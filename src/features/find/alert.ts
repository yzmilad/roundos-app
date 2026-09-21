export class FindPhoneAlert {
  active = false;
  pulses = 0;

  start(): void {
    this.active = true;
    this.pulses += 1;
  }

  stop(): void {
    this.active = false;
  }
}
