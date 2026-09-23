import { FrameAssembler } from '../protocol/assemble';
import {
  clipNotif,
  decodeFindPhone,
  decodeHelloScreen,
  decodeMusic,
  decodeWatchBattery,
  decodeCameraReady,
  decodeSync,
  encodeAlarmSlot,
  encodeCameraReady,
  encodeFindPhone,
  encodeFindWatch,
  encodeHour12,
  encodeMusicInfo,
  encodeNavOff,
  encodeNavText,
  encodeNotif,
  encodeNotifLast,
  encodePhoneBattery,
  encodeQrDone,
  encodeQrLink,
  encodeRinger,
  encodeSyncGet,
  encodeSyncSet,
  encodeTime,
  timeFromDate,
  type MusicAction,
} from '../protocol/frames';
import { SYNC, SYNC_OP } from '../protocol/opcodes';
import { applyMusic, type MediaHost } from '../features/music/apply';
import { appLabel, shouldForward, type IncomingNotif } from '../features/notifications/filter';
import type { BleTransport, ScanHit } from '../ble/types';

export type LinkState = 'idle' | 'scan' | 'link' | 'ready' | 'error';

export type AppSync = {
  notes: string[];
  wxCity: string;
  rssUrl: string;
  prayer: string;
  world: string[];
  cal: string[];
};

export type WatchSnap = {
  state: LinkState;
  devices: ScanHit[];
  name: string;
  rssi: number | null;
  watchBat: number | null;
  screen: number | null;
  lastNotif: string;
  findPhone: boolean;
  lastMusic: MusicAction | null;
  hour12: boolean;
  shutter: boolean;
  error: string | null;
  demo: boolean;
  apps: AppSync;
};

export function emptyAppSync(): AppSync {
  return {
    notes: ['', '', '', '', '', ''],
    wxCity: '',
    rssUrl: '',
    prayer: '',
    world: ['', '', ''],
    cal: ['', '', '', '', '', '', '', ''],
  };
}

function putSlot(arr: string[], n: number, i: number, text: string): string[] {
  const out = arr.slice();
  while (out.length < n) {
    out.push('');
  }
  if (i >= 0 && i < n) {
    out[i] = text;
  }
  return out;
}

export function applySyncPut(s: AppSync, kind: number, index: number, text: string): AppSync {
  if (kind === SYNC.NOTE) {
    return { ...s, notes: putSlot(s.notes, 6, index, text) };
  }
  if (kind === SYNC.WX) {
    return { ...s, wxCity: text };
  }
  if (kind === SYNC.RSS) {
    return { ...s, rssUrl: text };
  }
  if (kind === SYNC.PRAYER) {
    return { ...s, prayer: text };
  }
  if (kind === SYNC.WORLD) {
    return { ...s, world: putSlot(s.world, 3, index, text) };
  }
  if (kind === SYNC.CAL) {
    return { ...s, cal: putSlot(s.cal, 8, index, text) };
  }
  return s;
}

const emptySnap = (): WatchSnap => ({
  state: 'idle',
  devices: [],
  name: '',
  rssi: null,
  watchBat: null,
  screen: null,
  lastNotif: '',
  findPhone: false,
  lastMusic: null,
  hour12: false,
  shutter: false,
  error: null,
  demo: false,
  apps: emptyAppSync(),
});

export class WatchSession {
  snap: WatchSnap = emptySnap();
  mediaHost: MediaHost | null = null;
  findHost: { start(): void; stop(): void } | null = null;
  allowlist: Set<string> | null = null;
  private asm = new FrameAssembler();
  private connectedId: string | null = null;
  onChange: (s: WatchSnap) => void = () => {};

  get deviceId(): string | null {
    return this.connectedId;
  }

  constructor(private readonly tx: BleTransport) {}

  private bump(partial: Partial<WatchSnap>): void {
    this.snap = { ...this.snap, ...partial };
    this.onChange(this.snap);
  }

  private ingest(chunk: Uint8Array): void {
    for (const frame of this.asm.push(chunk)) {
      const screen = decodeHelloScreen(frame);
      if (screen != null) {
        this.bump({ state: 'ready', screen, error: null });
      }
      const bat = decodeWatchBattery(frame);
      if (bat != null) {
        this.bump({ watchBat: bat });
      }
      const fp = decodeFindPhone(frame);
      if (fp != null && fp !== this.snap.findPhone) {
        this.bump({ findPhone: fp });
        if (fp) {
          this.findHost?.start();
        } else {
          this.findHost?.stop();
        }
      }
      const music = decodeMusic(frame);
      if (music) {
        this.bump({ lastMusic: music });
        if (this.mediaHost) {
          applyMusic(this.mediaHost, music);
        }
      }
      const cam = decodeCameraReady(frame);
      if (cam) {
        this.bump({ shutter: true });
      }
      const sync = decodeSync(frame);
      if (sync && sync.op === SYNC_OP.PUT) {
        this.bump({ apps: applySyncPut(this.snap.apps, sync.kind, sync.index, sync.text) });
      }
    }
  }

