# DMusic

App musique iOS — lecture de fichiers locaux + streaming depuis une URL directe. Background audio, lock screen controls, mini-player persistant.

Design : Crimson Night + Violet Dusk (Direction B). Typographie : Archivo Black display, Instrument Serif italic pour contraste, Inter UI, JetBrains Mono meta.

## Démarrer

```bash
npm install
npx expo start
```

Puis scanne le QR avec l'app Expo Go (iOS) ou lance `w` pour ouvrir dans le navigateur.

## Build iOS sans Mac

```bash
npm i -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile preview   # .ipa ad-hoc
eas submit --platform ios                    # App Store
```

## Structure

```
app/                         expo-router
├── _layout.tsx              root (theme + fonts + audio)
├── index.tsx                redirect → onboarding
├── onboarding.tsx           3 étapes
├── (tabs)/
│   ├── library.tsx          bibliothèque + now-playing card
│   ├── player.tsx           player plein écran + waveform
│   └── links.tsx            URL mode + historique
├── playlists/
│   ├── index.tsx
│   └── [id].tsx             détail avec equalizer animé
├── queue.tsx
├── search.tsx
├── import.tsx
├── settings.tsx
└── lock.tsx                 preview lock screen widget

src/
├── theme/                   palettes + ThemeContext
├── components/              Artwork, TabBar, MiniPlayer, Icon
├── store/playerStore.ts     Zustand
├── services/AudioService.ts expo-av wrapper
└── data/sample.ts           mock data

design/                      Claude Design handoff bundle
```

## Palettes

- **Crimson Night** (par défaut) — `#ad2831` accent, noir rouge.
- **Violet Dusk** — `#a67fb7` accent, violet nuit.

Togglable depuis Settings → Apparence → Palette.

## Phase roadmap (depuis le plan)

- [x] MVP UI : Library, Player, Mini-player, Links, Onboarding
- [ ] `expo-document-picker` : import fichiers locaux
- [ ] `expo-media-library` : lecture Apple Music offline
- [ ] `expo-sqlite` : persistance tracks + liens
- [ ] Now-playing metadata (`Audio.setNowPlayingMetadataAsync`) pour lock screen
- [ ] Backend yt-dlp (mode perso) : `/stream?url=...`
