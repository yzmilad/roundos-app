import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useWatch } from '../src/store';
import { Btn, colors } from '../src/ui/kit';

export default function CameraScreen() {
  useKeepAwake();
  const snap = useWatch();
  const { session } = snap;
  const ref = useRef<CameraView>(null);
  const [perm, request] = useCameraPermissions();

  useEffect(() => {
    if (!perm?.granted) {
      void request();
    }
  }, [perm, request]);

  useEffect(() => {
    void session.cameraReady(true);
    return () => {
      void session.cameraReady(false);
    };
  }, [session]);

  useEffect(() => {
    if (!snap.shutter) {
      return;
    }
    void ref.current?.takePictureAsync().finally(() => session.ackShutter());
  }, [snap.shutter, session]);

  return (
    <View style={styles.page}>
      {perm?.granted ? (
        <CameraView ref={ref} style={styles.cam} facing="back" />
      ) : (
        <Text style={styles.hint}>Allow camera to use watch shutter</Text>
      )}
      <Text style={styles.hint}>{snap.shutter ? 'Capturing…' : 'Watch shutter takes a photo on this phone'}</Text>
      <Btn label="Close" kind="muted" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg, padding: 16, paddingTop: 48 },
  cam: { flex: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: '#111' },
  hint: { color: colors.muted, textAlign: 'center', marginVertical: 12 },
});
