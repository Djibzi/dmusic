import { create } from 'zustand';
import * as FileSystem from 'expo-file-system/legacy';
import * as AudioService from '@/services/AudioService';
import * as Extractor from '@/services/Extractor';
import * as Storage from '@/services/Storage';

function trackKey(t: Track): string {
  return t.originalUrl || t.uri || t.id;
}

function fmtDurationMs(ms?: number): string {
  if (!ms || ms <= 0) return '—';
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function resolveLocalUri(uri: string | undefined): string | undefined {
  if (!uri) return uri;
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;
  const base = FileSystem.documentDirectory ?? '';
  if (uri.startsWith('file://')) {
    const m = uri.match(/\/audio\/([^/]+)$/);
    if (m) return `${base}audio/${m[1]}`;
    return uri;
  }
  return base + uri.replace(/^\//, '');
}

export type Track = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: string;
  uri?: string;
  hue: number;
  variant?: 0 | 1 | 2;
  tag?: 'FAV' | 'NEW' | 'LINK' | '';
  expectedDurationMs?: number;
  originalUrl?: string;
  thumbnail?: string;
};

export type Playlist = {
  id: string;
  name: string;
  hue: number;
  createdAt: number;
  tracks: Track[];
};

export type LinkHistoryItem = {
  id: string;
  url: string;
  title: string;
  host: string;
  hue: number;
  playedAt: number;
  durationMs?: number;
  thumbnail?: string;
};

type PlayerState = {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  positionMs: number;
  durationMs: number;
  linkHistory: LinkHistoryItem[];
  importedTracks: Track[];
  playlists: Playlist[];
  favorites: Track[];
  currentPlaylistId: string | null;
  playedHistory: Track[];

  playTrack: (t: Track, opts?: { keepPlaylist?: boolean; fromHistory?: boolean }) => Promise<void>;
  playFromUrl: (url: string, hue: number) => Promise<void>;
  toggle: () => Promise<void>;
  seekFraction: (f: number) => Promise<void>;
  setQueue: (q: Track[]) => void;
  enqueue: (t: Track) => void;
  playNext: (t: Track) => void;
  removeFromQueue: (id: string) => void;
  skipToQueueIndex: (index: number) => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrev: () => Promise<void>;
  clearQueue: () => void;
  addImportedTracks: (t: Track[]) => void;
  removeImportedTrack: (id: string) => void;
  createPlaylist: (name: string, hue: number) => Playlist;
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  addTracksToPlaylist: (playlistId: string, tracks: Track[]) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  playPlaylist: (playlistId: string, startIndex?: number) => Promise<void>;
  toggleFavorite: (t: Track) => void;
  isFavorite: (id: string) => boolean;
  isFavoriteTrack: (t: Track) => boolean;
  stopPlayback: () => Promise<void>;
  removeLinkHistoryItem: (id: string) => void;
  hydrate: () => Promise<void>;
  _onStatus: (s: { positionMillis: number; durationMillis?: number; isPlaying: boolean; didJustFinish: boolean }) => void;
};

function parseHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    const m = url.match(/^https?:\/\/([^/]+)/i);
    return m ? m[1] : url.slice(0, 24);
  }
}

function parseTitle(url: string): string {
  try {
    const path = new URL(url).pathname;
    const last = path.split('/').filter(Boolean).pop();
    return last ? decodeURIComponent(last) : url;
  } catch {
    return url.split('/').pop() ?? url;
  }
}

let lastFinishedTrackId: string | null = null;
let lastWasPlaying = false;
let endWatchdog: ReturnType<typeof setTimeout> | null = null;
let endWatchdogTrackId: string | null = null;
let endWatchdogLastPos = 0;

