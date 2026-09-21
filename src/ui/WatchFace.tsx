import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from './kit';

export function WatchFace({
  linked,
  name,
  bat,
}: {
  linked: boolean;
  name: string;
  bat: number | null;
}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  const day = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <View style={styles.outer}>
      <View style={[styles.ring, linked ? styles.ringOn : styles.ringOff]}>
        <View style={styles.inner}>
          <Text style={styles.name}>{name || 'RoundOS'}</Text>
          <Text style={styles.time}>
            {hh}:{mm}
          </Text>
          <Text style={styles.day}>{day}</Text>
          <Text style={styles.bat}>
            {linked ? `${bat ?? '—'}%` : 'Not linked'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { alignItems: 'center', marginVertical: 12 },
  ring: {
    width: 216,
    height: 216,
    borderRadius: 108,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a1018',
  },
  ringOn: { borderColor: colors.accent },
  ringOff: { borderColor: '#2a3545' },
  inner: { alignItems: 'center', paddingHorizontal: 16 },
  name: { color: colors.muted, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' },
  time: { color: colors.text, fontSize: 44, fontWeight: '700', marginTop: 4 },
  day: { color: colors.muted, fontSize: 13, marginTop: 2 },
  bat: { color: colors.accent, fontSize: 15, fontWeight: '700', marginTop: 10 },
});
