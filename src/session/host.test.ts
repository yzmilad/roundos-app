import { describe, expect, it } from 'vitest';
import { FakeTransport } from '../ble/fake';
import { WatchSession } from './WatchSession';
import type { MediaHost } from '../features/music/apply';
import { FindPhoneAlert } from '../features/find/alert';

function logHost() {
  const log: string[] = [];
  const host: MediaHost = {
    toggle: () => log.push('toggle'),
    play: () => log.push('play'),
    pause: () => log.push('pause'),
    prev: () => log.push('prev'),
    next: () => log.push('next'),
    volUp: () => log.push('volUp'),
    volDown: () => log.push('volDown'),
    mute: () => log.push('mute'),
  };
  return { host, log };
}

async function linked() {
  const tx = new FakeTransport();
  const s = new WatchSession(tx);
  await s.connect();
  return { tx, s };
}

describe('D3–D5 session hosts', () => {
  it('findHost starts on 0x7D and stops on cancel', async () => {
    const { tx, s } = await linked();
    const alert = new FindPhoneAlert();
    s.findHost = alert;
    tx.simulateFindPhone(true);
    expect(alert.active).toBe(true);
    await s.cancelFindPhone();
    expect(alert.active).toBe(false);
  });

  it('mediaHost receives watch keys', async () => {
    const { tx, s } = await linked();
    const { host, log } = logHost();
    s.mediaHost = host;
    tx.simulateMusicToggle();
    tx.simulateMusicNext();
    tx.simulateMusicPrev();
    expect(log).toEqual(['toggle', 'next', 'prev']);
  });

  it('forwards notif unless allowlist blocks it', async () => {
    const { tx, s } = await linked();
    const n = {
      packageName: 'org.telegram.messenger',
      title: 'Ali',
      text: 'hello',
      ongoing: false,
      silent: false,
    };
    expect(await s.forwardIncoming(n)).toBe(true);
    expect(tx.watch.notif).toBe('Ali:hello');
    s.allowlist = new Set(['com.other']);
    expect(await s.forwardIncoming(n)).toBe(false);
  });
});
