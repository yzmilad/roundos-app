import { describe, expect, it } from 'vitest';
import { FakeTransport } from '../../ble/fake';
import { clipNotif } from '../../protocol/frames';
import { WatchSession } from '../../session/WatchSession';
import { appLabel, shouldForward, type IncomingNotif } from './filter';

const telegram: IncomingNotif = {
  packageName: 'org.telegram.messenger',
  title: 'Ali',
  text: 'hello',
  ongoing: false,
  silent: false,
};

describe('M3 notif filter', () => {
  it('drops ongoing and silent', () => {
    expect(shouldForward({ ...telegram, ongoing: true })).toBe(false);
    expect(shouldForward({ ...telegram, silent: true })).toBe(false);
    expect(shouldForward(telegram)).toBe(true);
  });

  it('honors allowlist when set', () => {
    const allow = new Set(['org.telegram.messenger']);
    expect(shouldForward(telegram, allow)).toBe(true);
    expect(shouldForward({ ...telegram, packageName: 'com.spam' }, allow)).toBe(false);
  });

  it('clips to watch title/body caps and sends last-chunk', async () => {
    const tx = new FakeTransport();
    const s = new WatchSession(tx);
    await s.connect();
    const line = clipNotif('A'.repeat(40), 'B'.repeat(80));
    expect(line.split(':')[0]?.length).toBeLessThanOrEqual(19);
    expect(line.split(':')[1]?.length).toBeLessThanOrEqual(31);
    if (shouldForward(telegram)) {
      await s.sendNotif(appLabel(telegram), telegram.text);
    }
    expect(tx.watch.notif).toBe('Ali:hello');
  });
});
