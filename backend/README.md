# DMusic Extractor

Extracts direct audio stream URLs from YouTube, SoundCloud, and ~1800 other sites (via yt-dlp).
The app POSTs a page URL here, gets back a playable audio URL that expo-av can stream.

## Local run

PowerShell (Windows):

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8787 --reload
```

If activation is blocked by execution policy, run once:
`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

Then from your iPhone (same wifi as your PC), test:
`http://<your-pc-lan-ip>:8787/resolve?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ`

Find your LAN IP with `ipconfig` (look for IPv4 on your Wi-Fi adapter).

## Endpoints

- `GET /health` → `{ok: true}`
- `GET /resolve?url=<page-url>` → `{url, title, artist, duration, thumbnail, source, original_url}`

## Notes

- Stream URLs from YouTube are time-limited (usually ~6h). Re-resolve when playback fails.
- Keep yt-dlp updated (`pip install -U yt-dlp`) — YouTube breaks it every few weeks.
