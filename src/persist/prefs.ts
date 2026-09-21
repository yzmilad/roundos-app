export type Prefs = {
  lastDeviceId: string | null;
  hour12: boolean;
  allow: string[];
  reconnect: boolean;
};

export const defaultPrefs = (): Prefs => ({
  lastDeviceId: null,
  hour12: false,
  allow: [],
  reconnect: true,
});

export interface Kv {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

const KEY = 'roundos.prefs.v1';

export function memoryKv(): Kv {
  const m = new Map<string, string>();
  return {
    getItem: async (k) => m.get(k) ?? null,
    setItem: async (k, v) => {
      m.set(k, v);
    },
  };
}

export function createKv(): Kv {
  try {
    // Native / web after the package is installed. Tests stay on memoryKv.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AsyncStorage = require('@react-native-async-storage/async-storage').default as Kv;
    if (AsyncStorage?.getItem && AsyncStorage?.setItem) {
      return AsyncStorage;
    }
  } catch {
    /* vitest / missing native */
  }
  return memoryKv();
}

export async function loadPrefs(kv: Kv): Promise<Prefs> {
  const raw = await kv.getItem(KEY);
  if (!raw) {
    return defaultPrefs();
  }
  try {
    const p = JSON.parse(raw) as Partial<Prefs>;
    return {
      ...defaultPrefs(),
      lastDeviceId: typeof p.lastDeviceId === 'string' ? p.lastDeviceId : null,
      hour12: !!p.hour12,
      allow: Array.isArray(p.allow) ? p.allow.filter((x) => typeof x === 'string') : [],
      reconnect: p.reconnect !== false,
    };
  } catch {
    return defaultPrefs();
  }
}

export async function savePrefs(kv: Kv, prefs: Prefs): Promise<void> {
  await kv.setItem(KEY, JSON.stringify(prefs));
}
