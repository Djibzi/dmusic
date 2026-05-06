# DMusic

App musique iOS native avec Live Activity custom au design glassmorphism.
Lit des fichiers audio locaux et streame depuis n'importe quelle URL YouTube/SoundCloud
via un backend yt-dlp en local. Deux thèmes, icône d'app dynamique selon le thème,
controles lock screen entièrement custom (pas de player Apple).

| Crimson Night | Violet Dusk |
|---|---|
| Rouge profond, accent `#ad2831` | Violet nuit, accent `#a149e0` |

## Fonctionnalités

- **Lecture locale** — import via `expo-document-picker` + `expo-media-library`,
  persistance SQLite (`expo-sqlite`)
- **Mode lien** — colle une URL YouTube/SoundCloud, le backend résout via yt-dlp
  et retourne un manifest audio + waveform pré-calculée
- **Live Activity custom** — bannière glassmorphism sur l'écran verrouillé avec
  artwork, titre, waveform 56-bars tactile pour seek, boutons play/pause/replay
  via App Intents (iOS 17+). Aucune dépendance au lecteur Apple standard.
- **Alternate app icons** — l'icône de l'app sur l'écran d'accueil change quand
  tu switches de palette dans les Settings
- **Thèmes** — Crimson Night (rouge) / Violet Dusk (violet), persistés en SQLite
- **Background audio** — `react-native-track-player` avec capabilities vidées
  pour qu'aucun control system Apple ne s'affiche

## Stack

- **Frontend** : Expo SDK 54, React Native 0.81, TypeScript, Zustand, expo-router v6
- **Audio** : `react-native-track-player` 4.x (avec `MPNowPlayingInfoCenter` /
  `MPRemoteCommandCenter` neutralisés via timer 250ms côté natif pour cacher
  le player Apple par défaut)
- **Live Activity** : `ActivityKit` + `WidgetKit` + `App Intents` (iOS 17+),
  config via `@bacons/apple-targets` qui génère le widget extension target
- **Module natif custom** (`modules/dmusic-activity`) — Expo Module qui expose
  `startActivity`, `updateActivity`, `endActivity`, `setAppIcon`, et écoute les
  intents Live Activity via App Group UserDefaults
- **Backend** : FastAPI + yt-dlp (Python), tourne en local sur `:8787`

## Structure

```
app/                              expo-router (UI)
├── _layout.tsx                   root provider
├── onboarding.tsx
├── (tabs)/
│   ├── library.tsx               bibliothèque + now-playing
│   ├── player.tsx                player plein écran
│   └── links.tsx                 mode URL
├── playlists/[id].tsx
├── queue.tsx, search.tsx, settings.tsx, ...

src/
├── theme/                        palettes + ThemeContext
├── components/                   MiniPlayer, Cover, Sheet, ...
├── store/playerStore.ts          Zustand (état lecture + Live Activity)
└── services/
    ├── AudioService.ts           wrapper RNTP
    ├── PlaybackService.ts        handlers RemotePlay/Pause/Seek
    ├── Extractor.ts              client backend yt-dlp
    └── Storage.ts                expo-sqlite

modules/dmusic-activity/          Expo Module natif (Swift)
├── ios/DmusicActivityModule.swift  ActivityKit bridge + setAppIcon
└── index.ts                       wrapper TS

targets/dmusicwidget/             Widget Extension iOS (via @bacons/apple-targets)
├── DMusicLiveActivity.swift      UI SwiftUI glassmorphism
├── DMusicAttributes.swift        ActivityAttributes
├── DMusicIconData.swift          icônes embeddées en base64
├── MusicIntents.swift            App Intents play/pause/seek
└── expo-target.config.js

plugins/withAlternateIcons.js     config plugin custom (alternate app icons)
backend/                          FastAPI + yt-dlp
```

## Setup

### Frontend

```bash
npm install
npx expo start
```

Sur Windows, le `.npmrc` à la racine active `legacy-peer-deps=true` pour gérer
les conflits de peer deps avec RNTP/Reanimated.

### Backend (mode lien)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8787
```

L'app pointe par défaut vers `http://192.168.1.180:8787` — adapte
[src/services/Extractor.ts](src/services/Extractor.ts) à ton IP locale.

### Build iOS (EAS)

Pas de Xcode local nécessaire (dev sur Windows).

```bash
npm i -g eas-cli
eas login
eas build --platform ios --profile development
```

Profile `development` = dev client avec Metro bundler en mode debug.
L'archive `.ipa` est installée via TestFlight ou install link.

Prérequis Apple Developer :
- App Group `group.com.dmusic.app` créé et associé aux deux bundle IDs
  (`com.dmusic.app` et `com.dmusic.app.widget`)
- Live Activities entitlement (auto via `NSSupportsLiveActivities` dans Info.plist)
- Deployment target iOS 17.0 (App Intents pour les boutons Live Activity)

## Architecture Live Activity

Le flux d'un click bouton sur le Live Activity :

```
User tap bouton lock screen
  ↓
PlayPauseIntent.perform()  (App Intent dans le widget process)
  ↓
écrit timestamp dans App Group UserDefaults
  ↓
Timer 250ms côté app principal (DmusicActivityModule) détecte le nouveau ts
  ↓
sendEvent("onAction", { action: "playPause" })
  ↓
JS : playerStore listener → toggle()
  ↓
RNTP play/pause + LiveActivity.updateActivity(state) → SwiftUI re-render
```

Le timer côté app sert aussi à **neutraliser le player Apple natif** :
toutes les 250ms, on vide `MPNowPlayingInfoCenter.nowPlayingInfo` et on retire
les targets de toutes les `MPRemoteCommand`. C'est la seule façon trouvée pour
empêcher RNTP/SwiftAudioEx d'afficher la bande "Now Playing" Apple sur le lock
screen — elle apparaîtrait au-dessus de notre Live Activity sinon.

## Limitations connues

- **Popup iOS au changement d'icône** — `setAlternateIconName` déclenche une
  alerte système "DMusic souhaite changer d'icône" non-supprimable (limitation
  Apple, valable pour toutes les apps App Store)
- **Live Activity ne survit pas à un force-quit** — limitation Apple. On
  termine proprement les activités via `UIApplication.willTerminateNotification`
  et on configure un `staleDate` à 30s comme fallback.
- **Backend en local uniquement** — yt-dlp bouge trop souvent pour déployer en
  prod sans CI de mise à jour. Le déploiement Fly.io est documenté mais pas actif.

## Conception

Design Live Activity dans [design/design_handoff_live_activity/](design/design_handoff_live_activity/).
Icônes (Crimson + Violet) extraites de `design/DMusic Icons.pdf` via PyMuPDF
(non commité).