export const usePlayerStore = create<PlayerState>((set, get) => {
  AudioService.onStatus((s) => get()._onStatus(s as any));

  return {
    currentTrack: null,
    isPlaying: false,
    queue: [],
    positionMs: 0,
    durationMs: 0,
    linkHistory: [],
    importedTracks: [],
    playlists: [],
    favorites: [],
    currentPlaylistId: null,
    playedHistory: [],

    playTrack: async (t, opts) => {
      lastFinishedTrackId = null;
      lastWasPlaying = false;
      endWatchdogLastPos = 0;
      if (endWatchdog) {
        clearTimeout(endWatchdog);
        endWatchdog = null;
        endWatchdogTrackId = null;
      }
      if (!opts?.keepPlaylist) set({ currentPlaylistId: null });
      if (!opts?.fromHistory) {
        const cur = get().currentTrack;
        if (cur && cur.id !== t.id) {
          set((s) => ({ playedHistory: [cur, ...s.playedHistory].slice(0, 50) }));
        }
      }
      const isLink = t.tag === 'LINK' || !!t.originalUrl;
      if (isLink) {
        let src = t.originalUrl;
        if (!src) {
          const match = get().linkHistory.find((h) => h.id === t.id);
          src = match?.url ?? t.uri;
        }
        if (src && /^https?:\/\//i.test(src)) {
          await get().playFromUrl(src, t.hue);
          return;
        }
      }
      set({ currentTrack: t, isPlaying: true, positionMs: 0, durationMs: 0 });
      const playable = resolveLocalUri(t.uri);
      if (playable) {
        try {
          await AudioService.playUri(playable);
        } catch (e) {
          console.warn('[play] failed', playable, e);
          set({ isPlaying: false });
        }
      }
    },

    playFromUrl: async (rawUrl, hue) => {
      const url = Extractor.normalizeUrl(rawUrl);
      const initialTitle = parseTitle(url);
      const initialHost = parseHost(url);
      const trackId = 'url-' + Date.now();
      const placeholder: Track = {
        id: trackId,
        title: initialTitle,
        artist: initialHost,
        duration: '—',
        uri: undefined,
        hue,
        variant: 0,
        tag: 'LINK',
        originalUrl: url,
      };
      set({ currentTrack: placeholder, isPlaying: false, positionMs: 0, durationMs: 0 });

      let streamUrl = url;
      let title = initialTitle;
      let host = initialHost;
      let expectedDurationMs: number | undefined;
      let thumbnail: string | undefined;

      if (Extractor.needsExtraction(url)) {
        try {
          const r = await Extractor.resolve(url);
          streamUrl = r.url;
          title = r.title || title;
          host = r.artist || host;
          if (r.duration && r.duration > 0) expectedDurationMs = Math.round(r.duration * 1000);
          if (r.thumbnail) thumbnail = r.thumbnail;
        } catch (e) {
          console.warn('[extractor] failed', e);
          set({
            currentTrack: { ...placeholder, title: 'Lien indisponible', artist: initialHost },
            isPlaying: false,
          });
          return;
        }
      }

      const track: Track = {
        ...placeholder,
        title,
        artist: host,
        uri: streamUrl,
        expectedDurationMs,
        duration: fmtDurationMs(expectedDurationMs),
        thumbnail,
      };
      const historyItem: LinkHistoryItem = {
        id: track.id,
        url,
        title,
        host,
        hue,
        playedAt: Date.now(),
        durationMs: expectedDurationMs,
        thumbnail,
      };
      set((s) => ({
        currentTrack: track,
        isPlaying: true,
        positionMs: 0,
        durationMs: 0,
        linkHistory: [
          historyItem,
          ...s.linkHistory.filter((h) => h.url !== url),
        ].slice(0, 20),
      }));
      Storage.upsertLinkHistory(historyItem).catch((e) => console.warn('[storage] link history', e));
      try {
        await AudioService.playUri(streamUrl);
      } catch (e) {
        console.warn('[play] url failed', e);
        set({ isPlaying: false });
      }
    },

    toggle: async () => {
      const next = !get().isPlaying;
      set({ isPlaying: next });
      await AudioService.togglePlay(next);
    },

    seekFraction: async (f) => {
      const dur = get().durationMs;
      if (!dur) return;
      const ms = Math.max(0, Math.min(dur, f * dur));
      await AudioService.seek(ms);
      set({ positionMs: ms });
    },

    setQueue: (q) => set({ queue: q }),

    enqueue: (t) =>
      set((s) => (s.queue.some((x) => x.id === t.id) ? s : { queue: [...s.queue, t] })),

    playNext: (t) =>
      set((s) => {
        const filtered = s.queue.filter((x) => x.id !== t.id);
        return { queue: [t, ...filtered] };
      }),

    removeFromQueue: (id) =>
      set((s) => ({ queue: s.queue.filter((t) => t.id !== id) })),

    skipToQueueIndex: async (index) => {
      const q = get().queue;
      if (index < 0 || index >= q.length) return;
      const target = q[index];
      const rest = q.slice(index + 1);
      set({ queue: rest });
      await get().playTrack(target, { keepPlaylist: true });
    },

    skipPrev: async () => {
      const hist = get().playedHistory;
      if (!hist.length) {
        await get().seekFraction(0);
        return;
      }
      const [prev, ...rest] = hist;
      const cur = get().currentTrack;
      set({ playedHistory: rest, queue: cur ? [cur, ...get().queue] : get().queue });
      await get().playTrack(prev, { keepPlaylist: true, fromHistory: true });
    },

    skipNext: async () => {
      const q = get().queue;
      if (q.length) {
        const [next, ...rest] = q;
        set({ queue: rest });
        await get().playTrack(next, { keepPlaylist: true });
        return;
      }
      const plId = get().currentPlaylistId;
      if (plId) {
        const p = get().playlists.find((x) => x.id === plId);
        if (p && p.tracks.length) {
          set({ queue: p.tracks.slice(1) });
          await get().playTrack(p.tracks[0], { keepPlaylist: true });
        }
      }
    },

    clearQueue: () => set({ queue: [] }),

    addImportedTracks: (tracks) => {
      let fresh: Track[] = [];
      set((s) => {
        const existing = new Set(s.importedTracks.map((t) => t.uri));
        fresh = tracks.filter((t) => t.uri && !existing.has(t.uri));
        return { importedTracks: [...fresh, ...s.importedTracks] };
      });
      if (fresh.length) {
        Storage.saveImportedTracks(fresh).catch((e) => console.warn('[storage] save', e));
      }
    },

    removeImportedTrack: (id) => {
      set((s) => ({ importedTracks: s.importedTracks.filter((t) => t.id !== id) }));
      Storage.deleteImportedTrack(id).catch((e) => console.warn('[storage] delete', e));
    },

    createPlaylist: (name, hue) => {
      const p: Playlist = {
        id: 'pl-' + Date.now(),
        name: name.trim() || 'Sans titre',
        hue,
        createdAt: Date.now(),
        tracks: [],
      };
      set((s) => ({ playlists: [p, ...s.playlists] }));
      Storage.savePlaylistMeta(p).catch((e) => console.warn('[storage] pl meta', e));
      return p;
    },

    renamePlaylist: (id, name) => {
      set((s) => ({
        playlists: s.playlists.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name } : p)),
      }));
      const p = get().playlists.find((x) => x.id === id);
      if (p) Storage.savePlaylistMeta(p).catch((e) => console.warn('[storage] pl rename', e));
    },

    deletePlaylist: (id) => {
      set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) }));
      Storage.deletePlaylist(id).catch((e) => console.warn('[storage] pl del', e));
    },

    addTracksToPlaylist: (playlistId, tracks) => {
      const target = get().playlists.find((p) => p.id === playlistId);
      if (!target) return;
      const existing = new Set(target.tracks.map((t) => t.id));
      const seen = new Set<string>();
      const fresh = tracks.filter((t) => {
        if (existing.has(t.id) || seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });
      if (!fresh.length) return;
      set((s) => ({
        playlists: s.playlists.map((p) =>
          p.id === playlistId ? { ...p, tracks: [...p.tracks, ...fresh] } : p
        ),
      }));
      const updated = get().playlists.find((x) => x.id === playlistId);
      if (updated) Storage.savePlaylistTracks(updated.id, updated.tracks).catch((e) => console.warn('[storage] pl tracks', e));
    },

    removeTrackFromPlaylist: (playlistId, trackId) => {
      set((s) => ({
        playlists: s.playlists.map((p) =>
          p.id === playlistId ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) } : p
        ),
      }));
      const p = get().playlists.find((x) => x.id === playlistId);
      if (p) Storage.savePlaylistTracks(p.id, p.tracks).catch((e) => console.warn('[storage] pl tracks', e));
    },

    removeLinkHistoryItem: (id) => {
      set((s) => ({ linkHistory: s.linkHistory.filter((h) => h.id !== id) }));
      Storage.deleteLinkHistoryItem(id).catch((e) => console.warn('[storage] link del', e));
    },

    stopPlayback: async () => {
      if (endWatchdog) {
        clearTimeout(endWatchdog);
        endWatchdog = null;
        endWatchdogTrackId = null;
        endWatchdogLastPos = 0;
      }
      try {
        await AudioService.stop();
      } catch {}
      set({ currentTrack: null, isPlaying: false, positionMs: 0, durationMs: 0, queue: [], currentPlaylistId: null });
    },

    playPlaylist: async (playlistId, startIndex = 0) => {
      const p = get().playlists.find((x) => x.id === playlistId);
      if (!p || !p.tracks.length) return;
      const idx = Math.max(0, Math.min(startIndex, p.tracks.length - 1));
      set({
        queue: [...p.tracks.slice(idx + 1), ...p.tracks.slice(0, idx)],
        currentPlaylistId: playlistId,
      });
      await get().playTrack(p.tracks[idx], { keepPlaylist: true });
    },

    toggleFavorite: (t) => {
      const key = trackKey(t);
      const existing = get().favorites;
      const found = existing.find((f) => trackKey(f) === key);
      if (found) {
        set({ favorites: existing.filter((f) => f.id !== found.id) });
        Storage.removeFavorite(found.id).catch((e) => console.warn('[storage] fav rm', e));
      } else {
        const fav: Track = { ...t, tag: 'FAV' };
        set({ favorites: [fav, ...existing] });
        Storage.addFavorite(fav).catch((e) => console.warn('[storage] fav add', e));
      }
    },

    isFavorite: (id) => get().favorites.some((f) => f.id === id),

    isFavoriteTrack: (t) => {
      const key = trackKey(t);
      return get().favorites.some((f) => trackKey(f) === key);
    },

    hydrate: async () => {
      try {
        const dedup = await Storage.dedupAll();
        if (
          dedup.importsRemoved ||
          dedup.playlistTracksRemoved ||
          dedup.favoritesRemoved ||
          dedup.filesDeleted
        ) {
          console.log('[hydrate] dedup cleaned:', dedup);
        }
        const [importedTracks, linkHistory, playlists, favorites] = await Promise.all([
          Storage.loadImportedTracks(),
          Storage.loadLinkHistory(),
          Storage.loadPlaylists(),
          Storage.loadFavorites(),
        ]);
        set({ importedTracks, linkHistory, playlists, favorites });
      } catch (e) {
        console.warn('[storage] hydrate', e);
      }
    },

    _onStatus: (s) => {
      const cur = get().currentTrack;
      const expected = cur?.expectedDurationMs;
      const reported = s.durationMillis ?? 0;
      let dur = reported;
      if (expected && expected > 0) {
        if (reported > expected * 1.5 || reported < expected * 0.5) dur = expected;
      }
      const pos = s.positionMillis ?? 0;
      set({
        positionMs: pos,
        durationMs: dur,
        isPlaying: s.isPlaying,
      });

      // Watchdog: schedule once per track at (duration - position + buffer). Reschedule only
      // on track change OR when a seek is detected (position jumped vs the last natural advance).
      const trackId = cur?.id ?? null;
      const effectiveDur = dur || expected || 0;
      if (s.isPlaying && trackId && effectiveDur > 0) {
        const trackChanged = endWatchdogTrackId !== trackId;
        const expectedNaturalPos = endWatchdogLastPos + 2000; // ticks are ~500ms; allow 2s drift
        const seekDetected =
          !trackChanged && (pos < endWatchdogLastPos - 1500 || pos > expectedNaturalPos);
        if (trackChanged || seekDetected || endWatchdog === null) {
          const remaining = Math.max(0, effectiveDur - pos);
          if (endWatchdog) clearTimeout(endWatchdog);
          endWatchdogTrackId = trackId;
          endWatchdog = setTimeout(() => {
            const nowCur = get().currentTrack;
            if (!nowCur || nowCur.id !== trackId) return;
            if (nowCur.id === lastFinishedTrackId) return;
            console.log('[watchdog] firing auto-advance for', trackId);
            lastFinishedTrackId = trackId;
            const q = get().queue;
            if (q.length) {
              const [next, ...rest] = q;
              set({ queue: rest });
              get().playTrack(next, { keepPlaylist: true });
            } else {
              const plId = get().currentPlaylistId;
              if (plId) {
                const p = get().playlists.find((x) => x.id === plId);
                if (p && p.tracks.length) {
                  set({ queue: p.tracks.slice(1) });
                  get().playTrack(p.tracks[0], { keepPlaylist: true });
                }
              }
            }
          }, remaining + 2000);
        }
        endWatchdogLastPos = pos;
      } else if (!s.isPlaying && endWatchdog) {
        clearTimeout(endWatchdog);
        endWatchdog = null;
        endWatchdogTrackId = null;
      }
      // Fallback end-of-track: stream stopped (transition playing→not) after meaningful playback
      const curId = get().currentTrack?.id ?? null;
      const justStopped = lastWasPlaying && !s.isPlaying;
      // Consider it "ended" if we just stopped AND either:
      //   - position reached duration (within 2s), OR
      //   - we have no duration but played > 5s (stream finished or cut off)
      const nearDuration = dur > 0 && pos >= dur - 2000;
      const playedEnough = pos > 5000;
      const reachedEnd = !s.didJustFinish && justStopped && (nearDuration || (dur === 0 && playedEnough));
      lastWasPlaying = s.isPlaying;
      if (s.didJustFinish || reachedEnd) {
        console.log('[end]', { didJustFinish: s.didJustFinish, reachedEnd, pos, dur, curId, lastFinishedTrackId });
      }
      if ((s.didJustFinish || reachedEnd) && curId !== lastFinishedTrackId) {
        lastFinishedTrackId = curId;
        const q = get().queue;
        if (q.length) {
          const [next, ...rest] = q;
          set({ queue: rest });
          get().playTrack(next, { keepPlaylist: true });
        } else {
          const plId = get().currentPlaylistId;
          if (plId) {
            const p = get().playlists.find((x) => x.id === plId);
            if (p && p.tracks.length) {
              set({ queue: p.tracks.slice(1) });
              get().playTrack(p.tracks[0], { keepPlaylist: true });
              return;
            }
          }
          set({ isPlaying: false, positionMs: 0 });
        }
      }
    },
  };
});
