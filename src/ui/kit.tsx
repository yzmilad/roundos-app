import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ReactNode } from 'react';

export const colors = {
  bg: '#0b0f14',
  card: '#1c2433',
  accent: '#00d4ff',
  text: '#ffffff',
  muted: '#7a8a99',
  warn: '#ffb020',
  ok: '#5cff9a',
};

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sec}>{title}</Text>
      {children}
    </View>
  );
}

export function Btn({ label, onPress, kind = 'accent' }: { label: string; onPress: () => void; kind?: 'accent' | 'muted' }) {
  return (
    <Pressable onPress={onPress} style={[styles.btn, kind === 'muted' && styles.btnMuted]}>
      <Text style={[styles.btnText, kind === 'muted' && styles.btnTextMuted]}>{label}</Text>
    </Pressable>
  );
}

export function Field(props: { value: string; onChangeText: (t: string) => void; placeholder: string }) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.muted}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  sec: { color: colors.accent, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  btnMuted: { backgroundColor: '#2a3545' },
  btnText: { color: '#041018', fontWeight: '700' },
  btnTextMuted: { color: colors.text },
  input: {
    color: colors.text,
    borderColor: '#334',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
  },
});
