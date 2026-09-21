import type { MusicAction } from '../../protocol/frames';

export type MediaHost = {
  toggle(): void;
  play(): void;
  pause(): void;
  prev(): void;
  next(): void;
  volUp(): void;
  volDown(): void;
  mute(): void;
};

export function applyMusic(host: MediaHost, action: MusicAction): void {
  host[action]();
}
