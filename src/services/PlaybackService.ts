import TrackPlayer, { Event } from 'react-native-track-player';
import { usePlayerStore } from '@/store/playerStore';

export async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    await TrackPlayer.play().catch(() => {});
    usePlayerStore.setState({ isPlaying: true });
  });

  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    await TrackPlayer.pause().catch(() => {});
    usePlayerStore.setState({ isPlaying: false });
  });

  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    await usePlayerStore.getState().stopPlayback();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    await usePlayerStore.getState().skipNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    await usePlayerStore.getState().skipPrev();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, async (event) => {
    await TrackPlayer.seekTo(event.position).catch(() => {});
  });

  TrackPlayer.addEventListener(Event.RemoteJumpForward, async (event) => {
    const progress = await TrackPlayer.getProgress();
    await TrackPlayer.seekTo(progress.position + (event.interval ?? 15)).catch(() => {});
  });

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async (event) => {
    const progress = await TrackPlayer.getProgress();
    await TrackPlayer.seekTo(Math.max(0, progress.position - (event.interval ?? 15))).catch(() => {});
  });
}
