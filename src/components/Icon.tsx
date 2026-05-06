import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

type Props = {
  name:
    | 'search'
    | 'plus'
    | 'play'
    | 'pause'
    | 'prev'
    | 'next'
    | 'shuffle'
    | 'repeat'
    | 'link'
    | 'queue'
    | 'volume'
    | 'library'
    | 'chevronRight'
    | 'chevronDown'
    | 'dots'
    | 'folder'
    | 'apple'
    | 'airdrop'
    | 'invalid'
    | 'handles'
    | 'settings';
  size?: number;
  color?: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
};

export function Icon({ name, size = 20, color = '#000', stroke, strokeWidth = 1.6, fill }: Props) {
  const s = stroke ?? color;
  const f = fill ?? 'none';
  switch (name) {
    case 'search':
      return (
        <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <Circle cx={7} cy={7} r={5} stroke={s} strokeWidth={strokeWidth} />
          <Path d="M14 14l-3.5-3.5" stroke={s} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'plus':
      return (
        <Svg width={size} height={size} viewBox="0 0 16 16">
          <Path d="M8 2v12M2 8h12" stroke={s} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );
    case 'play':
      return (
        <Svg width={size} height={size} viewBox="0 0 18 18" fill={fill ?? color}>
          <Path d="M4 2l12 7-12 7V2z" />
        </Svg>
      );
    case 'pause':
      return (
        <Svg width={size} height={size} viewBox="0 0 16 16" fill={fill ?? color}>
          <Path d="M3 2h4v12H3zM9 2h4v12H9z" />
        </Svg>
      );
    case 'prev':
      return (
        <Svg width={size} height={(size * 22) / 28} viewBox="0 0 28 22" fill={color}>
          <Path d="M14 2L0 11l14 9V2zM28 2l-14 9 14 9V2z" />
        </Svg>
      );
    case 'next':
      return (
        <Svg width={size} height={(size * 22) / 28} viewBox="0 0 28 22" fill={color}>
          <Path d="M14 2l14 9-14 9V2zM0 2l14 9L0 20V2z" />
        </Svg>
      );
    case 'shuffle':
      return (
        <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
          <Path
            d="M3 5h10M18 2l3 3-3 3M19 5H8M3 17h10M18 14l3 3-3 3"
            stroke={s}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'repeat':
      return (
        <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
          <Path
            d="M11 3a8 8 0 108 8M11 3V0M11 3l3 2M11 3L8 5"
            stroke={s}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'link':
      return (
        <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
          <Path
            d="M7 11l-3 3a3 3 0 004 4l3-3M11 7l3-3a3 3 0 114 4l-3 3M7 13l6-6"
            stroke={s}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'queue':
      return (
        <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
          <Path d="M3 6h14M3 10h14M3 14h10" stroke={s} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'volume':
      return (
        <Svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
          <Path d="M5 5l4-3v12L5 11H2V5h3z" />
        </Svg>
      );
    case 'library':
      return (
        <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
          <Path
            d="M2 4h14v12H2zM5 7h8M5 10h8M5 13h5"
            stroke={s}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'chevronRight':
      return (
        <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <Path d="M6 3l5 5-5 5" stroke={s} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'chevronDown':
      return (
        <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <Path d="M3 6l5 5 5-5" stroke={s} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'dots':
      return (
        <Svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
          <Circle cx={4} cy={10} r={1.5} />
          <Circle cx={10} cy={10} r={1.5} />
          <Circle cx={16} cy={10} r={1.5} />
        </Svg>
      );
    case 'folder':
      return (
        <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
          <Path
            d="M4 3h8l3 3v10H4V3z"
            stroke={s}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'apple':
      return (
        <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
          <Circle cx={10} cy={10} r={7} stroke={s} strokeWidth={strokeWidth} />
          <Path d="M10 6v6M7 10h6" stroke={s} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'airdrop':
      return (
        <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
          <Path
            d="M10 2v10M5 7l5-5 5 5M4 15h12"
            stroke={s}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'invalid':
      return (
        <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <Circle cx={8} cy={8} r={6} stroke={s} strokeWidth={1.8} />
          <Path d="M4 12l8-8" stroke={s} strokeWidth={1.8} />
        </Svg>
      );
    case 'handles':
      return (
        <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
          <Path
            d="M2 3h10M2 7h10M2 11h10"
            stroke={s}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'settings':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 15a3 3 0 100-6 3 3 0 000 6z"
            stroke={s}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
            stroke={s}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    default:
      return null;
  }
}
