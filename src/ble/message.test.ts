import { describe, expect, it } from 'vitest';
import { bleMessage } from './message';

describe('bleMessage', () => {
  it('replaces a bare Unknown error', () => {
    expect(bleMessage(new Error('Unknown error'))).toMatch(/Phone On/);
  });

  it('keeps a real reason', () => {
    expect(bleMessage({ message: 'Unknown error', reason: 'Device disconnected', errorCode: 201 })).toBe(
      'Device disconnected (201)',
    );
  });
});
