import { requireOptionalNativeModule, EventEmitter } from 'expo-modules-core';
import { Platform } from 'react-native';

type ActivityState = {
  title: string;
  artist: string;
  artworkURL?: string | null;
  positionMs: number;
  durationMs: number;
  isPlaying: boolean;
  accentHex: string;
  accentSecondaryHex: string;
  bgGlowHex: string;
  artHue: number;
  sourceIsLink: boolean;
};

export type LiveActivityAction =
  | { type: 'playPause' }
  | { type: 'replay' }
  | { type: 'seek'; position: number };

type DmusicActivityModuleType = {
  isSupported(): Promise<boolean>;
  startActivity(trackId: string, state: ActivityState): Promise<string>;
  updateActivity(state: ActivityState): Promise<void>;
  endActivity(): Promise<void>;
  setAppIcon(name: string | null): Promise<void>;
};

export type AppIconName = 'Crimson' | 'Violet' | null;

const native = requireOptionalNativeModule<DmusicActivityModuleType>('DmusicActivity');
const emitter = native ? new EventEmitter(native as any) : null;

export function addActionListener(cb: (action: LiveActivityAction) => void) {
  if (!emitter) return { remove: () => {} };
  return emitter.addListener('onAction', (e: { action: string; position?: number }) => {
    if (e.action === 'playPause') cb({ type: 'playPause' });
    else if (e.action === 'replay') cb({ type: 'replay' });
    else if (e.action === 'seek') cb({ type: 'seek', position: e.position ?? 0 });
  });
}

export async function isSupported(): Promise<boolean> {
  if (Platform.OS !== 'ios' || !native) return false;
  try {
    return await native.isSupported();
  } catch {
    return false;
  }
}

export async function startActivity(trackId: string, state: ActivityState): Promise<string | null> {
  if (Platform.OS !== 'ios' || !native) return null;
  console.log('[live-activity] start', trackId, 'artwork:', state.artworkURL ?? '(none)', 'sourceIsLink:', state.sourceIsLink);
  try {
    return await native.startActivity(trackId, state);
  } catch (e) {
    console.warn('[live-activity] start failed', e);
    return null;
  }
}

export async function updateActivity(state: ActivityState): Promise<void> {
  if (Platform.OS !== 'ios' || !native) return;
  try {
    await native.updateActivity(state);
  } catch (e) {
    console.warn('[live-activity] update failed', e);
  }
}

export async function endActivity(): Promise<void> {
  if (Platform.OS !== 'ios' || !native) return;
  console.log('[live-activity] end');
  try {
    await native.endActivity();
  } catch (e) {
    console.warn('[live-activity] end failed', e);
  }
}

// Switches the home-screen app icon. Pass null for the primary icon, or one
// of "Crimson" / "Violet" — names declared in CFBundleAlternateIcons via the
// withAlternateIcons config plugin. iOS shows an unsuppressable confirmation
// alert. Native side no-ops if already on the requested icon.
export async function setAppIcon(name: AppIconName): Promise<void> {
  if (Platform.OS !== 'ios' || !native) return;
  try {
    await native.setAppIcon(name);
  } catch (e) {
    console.warn('[live-activity] setAppIcon failed', e);
  }
}
