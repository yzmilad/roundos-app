import { HEADER, MAX_FRAME } from './uuids';
import {
  MUSIC,
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

export function decodeWatchBattery(buf: Uint8Array): number | null {
  const h = decodeHeader(buf);
  if (!h || h.opcode !== OP.BATTERY || h.payload.length < 2) {
    return null;
  }
  return h.payload[1];
}
