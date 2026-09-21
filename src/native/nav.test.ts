import { describe, expect, it } from 'vitest';
import { navFromCoords } from './nav';

describe('D7 nav text', () => {
  it('formats lat/lon and optional heading/speed', () => {
    expect(navFromCoords(35.7219, 51.3347)).toEqual({
      title: 'GPS',
      directions: '35.72190, 51.33470',
      distance: '',
    });
    expect(navFromCoords(35.72, 51.33, 10, 90)).toMatchObject({
      title: '90 deg',
      distance: '36 km/h',
    });
  });
});
