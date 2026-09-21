package expo.modules.roundosbridge

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class RoundosBridgeModule : Module() {
  private val ctx: Context?
    get() = appContext.reactContext

  override fun definition() = ModuleDefinition {
    Name("RoundosBridge")
    Events("onNotification", "onMedia")

    OnStartObserving("onNotification") {
      emitter = { name, body -> sendEvent(name, body) }
    }
    OnStopObserving("onNotification") {
      emitter = null
    }

    Function("isNotifEnabled") {
      val c = ctx ?: return@Function false
      val enabled = Settings.Secure.getString(c.contentResolver, "enabled_notification_listeners") ?: ""
      val cn = ComponentName(c, RoundosNotifService::class.java).flattenToString()
      enabled.contains(cn) || enabled.contains(c.packageName)
    }

    Function("openNotifSettings") {
      val c = ctx ?: return@Function
      val i = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
      i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      c.startActivity(i)
    }

    Function("startKeepAlive") {
      val c = ctx ?: return@Function
      val i = Intent(c, RoundosKeepAliveService::class.java)
      if (Build.VERSION.SDK_INT >= 26) {
        c.startForegroundService(i)
      } else {
        c.startService(i)
      }
    }

    Function("stopKeepAlive") {
      val c = ctx ?: return@Function
      c.stopService(Intent(c, RoundosKeepAliveService::class.java))
    }

    Function("mediaAction") { action: String ->
      val c = ctx ?: return@Function
      when (action) {
        "volUp" -> vol(c, AudioManager.ADJUST_RAISE)
        "volDown" -> vol(c, AudioManager.ADJUST_LOWER)
        "mute" -> vol(c, AudioManager.ADJUST_TOGGLE_MUTE)
        else -> {
          val ctl = activeController(c) ?: return@Function
          val tc = ctl.transportControls
          when (action) {
            "play" -> tc.play()
            "pause" -> tc.pause()
            "prev" -> tc.skipToPrevious()
            "next" -> tc.skipToNext()
            else -> {
              val playing = ctl.playbackState?.state == PlaybackState.STATE_PLAYING
              if (playing) tc.pause() else tc.play()
            }
          }
        }
      }
    }

    Function("mediaSnapshot") {
      val c = ctx ?: return@Function null
      val ctl = activeController(c)
      val title = ctl?.metadata?.description?.title?.toString() ?: ""
      val playing = ctl?.playbackState?.state == PlaybackState.STATE_PLAYING
      val am = c.getSystemService(Context.AUDIO_SERVICE) as AudioManager
      val max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC).coerceAtLeast(1)
      val vol = (100 * am.getStreamVolume(AudioManager.STREAM_MUSIC)) / max
      mapOf("title" to title, "vol" to vol, "playing" to playing)
    }
  }

  private fun activeController(c: Context) =
    try {
      val mm = c.getSystemService(Context.MEDIA_SESSION_SERVICE) as MediaSessionManager
      val cn = ComponentName(c, RoundosNotifService::class.java)
      mm.getActiveSessions(cn).firstOrNull()
    } catch (_: SecurityException) {
      null
    }

  private fun vol(c: Context, dir: Int) {
    val am = c.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    am.adjustStreamVolume(AudioManager.STREAM_MUSIC, dir, AudioManager.FLAG_SHOW_UI)
  }

  companion object {
    var emitter: ((String, Map<String, Any?>) -> Unit)? = null

    fun emit(name: String, body: Map<String, Any?>) {
      emitter?.invoke(name, body)
    }
  }
}
