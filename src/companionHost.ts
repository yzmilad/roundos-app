import { appLabel } from './features/notifications/filter';
import { FindPhoneAlert } from './features/find/alert';
import { getBridge } from './native/bridge';
import { readPhoneBattery } from './native/battery';
import { startFindRing, vibratePulse } from './native/vibrate';
import { session, useWatch } from './store';

/** Wire OS battery, find-phone ring, notif listener, media keys, BLE keep-alive. */
export function bindCompanion(): () => void {
  const bridge = getBridge();
  const find = new FindPhoneAlert();
  let stopRing: (() => void) | null = null;

  session.findHost = {
    start() {
      find.start();
      stopRing?.();
      stopRing = startFindRing(() => vibratePulse());
    },
    stop() {
      find.stop();
      stopRing?.();
      stopRing = null;
    },
  };
  session.mediaHost = bridge.media;

  const unNotif = bridge.subscribeNotif((n) => {
    void session.forwardIncoming(n).then((ok) => {
      if (ok) {
        useWatch.getState().rememberNotif(appLabel(n), n.text || n.title);
      }
    });
  });
  const unMedia = bridge.subscribeMedia((m) => {
    if (session.snap.state === 'ready') {
      void session.sendMusicInfo(m.title, m.vol);
    }
  });

  let batTimer: ReturnType<typeof setInterval> | null = null;
  let linked = session.snap.state === 'ready';

  const onLinked = () => {
    void (async () => {
      const b = await readPhoneBattery();
      if (b && session.snap.state === 'ready') {
        await session.sendPhoneBattery(b.percent, b.charging);
        useWatch.setState({ phoneBat: b.percent, phoneChg: b.charging });
      }
    })();
    if (!batTimer) {
      batTimer = setInterval(() => {
        void (async () => {
          if (session.snap.state !== 'ready') {
            return;
          }
          const b = await readPhoneBattery();
          if (b) {
            await session.sendPhoneBattery(b.percent, b.charging);
            useWatch.setState({ phoneBat: b.percent, phoneChg: b.charging });
          }
        })();
      }, 60_000);
    }
    bridge.startKeepAlive();
    const id = session.deviceId;
    if (id) {
      useWatch.getState().patchPrefs({ lastDeviceId: id });
    }
  };

  const onUnlinked = () => {
    if (batTimer) {
      clearInterval(batTimer);
      batTimer = null;
    }
    bridge.stopKeepAlive();
  };

  if (linked) {
    onLinked();
  }

  const prev = session.onChange;
  session.onChange = (snap) => {
    prev(snap);
    const now = snap.state === 'ready';
    if (now && !linked) {
      linked = true;
      onLinked();
    } else if (!now && linked) {
      linked = false;
      onUnlinked();
    }
  };

  useWatch.setState({ nativeOk: bridge.present, notifAccess: bridge.isNotifEnabled() });

  void (async () => {
    const { prefs } = useWatch.getState();
    if (prefs.hour12 && !session.snap.hour12) {
      /* applied after link via Watch Sync; keep snap in sync for UI */
    }
    if (prefs.reconnect && prefs.lastDeviceId && session.snap.state === 'idle') {
      try {
        await session.scan();
        await session.connect(prefs.lastDeviceId);
      } catch {
        /* scan permission / fake already connected */
      }
    }
  })();

  return () => {
    unNotif();
    unMedia();
    onUnlinked();
    session.findHost = null;
    session.mediaHost = null;
    session.onChange = prev;
  };
}
