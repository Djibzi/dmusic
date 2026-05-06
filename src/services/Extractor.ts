import Constants from 'expo-constants';

export type Resolved = {
  url: string;
  title: string;
  artist: string;
  duration: number | null;
  thumbnail: string | null;
  source: string;
  original_url: string;
};

function getBaseUrl(): string {
  const fromEnv =
    (Constants.expoConfig?.extra as any)?.extractorUrl ||
    process.env.EXPO_PUBLIC_EXTRACTOR_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, '');
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).expoGoConfig?.debuggerHost ||
    '';
  const host = hostUri.split(':')[0];
  if (host) return `http://${host}:8787`;
  return 'http://127.0.0.1:8787';
}

const DIRECT_AUDIO_EXT = /\.(mp3|m4a|aac|ogg|oga|opus|wav|flac)(\?.*)?$/i;
const STREAMING_HOSTS = /(youtube\.com|youtu\.be|soundcloud\.com|bandcamp\.com|mixcloud\.com|vimeo\.com|twitch\.tv|dailymotion\.com)/i;

export function needsExtraction(url: string): boolean {
  if (DIRECT_AUDIO_EXT.test(url)) return false;
  return STREAMING_HOSTS.test(url);
}

export function normalizeUrl(url: string): string {
  try {
    if (/youtu\.be\//i.test(url)) {
      const m = url.match(/youtu\.be\/([\w-]+)/);
      if (m) return `https://www.youtube.com/watch?v=${m[1]}`;
    }
    if (/youtube\.com/i.test(url)) {
      const m = url.match(/[?&]v=([\w-]+)/);
      if (m) return `https://www.youtube.com/watch?v=${m[1]}`;
    }
    return url;
  } catch {
    return url;
  }
}

export async function resolve(url: string): Promise<Resolved> {
  const base = getBaseUrl();
  const endpoint = `${base}/resolve?url=${encodeURIComponent(url)}`;
  console.log('[extractor] →', endpoint);
  let res: Response;
  try {
    res = await fetch(endpoint);
  } catch (e: any) {
    throw new Error(`backend injoignable (${base}) : ${e?.message ?? e}`);
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`extractor ${res.status}: ${txt || res.statusText}`);
  }
  return (await res.json()) as Resolved;
}

export type Envelope = { envelope: number[]; samples_per_sec: number };

export async function fetchEnvelope(url: string): Promise<Envelope | null> {
  const base = getBaseUrl();
  const endpoint = `${base}/envelope?url=${encodeURIComponent(url)}`;
  try {
    const res = await fetch(endpoint);
    if (!res.ok) return null;
    return (await res.json()) as Envelope;
  } catch (e) {
    console.warn('[extractor] envelope fetch failed', e);
    return null;
  }
}
