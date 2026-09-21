import { describe, expect, it } from 'vitest';
import { loadPrefs, memoryKv, savePrefs, defaultPrefs } from './prefs';

describe('D1 prefs', () => {
  it('round-trips last device, hour12, allowlist', async () => {
    const kv = memoryKv();
    expect(await loadPrefs(kv)).toEqual(defaultPrefs());
    const prefs = {
      lastDeviceId: 'AA:BB',
      hour12: true,
      allow: ['org.telegram.messenger'],
      reconnect: false,
    };
    await savePrefs(kv, prefs);
    expect(await loadPrefs(kv)).toEqual(prefs);
  });
});
