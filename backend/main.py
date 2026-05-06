from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
import yt_dlp
import httpx
import time
import subprocess
import shutil
import numpy as np
from threading import Lock

app = FastAPI(title="DMusic Extractor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


class Resolved(BaseModel):
    url: str
    title: str
    artist: str
    duration: float | None
    thumbnail: str | None
    source: str
    original_url: str


YDL_OPTS = {
    "quiet": True,
    "no_warnings": True,
    "noplaylist": True,
    "skip_download": True,
    # Hint yt-dlp to prefer iOS-decodable codecs (m4a/aac/mp3) — pick_ios_friendly() filters anyway
    "format": "bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio[acodec=aac]/best[ext=mp4]/best",
    "extractor_args": {
        "youtube": {
            # Order matters — first that returns real audio formats wins.
            # iOS is fast but lately blocked; tv_embedded and web are more reliable.
            "player_client": ["tv_embedded", "web", "android", "ios"],
        }
    },
    # Force IPv4 — IPv6 routing on Windows often dead-slow or broken
    "source_address": "0.0.0.0",
    # Hard caps so nothing hangs forever
    "socket_timeout": 10,
    "extractor_retries": 1,
    "fragment_retries": 1,
    "retries": 1,
    "ignore_no_formats_error": True,
}


# In-memory LRU cache for resolve results (instant replay of same URL)
_CACHE_TTL = 60 * 50  # 50 minutes — most signed URLs expire ~6h, but be conservative
_CACHE_MAX = 128
_cache: dict[str, tuple[float, "Resolved"]] = {}
_cache_lock = Lock()


def _cache_get(key: str):
    with _cache_lock:
        item = _cache.get(key)
        if not item:
            return None
        ts, val = item
        if time.time() - ts > _CACHE_TTL:
            _cache.pop(key, None)
            return None
        return val


def _cache_put(key: str, val: "Resolved"):
    with _cache_lock:
        if len(_cache) >= _CACHE_MAX:
            # drop oldest
            oldest = min(_cache.items(), key=lambda kv: kv[1][0])[0]
            _cache.pop(oldest, None)
        _cache[key] = (time.time(), val)


IOS_PLAYABLE_EXTS = {"m4a", "mp4", "mp3", "aac", "m3u8"}


def pick_ios_friendly(info: dict) -> dict | None:
    """Pick a format AVPlayer can play: progressive http(s), audio-only m4a/mp3/aac.
    Never return webm/opus — AVPlayer can't decode those (error -11828).
    Reject combined video+audio mp4 too — expo-av Audio.Sound mutes them."""
    formats = info.get("formats") or []
    if not formats:
        return None

    def is_audio_only(f) -> bool:
        vcodec = (f.get("vcodec") or "").lower()
        return vcodec in ("none", "")

    def is_ios_codec(f) -> bool:
        ext = (f.get("ext") or "").lower()
        acodec = (f.get("acodec") or "").lower()
        if acodec in ("opus", "vorbis"):
            return False
        return ext in {"m4a", "mp3", "aac"} or acodec in {"mp4a", "aac", "mp3"}

    # Pass 1: audio-only with iOS-friendly codec
    audio_only = [f for f in formats if f.get("url") and is_audio_only(f) and is_ios_codec(f)]
    if audio_only:
        audio_only.sort(key=lambda f: float(f.get("abr") or f.get("tbr") or 0), reverse=True)
        return audio_only[0]

    # Pass 2: combined video+audio mp4 with AAC audio (last resort — may render silent on expo-av)
    combined = [
        f for f in formats
        if f.get("url") and (f.get("ext") or "").lower() == "mp4"
        and (f.get("acodec") or "").lower() in {"mp4a", "aac"}
    ]
    if combined:
        combined.sort(key=lambda f: float(f.get("abr") or f.get("tbr") or 0), reverse=True)
        return combined[0]

    return None


def _log_formats(info: dict):
    formats = info.get("formats") or []
    print(f"[resolve] {len(formats)} formats available")
    for f in formats[:8]:
        print(
            f"  - id={f.get('format_id')} ext={f.get('ext')} "
            f"acodec={f.get('acodec')} vcodec={f.get('vcodec')} "
            f"protocol={f.get('protocol')} abr={f.get('abr')} "
            f"hasUrl={'y' if f.get('url') else 'n'}"
        )


@app.get("/health")
def health():
    return {"ok": True}


# Envelope cache — stores RMS arrays keyed by original URL
_envelope_cache: dict[str, tuple[float, list[float]]] = {}
_envelope_cache_lock = Lock()
ENVELOPE_SAMPLES_PER_SEC = 20


def _envelope_cache_get(key: str):
    with _envelope_cache_lock:
        item = _envelope_cache.get(key)
        if not item:
            return None
        ts, val = item
        if time.time() - ts > _CACHE_TTL:
            _envelope_cache.pop(key, None)
            return None
        return val


def _envelope_cache_put(key: str, val: list[float]):
    with _envelope_cache_lock:
        if len(_envelope_cache) >= _CACHE_MAX:
            oldest = min(_envelope_cache.items(), key=lambda kv: kv[1][0])[0]
            _envelope_cache.pop(oldest, None)
        _envelope_cache[key] = (time.time(), val)


def _compute_rms_envelope(stream_url: str, samples_per_sec: int = ENVELOPE_SAMPLES_PER_SEC) -> list[float]:
    """Decode audio via ffmpeg (mono, 8kHz, 16-bit PCM) and return RMS amplitude per
    1/samples_per_sec window, normalized to [0, 1].
    Cheap because we use 8kHz mono — RMS doesn't need full quality."""
    if shutil.which("ffmpeg") is None:
        raise RuntimeError("ffmpeg not found on PATH")

    cmd = [
        "ffmpeg",
        "-i", stream_url,
        "-f", "s16le",
        "-ac", "1",
        "-ar", "8000",
        "-loglevel", "error",
        "-",
    ]
    proc = subprocess.run(cmd, capture_output=True, timeout=120)
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {proc.stderr.decode()[:200]}")

    pcm = np.frombuffer(proc.stdout, dtype=np.int16).astype(np.float32) / 32768.0
    if pcm.size == 0:
        return []

    sample_rate = 8000
    frame_size = max(1, sample_rate // samples_per_sec)
    n_frames = pcm.size // frame_size
    if n_frames == 0:
        return []
    pcm = pcm[: n_frames * frame_size].reshape(n_frames, frame_size)
    rms = np.sqrt(np.mean(pcm ** 2, axis=1))
    if rms.max() > 0:
        rms = rms / rms.max()
    # Slight gamma to make the dynamic range pop visually
    rms = np.power(rms, 0.7)
    return rms.tolist()


def _resolve_stream_url(url: str) -> str:
    """Get a direct stream URL for an input URL (using yt-dlp if needed). Reuses /resolve cache."""
    cached = _cache_get(f"{url}|proxy=0")
    if cached is not None:
        return cached.url
    try:
        with yt_dlp.YoutubeDL(YDL_OPTS) as ydl:
            info = ydl.extract_info(url, download=False)
        chosen = pick_ios_friendly(info)
        stream_url = (chosen or {}).get("url") or info.get("url")
        if not stream_url:
            raise RuntimeError("no playable stream")
        return stream_url
    except Exception as e:
        raise RuntimeError(f"resolve failed: {e}")


@app.get("/envelope")
def envelope(url: str = Query(...)):
    """Return RMS amplitude envelope of the audio at `url`, sampled at
    ENVELOPE_SAMPLES_PER_SEC Hz, normalized to [0, 1]."""
    cached = _envelope_cache_get(url)
    if cached is not None:
        print(f"[envelope] CACHE HIT {url}")
        return {"envelope": cached, "samples_per_sec": ENVELOPE_SAMPLES_PER_SEC}

    t0 = time.time()
    print(f"[envelope] START {url}")
    try:
        stream_url = _resolve_stream_url(url)
        env = _compute_rms_envelope(stream_url)
    except Exception as e:
        print(f"[envelope] FAIL after {time.time()-t0:.1f}s : {e}")
        raise HTTPException(status_code=422, detail=f"envelope failed: {e}")

    print(f"[envelope] computed {len(env)} samples in {time.time()-t0:.1f}s")
    _envelope_cache_put(url, env)
    return {"envelope": env, "samples_per_sec": ENVELOPE_SAMPLES_PER_SEC}


@app.get("/resolve", response_model=Resolved)
def resolve(request: Request, url: str = Query(...), proxy: bool = Query(True)):
    cache_key = f"{url}|proxy={1 if proxy else 0}"
    cached = _cache_get(cache_key)
    if cached is not None:
        print(f"[resolve] CACHE HIT {url}")
        return cached

    def has_audio_formats(inf: dict | None) -> bool:
        """A real audio format is any with acodec != none and a URL — storyboards (mhtml) don't qualify."""
        if not inf:
            return False
        for f in inf.get("formats") or []:
            if not f.get("url"):
                continue
            if (f.get("ext") or "").lower() == "mhtml":
                continue
            ac = (f.get("acodec") or "").lower()
            if ac and ac != "none":
                return True
        return False

    t0 = time.time()
    print(f"[resolve] START {url}")
    info = None
    last_err: Exception | None = None

    # Try each client family separately — fast iteration, stop at first success
    client_attempts = [
        {"player_client": ["tv_embedded"]},
        {"player_client": ["web"]},
        {"player_client": ["android"]},
        {"player_client": ["ios"]},
    ]
    attempts: list[dict] = [{**YDL_OPTS, "extractor_args": {"youtube": ca}} for ca in client_attempts]
    attempts.append({**YDL_OPTS, "extractor_args": {}})  # last-resort: yt-dlp default

    for i, attempt_opts in enumerate(attempts):
        label = (attempt_opts.get("extractor_args", {}).get("youtube", {}) or {}).get("player_client", ["default"])
        try:
            with yt_dlp.YoutubeDL(attempt_opts) as ydl:
                info_try = ydl.extract_info(url, download=False)
            if has_audio_formats(info_try):
                info = info_try
                print(f"[resolve] client {label} returned audio formats ({time.time()-t0:.1f}s)")
                break
            print(f"[resolve] client {label} returned no audio formats, trying next")
        except yt_dlp.utils.DownloadError as e:
            last_err = e
            print(f"[resolve] client {label} failed: {e}")
        except Exception as e:
            last_err = e
            print(f"[resolve] client {label} failed: {e}")

    if info is None:
        msg = str(last_err) if last_err else "no playable formats from any client"
        print(f"[resolve] FAIL after {time.time()-t0:.1f}s : {msg}")
        raise HTTPException(status_code=422, detail=f"extractor failed: {msg}")
    print(f"[resolve] yt-dlp done in {time.time()-t0:.1f}s")

    if info is None:
        raise HTTPException(status_code=404, detail="no media found")

    chosen = pick_ios_friendly(info)
    stream_url = (chosen or {}).get("url") or info.get("url")

    if not stream_url:
        _log_formats(info)
        raise HTTPException(status_code=422, detail="no playable stream")

    print(f"[resolve] picked format: ext={chosen.get('ext') if chosen else '?'} "
          f"acodec={chosen.get('acodec') if chosen else '?'} "
          f"protocol={chosen.get('protocol') if chosen else '?'} "
          f"abr={chosen.get('abr') if chosen else '?'}")

    if proxy:
        base = str(request.base_url).rstrip("/")
        stream_url = f"{base}/stream?url={_q(stream_url)}"

    # YouTube thumbnails:
    #  - maxresdefault.jpg: highest res but returns gray placeholder when missing
    #  - sddefault.jpg / hqdefault.jpg: 4:3 with black letterbox bars baked into the image
    #  - mqdefault.jpg: 320x180, true 16:9, always exists, no bars — reliable choice
    thumb = info.get("thumbnail")
    if thumb and "i.ytimg.com" in thumb:
        for variant in ("maxresdefault.jpg", "sddefault.jpg", "hqdefault.jpg"):
            if variant in thumb:
                thumb = thumb.replace(variant, "mqdefault.jpg")
                break

    result = Resolved(
        url=stream_url,
        title=info.get("title") or "Unknown",
        artist=info.get("uploader") or info.get("channel") or info.get("extractor") or "Unknown",
        duration=info.get("duration"),
        thumbnail=thumb,
        source=info.get("extractor_key") or info.get("extractor") or "unknown",
        original_url=url,
    )
    _cache_put(cache_key, result)
    return result


def _q(s: str) -> str:
    from urllib.parse import quote
    return quote(s, safe="")


UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"


@app.get("/stream")
async def stream(request: Request, url: str = Query(...)):
    """Proxy audio from the resolved upstream URL, forwarding Range for seeking."""
    headers = {"User-Agent": UA}
    rng = request.headers.get("range")
    if rng:
        headers["Range"] = rng

    t0 = time.time()
    print(f"[stream] START range={rng or '-'}  url={url[:80]}…")

    client = httpx.AsyncClient(follow_redirects=True, timeout=httpx.Timeout(30.0, connect=10.0))
    try:
        upstream = await client.send(
            client.build_request("GET", url, headers=headers),
            stream=True,
        )
    except Exception as e:
        await client.aclose()
        print(f"[stream] CONNECT FAIL after {time.time()-t0:.1f}s : {e}")
        raise HTTPException(status_code=502, detail=f"upstream connect failed: {e}")
    print(f"[stream] connected status={upstream.status_code} in {time.time()-t0:.1f}s")

    if upstream.status_code >= 400:
        body = await upstream.aread()
        await upstream.aclose()
        await client.aclose()
        return Response(status_code=upstream.status_code, content=body)

    passthrough = {}
    for h in ("content-length", "content-range", "accept-ranges", "etag", "last-modified"):
        v = upstream.headers.get(h)
        if v:
            passthrough[h] = v
    if "accept-ranges" not in passthrough:
        passthrough["accept-ranges"] = "bytes"
    # Force an audio MIME type so AVPlayer/expo-av decodes the audio track,
    # not video (video mp4 sometimes plays silent through Audio.Sound).
    upstream_ct = (upstream.headers.get("content-type") or "").lower()
    if "mpeg" in upstream_ct or url.lower().endswith(".mp3"):
        passthrough["content-type"] = "audio/mpeg"
    else:
        passthrough["content-type"] = "audio/mp4"

    async def body_iter():
        try:
            async for chunk in upstream.aiter_bytes(64 * 1024):
                yield chunk
        finally:
            await upstream.aclose()
            await client.aclose()

    return StreamingResponse(
        body_iter(),
        status_code=upstream.status_code,
        headers=passthrough,
        media_type=passthrough["content-type"],
    )
