import { describe, expect, it } from 'vitest';
import { readPhoneBattery } from './battery';

describe('D2 phone battery', () => {
  it('reads percent from a Battery-like source', async () => {
    const b = await readPhoneBattery(async () => ({ level: 0.41, charging: true }));
    expect(b).toEqual({ percent: 41, charging: true });
  });
});
