import { describe, expect, it } from 'vitest';
import { FrameAssembler } from './assemble';
import {
  decodeHeader,
  decodeTime,
  encodeFindPhone,
  encodeFindWatch,
  encodeFrame,
  encodeMusicNext,
  encodeMusicPrev,
  encodeMusicToggle,
  encodeNotifLast,
  encodeTime,
} from './frames';
import { MUSIC, NOTIF_STATE_LAST, OP } from './opcodes';

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
