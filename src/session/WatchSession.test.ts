import { describe, expect, it } from 'vitest';
import { FakeTransport } from '../ble/fake';
import { decodeWatchBattery, encodeWatchBattery } from '../protocol/frames';
import { OP } from '../protocol/opcodes';
import { WatchSession } from './WatchSession';

async function linked() {
  const tx = new FakeTransport();
  const s = new WatchSession(tx);
  await s.scan();
  await s.connect();
  return { tx, s };
}

describe('M1 link', () => {
  it('decodes watch battery percent at payload[2]', () => {
    const f = encodeWatchBattery(64);
    expect(f[4]).toBe(OP.BATTERY);
    expect(decodeWatchBattery(f)).toBe(64);
  });

  it('scans RoundOS, connects, gets hello screen and battery', async () => {
    const { s } = await linked();
    expect(s.snap.devices[0]?.name).toBe('RoundOS');
    expect(s.snap.state).toBe('ready');
    expect(s.snap.screen).toBe(7);
    expect(s.snap.watchBat).toBe(87);
  });
});

describe('M2 time', () => {
  it('writes 0x93 after link and 0x7C on demand', async () => {
    const { tx, s } = await linked();
    expect(tx.watch.time).not.toBeNull();
    expect(tx.writes.some((w) => w[4] === OP.TIME)).toBe(true);
    const d = new Date(2026, 8, 21, 13, 53, 0);
    await s.syncTime(d);
    await s.setHour12(true);
    expect(tx.watch.time).toBe('2026-9-21 13:53:0');
    expect(tx.watch.hour12).toBe(true);
    expect(tx.writes.some((w) => w[4] === OP.HOUR12)).toBe(true);
  });
});

describe('M3 notif', () => {
  it('clips and sends last-chunk 0x72', async () => {
    const { tx, s } = await linked();
    await s.sendNotif('Telegram', 'hello from phone');
    expect(tx.watch.notif).toBe('Telegram:hello from phone');
    const w = tx.writes.find((x) => x[4] === OP.NOTIF);
    expect(w?.[7]).toBe(0x02);
  });
});

describe('M4 find', () => {
  it('find watch TX 0x71; find phone RX 0x7D', async () => {
    const { tx, s } = await linked();
    await s.findWatch();
    expect(tx.watch.findWatch).toBe(true);
    tx.simulateFindPhone(true);
    expect(s.snap.findPhone).toBe(true);
    await s.cancelFindPhone();
    expect(s.snap.findPhone).toBe(false);
  });
});

describe('M5 music', () => {
  it('records toggle/prev/next from watch', async () => {
    const { tx, s } = await linked();
    tx.simulateMusicToggle();
    expect(s.snap.lastMusic).toBe('toggle');
    tx.simulateMusicNext();
    expect(s.snap.lastMusic).toBe('next');
    tx.simulateMusicPrev();
    expect(s.snap.lastMusic).toBe('prev');
  });
});

describe('U phone→watch frames', () => {
  it('U1 chunks assemble into inbox', async () => {
    const { tx, s } = await linked();
    await s.sendNotifChunk('Tele', 0x00);
    expect(tx.watch.notif).toBeNull();
    await s.sendNotifChunk('gram:hi', 0x02);
    expect(tx.watch.notif).toBe('Telegram:hi');
    expect(tx.watch.inbox).toEqual(['Telegram:hi']);
  });

  it('U2–U7 music, battery, camera, alarm, nav, qr, shutter', async () => {
    const { tx, s } = await linked();
    await s.sendMusicInfo('Song', 64);
    expect(tx.watch.song).toBe('Song');
    expect(tx.watch.vol).toBe(64);
    await s.sendPhoneBattery(41, true);
    expect(tx.watch.phoneBat).toEqual({ percent: 41, charging: true });
    await s.cameraReady(true);
    expect(tx.watch.cameraReady).toBe(true);
    tx.simulateCapture();
    expect(s.snap.shutter).toBe(true);
    await s.sendAlarm(0, 7, 30);
    expect(tx.watch.alarm).toMatch(/7:30/);
    await s.sendNav('Turn right', 'Valiasr');
    expect(tx.watch.nav).toBe(true);
    await s.navOff();
    expect(tx.watch.nav).toBe(false);
    await s.sendQr('https://example.com');
    expect(tx.watch.qr[0]).toBe('https://example.com');
  });
});
