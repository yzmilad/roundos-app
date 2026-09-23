# RoundOS phone app

Chronos-compatible companion for the Waveshare ESP32-S3-Touch-LCD-1.28 watch.
Roadmap: firmware repo `docs/COMPANION_APP.md`.

Chronos-like companion shell (Watch / Alerts / Music / Tools / More), RoundOS colors — not a Play Store pixel clone. BLE talks Nordic UART to advertised name `RoundOS`. Local watch apps (Calc, Weather Wi‑Fi, Notes, …) stay on the watch.

## Status

- **M0–M5 + U1–U7 + Track D** (persist, battery, find vibrate, notif/media native module, camera, GPS nav, keep-alive): `npm test`.
- Watch firmware **1.3.0** parses the same frames.
- Web uses `FakeTransport`. Android APK bakes `EXPO_PUBLIC_USE_FAKE=0` (real `ble-plx`) via GitHub Actions **android-apk**.

```powershell
cd ..\roundos-app
npm test
npx expo start
```

Then `w` for FakeWatch in the browser. Do not use Expo Go for BLE.

Install the APK: GitHub → Actions → **android-apk** → artifact **RoundOS**, or:

```powershell
gh run download -R yzmilad/roundos-app -n RoundOS
```

On the watch: **RoundOS 1.3.0**, Settings → Phone On (not HID). On the phone: install APK, Bluetooth + location, Connect RoundOS.

If `dl.google.com` works on another PC:

```powershell
.\scripts\env.ps1
$env:EXPO_PUBLIC_USE_FAKE='0'
npx expo run:android
```
