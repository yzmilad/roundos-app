import { HEADER, MAX_FRAME } from './uuids';
import {
  MUSIC,
  NAV_DATA,
  NAV_OFF,
  NOTIF_ICON_RING,
  NOTIF_ICON_RING_OFF,
  NOTIF_STATE_LAST,
  OP,
} from './opcodes';

export type ChronosTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function u8(n: number): number {
  return n & 0xff;
}

/** Chronos: bytes 1–2 are length of everything after the 3-byte header. */
export function encodeFrame(
  opcode: number,
  payload: Uint8Array = new Uint8Array(0),
  start = 0xab,
  type = 0xff,
): Uint8Array {
  const lengthField = 2 + payload.length;
  const total = HEADER + lengthField;
  if (total > MAX_FRAME) {
    throw new Error(`frame ${total} > ${MAX_FRAME}`);
  }
  const out = new Uint8Array(total);
  out[0] = u8(start);
  out[1] = (lengthField >> 8) & 0xff;
  out[2] = lengthField & 0xff;
  out[3] = u8(type);
  out[4] = u8(opcode);
  out.set(payload, 5);
  return out;
}

export function decodeHeader(buf: Uint8Array): {
  start: number;
  lengthField: number;
  total: number;
  type: number;
  opcode: number;
  payload: Uint8Array;
} | null {
  if (buf.length < 5) {
    return null;
  }
  if (buf[0] !== 0xab && buf[0] !== 0xea) {
    return null;
  }
  if (buf[3] !== 0xfe && buf[3] !== 0xff) {
    return null;
  }
  const lengthField = (buf[1] << 8) | buf[2];
  const total = HEADER + lengthField;
  if (total < 5 || total > MAX_FRAME || buf.length < total) {
    return null;
  }
  return {
    start: buf[0],
    lengthField,
    total,
    type: buf[3],
    opcode: buf[4],
    payload: buf.slice(5, total),
  };
}

export function encodeTime(t: ChronosTime): Uint8Array {
  const p = new Uint8Array(9);
  p[0] = 0x80;
  p[1] = 0x00;
  p[2] = (t.year >> 8) & 0xff;
  p[3] = t.year & 0xff;
  p[4] = u8(t.month);
  p[5] = u8(t.day);
  p[6] = u8(t.hour);
  p[7] = u8(t.minute);
  p[8] = u8(t.second);
  return encodeFrame(OP.TIME, p);
}

export function decodeTime(buf: Uint8Array): ChronosTime | null {
  const h = decodeHeader(buf);
  if (!h || h.opcode !== OP.TIME || buf.length < 14) {
    return null;
  }
  return {
    year: buf[7] * 256 + buf[8],
    month: buf[9],
    day: buf[10],
    hour: buf[11],
    minute: buf[12],
    second: buf[13],
  };
}

export function encodeNotifLast(titleAndBody: string, icon = 0x00): Uint8Array {
  const text = new TextEncoder().encode(titleAndBody);
  const p = new Uint8Array(3 + text.length);
  p[0] = 0x80;
  p[1] = u8(icon);
  p[2] = NOTIF_STATE_LAST;
  p.set(text, 3);
  return encodeFrame(OP.NOTIF, p);
}

export function encodeRinger(on: boolean): Uint8Array {
  const p = new Uint8Array([0x80, on ? NOTIF_ICON_RING : NOTIF_ICON_RING_OFF, 0x00]);
  return encodeFrame(OP.NOTIF, p);
}

export function encodeFindWatch(): Uint8Array {
  return encodeFrame(OP.FIND_WATCH);
}

export function encodeHour12(on: boolean): Uint8Array {
  return encodeFrame(OP.HOUR12, new Uint8Array([0x80, on ? 1 : 0]));
}

/** Watch → phone find-phone, extra_n=1. */
export function encodeFindPhone(on: boolean): Uint8Array {
  return encodeFrame(OP.FIND_PHONE, new Uint8Array([0x80, on ? 0x01 : 0x00]));
}

export function encodeMusicToggle(): Uint8Array {
  return encodeFrame(OP.MUSIC_TOGGLE, new Uint8Array([0x80, MUSIC.TOGGLE]));
}

export function encodeMusicPrev(): Uint8Array {
  return encodeFrame(OP.MUSIC_CTRL, new Uint8Array([0x80, MUSIC.PREV]));
}

export function encodeMusicNext(): Uint8Array {
  return encodeFrame(OP.MUSIC_CTRL, new Uint8Array([0x80, MUSIC.NEXT]));
}

/** Watch TX: AB 00 05 FF 91 80 00 percent */
export function encodeWatchBattery(percent: number): Uint8Array {
  return encodeFrame(OP.BATTERY, new Uint8Array([0x80, 0x00, percent & 0xff]));
}

