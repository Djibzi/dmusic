import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Easing,
} from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { FONTS } from '@/theme/fonts';

export type SheetOption = {
  label: string;
  destructive?: boolean;
  cancel?: boolean;
  onPress?: () => void;
};

type PromptOpts = {
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit?: (value: string) => void;
};

type SheetOpts = {
  title?: string;
  message?: string;
  options: SheetOption[];
};

type ConfirmOpts = {
  title: string;
  message?: string;
  destructive?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
};

type Ctx = {
  prompt: (opts: PromptOpts) => void;
  sheet: (opts: SheetOpts) => void;
  confirm: (opts: ConfirmOpts) => void;
  alert: (title: string, message?: string) => void;
};

const SheetContext = createContext<Ctx | null>(null);

export function useSheet(): Ctx {
  const v = useContext(SheetContext);
  if (!v) throw new Error('useSheet must be used inside SheetProvider');
  return v;
}

export function SheetProvider({ children }: { children: React.ReactNode }) {
  const [promptState, setPromptState] = useState<PromptOpts | null>(null);
  const [sheetState, setSheetState] = useState<SheetOpts | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmOpts | null>(null);
  const [alertState, setAlertState] = useState<{ title: string; message?: string } | null>(null);

  const ctx: Ctx = {
    prompt: useCallback((opts) => setPromptState(opts), []),
    sheet: useCallback((opts) => setSheetState(opts), []),
    confirm: useCallback((opts) => setConfirmState(opts), []),
    alert: useCallback((title, message) => setAlertState({ title, message }), []),
  };

  return (
    <SheetContext.Provider value={ctx}>
      {children}
      <PromptModal opts={promptState} close={() => setPromptState(null)} />
      <ActionSheetModal opts={sheetState} close={() => setSheetState(null)} />
      <ConfirmModal opts={confirmState} close={() => setConfirmState(null)} />
      <AlertModal opts={alertState} close={() => setAlertState(null)} />
    </SheetContext.Provider>
  );
}

function useFadeSlide(visible: boolean) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
        Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]).start();
    } else {
      fade.setValue(0);
      slide.setValue(40);
    }
  }, [visible, fade, slide]);
  return { fade, slide };
}

function Backdrop({ onPress, fade }: { onPress: () => void; fade: Animated.Value }) {
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        opacity: fade,
      }}
    >
      <Pressable style={{ flex: 1 }} onPress={onPress} />
    </Animated.View>
  );
}

function PromptModal({ opts, close }: { opts: PromptOpts | null; close: () => void }) {
  const { palette, dark, c } = useTheme();
  const [value, setValue] = useState('');
  const inputRef = useRef<TextInput>(null);
  const { fade, slide } = useFadeSlide(!!opts);

  useEffect(() => {
    if (opts) {
      setValue(opts.defaultValue ?? '');
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [opts]);

  if (!opts) return null;

  const onSubmit = () => {
    const v = value.trim();
    close();
    if (v) opts.onSubmit?.(v);
  };

  return (
    <Modal transparent visible animationType="none" onRequestClose={close}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}
      >
        <Backdrop onPress={close} fade={fade} />
        <Animated.View
          style={{
            width: '100%',
            maxWidth: 340,
            backgroundColor: c.surface,
            borderRadius: 20,
            padding: 22,
            borderWidth: dark ? 1 : 0,
            borderColor: c.hairline,
            opacity: fade,
            transform: [{ translateY: slide }],
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 20,
              textTransform: 'uppercase',
              letterSpacing: -0.5,
              color: c.fg,
            }}
          >
            {opts.title}
          </Text>
          {opts.message ? (
            <Text style={{ fontFamily: FONTS.sans, fontSize: 13, color: c.muted, marginTop: 6 }}>
              {opts.message}
            </Text>
          ) : null}
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={setValue}
            placeholder={opts.placeholder}
            placeholderTextColor={c.muted}
            autoFocus
            autoCapitalize="sentences"
            autoCorrect={false}
            selectionColor={palette.accent}
            cursorColor={palette.accent}
            onSubmitEditing={onSubmit}
            returnKeyType="done"
            style={{
              marginTop: 16,
              backgroundColor: c.softFill,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 14,
              fontFamily: FONTS.sans,
              fontSize: 15,
              color: c.fg,
              borderWidth: 2,
              borderColor: palette.accent,
            }}
          />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <Pressable
              onPress={close}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 999,
                backgroundColor: c.softFill,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 12,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  color: c.fg,
                }}
              >
                {opts.cancelLabel ?? 'Annuler'}
              </Text>
            </Pressable>
            <Pressable
              onPress={onSubmit}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 999,
                backgroundColor: palette.accent,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 12,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  color: '#fff',
                }}
              >
                {opts.submitLabel ?? 'Valider'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ActionSheetModal({ opts, close }: { opts: SheetOpts | null; close: () => void }) {
  const { palette, dark, c } = useTheme();
  const { fade, slide } = useFadeSlide(!!opts);
  if (!opts) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={close}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Backdrop onPress={close} fade={fade} />
        <Animated.View
          style={{
            backgroundColor: c.surface,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            padding: 14,
            paddingBottom: 30,
            borderWidth: dark ? 1 : 0,
            borderColor: c.hairline,
            opacity: fade,
            transform: [{ translateY: slide }],
          }}
        >
          {(opts.title || opts.message) && (
            <View style={{ paddingHorizontal: 8, paddingTop: 8, paddingBottom: 14 }}>
              {opts.title ? (
                <Text
                  numberOfLines={2}
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 18,
                    textTransform: 'uppercase',
                    letterSpacing: -0.3,
                    color: c.fg,
                  }}
                >
                  {opts.title}
                </Text>
              ) : null}
              {opts.message ? (
                <Text
                  numberOfLines={2}
                  style={{ fontFamily: FONTS.sans, fontSize: 13, color: c.muted, marginTop: 4 }}
                >
                  {opts.message}
                </Text>
              ) : null}
            </View>
          )}
          {opts.options
            .filter((o) => !o.cancel)
            .map((o, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  close();
                  o.onPress?.();
                }}
                style={({ pressed }) => ({
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 14,
                  marginBottom: 4,
                  backgroundColor: pressed ? c.softFill : 'transparent',
                })}
              >
                <Text
                  style={{
                    fontFamily: FONTS.sansSemi,
                    fontSize: 15,
                    color: o.destructive ? '#e94c4c' : c.fg,
                  }}
                >
                  {o.label}
                </Text>
              </Pressable>
            ))}
          <Pressable
            onPress={close}
            style={({ pressed }) => ({
              marginTop: 10,
              paddingVertical: 14,
              borderRadius: 999,
              backgroundColor: pressed ? c.softFill : c.softFill,
              alignItems: 'center',
            })}
          >
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 12,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: c.fg,
              }}
            >
              Annuler
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

