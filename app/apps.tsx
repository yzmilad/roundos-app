import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RSS_FEEDS, SYNC, WORLD_CITIES } from '../src/protocol/opcodes';
import { useWatch } from '../src/store';
import { Btn, Field, Screen, Section, colors } from '../src/ui/kit';

function Chip({
  label,
  on,
  onPress,
}: {
  label: string;
  on?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, on && styles.chipOn]}>
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

export default function AppsScreen() {
  const snap = useWatch();
  const { session, apps } = snap;
  const [notes, setNotes] = useState(apps.notes);
  const [city, setCity] = useState(apps.wxCity);
  const [rss, setRss] = useState(apps.rssUrl);
  const [prayer, setPrayer] = useState(apps.prayer);
  const [world, setWorld] = useState(apps.world);
  const [calDate, setCalDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [calNote, setCalNote] = useState('');

  useEffect(() => {
    setNotes(apps.notes);
    setCity(apps.wxCity);
    setRss(apps.rssUrl);
    setPrayer(apps.prayer);
    setWorld(apps.world);
  }, [apps]);

  const ready = snap.state === 'ready';

  return (
    <Screen>
      <Text style={styles.title}>Apps</Text>
      <Text style={styles.sub}>Push Notes, Weather, RSS and the rest over Bluetooth</Text>
      {!ready ? <Text style={styles.meta}>Connect the watch on Watch first.</Text> : null}

      <Section title="Watch">
        <Btn label="Pull from watch" kind="muted" onPress={() => void session.pullApps()} />
      </Section>

      <Section title="Notes">
        {notes.map((n, i) => (
          <View key={i}>
            <Text style={styles.meta}>Slot {i + 1}</Text>
            <Field
              value={n}
              onChangeText={(t) => setNotes((a) => a.map((x, j) => (j === i ? t : x)))}
              placeholder={`note ${i + 1}`}
            />
            <Btn
              label={`Send note ${i + 1}`}
              kind="muted"
              onPress={() => void session.sendApp(SYNC.NOTE, i, notes[i] ?? '')}
            />
          </View>
        ))}
      </Section>

      <Section title="Weather city">
        <Text style={styles.meta}>OpenWeather on the watch. API key stays on the watch.</Text>
        <Field value={city} onChangeText={setCity} placeholder="Tehran" />
        <Btn label="Send city" onPress={() => void session.sendApp(SYNC.WX, 0, city)} />
      </Section>

      <Section title="RSS">
        <View style={styles.row}>
          {RSS_FEEDS.map((f) => (
            <Chip
              key={f.lab}
              label={f.lab}
              on={rss === f.url}
              onPress={() => {
                setRss(f.url);
                void session.sendApp(SYNC.RSS, 0, f.url);
              }}
            />
          ))}
        </View>
        <Field value={rss} onChangeText={setRss} placeholder="https://…" />
        <Btn label="Send RSS URL" kind="muted" onPress={() => void session.sendApp(SYNC.RSS, 0, rss)} />
      </Section>

      <Section title="Prayer">
        <Text style={styles.meta}>Latitude,longitude</Text>
        <Field value={prayer} onChangeText={setPrayer} placeholder="35.69,51.39" />
        <Btn label="Send location" onPress={() => void session.sendApp(SYNC.PRAYER, 0, prayer)} />
      </Section>

      <Section title="World clock">
        {world.map((w, i) => (
          <View key={i}>
            <Text style={styles.meta}>Slot {i + 1}: {w || 'empty'}</Text>
            <View style={styles.row}>
              {WORLD_CITIES.map((name) => (
                <Chip
                  key={`${i}-${name}`}
                  label={name}
                  on={w === name}
                  onPress={() => {
                    setWorld((a) => a.map((x, j) => (j === i ? name : x)));
                    void session.sendApp(SYNC.WORLD, i, name);
                  }}
                />
              ))}
            </View>
          </View>
        ))}
      </Section>

      <Section title="Calendar note">
        <Field value={calDate} onChangeText={setCalDate} placeholder="2026-09-23" />
        <Field value={calNote} onChangeText={setCalNote} placeholder="text" />
        <Btn
          label="Send day note"
          onPress={() => void session.sendApp(SYNC.CAL, 0, `${calDate}|${calNote}`)}
        />
      </Section>

      <Text style={styles.hint}>
        Calc, Torch, Level, Dice and Timer have nothing to sync. Alarm is on More. Face stays on the
        watch.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 26, fontWeight: '700' },
  sub: { color: colors.muted, marginTop: 4, marginBottom: 16 },
  meta: { color: colors.muted, marginTop: 8, marginBottom: 4 },
  hint: { color: colors.muted, fontSize: 12, marginTop: 8, marginBottom: 24 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: {
    backgroundColor: '#1c2836',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  chipOn: { backgroundColor: colors.accent },
  chipText: { color: colors.text, fontWeight: '700', fontSize: 12 },
  chipTextOn: { color: '#041018' },
});
