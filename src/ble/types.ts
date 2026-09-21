import { FrameAssembler } from '../protocol/assemble';
import { decodeHeader } from '../protocol/frames';

export type ScanHit = {
  id: string;
  name: string;
  rssi: number | null;
};

export interface BleTransport {
  startScan(onDevice: (d: ScanHit) => void): Promise<void>;
  stopScan(): Promise<void>;
  connect(
    id: string,
    onData: (chunk: Uint8Array) => void,
    onDisconnect: () => void,
  ): Promise<void>;
  write(data: Uint8Array): Promise<void>;
  disconnect(): Promise<void>;
}

export function chunksToFrames(asm: FrameAssembler, chunk: Uint8Array) {
  return asm.push(chunk);
}

export function opcodeOf(frame: Uint8Array): number | null {
  return decodeHeader(frame)?.opcode ?? null;
}
