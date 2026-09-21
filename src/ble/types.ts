/** M1 will implement BlePlxTransport. M0 only types. */
export type LinkState = 'idle' | 'scan' | 'link' | 'ready' | 'error';

export type WatchSnap = {
  state: LinkState;
  name: string;
  rssi: number | null;
  watchBat: number | null;
  error: string | null;
};
