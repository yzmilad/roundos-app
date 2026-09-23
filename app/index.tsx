import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useWatch } from '../src/store';
import { Btn, RoundAction, Screen, colors } from '../src/ui/kit';
import { WatchFace } from '../src/ui/WatchFace';

export default function WatchScreen() {
  const snap = useWatch();
  const { session, patchPrefs } = snap;
  const linked = snap.state === 'ready';

  useEffect(() => {
    if (snap.prefs.hour12 !== snap.hour12 && linked) {
      void session.setHour12(snap.prefs.hour12);
    }
  }, [linked, session, snap.hour12, snap.prefs.hour12]);

  return (
    <Screen>
      <Text style={styles.brand}>RoundOS</Text>
      <Text style={styles.sub}>
        {linked ? 'Connected' : snap.state === 'scan' ? 'Scanning…' : snap.state === 'link' ? 'Linking…' : 'Companion'}
        {snap.demo ? ' · demo' : ''}
        {snap.phoneBat != null ? ` · phone ${snap.phoneBat}%` : ''}
      </Text>
      {snap.error ? <Text style={styles.err}>{snap.error}</Text> : null}

      <WatchFace linked={linked} name={snap.name || 'RoundOS'} bat={snap.watchBat} />

      {snap.findPhone ? (
        <View style={styles.ringCard}>
          <Text style={styles.ringTitle}>Watch is ringing this phone</Text>
          <Btn label="Stop" kind="danger" onPress={() => void session.cancelFindPhone()} />
        </View>
      ) : null}

      {snap.shutter ? (
        <View style={styles.ringCard}>
          <Text style={styles.ringTitle}>Watch shutter</Text>
          <Btn label="Done" kind="muted" onPress={() => session.ackShutter()} />
        </View>
      ) : null}

      <View style={styles.actions}>
        <RoundAction label="Find" sub="watch" onPress={() => void session.findWatch()} />
        <RoundAction label="Sync" sub="time" onPress={() => void session.syncTime()} />
        <RoundAction
          label={snap.hour12 ? '12h' : '24h'}
          sub="clock"
          onPress={() => {
            const next = !snap.hour12;
            void session.setHour12(next);
            patchPrefs({ hour12: next });
          }}
        />
      </View>

      {linked ? (
        <Btn label="Disconnect" kind="muted" onPress={() => void session.disconnect()} />
      ) : (
        <Btn
          label="Connect RoundOS"
          onPress={() => void session.connectRoundOs()}
        />
      )}

      {snap.devices.length > 0 && !linked ? (
        <View style={styles.list}>
          {snap.devices.map((d) => (
            <Pressable key={d.id} onPress={() => void session.connect(d.id)} style={styles.dev}>
              <Text style={styles.devName}>{d.name}</Text>
              <Text style={styles.devMeta}>{d.rssi != null ? `${d.rssi} dBm` : d.id}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { color: colors.accent, fontSize: 22, fontWeight: '700', letterSpacing: 1 },
  sub: { color: colors.muted, marginTop: 4, marginBottom: 4 },
  err: { color: '#ff6b6b', marginBottom: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 18 },
  ringCard: {
    backgroundColor: '#2a1c10',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  ringTitle: { color: colors.warn, fontWeight: '700', textAlign: 'center' },
  list: { marginTop: 12 },
  dev: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  devName: { color: colors.text, fontWeight: '700' },
  devMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
