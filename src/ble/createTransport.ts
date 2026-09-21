import { FakeTransport } from './fake';
import type { BleTransport } from './types';

/** Web and tests use FakeWatch. Set EXPO_PUBLIC_USE_FAKE=0 on a native build for ble-plx. */
export function createTransport(): BleTransport {
  if (process.env.EXPO_PUBLIC_USE_FAKE === '0') {
    const { BlePlxTransport } = require('./blePlx') as typeof import('./blePlx');
    return new BlePlxTransport();
  }
  return new FakeTransport();
}

export function isFakeTransport(tx: BleTransport): tx is FakeTransport {
  return tx instanceof FakeTransport;
}
