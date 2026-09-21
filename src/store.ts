import { create } from 'zustand';
import { createTransport, isFakeTransport } from './ble/createTransport';
import { FakeTransport } from './ble/fake';
import { createKv, defaultPrefs, loadPrefs, savePrefs, type Prefs } from './persist/prefs';
import { WatchSession, type WatchSnap } from './session/WatchSession';

export const demoTx = createTransport();
export const session = new WatchSession(demoTx);
const kv = createKv();

export type SentNote = { app: string; body: string };

type Store = WatchSnap & {
  session: WatchSession;
  tx: FakeTransport | null;
  notes: SentNote[];
  rememberNotif: (app: string, body: string) => void;
  prefs: Prefs;
  patchPrefs: (p: Partial<Prefs>) => void;
  phoneBat: number | null;
  phoneChg: boolean;
  nativeOk: boolean;
  notifAccess: boolean;
};

export const useWatch = create<Store>((set, get) => {
  session.onChange = (snap) =>
    set((s) => ({
      ...s,
      ...snap,
      session,
      tx: isFakeTransport(demoTx) ? demoTx : null,
    }));
  return {
    ...session.snap,
    session,
    tx: isFakeTransport(demoTx) ? demoTx : null,
    notes: [],
    rememberNotif: (app, body) =>
      set((s) => ({ notes: [{ app, body }, ...s.notes].slice(0, 8) })),
    prefs: defaultPrefs(),
    patchPrefs: (p) => {
      const prefs = { ...get().prefs, ...p };
      set({ prefs });
      session.allowlist = prefs.allow.length ? new Set(prefs.allow) : null;
      void savePrefs(kv, prefs);
    },
    phoneBat: null,
    phoneChg: false,
    nativeOk: false,
    notifAccess: false,
  };
});

void loadPrefs(kv).then((prefs) => {
  session.allowlist = prefs.allow.length ? new Set(prefs.allow) : null;
  useWatch.setState({ prefs });
});
