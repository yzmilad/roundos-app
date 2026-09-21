# RoundOS phone app

Chronos-compatible companion for the Waveshare ESP32-S3-Touch-LCD-1.28 watch.
Roadmap: `esp32-s3-touch-lcd-1.28/docs/COMPANION_APP.md` (M0–M5, then U1+).

Not the Play Store Chronos UI. BLE talks Nordic UART to advertised name `RoundOS`.

## M0

- Expo SDK 57 + Router + TypeScript
- `src/protocol/` encode/decode (no React Native)
- Hello screen only — no live BLE yet

```powershell
cd ..\roundos-app
npm test
npx expo start
```

Android APK (dev client) after JDK 17 + Android SDK:

```powershell
.\scripts\env.ps1
npx expo run:android
```

If `dl.google.com/android/repository` is blocked, install **Android Studio** (it uses a different CDN) or cloud-build:

```powershell
npx eas-cli build -p android --profile development
```

JDK 17 is Microsoft OpenJDK (`JAVA_HOME` = `C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot`).

`react-native-ble-plx` is installed for M1; this phase does not scan.
