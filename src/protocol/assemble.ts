import { HEADER, MAX_FRAME } from './uuids';

export class FrameAssembler {
  private buf = new Uint8Array(0);

  push(chunk: Uint8Array): Uint8Array[] {
    if (chunk.length === 0) {
      return [];
    }
    const next = new Uint8Array(this.buf.length + chunk.length);
    next.set(this.buf, 0);
    next.set(chunk, this.buf.length);
    this.buf = next;
    const out: Uint8Array[] = [];
    while (this.buf.length >= 4) {
      const b0 = this.buf[0];
      const b3 = this.buf[3];
      if ((b0 !== 0xab && b0 !== 0xea) || (b3 !== 0xfe && b3 !== 0xff)) {
        this.buf = this.buf.slice(1);
        continue;
      }
      const need = ((this.buf[1] << 8) | this.buf[2]) + HEADER;
      if (need < 5 || need > MAX_FRAME) {
        this.buf = this.buf.slice(1);
        continue;
      }
      if (this.buf.length < need) {
        break;
      }
      out.push(this.buf.slice(0, need));
      this.buf = this.buf.slice(need);
    }
    return out;
  }

  reset(): void {
    this.buf = new Uint8Array(0);
  }
}