function ConfirmModal({ opts, close }: { opts: ConfirmOpts | null; close: () => void }) {
  const { palette, dark, c } = useTheme();
  const { fade, slide } = useFadeSlide(!!opts);
  if (!opts) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={close}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
        <Backdrop onPress={close} fade={fade} />
        <Animated.View
          style={{
            width: '100%',
            maxWidth: 340,
            backgroundColor: c.surface,
            borderRadius: 20,
            padding: 22,
            borderWidth: dark ? 1 : 0,
            borderColor: c.hairline,
            opacity: fade,
            transform: [{ translateY: slide }],
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 20,
              textTransform: 'uppercase',
              letterSpacing: -0.5,
              color: c.fg,
            }}
          >
            {opts.title}
          </Text>
          {opts.message ? (
            <Text style={{ fontFamily: FONTS.sans, fontSize: 13, color: c.muted, marginTop: 6, lineHeight: 19 }}>
              {opts.message}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 18 }}>
            <Pressable
              onPress={close}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 999,
                backgroundColor: c.softFill,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 12,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  color: c.fg,
                }}
              >
                {opts.cancelLabel ?? 'Annuler'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                close();
                opts.onConfirm?.();
              }}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 999,
                backgroundColor: opts.destructive ? '#e94c4c' : palette.accent,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 12,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  color: '#fff',
                }}
              >
                {opts.confirmLabel ?? 'OK'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function AlertModal({
  opts,
  close,
}: {
  opts: { title: string; message?: string } | null;
  close: () => void;
}) {
  const { palette, dark, c } = useTheme();
  const { fade, slide } = useFadeSlide(!!opts);
  if (!opts) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={close}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
        <Backdrop onPress={close} fade={fade} />
        <Animated.View
          style={{
            width: '100%',
            maxWidth: 340,
            backgroundColor: c.surface,
            borderRadius: 20,
            padding: 22,
            borderWidth: dark ? 1 : 0,
            borderColor: c.hairline,
            opacity: fade,
            transform: [{ translateY: slide }],
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 20,
              textTransform: 'uppercase',
              letterSpacing: -0.5,
              color: c.fg,
            }}
          >
            {opts.title}
          </Text>
          {opts.message ? (
            <Text style={{ fontFamily: FONTS.sans, fontSize: 13, color: c.muted, marginTop: 6, lineHeight: 19 }}>
              {opts.message}
            </Text>
          ) : null}
          <Pressable
            onPress={close}
            style={{
              marginTop: 18,
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor: palette.accent,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 12,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: '#fff',
              }}
            >
              OK
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}
