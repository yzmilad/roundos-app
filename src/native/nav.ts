export function navFromCoords(
  lat: number,
  lon: number,
  speedMps?: number | null,
  heading?: number | null,
): { title: string; directions: string; distance: string } {
  const title =
    heading != null && Number.isFinite(heading) ? `${Math.round(heading)} deg` : 'GPS';
  const distance =
    speedMps != null && Number.isFinite(speedMps) && speedMps > 0.3
      ? `${(speedMps * 3.6).toFixed(0)} km/h`
      : '';
  return {
    title,
    directions: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
    distance,
  };
}

export function watchNav(
  onFix: (n: { title: string; directions: string; distance: string }) => void,
): () => void {
  const geo = (
    globalThis as {
      navigator?: {
        geolocation?: {
          watchPosition: (
            ok: (p: {
              coords: { latitude: number; longitude: number; speed: number | null; heading: number | null };
            }) => void,
            err?: () => void,
            opts?: { enableHighAccuracy?: boolean; maximumAge?: number },
          ) => number;
          clearWatch: (id: number) => void;
        };
      };
    }
  ).navigator?.geolocation;
  if (geo) {
    const id = geo.watchPosition(
      (p) => {
        onFix(navFromCoords(p.coords.latitude, p.coords.longitude, p.coords.speed, p.coords.heading));
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 2000 },
    );
    return () => geo.clearWatch(id);
  }

  let cancelled = false;
  let sub: { remove(): void } | null = null;
  void import('expo-location').then(async (Location) => {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (cancelled || perm.status !== 'granted') {
      return;
    }
    sub = await Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced }, (p) => {
      onFix(navFromCoords(p.coords.latitude, p.coords.longitude, p.coords.speed, p.coords.heading));
    });
  }).catch(() => undefined);
  return () => {
    cancelled = true;
    sub?.remove();
  };
}
