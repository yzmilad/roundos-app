import { describe, expect, it } from 'vitest';
import { FrameAssembler } from './assemble';
import {
  decodeHeader,
  decodeHelloScreen,
  decodeTime,
  decodeWatchBattery,
  encodeFindPhone,
  encodeFindWatch,
  encodeFrame,
  encodeHello,
  encodeMusicNext,
  encodeMusicPrev,
  encodeMusicToggle,
  encodeNotifLast,
  encodePhoneBattery,
  encodeSyncPut,
  encodeSyncSet,
  encodeTime,
  encodeWatchBattery,
  decodeSync,
} from './frames';
import { MUSIC, NOTIF_STATE_LAST, OP, SYNC, SYNC_OP } from './opcodes';

describe('encodeFrame', () => {
  it('sets AB length type opcode', () => {
    const f = encodeFrame(OP.FIND_WATCH);
    expect([...f]).toEqual([0xab, 0x00, 0x02, 0xff, 0x71]);
    expect(decodeHeader(f)?.opcode).toBe(OP.FIND_WATCH);
  });
});

describe('time 0x93', () => {
  it('round-trips the watch layout (year at bytes 7-8)', () => {
    const t = {
      year: 2026,
      month: 9,
      day: 21,
      hour: 12,
      minute: 47,
      second: 3,
    };
    const f = encodeTime(t);
    expect(f.length).toBe(14);
    expect(f[4]).toBe(OP.TIME);
    expect(decodeTime(f)).toEqual(t);
  });
});

describe('notif 0x72', () => {
  it('marks last chunk state 0x02', () => {
    const f = encodeNotifLast('Telegram:hi');
    expect(f[4]).toBe(OP.NOTIF);
    expect(f[7]).toBe(NOTIF_STATE_LAST);
    const text = new TextDecoder().decode(f.slice(8));
    expect(text).toBe('Telegram:hi');
  });
});

describe('find + music (watch TX shape)', () => {
  it('0x71 find watch', () => {
    expect(encodeFindWatch()[4]).toBe(OP.FIND_WATCH);
  });

  it('0x7D find phone on/off', () => {
    const on = encodeFindPhone(true);
    expect(on[4]).toBe(OP.FIND_PHONE);
    expect(on[6]).toBe(0x01);
    expect(encodeFindPhone(false)[6]).toBe(0x00);
  });

  it('0x99 toggle and 0x9D prev/next', () => {
    const tog = encodeMusicToggle();
    expect(tog[4]).toBe(OP.MUSIC_TOGGLE);
    expect(tog[6]).toBe(MUSIC.TOGGLE);
    expect(encodeMusicPrev()[4]).toBe(OP.MUSIC_CTRL);
    expect(encodeMusicPrev()[6]).toBe(MUSIC.PREV);
    expect(encodeMusicNext()[6]).toBe(MUSIC.NEXT);
  });
});

describe('FrameAssembler', () => {
  it('joins split BLE writes', () => {
    const f = encodeTime({
      year: 2026,
      month: 1,
      day: 2,
      hour: 3,
      minute: 4,
      second: 5,
    });
    const a = new FrameAssembler();
    expect(a.push(f.slice(0, 6))).toEqual([]);
    const got = a.push(f.slice(6));
    expect(got).toHaveLength(1);
    expect([...got[0]]).toEqual([...f]);
  });
});

describe('hello + watch battery (watch TX)', () => {
  it('hello screen at byte 18', () => {
    const f = encodeHello(18);
    expect(f[4]).toBe(OP.HELLO);
    expect(f.length).toBe(20);
    expect(decodeHelloScreen(f)).toBe(18);
  });

  it('matches firmware extra_n=2 battery', () => {
    const f = encodeWatchBattery(64);
    expect([...f]).toEqual([0xab, 0x00, 0x05, 0xff, 0x91, 0x80, 0x00, 64]);
    expect(decodeWatchBattery(f)).toBe(64);
  });

  it('does not treat phone battery FE as watch percent', () => {
    const f = encodePhoneBattery(41, true);
    expect(f[3]).toBe(0xfe);
    expect(decodeWatchBattery(f)).toBeNull();
  });
});

describe('app sync 0xB1', () => {
  it('SET note then GET dumps PUT', () => {
    const f = encodeSyncSet(SYNC.NOTE, 2, 'buy milk');
    expect(f[4]).toBe(OP.SYNC);
    expect(decodeSync(f)).toEqual({ kind: SYNC.NOTE, op: SYNC_OP.SET, index: 2, text: 'buy milk' });
    const p = encodeSyncPut(SYNC.WX, 0, 'Tehran');
    expect(decodeSync(p)).toEqual({ kind: SYNC.WX, op: SYNC_OP.PUT, index: 0, text: 'Tehran' });
  });
});
