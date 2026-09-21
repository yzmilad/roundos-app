import {
  encodeFindPhone,
  encodeMusicNext,
  encodeMusicPrev,
  encodeMusicToggle,
  encodeHello,
  encodeWatchBattery,
  encodeCameraCapture,
  decodeHeader,
} from '../protocol/frames';
import { assembleNotif } from '../protocol/inbox';
import { MUSIC, OP } from '../protocol/opcodes';
import type { BleTransport, ScanHit } from './types';

export type FakeWatchState = {
  time: string | null;
  hour12: boolean | null;
  notif: string | null;
  inbox: string[];
  findWatch: boolean;
  phoneBat: { percent: number; charging: boolean } | null;
  cameraReady: boolean | null;
  alarm: string | null;
  nav: boolean | null;
  qr: string[];
  song: string | null;
  vol: number | null;
};

export class FakeTransport implements BleTransport {
  readonly writes: Uint8Array[] = [];
  watch: FakeWatchState = {
    time: null,
    hour12: null,
    notif: null,
    inbox: [],
    findWatch: false,
    phoneBat: null,
    cameraReady: null,
    alarm: null,
    nav: null,
    qr: [],
    song: null,
    vol: null,
  };

  batteryPercent = 87;
  screen = 7;
  private pending = '';
  private onData: ((c: Uint8Array) => void) | null = null;
  private onDisc: (() => void) | null = null;
  connected = false;

  emit(frame: Uint8Array): void {
    this.onData?.(frame);
  }

  async startScan(onDevice: (d: ScanHit) => void): Promise<void> {
    onDevice({ id: 'fake-roundos', name: 'RoundOS', rssi: -42 });
  }

  async stopScan(): Promise<void> {}

  async connect(
    _id: string,
    onData: (chunk: Uint8Array) => void,
    onDisconnect: () => void,
  ): Promise<void> {
    this.onData = onData;
    this.onDisc = onDisconnect;
    this.connected = true;
    this.emit(encodeHello(this.screen));
    this.emit(encodeWatchBattery(this.batteryPercent));
  }

  async write(data: Uint8Array): Promise<void> {
    this.writes.push(data);
    const h = decodeHeader(data);
    if (!h) {
      return;
    }
    if (h.opcode === OP.TIME && data.length >= 14) {
      this.watch.time = `${data[7] * 256 + data[8]}-${data[9]}-${data[10]} ${data[11]}:${data[12]}:${data[13]}`;
    }
    if (h.opcode === OP.HOUR12 && data.length > 6) {
      this.watch.hour12 = data[6] !== 0;
    }
    if (h.opcode === OP.NOTIF && data.length > 8) {
      if (data[6] === 0x01 || data[6] === 0x02) {
        return;
      }
      const chunk = new TextDecoder().decode(data.slice(8));
      const next = assembleNotif(this.pending, data[7], chunk);
      this.pending = next.pending;
      if (next.commit != null) {
        this.watch.notif = next.commit;
        if (this.watch.inbox.length < 8) {
          this.watch.inbox = [...this.watch.inbox, next.commit];
        } else {
          this.watch.inbox = [...this.watch.inbox.slice(1), next.commit];
        }
      }
    }
    if (h.opcode === OP.FIND_WATCH) {
      this.watch.findWatch = true;
    }
    if (h.opcode === OP.BATTERY && h.type === 0xfe && data.length > 7) {
      this.watch.phoneBat = { charging: data[6] === 1, percent: data[7] };
    }
    if (h.opcode === OP.CAMERA && data.length > 6) {
      this.watch.cameraReady = data[6] === 1;
    }
    if (h.opcode === OP.ALARM && data.length > 10) {
      this.watch.alarm = `${data[6]} ${data[8]}:${data[9]} en=${data[7]}`;
    }
    if (h.opcode === OP.NAV && h.type === 0xfe) {
      this.watch.nav = data[5] !== 0x00;
    }
    if (h.opcode === OP.QR && h.type === 0xff && data.length > 6) {
      this.watch.qr[data[5]] = new TextDecoder().decode(data.slice(6));
    }
    if (h.opcode === OP.MUSIC_TOGGLE && data.length > 8 && data[6] === MUSIC.INFO) {
      this.watch.vol = data[7];
      this.watch.song = new TextDecoder().decode(data.slice(8));
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.onData = null;
    const d = this.onDisc;
    this.onDisc = null;
    d?.();
  }

  simulateFindPhone(on: boolean): void {
    this.emit(encodeFindPhone(on));
  }

  simulateMusicToggle(): void {
    this.emit(encodeMusicToggle());
  }

  simulateMusicPrev(): void {
    this.emit(encodeMusicPrev());
  }

  simulateMusicNext(): void {
    this.emit(encodeMusicNext());
  }

  simulateCapture(): void {
    this.emit(encodeCameraCapture());
  }
}
