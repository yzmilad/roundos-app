package expo.modules.roundosbridge

import android.app.Notification
import android.media.AudioManager
import android.media.MediaMetadata
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.content.ComponentName
import android.content.Context

class RoundosNotifService : NotificationListenerService() {
  override fun onNotificationPosted(sbn: StatusBarNotification) {
    if (sbn.packageName == packageName) {
      return
    }
    val n = sbn.notification
    val extras = n.extras
    val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
    val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
    val silent =
      if (Build.VERSION.SDK_INT >= 26) n.flags and Notification.FLAG_ONLY_ALERT_ONCE != 0 && n.sound == null
      else n.sound == null && n.vibrate == null
    RoundosBridgeModule.emit(
      "onNotification",
      mapOf(
        "packageName" to sbn.packageName,
        "title" to title,
        "text" to text,
        "ongoing" to sbn.isOngoing,
        "silent" to silent,
      ),
    )
    emitMedia()
  }

  override fun onListenerConnected() {
    emitMedia()
  }

  private fun emitMedia() {
    try {
      val mm = getSystemService(Context.MEDIA_SESSION_SERVICE) as MediaSessionManager
      val cn = ComponentName(this, RoundosNotifService::class.java)
      val ctl = mm.getActiveSessions(cn).firstOrNull() ?: return
      val title =
        ctl.metadata?.getString(MediaMetadata.METADATA_KEY_TITLE)
          ?: ctl.metadata?.description?.title?.toString()
          ?: ""
      if (title.isEmpty()) {
        return
      }
      val am = getSystemService(Context.AUDIO_SERVICE) as AudioManager
      val max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC).coerceAtLeast(1)
      val vol = (100 * am.getStreamVolume(AudioManager.STREAM_MUSIC)) / max
      val playing = ctl.playbackState?.state == PlaybackState.STATE_PLAYING
      RoundosBridgeModule.emit(
        "onMedia",
        mapOf("title" to title, "vol" to vol, "playing" to playing),
      )
    } catch (_: SecurityException) {
      /* listener not enabled */
    }
  }
}
