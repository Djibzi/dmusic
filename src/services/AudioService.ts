import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
} from 'react-native-track-player';

export type TrackMeta = {
  id?: string;
  title?: string;
  artist?: string;
  artwork?: string;
  durationMs?: number;
};

type StatusCb = (s: {
  positionMillis: number;
  durationMillis: number;
  isPlaying: boolean;
  didJustFinish: boolean;
}) => void;

let isSetup = false;
let statusListener: StatusCb | null = null;
let progressInterval: ReturnType<typeof setInterval> | null = null;
let playbackEndedSub: { remove: () => void } | null = null;
let playbackStateSub: { remove: () => void } | null = null;
let lastIsPlaying = false;

export async function configureAudio() {
  if (isSetup) return;
  try {
    await TrackPlayer.setupPlayer({
      autoHandleInterruptions: true,
    });
  } catch (e: any) {
    if (!String(e?.message ?? e).includes('player has already been initialized')) throw e;
  }
  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
    // No capabilities exposed to MPRemoteCommandCenter — we don't want the
    // standard iOS Now Playing widget. Our custom Live Activity is the UI.
    capabilities: [],
    compactCapabilities: [],
    progressUpdateEventInterval: 0.5,
  });

  // Poll progress at 500ms — RNTP doesn't auto-fire progress events on iOS in some cases
  if (progressInterval) clearInterval(progressInterval);
  progressInterval = setInterval(async () => {
    if (!statusListener) return;
    try {
      const [progress, state] = await Promise.all([
        TrackPlayer.getProgress(),
        TrackPlayer.getPlaybackState(),
      ]);
      const playing = state.state === State.Playing;
      statusListener({
        positionMillis: Math.round((progress.position ?? 0) * 1000),
        durationMillis: Math.round((progress.duration ?? 0) * 1000),
        isPlaying: playing,
        didJustFinish: false,
      });
      lastIsPlaying = playing;
    } catch {}
  }, 500);

  // PlaybackQueueEnded fires when track finishes
  playbackEndedSub?.remove();
  playbackEndedSub = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
    if (!statusListener) return;
    try {
      const progress = await TrackPlayer.getProgress();
      statusListener({
        positionMillis: Math.round((progress.position ?? 0) * 1000),
        durationMillis: Math.round((progress.duration ?? 0) * 1000),
        isPlaying: false,
        didJustFinish: true,
      });
    } catch {}
  });

  // PlaybackState fires on play/pause/buffer changes — push immediate update so UI reacts fast
  playbackStateSub?.remove();
  playbackStateSub = TrackPlayer.addEventListener(Event.PlaybackState, async (data) => {
    if (!statusListener) return;
    try {
      const progress = await TrackPlayer.getProgress();
      const playing = data.state === State.Playing;
      statusListener({
        positionMillis: Math.round((progress.position ?? 0) * 1000),
        durationMillis: Math.round((progress.duration ?? 0) * 1000),
        isPlaying: playing,
        didJustFinish: false,
      });
      lastIsPlaying = playing;
    } catch {}
  });

  isSetup = true;
}

export function onStatus(cb: StatusCb) {
  statusListener = cb;
}

export async function playUri(uri: string, meta?: TrackMeta) {
  await configureAudio();
  await TrackPlayer.reset();
  // Pass empty title/artist/artwork so MPNowPlayingInfoCenter stays empty
  // and the standard iOS Now Playing bar doesn't appear on the lock screen.
  // Our custom Live Activity (DMusicWidget) is the only lock-screen UI.
  await TrackPlayer.add({
    id: meta?.id || uri,
    url: uri,
    title: ' ',
    artist: ' ',
    duration: meta?.durationMs ? meta.durationMs / 1000 : undefined,
  });
  await TrackPlayer.play();
}

export async function pause() {
  await TrackPlayer.pause().catch(() => {});
}

export async function resume() {
  await TrackPlayer.play().catch(() => {});
}

export async function togglePlay(wantPlay: boolean) {
  if (wantPlay) await TrackPlayer.play().catch(() => {});
  else await TrackPlayer.pause().catch(() => {});
}

export async function seek(positionMs: number) {
  await TrackPlayer.seekTo(positionMs / 1000).catch(() => {});
}

export async function stop() {
  await TrackPlayer.reset().catch(() => {});
}
