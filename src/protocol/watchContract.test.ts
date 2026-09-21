import { describe, expect, it } from 'vitest';
import { assembleNotif, INBOX_CAP, pushInbox, splitTitle } from './inbox';
import {
  decodeAlarmSlot,
  decodeCameraReady,
  decodeMusicInfo,
  decodeNav,
  decodePhoneBattery,
  decodeQrDone,
  decodeQrLink,
  encodeAlarmSlot,
  encodeCameraReady,
  encodeMusicInfo,
  encodeNavOff,
  encodeNavText,
  encodePhoneBattery,
  encodeQrDone,
  encodeQrLink,
} from './frames';
import { MUSIC, NAV_DATA, NOTIF_STATE_FIRST, NOTIF_STATE_MID, OP } from './opcodes';

describe('U1 inbox', () => {
  it('assembles 0x00 then 0x02 and rings at 8', () => {
    const a = assembleNotif('', NOTIF_STATE_FIRST, 'Tele');
    expect(a.commit).toBeNull();
    const b = assembleNotif(a.pending, 0x02, 'gram:hi');
    expect(b.commit).toBe('Telegram:hi');
    expect(splitTitle(b.commit!).title).toBe('Telegram');
    let box: { title: string; body: string }[] = [];
    for (let i = 0; i < 9; i++) {
      box = pushInbox(box, { title: `n${i}`, body: `${i}` });
    }
    expect(box).toHaveLength(INBOX_CAP);
    expect(box[0]?.title).toBe('n1');
    expect(box[7]?.title).toBe('n8');
  });

  it('mid chunk does not commit', () => {
    const a = assembleNotif('', NOTIF_STATE_FIRST, 'A');
    const b = assembleNotif(a.pending, NOTIF_STATE_MID, 'B');
    expect(b.commit).toBeNull();
    const c = assembleNotif(b.pending, 0x02, 'C');
    expect(c.commit).toBe('ABC');
  });
});

describe('U2 music info', () => {
  it('0x99 extra 0xAA title and vol', () => {
    const f = encodeMusicInfo('Song', 64);
    expect(f[4]).toBe(OP.MUSIC_TOGGLE);
    expect(f[6]).toBe(MUSIC.INFO);
    expect(decodeMusicInfo(f)).toEqual({ title: 'Song', vol: 64 });
  });
});

describe('U3 camera', () => {
  it('ready is data[6]', () => {
    const f = encodeCameraReady(true);
    expect(f[4]).toBe(OP.CAMERA);
    expect(decodeCameraReady(f)).toBe(true);
    expect(decodeCameraReady(encodeCameraReady(false))).toBe(false);
  });
});

describe('U4 phone battery', () => {
  it('FE charging + percent', () => {
    const f = encodePhoneBattery(41, true);
    expect(f[3]).toBe(0xfe);
    expect(decodePhoneBattery(f)).toEqual({ percent: 41, charging: true });
  });
});

describe('U5 nav', () => {
  it('off is data[5]==0; text starts at byte 12', () => {
    expect(decodeNav(encodeNavOff())?.active).toBe(false);
    const f = encodeNavText('500 m', '2 min', '0.5 km', '', 'Turn right');
    expect(f[5]).toBe(NAV_DATA);
    const n = decodeNav(f);
    expect(n).toMatchObject({
      active: true,
      title: '500 m',
      duration: '2 min',
      distance: '0.5 km',
      directions: 'Turn right',
    });
  });
});

describe('U6 QR', () => {
  it('FF link then FE done count', () => {
    const f = encodeQrLink(0, 'https://ex.com');
    expect(decodeQrLink(f)).toEqual({ index: 0, url: 'https://ex.com' });
    expect(decodeQrDone(encodeQrDone(1))).toBe(1);
  });
});

describe('U7 alarm', () => {
  it('index enabled hour minute at bytes 6-9', () => {
    const f = encodeAlarmSlot(0, true, 7, 30, 0x7f);
    expect(decodeAlarmSlot(f)).toEqual({ index: 0, enabled: true, hour: 7, minute: 30, repeat: 0x7f });
  });
});
