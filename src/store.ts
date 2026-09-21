import { create } from 'zustand';
import { createTransport, isFakeTransport } from './ble/createTransport';
import { FakeTransport } from './ble/fake';
import { WatchSession, type WatchSnap } from './session/WatchSession';

export const demoTx = createTransport();
export const session = new WatchSession(demoTx);

type Store = WatchSnap & {
  session: WatchSession;
  tx: FakeTransport | null;
};

export const useWatch = create<Store>((set) => {
  session.onChange = (snap) =>
    set({
      ...snap,
      session,
      tx: isFakeTransport(demoTx) ? demoTx : null,
    });
  return {
    ...session.snap,
    session,
    tx: isFakeTransport(demoTx) ? demoTx : null,
  };
});