  async scan(): Promise<void> {
    this.bump({ state: 'scan', devices: [], error: null });
    await this.tx.stopScan();
    const found: ScanHit[] = [];
    await this.tx.startScan((d) => {
      const i = found.findIndex((x) => x.id === d.id);
      if (i >= 0) {
        found[i] = d;
      } else {
        found.push(d);
      }
      this.bump({ devices: [...found] });
    });
  }

  async connect(id?: string): Promise<void> {
    const hit = id
      ? this.snap.devices.find((d) => d.id === id) ?? { id, name: 'RoundOS', rssi: null }
      : this.snap.devices[0] ?? { id: 'fake-roundos', name: 'RoundOS', rssi: -42 };
    this.asm.reset();
    this.bump({
      state: 'link',
      name: hit.name,
      rssi: hit.rssi,
      error: null,
      watchBat: null,
      demo: hit.id.startsWith('fake'),
    });
    this.connectedId = hit.id;
    try {
      await this.tx.connect(
        hit.id,
        (c) => this.ingest(c),
        () => {
          this.connectedId = null;
          this.findHost?.stop();
          this.bump({ state: 'idle', findPhone: false });
        },
      );
      await this.syncTime();
      await this.pullApps();
    } catch (e) {
      this.bump({ state: 'error', error: e instanceof Error ? e.message : 'connect failed' });
    }
  }

  async disconnect(): Promise<void> {
    this.findHost?.stop();
    await this.tx.disconnect();
    this.connectedId = null;
    this.bump({ state: 'idle', findPhone: false });
  }

  async syncTime(d = new Date()): Promise<void> {
    await this.tx.write(encodeTime(timeFromDate(d)));
  }

  async setHour12(on: boolean): Promise<void> {
    this.bump({ hour12: on });
    await this.tx.write(encodeHour12(on));
  }

  async sendNotif(app: string, body: string): Promise<void> {
    const line = clipNotif(app, body);
    this.bump({ lastNotif: line });
    await this.tx.write(encodeNotifLast(line));
  }

  async sendNotifChunk(text: string, state: number): Promise<void> {
    await this.tx.write(encodeNotif(text, state));
  }

  async ringer(on: boolean): Promise<void> {
    await this.tx.write(encodeRinger(on));
  }

  async findWatch(): Promise<void> {
    await this.tx.write(encodeFindWatch());
  }

  async cancelFindPhone(): Promise<void> {
    await this.tx.write(encodeFindPhone(false));
    this.findHost?.stop();
    this.bump({ findPhone: false });
  }

  async forwardIncoming(n: IncomingNotif): Promise<boolean> {
    const allow = this.allowlist && this.allowlist.size > 0 ? this.allowlist : null;
    if (!shouldForward(n, allow)) {
      return false;
    }
    await this.sendNotif(appLabel(n), n.text || n.title);
    return true;
  }

  async sendPhoneBattery(percent: number, charging: boolean): Promise<void> {
    await this.tx.write(encodePhoneBattery(percent, charging));
  }

  async cameraReady(ready: boolean): Promise<void> {
    await this.tx.write(encodeCameraReady(ready));
  }

  async sendAlarm(index: number, hour: number, minute: number, enabled = true): Promise<void> {
    await this.tx.write(encodeAlarmSlot(index, enabled, hour, minute));
  }

  async sendNav(title: string, directions: string, distance = '', duration = ''): Promise<void> {
    await this.tx.write(encodeNavText(title, duration, distance, '', directions));
  }

  async navOff(): Promise<void> {
    await this.tx.write(encodeNavOff());
  }

  async sendQr(url: string): Promise<void> {
    await this.tx.write(encodeQrLink(0, url));
    await this.tx.write(encodeQrDone(1));
  }

  async sendMusicInfo(title: string, vol: number): Promise<void> {
    await this.tx.write(encodeMusicInfo(title, vol));
  }

  async sendApp(kind: number, index: number, text: string): Promise<void> {
    await this.tx.write(encodeSyncSet(kind, index, text));
  }

  async pullApps(): Promise<void> {
    await this.tx.write(encodeSyncGet(SYNC.ALL, 0));
  }

  ackShutter(): void {
    this.bump({ shutter: false });
  }
}
