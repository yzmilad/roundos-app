const { AndroidConfig, withAndroidManifest } = require('expo/config-plugins');

const NOTIF = 'expo.modules.roundosbridge.RoundosNotifService';
const KEEP = 'expo.modules.roundosbridge.RoundosKeepAliveService';

function withRoundosBridge(config) {
  config = AndroidConfig.Permissions.withPermissions(config, [
    'android.permission.POST_NOTIFICATIONS',
    'android.permission.CAMERA',
    'android.permission.ACCESS_COARSE_LOCATION',
    'android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE',
  ]);
  return withAndroidManifest(config, (mod) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults);
    app.service = app.service || [];
    if (!app.service.some((s) => s.$['android:name'] === NOTIF)) {
      app.service.push({
        $: {
          'android:name': NOTIF,
          'android:exported': 'true',
          'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.service.notification.NotificationListenerService' } }],
          },
        ],
      });
    }
    if (!app.service.some((s) => s.$['android:name'] === KEEP)) {
      app.service.push({
        $: {
          'android:name': KEEP,
          'android:exported': 'false',
          'android:foregroundServiceType': 'connectedDevice',
        },
      });
    }
    return mod;
  });
}

module.exports = withRoundosBridge;
