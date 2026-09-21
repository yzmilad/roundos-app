import type { IncomingNotif } from '../features/notifications/filter';
import type { MediaHost } from '../features/music/apply';

export type MediaSnap = { title: string; vol: number; playing: boolean };

export type NativeBridge = {
  present: boolean;
  isNotifEnabled(): boolean;
  openNotifSettings(): void;
  startKeepAlive(): void;
  stopKeepAlive(): void;
  media: MediaHost;
  mediaSnapshot(): MediaSnap | null;
  subscribeNotif(cb: (n: IncomingNotif) => void): () => void;
  subscribeMedia(cb: (m: MediaSnap) => void): () => void;
};

const noopMedia: MediaHost = {
  toggle() {},
  play() {},
  pause() {},
  prev() {},
  next() {},
  volUp() {},
  volDown() {},
  mute() {},
};

const stub: NativeBridge = {
  present: false,
  isNotifEnabled: () => false,
  openNotifSettings: () => {},
  startKeepAlive: () => {},
  stopKeepAlive: () => {},
  media: noopMedia,
  mediaSnapshot: () => null,
  subscribeNotif: () => () => {},
  subscribeMedia: () => () => {},
};

type NativeMod = {
  isNotifEnabled(): boolean;
  openNotifSettings(): void;
  startKeepAlive(): void;
  stopKeepAlive(): void;
  mediaAction(action: string): void;
  mediaSnapshot(): MediaSnap | null;
  addListener(event: string, cb: (e: Record<string, unknown>) => void): { remove(): void };
};

function loadNative(): NativeMod | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { requireNativeModule } = require('expo-modules-core') as {
      requireNativeModule: (n: string) => NativeMod;
    };
    return requireNativeModule('RoundosBridge');
  } catch {
    return null;
  }
}

function asNotif(e: Record<string, unknown>): IncomingNotif {
  return {
    packageName: String(e.packageName ?? ''),
    title: String(e.title ?? ''),
    text: String(e.text ?? ''),
    ongoing: !!e.ongoing,
    silent: !!e.silent,
  };
}

export function getBridge(): NativeBridge {
  const mod = loadNative();
  if (!mod) {
    return stub;
  }
  const media: MediaHost = {
    toggle: () => mod.mediaAction('toggle'),
    play: () => mod.mediaAction('play'),
    pause: () => mod.mediaAction('pause'),
    prev: () => mod.mediaAction('prev'),
    next: () => mod.mediaAction('next'),
    volUp: () => mod.mediaAction('volUp'),
    volDown: () => mod.mediaAction('volDown'),
    mute: () => mod.mediaAction('mute'),
  };
  return {
    present: true,
    isNotifEnabled: () => !!mod.isNotifEnabled(),
    openNotifSettings: () => mod.openNotifSettings(),
    startKeepAlive: () => mod.startKeepAlive(),
    stopKeepAlive: () => mod.stopKeepAlive(),
    media,
    mediaSnapshot: () => mod.mediaSnapshot(),
    subscribeNotif: (cb) => {
      const sub = mod.addListener('onNotification', (e) => cb(asNotif(e)));
      return () => sub.remove();
    },
    subscribeMedia: (cb) => {
      const sub = mod.addListener('onMedia', (e) =>
        cb({
          title: String(e.title ?? 'Song'),
          vol: Number(e.vol ?? 50),
          playing: !!e.playing,
        }),
      );
      return () => sub.remove();
    },
  };
}
