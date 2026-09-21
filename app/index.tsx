import { StyleSheet, Text, View } from 'react-native';
import { NORDIC, WATCH_NAME } from '../src/protocol';

export default function Home() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>RoundOS</Text>
      <Text style={styles.sub}>M0 Hello RN</Text>
      <Text style={styles.meta}>watch {WATCH_NAME}</Text>
      <Text style={styles.meta}>{NORDIC.service}</Text>
      <Text style={styles.hint}>npm test — protocol codec</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#0b0f14',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { color: '#00d4ff', fontSize: 28, fontWeight: '700' },
  sub: { color: '#ffffff', fontSize: 18, marginTop: 8 },
  meta: { color: '#7a8a99', fontSize: 12, marginTop: 12, textAlign: 'center' },
  hint: { color: '#7a8a99', fontSize: 14, marginTop: 28 },
});
