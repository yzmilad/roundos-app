import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useWatch } from '../src/store';
import { Btn, Field, Screen, Section, colors } from '../src/ui/kit';

export default function AlertsScreen() {
  const snap = useWatch();
  const { session, rememberNotif } = snap;
  const [app, setApp] = useState('Telegram');
  const [body, setBody] = useState('hello RoundOS');

  return (
    <Screen>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.sub}>Forward a preview to the watch inbox</Text>

      <Section title="Send">
        <Field value={app} onChangeText={setApp} placeholder="app" />
        <Field value={body} onChangeText={setBody} placeholder="message" />
        <Btn
          label="Send to watch"
          onPress={() => {
            void session.sendNotif(app, body);
            rememberNotif(app, body);
          }}
        />
      </Section>

      <Section title="Inbox">
        {snap.notes.length === 0 && !snap.lastNotif ? (
          <Text style={styles.empty}>Nothing sent yet</Text>
        ) : (
          (snap.notes.length ? snap.notes : [{ app: 'Watch', body: snap.lastNotif }]).map((n, i) => (
            <View key={`${n.app}-${i}`} style={styles.row}>
              <Text style={styles.app}>{n.app}</Text>
              <Text style={styles.body}>{n.body}</Text>
            </View>
          ))
        )}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 26, fontWeight: '700' },
  sub: { color: colors.muted, marginTop: 4, marginBottom: 16 },
  empty: { color: colors.muted },
  row: { paddingVertical: 10, borderBottomColor: '#1c2433', borderBottomWidth: 1 },
  app: { color: colors.accent, fontWeight: '700' },
  body: { color: colors.text, marginTop: 2 },
});
