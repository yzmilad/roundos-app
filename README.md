# RoundOS phone app

Chronos-compatible companion for the Waveshare ESP32-S3-Touch-LCD-1.28 watch.
Roadmap: firmware repo `docs/COMPANION_APP.md`.

Chronos-like companion shell (Watch / Alerts / Music / Tools / Apps / More), RoundOS colors — not a Play Store pixel clone. BLE talks Nordic UART to advertised name `RoundOS`. Tab **Apps** SET/GETs Notes, Weather city, RSS URL, prayer geo, world slots, and calendar notes over `0xB1`. Calc/Torch/Level/Dice/Timer have no settings. Do not send the OpenWeather key.

## Status

- **M0–M5 + U1–U7 + Track D + Apps sync `0xB1`**: `npm test`.
- Watch firmware **1.4.0** parses the same frames.
- Web uses `FakeTransport`. Android APK bakes `EXPO_PUBLIC_USE_FAKE=0` (real `ble-plx`) via GitHub Actions **android-apk**.

```powershell
cd ..\roundos-app
npm test
npx expo start
```

Then `w` for FakeWatch in the browser. Do not use Expo Go for BLE.

Install the APK: [companion-1.1.0](https://github.com/yzmilad/roundos-app/releases/tag/companion-1.1.0) (`app-release.apk`), or Actions artifact **RoundOS**.

```powershell
gh run download -R yzmilad/roundos-app -n RoundOS
```

On the watch: **RoundOS 1.4.0**, Settings → Phone On (not HID). On the phone: install APK, Bluetooth + location, Connect RoundOS. Tab **Apps** to push notes/city/RSS.

If `dl.google.com` works on another PC:

```powershell
.\scripts\env.ps1
$env:EXPO_PUBLIC_USE_FAKE='0'
npx expo run:android
```
