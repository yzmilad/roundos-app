export const OP = {
  FIND_WATCH: 0x71,
  NOTIF: 0x72,
  ALARM: 0x73,
  HOUR12: 0x7c,
  FIND_PHONE: 0x7d,
  WEATHER: 0x7e,
  CAMERA: 0x79,
  BATTERY: 0x91,
  HELLO: 0x92,
  TIME: 0x93,
  MUSIC_TOGGLE: 0x99,
  MUSIC_CTRL: 0x9d,
  QR: 0xa8,
  SYNC: 0xb1,
  NAV_ICON: 0xee,
  NAV: 0xef,
} as const;

export const MUSIC = {
  TOGGLE: 0x00,
  PLAY: 0x00,
  PAUSE: 0x01,
  PREV: 0x02,
  NEXT: 0x03,
  VOL_SET: 0xa0,
  VOL_UP: 0xa1,
  VOL_DOWN: 0xa2,
  VOL_MUTE: 0xa3,
  INFO: 0xaa,
} as const;

export const NOTIF_STATE_FIRST = 0x00;
export const NOTIF_STATE_MID = 0x01;

export const NOTIF_STATE_LAST = 0x02;
export const NOTIF_ICON_RING = 0x01;
export const NOTIF_ICON_RING_OFF = 0x02;
export const NAV_OFF = 0x00;
export const NAV_DATA = 0x80;

export const SYNC = {
  NOTE: 1,
  WX: 2,
  RSS: 3,
  PRAYER: 4,
  WORLD: 5,
  CAL: 6,
  ALL: 0xff,
} as const;

export const SYNC_OP = {
  SET: 0,
  GET: 1,
  PUT: 2,
} as const;

export const SYNC_TEXT_MAX = 79;

export const RSS_FEEDS = [
  { lab: 'IRNA', url: 'https://en.irna.ir/rss' },
  { lab: 'TT', url: 'https://www.tehrantimes.com/rss' },
] as const;

export const WORLD_CITIES = [
  'Tehran',
  'Mashhad',
  'Istanbul',
  'Dubai',
  'Moscow',
  'London',
  'Paris',
  'Berlin',
  'New York',
  'Chicago',
  'LA',
  'Tokyo',
  'Seoul',
  'Beijing',
  'Mumbai',
  'Sydney',
  'UTC',
] as const;
