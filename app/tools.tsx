import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useWatch } from '../src/store';
import { Btn, Field, Screen, Section, colors } from '../src/ui/kit';

export default function ToolsScreen() {
  const snap = useWatch();
  const { session, tx } = snap;
  const [qr, setQr] = useState('https://github.com/yzmilad');
  const [nav, setNav] = useState('Turn right onto Valiasr');

  return (
    <Screen>
      <Text style={styles.title}>Tools</Text>
      <Text style={styles.sub}>Camera, maps, QR and alarms</Text>

      <Section title="Camera">
        <Btn
          label={snap.shutter ? 'Shutter received' : 'Camera ready'}
          onPress={() => void session.cameraReady(true)}
        />
        {snap.shutter ? <Btn label="Clear shutter" kind="muted" onPress={() => session.ackShutter()} /> : null}
      </Section>

      <Section title="Navigation">
        <Field value={nav} onChangeText={setNav} placeholder="instruction" />
        <Btn label="Send turn" onPress={() => void session.sendNav('500 m', nav, '0.5 km', '2 min')} />
        <Btn label="End navigation" kind="muted" onPress={() => void session.navOff()} />
      </Section>

      <Section title="QR">
        <Field value={qr} onChangeText={setQr} placeholder="link" />
        <Btn label="Send link" onPress={() => void session.sendQr(qr)} />
      </Section>

      <Section title="Alarm">
        <Btn label="Set 07:30" onPress={() => void session.sendAlarm(0, 7, 30)} />
      </Section>

      {tx ? (
        <Section title="Demo watch">
          <Text style={styles.hint}>Only while the fake watch is connected in the browser.</Text>
          <Btn label="Ring this phone" kind="muted" onPress={() => tx.simulateFindPhone(true)} />
          <Btn label="Watch shutter" kind="muted" onPress={() => tx.simulateCapture()} />
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 26, fontWeight: '700' },
  sub: { color: colors.muted, marginTop: 4, marginBottom: 16 },
  hint: { color: colors.muted, fontSize: 12, marginBottom: 8 },
});
