import { describe, expect, it } from 'vitest';
import { FakeTransport } from '../../ble/fake';
import { WatchSession } from '../../session/WatchSession';
import { FindPhoneAlert } from './alert';

describe('M4 find phone', () => {
  it('starts on 0x7D on and stops on cancel', async () => {
    const tx = new FakeTransport();
    const s = new WatchSession(tx);
    const alert = new FindPhoneAlert();
    s.onChange = (snap) => {
      if (snap.findPhone) {
        alert.start();
      } else {
        alert.stop();
      }
    };
    await s.connect();
    tx.simulateFindPhone(true);
    expect(alert.active).toBe(true);
    expect(alert.pulses).toBe(1);
    await s.cancelFindPhone();
    expect(alert.active).toBe(false);
    expect(s.snap.findPhone).toBe(false);
  });
});
