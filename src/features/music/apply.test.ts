import { describe, expect, it } from 'vitest';
import { FakeTransport } from '../../ble/fake';
import { WatchSession } from '../../session/WatchSession';
import { applyMusic, type MediaHost } from './apply';

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

describe('M5 music map', () => {
  it('maps watch 0x99/0x9D to host calls', async () => {
    const tx = new FakeTransport();
    const s = new WatchSession(tx);
    const { host, log } = logHost();
    await s.connect();
    tx.simulateMusicToggle();
    if (s.snap.lastMusic) {
      applyMusic(host, s.snap.lastMusic);
    }
    tx.simulateMusicNext();
    if (s.snap.lastMusic) {
      applyMusic(host, s.snap.lastMusic);
    }
    tx.simulateMusicPrev();
    if (s.snap.lastMusic) {
      applyMusic(host, s.snap.lastMusic);
    }
    expect(log).toEqual(['toggle', 'next', 'prev']);
  });
});
