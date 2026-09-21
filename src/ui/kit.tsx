import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const colors = {
  bg: '#070b10',
  card: '#121a24',
  accent: '#00d4ff',
  text: '#ffffff',
  muted: '#7a8a99',
  warn: '#ffb020',
  ok: '#5cff9a',
  dim: '#0e141c',
};

export function Screen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.inner, { paddingTop: Math.max(insets.top, 20) + 16 }]}
    >
      {children}
    </ScrollView>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.sec}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function Btn({
  label,
  onPress,
  kind = 'accent',
}: {
  label: string;
  onPress: () => void;
  kind?: 'accent' | 'muted' | 'danger';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.btn,
        kind === 'muted' && styles.btnMuted,
        kind === 'danger' && styles.btnDanger,
      ]}
    >
      <Text style={[styles.btnText, kind !== 'accent' && styles.btnTextLight]}>{label}</Text>
    </Pressable>
  );
}

export function Field(props: { value: string; onChangeText: (t: string) => void; placeholder: string }) {
  return <TextInput {...props} placeholderTextColor={colors.muted} style={styles.input} />;
}

export function RoundAction({
  label,
  sub,
  onPress,
}: {
  label: string;
  sub?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.roundWrap}>
      <View style={styles.round}>
        <Text style={styles.roundLab}>{label}</Text>
      </View>
      {sub ? <Text style={styles.roundSub}>{sub}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  inner: { padding: 20, paddingBottom: 36 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  sec: { color: colors.muted, fontSize: 12, fontWeight: '700', marginBottom: 10, letterSpacing: 0.6 },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 8,
    alignItems: 'center',
  },
  btnMuted: { backgroundColor: '#1c2836' },
  btnDanger: { backgroundColor: '#3a1c22' },
  btnText: { color: '#041018', fontWeight: '700', fontSize: 15 },
  btnTextLight: { color: colors.text },
  input: {
    color: colors.text,
    borderColor: '#243040',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    backgroundColor: colors.dim,
  },
  roundWrap: { alignItems: 'center', width: 84 },
  round: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1c2836',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a3a4c',
  },
  roundLab: { color: colors.accent, fontWeight: '700', fontSize: 13 },
  roundSub: { color: colors.muted, fontSize: 11, marginTop: 6 },
});
