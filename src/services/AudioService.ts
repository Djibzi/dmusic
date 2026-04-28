import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';

let sound: Audio.Sound | null = null;
let configured = false;
let statusListener: ((s: AVPlaybackStatusSuccess) => void) | null = null;

export async function configureAudio() {
  if (configured) return;
  await Audio.setAudioModeAsync({
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    interruptionModeIOS: 1,
  });
  configured = true;
}

export function onStatus(cb: (s: AVPlaybackStatusSuccess) => void) {
  statusListener = cb;
}

function attachListener(s: Audio.Sound) {
  s.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    statusListener?.(status);
  });
}

export async function playUri(uri: string) {
  await configureAudio();
  if (sound) {
    await sound.unloadAsync().catch(() => {});
    sound = null;
  }
  const { sound: s } = await Audio.Sound.createAsync(
    { uri },
    { shouldPlay: true, progressUpdateIntervalMillis: 500 }
  );
  sound = s;
  attachListener(s);
  return s;
}

export async function pause() {
  if (sound) await sound.pauseAsync().catch(() => {});
}

export async function resume() {
  if (sound) await sound.playAsync().catch(() => {});
}

export async function togglePlay(wantPlay: boolean) {
  if (!sound) return;
  if (wantPlay) await sound.playAsync().catch(() => {});
  else await sound.pauseAsync().catch(() => {});
}

export async function seek(positionMs: number) {
  if (sound) await sound.setPositionAsync(positionMs).catch(() => {});
}

export async function stop() {
  if (sound) {
    await sound.unloadAsync().catch(() => {});
    sound = null;
  }
}
