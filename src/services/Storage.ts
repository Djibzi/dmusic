import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import type { Track, LinkHistoryItem, Playlist } from '@/store/playerStore';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('dmusic.db').then(async (db) => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS imported_tracks (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          artist TEXT NOT NULL,
          album TEXT,
          duration TEXT NOT NULL,
          uri TEXT NOT NULL,
          hue INTEGER NOT NULL,
          variant INTEGER,
          tag TEXT,
          added_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS link_history (
          id TEXT PRIMARY KEY NOT NULL,
          url TEXT NOT NULL UNIQUE,
          title TEXT NOT NULL,
          host TEXT NOT NULL,
          hue INTEGER NOT NULL,
          played_at INTEGER NOT NULL,
          duration_ms INTEGER,
          thumbnail TEXT
        );
        CREATE TABLE IF NOT EXISTS playlists (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          hue INTEGER NOT NULL,
          created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS playlist_tracks (
          playlist_id TEXT NOT NULL,
          track_id TEXT NOT NULL,
          position INTEGER NOT NULL,
          track_json TEXT NOT NULL,
          PRIMARY KEY (playlist_id, track_id)
        );
        CREATE INDEX IF NOT EXISTS idx_pl_tracks_order
          ON playlist_tracks (playlist_id, position);
        CREATE TABLE IF NOT EXISTS favorites (
          id TEXT PRIMARY KEY NOT NULL,
          track_json TEXT NOT NULL,
          added_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
      // Migration: add duration_ms column to link_history if missing
      try {
        await db.execAsync(`ALTER TABLE link_history ADD COLUMN duration_ms INTEGER`);
      } catch {
        // column already exists
      }
      // Migration: add thumbnail column to link_history if missing
      try {
        await db.execAsync(`ALTER TABLE link_history ADD COLUMN thumbnail TEXT`);
      } catch {
        // column already exists
      }
      return db;
    });
  }
  return dbPromise;
}

export async function loadImportedTracks(): Promise<Track[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM imported_tracks ORDER BY added_at DESC'
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    artist: r.artist,
    album: r.album ?? undefined,
    duration: r.duration,
    uri: r.uri,
    hue: r.hue,
    variant: (r.variant ?? 0) as 0 | 1 | 2,
    tag: (r.tag ?? '') as Track['tag'],
  }));
}

export async function saveImportedTracks(tracks: Track[]): Promise<void> {
  if (!tracks.length) return;
  const db = await getDb();
  const now = Date.now();
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < tracks.length; i++) {
      const t = tracks[i];
      await db.runAsync(
        `INSERT OR REPLACE INTO imported_tracks
         (id, title, artist, album, duration, uri, hue, variant, tag, added_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          t.id,
          t.title,
          t.artist,
          t.album ?? null,
          t.duration,
          t.uri ?? '',
          t.hue,
          t.variant ?? 0,
          t.tag ?? '',
          now - i,
        ]
      );
    }
  });
}

export async function deleteImportedTrack(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM imported_tracks WHERE id = ?', [id]);
}

export async function loadLinkHistory(): Promise<LinkHistoryItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM link_history ORDER BY played_at DESC LIMIT 20'
  );
  return rows.map((r) => ({
    id: r.id,
    url: r.url,
    title: r.title,
    host: r.host,
    hue: r.hue,
    playedAt: r.played_at,
    durationMs: r.duration_ms ?? undefined,
    thumbnail: r.thumbnail ?? undefined,
  }));
}

export async function loadPlaylists(): Promise<Playlist[]> {
  const db = await getDb();
  const meta = await db.getAllAsync<any>(
    'SELECT * FROM playlists ORDER BY created_at DESC'
  );
  const tracks = await db.getAllAsync<any>(
    'SELECT playlist_id, track_json FROM playlist_tracks ORDER BY position ASC'
  );
  const byId = new Map<string, Track[]>();
  for (const r of tracks) {
    try {
      const t = JSON.parse(r.track_json) as Track;
      const arr = byId.get(r.playlist_id) ?? [];
      arr.push(t);
      byId.set(r.playlist_id, arr);
    } catch {}
  }
  return meta.map((p) => ({
    id: p.id,
    name: p.name,
    hue: p.hue,
    createdAt: p.created_at,
    tracks: byId.get(p.id) ?? [],
  }));
}

export async function savePlaylistMeta(p: Playlist): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO playlists (id, name, hue, created_at) VALUES (?, ?, ?, ?)`,
    [p.id, p.name, p.hue, p.createdAt]
  );
}

export async function deletePlaylist(id: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM playlist_tracks WHERE playlist_id = ?', [id]);
    await db.runAsync('DELETE FROM playlists WHERE id = ?', [id]);
  });
}

export async function savePlaylistTracks(playlistId: string, tracks: Track[]): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM playlist_tracks WHERE playlist_id = ?', [playlistId]);
    for (let i = 0; i < tracks.length; i++) {
      await db.runAsync(
        `INSERT INTO playlist_tracks (playlist_id, track_id, position, track_json)
         VALUES (?, ?, ?, ?)`,
        [playlistId, tracks[i].id, i, JSON.stringify(tracks[i])]
      );
    }
  });
}