export function decodeWatchBattery(buf: Uint8Array): number | null {
  const h = decodeHeader(buf);
  if (!h || h.opcode !== OP.BATTERY) {
    return null;
  }
  if (h.type === 0xfe && h.payload.length >= 3) {
    return null;
  }
  if (h.payload.length >= 3) {
    return h.payload[2];
  }
  if (h.payload.length >= 2) {
    return h.payload[1];
  }
  return null;
}

export function encodeHello(screen = 7): Uint8Array {
  return new Uint8Array([
    0xab, 0x00, 0x11, 0xff, 0x92, 0xc0, 1, 91, 0x00, 0xfb, 0x1e, 0x40, 0xc0, 0x0e, 0x32, 0x28,
    0x00, 0xe2, screen & 0xff, 0x80,
  ]);
}

export function decodeHelloScreen(buf: Uint8Array): number | null {
  const h = decodeHeader(buf);
  if (!h || h.opcode !== OP.HELLO || buf.length < 19) {
    return null;
  }
  return buf[18];
}

export function timeFromDate(d = new Date()): ChronosTime {
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
    second: d.getSeconds(),
  };
}

export function decodeFindPhone(buf: Uint8Array): boolean | null {
  const h = decodeHeader(buf);
  if (!h || h.opcode !== OP.FIND_PHONE || h.payload.length < 2) {
    return null;
  }
  return h.payload[1] === 0x01;
}

export type MusicAction = 'toggle' | 'play' | 'pause' | 'prev' | 'next' | 'volUp' | 'volDown' | 'mute';

export function decodeMusic(buf: Uint8Array): MusicAction | null {
  const h = decodeHeader(buf);
  if (!h || h.payload.length < 2) {
    return null;
  }
  const extra = h.payload[1];
  if (h.opcode === OP.MUSIC_TOGGLE) {
    if (extra === MUSIC.VOL_UP) {
      return 'volUp';
    }
    if (extra === MUSIC.VOL_DOWN) {
      return 'volDown';
    }
    if (extra === MUSIC.VOL_MUTE) {
      return 'mute';
    }
    return 'toggle';
  }
  if (h.opcode === OP.MUSIC_CTRL) {
    if (extra === MUSIC.PAUSE) {
      return 'pause';
    }
    if (extra === MUSIC.PREV) {
      return 'prev';
    }
    if (extra === MUSIC.NEXT) {
      return 'next';
    }
    return 'play';
  }
  return null;
}

export function clipNotif(app: string, body: string): string {
  const t = app.replace(/[:\n]/g, ' ').slice(0, 19);
  const b = body.replace(/\n/g, ' ').slice(0, 31);
  return `${t}:${b}`;
}

export function encodePhoneBattery(percent: number, charging: boolean): Uint8Array {
  return encodeFrame(OP.BATTERY, new Uint8Array([0x00, charging ? 1 : 0, percent & 0xff]), 0xab, 0xfe);
}

export function encodeCameraReady(ready: boolean): Uint8Array {
  return encodeFrame(OP.CAMERA, new Uint8Array([0x80, ready ? 1 : 0]));
}

export function encodeAlarmSlot(index: number, enabled: boolean, hour: number, minute: number, repeat = 0): Uint8Array {
  return encodeFrame(
    OP.ALARM,
    new Uint8Array([0x80, index & 0xff, enabled ? 1 : 0, hour & 0xff, minute & 0xff, repeat & 0xff]),
  );
}

export function encodeNavOff(): Uint8Array {
  return encodeFrame(OP.NAV, new Uint8Array([NAV_OFF]), 0xab, 0xfe);
}

function cstr(s: string): Uint8Array {
  const u = new TextEncoder().encode(s);
  const o = new Uint8Array(u.length + 1);
  o.set(u, 0);
  return o;
}

export function encodeNavText(title: string, duration: string, distance: string, eta: string, directions: string, speed = ''): Uint8Array {
  const head = new Uint8Array([NAV_DATA, 0, 1, 0, 0, 0, 0]);
  const parts = [title, duration, distance, eta, directions, speed].map(cstr);
  let n = head.length;
  for (const p of parts) {
    n += p.length;
  }
  const payload = new Uint8Array(n);
  payload.set(head, 0);
  let i = head.length;
  for (const p of parts) {
    payload.set(p, i);
    i += p.length;
  }
  return encodeFrame(OP.NAV, payload, 0xab, 0xfe);
}

export function encodeQrLink(index: number, url: string): Uint8Array {
  const text = new TextEncoder().encode(url);
  const p = new Uint8Array(1 + text.length);
  p[0] = index & 0xff;
  p.set(text, 1);
  return encodeFrame(OP.QR, p, 0xab, 0xff);
}

export function encodeQrDone(count: number): Uint8Array {
  return encodeFrame(OP.QR, new Uint8Array([count & 0xff]), 0xab, 0xfe);
}
