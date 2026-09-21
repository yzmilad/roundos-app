export function vibratePulse(): void {
  const nav = globalThis as { navigator?: { vibrate?: (p: number | number[]) => boolean } };
  nav.navigator?.vibrate?.([400, 140, 400]);
}

export function startFindRing(onPulse: () => void, periodMs = 1200): () => void {
  onPulse();
  const t = setInterval(onPulse, periodMs);
  return () => clearInterval(t);
}
