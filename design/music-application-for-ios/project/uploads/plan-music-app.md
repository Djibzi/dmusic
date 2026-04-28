# Plan — App Musique iPhone (sans MacBook)

## La contrainte clé : pas de Mac

C'est le vrai défi. Xcode tourne exclusivement sur macOS. La solution : **Expo + EAS Build** (Expo Application Services), qui compile ton app iOS dans le cloud sur des serveurs macOS. Tu codes sur Windows, tu pushs, le cloud construit l'`.ipa`, et tu soumets à l'App Store — tout ça sans Mac physique.

---

## Stack recommandée

| Rôle | Outil | Pourquoi |
|---|---|---|
| Framework | **React Native + Expo SDK** | Connaissance React existante, adoption rapide |
| Audio | **expo-audio** (ou `expo-av`) | Gère le background audio iOS nativement |
| Build cloud | **EAS Build** | Compile iOS sans Mac |
| Soumission | **EAS Submit** | Envoie à l'App Store sans Mac |
| État global | **Zustand** | Léger, parfait pour un player |
| Stockage local | **expo-file-system + expo-sqlite** | Bibliothèque musicale locale |

---

## Architecture de l'app

```
src/
├── app/                  # Expo Router (navigation)
│   ├── (tabs)/
│   │   ├── library.tsx   # Bibliothèque musicale
│   │   ├── player.tsx    # Player principal
│   │   └── playlists.tsx
│   └── _layout.tsx
├── services/
│   └── AudioService.ts   # Singleton du player audio
├── store/
│   └── playerStore.ts    # Zustand — état global du player
└── components/
    ├── MiniPlayer.tsx     # Barre persistante en bas
    ├── FullPlayer.tsx     # Vue plein écran
    └── TrackList.tsx
```

---

## Background Audio — le point critique iOS

C'est ici que ça se joue. Il faut **3 configurations obligatoires** :

### 1. `app.json` — déclarer le background mode

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.tonnom.musicapp",
      "infoPlist": {
        "UIBackgroundModes": ["audio"]
      }
    }
  }
}
```

### 2. `AudioService.ts` — configurer la session AVAudio

```typescript
import { Audio } from 'expo-av';

// À appeler au démarrage de l'app — UNE SEULE FOIS
await Audio.setAudioModeAsync({
  staysActiveInBackground: true,       // ← musique continue en veille
  playsInSilentModeIOS: true,          // ← joue même en mode silencieux
  shouldDuckAndroid: true,
  interruptionModeIOS: 1,              // mixe avec autres apps si besoin
});
```

### 3. Lock Screen Controls (Control Center)

Expo gère ça automatiquement via `expo-av` avec les métadonnées :

```typescript
await Audio.setNowPlayingMetadataAsync({
  artist: track.artist,
  title: track.title,
  albumArtUri: track.artwork,
});
```

→ Les boutons play/pause apparaissent sur l'écran de verrouillage et dans le Control Center.

---

## Lecture via lien URL

L'app permet de coller un lien direct vers un fichier audio (`.mp3`, `.m4a`, `.ogg`, etc.) et de le lire instantanément — sans téléchargement préalable.

### Comment ça fonctionne

`expo-av` accepte nativement une URL comme source audio, exactement comme un fichier local. iOS gère le buffering et le streaming en arrière-plan automatiquement.

```typescript
// Lecture directe depuis une URL
const { sound } = await Audio.Sound.createAsync(
  { uri: 'https://example.com/track.mp3' },
  { shouldPlay: true }
);
```

### Interface dans l'app

Un bouton **"Lire depuis un lien"** ouvre une modale avec :

- Un champ texte pour coller l'URL
- Un bouton **Lire** qui lance la piste directement dans le player
- Un bouton **Ajouter à la bibliothèque** pour sauvegarder le lien localement (via SQLite) avec un nom personnalisé

```typescript
// Sauvegarder un lien dans la bibliothèque locale
await db.runAsync(
  'INSERT INTO tracks (title, artist, uri, type) VALUES (?, ?, ?, ?)',
  [customTitle, customArtist, url, 'remote']
);
```

### Sources compatibles

| Type | Exemple | Compatible |
|---|---|---|
| Fichier audio direct | `https://monsite.com/track.mp3` | ✅ Oui |
| SoundCloud (lien direct) | URL `.mp3` extraite | ✅ Oui |
| YouTube | `youtube.com/watch?v=...` | ❌ Non (DRM) |
| Spotify / Apple Music | Liens streaming | ❌ Non (DRM) |

> **Note :** seules les URLs pointant directement vers un fichier audio fonctionnent. Les plateformes avec DRM (YouTube, Spotify) ne sont pas compatibles sans leur SDK officiel.

---

## Fonctionnalités — par phases

### Phase 1 — MVP (3-4 semaines)

- Importer de la musique depuis les fichiers iPhone (`expo-document-picker`)
- **Lecture via lien URL** (coller un lien → lecture directe)
- Player basique : play / pause / suivant / précédent
- Background audio + lock screen controls
- Mini-player persistant en bas de l'écran

### Phase 2 — Bibliothèque (2 semaines)

- Lire la bibliothèque Apple Music locale (`expo-media-library`)
- Tri par artiste / album / titre
- Playlists manuelles (SQLite)
- **Sauvegarder des liens URL dans la bibliothèque** avec titre/artiste personnalisés

### Phase 3 — Expérience (2 semaines)

- Animations du player (artwork rotatif, waveform)
- Mode shuffle / repeat
- Crossfade entre pistes
- Égaliseur basique
- **Historique des liens écoutés récemment**

---

## Workflow de build sans Mac

```bash
# 1. Installer les outils
npm install -g eas-cli
eas login   # ton compte Apple Developer

# 2. Configurer le projet
eas build:configure

# 3. Lancer un build iOS dans le cloud (gratuit : 30 builds/mois)
eas build --platform ios --profile preview

# 4. Soumettre à l'App Store
eas submit --platform ios
```

EAS gère automatiquement les **certificates** et **provisioning profiles** avec ton compte Apple Developer — pas besoin de les créer manuellement.

---

## Limites à anticiper

- **expo-media-library** donne accès aux fichiers audio locaux mais **pas** à l'Apple Music streaming (DRM). Tu peux lire les fichiers téléchargés offline, pas les tracks streamées.
- Les liens URL ne fonctionnent qu'avec des fichiers audio directs — pas les plateformes protégées (YouTube, Spotify).
- Le build cloud EAS prend ~15-20 min par compilation.
- Gratuit jusqu'à 30 builds/mois sur EAS.

---

## Pour démarrer aujourd'hui

```bash
npx create-expo-app MusicApp --template blank-typescript
cd MusicApp
npx expo install expo-av expo-media-library expo-document-picker zustand expo-sqlite
```
