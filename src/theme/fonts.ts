import {
  ArchivoBlack_400Regular,
} from '@expo-google-fonts/archivo-black';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';

export const FONTS = {
  mono: 'JetBrainsMono_400Regular',
  monoB: 'JetBrainsMono_600SemiBold',
  sans: 'Inter_400Regular',
  sansMed: 'Inter_500Medium',
  sansSemi: 'Inter_600SemiBold',
  sansB: 'Inter_700Bold',
  display: 'ArchivoBlack_400Regular',
  serif: 'InstrumentSerif_400Regular',
  serifI: 'InstrumentSerif_400Regular_Italic',
} as const;

export const FONT_MAP = {
  ArchivoBlack_400Regular,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
};
