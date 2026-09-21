import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useWatch } from '../src/store';
import { Btn, Field, Section, colors } from '../src/ui/kit';

export default function Home() {
  const snap = useWatch();
  const { session, tx } = snap;
  const [app, setApp] = useState('Telegram');
  const [body, setBody] = useState('hello RoundOS');
  const [qr, setQr] = useState('https://github.com/yzmilad');
  const [nav, setNav] = useState('Turn right onto Valiasr');

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>RoundOS</Text>
      <Text style={styles.sub}>
        {snap.state} {snap.demo ? '· demo watch' : ''} {snap.watchBat != null ? `· bat ${snap.watchBat}%` : ''}
      </Text>
      {snap.error ? <Text style={styles.err}>{snap.error}</Text> : null}

      <Section title="M1 link">
        <Text style={styles.p}>
          {snap.devices.map((d) => d.name).join(', ') || 'no scan yet'}
        </Text>
        <Btn label="Scan + connect demo" onPress={() => void session.scan().then(() => session.connect())} />
        <Btn label="Disconnect" kind="muted" onPress={() => void session.disconnect()} />
      </Section>

      <Section title="M2 time">
        <Btn label="Sync phone clock → watch" onPress={() => void session.syncTime()} />
        <Btn
          label={snap.hour12 ? 'Use 24h' : 'Use 12h'}
          kind="muted"
          onPress={() => void session.setHour12(!snap.hour12)}
        />
      </Section>

      <Section title="M3 notification">
        <Field value={app} onChangeText={setApp} placeholder="app" />
        <Field value={body} onChangeText={setBody} placeholder="body" />
        <Btn label="Send last-chunk 0x72" onPress={() => void session.sendNotif(app, body)} />
        {snap.lastNotif ? <Text style={styles.p}>{snap.lastNotif}</Text> : null}
      </Section>

      <Section title="M4 find">
        <Btn label="Find watch" onPress={() => void session.findWatch()} />
        {tx ? (
          <Btn label="Simulate find phone (watch)" kind="muted" onPress={() => tx.simulateFindPhone(true)} />
        ) : null}
        {snap.findPhone ? (
          <View>
            <Text style={styles.warn}>Watch is finding this phone</Text>
            <Btn label="Cancel find phone" onPress={() => void session.cancelFindPhone()} />
          </View>
        ) : null}
      </Section>

      <Section title="M5 music (from watch)">
        <Text style={styles.p}>last command: {snap.lastMusic ?? '—'}</Text>
        {tx ? (
          <>
            <Btn label="Simulate toggle" kind="muted" onPress={() => tx.simulateMusicToggle()} />
            <Btn label="Simulate prev" kind="muted" onPress={() => tx.simulateMusicPrev()} />
            <Btn label="Simulate next" kind="muted" onPress={() => tx.simulateMusicNext()} />
          </>
        ) : null}
      </Section>

      <Section title="U3–U7 phone frames (watch firmware later)">
        <Btn label="U4 send phone battery 80%" onPress={() => void session.sendPhoneBattery(80, true)} />
        <Btn label="U3 camera ready" kind="muted" onPress={() => void session.cameraReady(true)} />
        <Btn label="U7 alarm 07:30 slot 0" kind="muted" onPress={() => void session.sendAlarm(0, 7, 30)} />
        <Field value={nav} onChangeText={setNav} placeholder="nav instruction" />
        <Btn label="U5 send nav" onPress={() => void session.sendNav('500 m', nav, '0.5 km', '2 min')} />
        <Field value={qr} onChangeText={setQr} placeholder="QR url" />
        <Btn label="U6 send QR" onPress={() => void session.sendQr(qr)} />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  inner: { padding: 20, paddingBottom: 48 },
  title: { color: colors.accent, fontSize: 28, fontWeight: '700' },
  sub: { color: colors.muted, marginTop: 4, marginBottom: 16 },
  p: { color: colors.text, fontSize: 14 },
  err: { color: '#ff6b6b', marginBottom: 8 },
  warn: { color: colors.warn, marginTop: 8 },
});
