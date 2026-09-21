export const INBOX_CAP = 8;

export type Note = { title: string; body: string };

export function splitTitle(msg: string): Note {
  const cut = msg.slice(0, 30);
  const i = cut.indexOf(':');
  if (i > 0) {
    return { title: cut.slice(0, i).slice(0, 19), body: msg.slice(i + 1).replace(/\n/g, ' ').slice(0, 31) };
  }
  return { title: 'Phone', body: msg.replace(/\n/g, ' ').slice(0, 31) };
}

export function pushInbox(list: Note[], note: Note, cap = INBOX_CAP): Note[] {
  if (list.length < cap) {
    return [...list, note];
  }
  return [...list.slice(1), note];
}

/** Mirror of companion.cpp applyNotif chunk states 0x00/0x01/0x02. */
export function assembleNotif(
  prev: string,
  state: number,
  chunk: string,
): { pending: string; commit: string | null } {
  if (state === 0x00) {
    return { pending: chunk, commit: null };
  }
  if (state === 0x01) {
    return { pending: prev + chunk, commit: null };
  }
  if (state === 0x02) {
    return { pending: '', commit: prev + chunk };
  }
  return { pending: prev, commit: null };
}
