/** Turn a ble-plx rejection into a line the Watch screen can show. */
export function bleMessage(e: unknown): string {
  if (e && typeof e === 'object') {
    const o = e as { message?: string; reason?: string; errorCode?: number | string };
    const reason = typeof o.reason === 'string' ? o.reason.trim() : '';
    const message = typeof o.message === 'string' ? o.message.trim() : '';
    const code = o.errorCode != null ? String(o.errorCode) : '';
    const vague = (s: string) => /^unknown error/i.test(s) || s === 'Unknown';
    if (reason && !vague(reason)) {
      return code && code !== '0' ? `${reason} (${code})` : reason;
    }
    if (message && !vague(message)) {
      return code && code !== '0' ? `${message} (${code})` : message;
    }
    if (code === '133') {
      return 'Bluetooth busy. Turn Phone off and on, then connect again.';
    }
  }
  if (e instanceof Error && e.message && !/^unknown error/i.test(e.message)) {
    return e.message;
  }
  return 'Could not link. On the watch open Settings → Phone On, then try again.';
}