export async function loadFavorites(): Promise<Track[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT track_json FROM favorites ORDER BY added_at DESC'
  );
  const out: Track[] = [];
  for (const r of rows) {
    try {
      out.push(JSON.parse(r.track_json) as Track);
    } catch {}
  }
  return out;
}

export async function addFavorite(t: Track): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO favorites (id, track_json, added_at) VALUES (?, ?, ?)`,
    [t.id, JSON.stringify(t), Date.now()]
  );
}

export async function removeFavorite(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM favorites WHERE id = ?', [id]);
}

export async function clearLinkHistory(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM link_history');
}

export async function deleteLinkHistoryItem(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM link_history WHERE id = ?', [id]);
}

export async function upsertLinkHistory(item: LinkHistoryItem): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO link_history (id, url, title, host, hue, played_at, duration_ms, thumbnail)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [item.id, item.url, item.title, item.host, item.hue, item.playedAt, item.durationMs ?? null, item.thumbnail ?? null]
  );
  await db.runAsync(
    `DELETE FROM link_history WHERE id NOT IN
     (SELECT id FROM link_history ORDER BY played_at DESC LIMIT 20)`
  );
}

export async function loadSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>('SELECT value FROM app_settings WHERE key = ?', [key]);
  return row?.value ?? null;
}

export async function saveSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`,
    [key, value]
  );
}

export async function dedupAll(): Promise<{
  importsRemoved: number;
  filesDeleted: number;
  playlistTracksRemoved: number;
  favoritesRemoved: number;
}> {
  const db = await getDb();

  // 1. Imported tracks: dedup by lowercase title, keep the most recent (added_at DESC)
  const importedRows = await db.getAllAsync<any>(
    'SELECT id, title, uri FROM imported_tracks ORDER BY added_at DESC'
  );
  const seenImports = new Set<string>();
  const importsToDelete: { id: string; uri: string | null }[] = [];
  for (const r of importedRows) {
    const key = String(r.title || '').toLowerCase().trim();
    if (!key) continue;
    if (seenImports.has(key)) importsToDelete.push({ id: r.id, uri: r.uri });
    else seenImports.add(key);
  }

  // 2. Favorites: dedup by track JSON title, keep most recent (added_at DESC)
  const favRows = await db.getAllAsync<any>(
    'SELECT id, track_json FROM favorites ORDER BY added_at DESC'
  );
  const seenFavs = new Set<string>();
  const favsToDelete: string[] = [];
  for (const r of favRows) {
    try {
      const t = JSON.parse(r.track_json) as Track;
      const key = String(t.title || '').toLowerCase().trim();
      if (!key) continue;
      if (seenFavs.has(key)) favsToDelete.push(r.id);
      else seenFavs.add(key);
    } catch {}
  }

  // 3. Playlist tracks: dedup per playlist by track JSON title (preserve the earliest position)
  const ptRows = await db.getAllAsync<any>(
    'SELECT playlist_id, track_id, position, track_json FROM playlist_tracks ORDER BY playlist_id, position ASC'
  );
  const seenByPl = new Map<string, Set<string>>();
  const ptToDelete: { playlist_id: string; track_id: string }[] = [];
  for (const r of ptRows) {
    let seen = seenByPl.get(r.playlist_id);
    if (!seen) {
      seen = new Set();
      seenByPl.set(r.playlist_id, seen);
    }
    try {
      const t = JSON.parse(r.track_json) as Track;
      const key = String(t.title || '').toLowerCase().trim();
      if (!key) continue;
      if (seen.has(key)) ptToDelete.push({ playlist_id: r.playlist_id, track_id: r.track_id });
      else seen.add(key);
    } catch {}
  }

  if (!importsToDelete.length && !favsToDelete.length && !ptToDelete.length) {
    return { importsRemoved: 0, filesDeleted: 0, playlistTracksRemoved: 0, favoritesRemoved: 0 };
  }

  await db.withTransactionAsync(async () => {
    for (const r of importsToDelete) {
      await db.runAsync('DELETE FROM imported_tracks WHERE id = ?', [r.id]);
    }
    for (const id of favsToDelete) {
      await db.runAsync('DELETE FROM favorites WHERE id = ?', [id]);
    }
    for (const r of ptToDelete) {
      await db.runAsync(
        'DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?',
        [r.playlist_id, r.track_id]
      );
    }
  });

  // Delete orphan audio files for removed imports
  let filesDeleted = 0;
  const base = FileSystem.documentDirectory ?? '';
  for (const r of importsToDelete) {
    if (!r.uri || !r.uri.startsWith('audio/')) continue;
    try {
      await FileSystem.deleteAsync(base + r.uri, { idempotent: true });
      filesDeleted++;
    } catch (e) {
      console.warn('[dedup] file delete failed', r.uri, e);
    }
  }

  return {
    importsRemoved: importsToDelete.length,
    filesDeleted,
    playlistTracksRemoved: ptToDelete.length,
    favoritesRemoved: favsToDelete.length,
  };
}
