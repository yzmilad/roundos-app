import { BleManager, State, type Device, type Subscription } from 'react-native-ble-plx';
import type { BleTransport, ScanHit } from './types';
import { NORDIC } from '../protocol/uuids';

function b64ToU8(b64: string): Uint8Array {
  const bin = atob(b64);
  const o = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    o[i] = bin.charCodeAt(i);
  }
  return o;
}

function u8ToB64(u: Uint8Array): string {
  let s = '';
  for (const b of u) {
    s += String.fromCharCode(b);
  }
  return btoa(s);
}

export class BlePlxTransport implements BleTransport {
  private mgr = new BleManager();
  private device: Device | null = null;
  private scanSub: Subscription | null = null;
  private mon: Subscription | null = null;

  async startScan(onDevice: (d: ScanHit) => void): Promise<void> {
    const st = await this.mgr.state();
    if (st !== State.PoweredOn) {
      throw new Error(`bluetooth ${st}`);
    }
    this.mgr.startDeviceScan([NORDIC.service], { allowDuplicates: false }, (err, dev) => {
      if (err || !dev) {
        return;
      }
      const name = dev.name || dev.localName || '';
      onDevice({ id: dev.id, name: name || '(no name)', rssi: dev.rssi });
    });
  }

  async stopScan(): Promise<void> {
    this.mgr.stopDeviceScan();
  }

  async connect(
    id: string,
    onData: (chunk: Uint8Array) => void,
    onDisconnect: () => void,
  ): Promise<void> {
    await this.stopScan();
    let d = await this.mgr.connectToDevice(id, { requestMTU: 185 });
    d = await d.discoverAllServicesAndCharacteristics();
    this.device = d;
    this.scanSub = d.onDisconnected(() => {
      this.device = null;
      onDisconnect();
    });
    this.mon = d.monitorCharacteristicForService(NORDIC.service, NORDIC.tx, (err, ch) => {
      if (err || !ch?.value) {
        return;
      }
      onData(b64ToU8(ch.value));
    });
  }

  async write(data: Uint8Array): Promise<void> {
    if (!this.device) {
      throw new Error('not connected');
    }
    await this.device.writeCharacteristicWithResponseForService(
      NORDIC.service,
      NORDIC.rx,
      u8ToB64(data),
    );
  }

  async disconnect(): Promise<void> {
    this.mon?.remove();
    this.scanSub?.remove();
    this.mon = null;
    this.scanSub = null;
    if (this.device) {
      await this.mgr.cancelDeviceConnection(this.device.id).catch(() => undefined);
    }
    this.device = null;
  }
}
