export const OP = {
  FIND_WATCH: 0x71,
  NOTIF: 0x72,
  HOUR12: 0x7c,
  FIND_PHONE: 0x7d,
  BATTERY: 0x91,
  HELLO: 0x92,
  TIME: 0x93,
  MUSIC_TOGGLE: 0x99,
  MUSIC_CTRL: 0x9d,
} as const;

export const MUSIC = {
  TOGGLE: 0x00,
  PLAY: 0x00,
  PAUSE: 0x01,
  PREV: 0x02,
  NEXT: 0x03,
} as const;

export const NOTIF_STATE_LAST = 0x02;
export const NOTIF_ICON_RING = 0x01;
export const NOTIF_ICON_RING_OFF = 0x02;
