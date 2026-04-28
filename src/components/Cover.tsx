import React, { useState } from 'react';
import { Image } from 'react-native';
import { Artwork } from './Artwork';
import type { Track } from '@/store/playerStore';

export function Cover({
  size,
  track,
  variant,
}: {
  size: number;
  track: Pick<Track, 'thumbnail' | 'hue' | 'variant'>;
  variant?: 0 | 1 | 2;
}) {
  const [failed, setFailed] = useState(false);
  if (track.thumbnail && !failed) {
    return (
      <Image
        source={{ uri: track.thumbnail }}
        onError={() => setFailed(true)}
        style={{
          width: size,
          height: size,
          borderRadius: Math.max(6, size * 0.06),
          backgroundColor: '#000',
        }}
        resizeMode="cover"
      />
    );
  }
  return <Artwork size={size} hue={track.hue} variant={variant ?? track.variant ?? 0} />;
}
