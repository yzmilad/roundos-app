# RoundOS phone app

Chronos-compatible companion for the Waveshare ESP32-S3-Touch-LCD-1.28 watch.
Roadmap: firmware repo `docs/COMPANION_APP.md`.

Chronos-like companion shell (Watch / Alerts / Music / Tools), RoundOS colors — not a Play Store pixel clone. BLE talks Nordic UART to advertised name `RoundOS`.

## Status

- **M0–M5 + U1–U7** protocol + Chronos-like companion tabs: `npm test`.
- Watch firmware **1.3.0** parses the same frames (Inbox/Cam/Nav/Link on the watch).
- Web uses `FakeTransport` (no browser BLE). Open Metro web at `/`.
- Native `BlePlxTransport` is ready; set `EXPO_PUBLIC_USE_FAKE=0` after an Android SDK/APK exists.

```powershell
cd ..\roundos-app
npm test
npx expo start
```

Then `w` for web, or scan the QR with a **dev client** (not Expo Go) once Android SDK works.

Android APK after JDK 17 + Android SDK:

```powershell
.\scripts\env.ps1
$env:EXPO_PUBLIC_USE_FAKE='0'
npx expo run:android
```

If `dl.google.com/android/repository` is blocked, install Android Studio on another network or:

```powershell
npx eas-cli build -p android --profile development
```

JDK 17 is Microsoft OpenJDK (`JAVA_HOME` = `C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot`).
