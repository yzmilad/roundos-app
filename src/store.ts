import { create } from 'zustand';
import { createTransport, isFakeTransport } from './ble/createTransport';
import { FakeTransport } from './ble/fake';
import { WatchSession, type WatchSnap } from './session/WatchSession';

export const demoTx = createTransport();
export const session = new WatchSession(demoTx);

export type SentNote = { app: string; body: string };

type Store = WatchSnap & {
  session: WatchSession;
  tx: FakeTransport | null;
  notes: SentNote[];
  rememberNotif: (app: string, body: string) => void;
};

export const useWatch = create<Store>((set) => {
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
  };
});
