export type PhoneBat = { percent: number; charging: boolean };

type BatteryLike = { level: number; charging: boolean };

export async function readPhoneBattery(
  getBattery?: () => Promise<BatteryLike>,
): Promise<PhoneBat | null> {
  const fn =
    getBattery ??
    (globalThis as { navigator?: { getBattery?: () => Promise<BatteryLike> } }).navigator?.getBattery;
  if (typeof fn === 'function') {
    const b = await fn.call((globalThis as { navigator?: unknown }).navigator);
    const percent = Math.max(0, Math.min(100, Math.round((b.level ?? 0) * 100)));
    return { percent, charging: !!b.charging };
  }
  try {
    const Battery = await import('expo-battery');
    const level = await Battery.getBatteryLevelAsync();
    const state = await Battery.getBatteryStateAsync();
    const charging =
      state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL;
    return { percent: Math.max(0, Math.min(100, Math.round(level * 100))), charging };
  } catch {
    return null;
  }
}
