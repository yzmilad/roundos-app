import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useWatch } from '../src/store';
import { Btn, Field, RoundAction, Screen, Section, colors } from '../src/ui/kit';

export default function MusicScreen() {
  const snap = useWatch();
  const { session } = snap;
  const [song, setSong] = useState('Song');
  const [vol, setVol] = useState(64);

  const pushInfo = (v = vol) => {
    setVol(v);
    void session.sendMusicInfo(song, v);
  };

  return (
    <Screen>
      <Text style={styles.title}>Music</Text>
      <Text style={styles.sub}>
        {snap.lastMusic ? `Watch pressed ${snap.lastMusic}` : 'Now playing is sent to the watch'}
      </Text>

      <Section title="Now playing">
        <Field value={song} onChangeText={setSong} placeholder="track title" />
        <Btn label="Send to watch" onPress={() => pushInfo()} />
        <Text style={styles.vol}>Volume {vol}%</Text>
        <View style={styles.row}>
          <RoundAction label="−" sub="vol" onPress={() => pushInfo(Math.max(0, vol - 8))} />
          <RoundAction label="♪" sub="send" onPress={() => pushInfo()} />
          <RoundAction label="+" sub="vol" onPress={() => pushInfo(Math.min(100, vol + 8))} />
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 26, fontWeight: '700' },
  sub: { color: colors.muted, marginTop: 4, marginBottom: 16 },
  vol: { color: colors.accent, marginTop: 12, textAlign: 'center', fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
});
