export type IncomingNotif = {
  packageName: string;
  title: string;
  text: string;
  ongoing: boolean;
  silent: boolean;
};

/** Empty allowlist = all apps. Ongoing/silent never go to the watch. */
export function shouldForward(n: IncomingNotif, allow?: Set<string> | null): boolean {
  if (n.ongoing || n.silent) {
    return false;
  }
  if (!n.title && !n.text) {
    return false;
  }
  if (allow && allow.size > 0 && !allow.has(n.packageName)) {
    return false;
  }
  return true;
}

export function appLabel(n: IncomingNotif): string {
  const last = n.packageName.split('.').pop() || n.packageName;
  return (n.title || last).trim();
}
