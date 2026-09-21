import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { getBridge } from '../src/native/bridge';
import { useWatch } from '../src/store';
import { Btn, Field, Screen, Section, colors } from '../src/ui/kit';

export default function MoreScreen() {
  const snap = useWatch();
  const { session, prefs, patchPrefs } = snap;
  const bridge = getBridge();
  const [allow, setAllow] = useState(prefs.allow.join('\n'));
  const [slots, setSlots] = useState([
    { h: '7', m: '30' },
    { h: '13', m: '00' },
    { h: '22', m: '00' },
  ]);
  const allowHint = useMemo(
    () => (prefs.allow.length ? `${prefs.allow.length} apps` : 'all apps'),
    [prefs.allow],
  );

  return (
    <Screen>
      <Text style={styles.title}>More</Text>
      <Text style={styles.sub}>Link, filters, alarms</Text>

      <Section title="Link">
        <Text style={styles.meta}>
          {bridge.present ? 'Android native bridge on' : 'Web / FakeWatch — native off'}
        </Text>
        <Text style={styles.meta}>Last device {prefs.lastDeviceId || 'none'}</Text>
        <Btn
          label={prefs.reconnect ? 'Auto-reconnect on' : 'Auto-reconnect off'}
          kind="muted"
          onPress={() => patchPrefs({ reconnect: !prefs.reconnect })}
        />
      </Section>

      <Section title="Notifications">
        <Text style={styles.meta}>Allowlist ({allowHint}). Empty = forward everything.</Text>
        <Field value={allow} onChangeText={setAllow} placeholder={'org.telegram.messenger'} />
        <Btn
          label="Save allowlist"
          onPress={() =>
            patchPrefs({
              allow: allow
                .split(/[\n,]/)
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
        {bridge.present ? (
          <Btn
            label={snap.notifAccess ? 'Notification access on' : 'Open notification access'}
            kind="muted"
            onPress={() => bridge.openNotifSettings()}
          />
        ) : null}
      </Section>

      <Section title="Alarms">
        {slots.map((s, i) => (
          <Text key={i} style={styles.meta}>
            Slot {i + 1}
          </Text>
        ))}
        <Field value={slots[0].h} onChangeText={(h) => setSlots((a) => [{ ...a[0], h }, a[1], a[2]])} placeholder="hour" />
        <Field value={slots[0].m} onChangeText={(m) => setSlots((a) => [{ ...a[0], m }, a[1], a[2]])} placeholder="minute" />
        <Btn
          label={`Send slot 1 ${slots[0].h}:${slots[0].m}`}
          onPress={() => void session.sendAlarm(0, Number(slots[0].h) || 0, Number(slots[0].m) || 0)}
        />
        <Field value={slots[1].h} onChangeText={(h) => setSlots((a) => [a[0], { ...a[1], h }, a[2]])} placeholder="hour" />
        <Field value={slots[1].m} onChangeText={(m) => setSlots((a) => [a[0], { ...a[1], m }, a[2]])} placeholder="minute" />
        <Btn
          label={`Send slot 2 ${slots[1].h}:${slots[1].m}`}
          kind="muted"
          onPress={() => void session.sendAlarm(1, Number(slots[1].h) || 0, Number(slots[1].m) || 0)}
        />
        <Field value={slots[2].h} onChangeText={(h) => setSlots((a) => [a[0], a[1], { ...a[2], h }])} placeholder="hour" />
        <Field value={slots[2].m} onChangeText={(m) => setSlots((a) => [a[0], a[1], { ...a[2], m }])} placeholder="minute" />
        <Btn
          label={`Send slot 3 ${slots[2].h}:${slots[2].m}`}
          kind="muted"
          onPress={() => void session.sendAlarm(2, Number(slots[2].h) || 0, Number(slots[2].m) || 0)}
        />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 26, fontWeight: '700' },
  sub: { color: colors.muted, marginTop: 4, marginBottom: 16 },
  meta: { color: colors.muted, marginBottom: 8 },
});
