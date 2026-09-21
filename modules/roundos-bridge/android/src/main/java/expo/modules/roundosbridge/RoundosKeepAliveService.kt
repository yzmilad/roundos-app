package expo.modules.roundosbridge

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder

class RoundosKeepAliveService : Service() {
  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val mgr = getSystemService(NotificationManager::class.java)
    if (Build.VERSION.SDK_INT >= 26) {
      mgr.createNotificationChannel(
        NotificationChannel(CHANNEL, "RoundOS", NotificationManager.IMPORTANCE_LOW),
      )
    }
    val n =
      if (Build.VERSION.SDK_INT >= 26) {
        Notification.Builder(this, CHANNEL)
          .setContentTitle("RoundOS")
          .setContentText("Watch linked")
          .setSmallIcon(android.R.drawable.stat_sys_data_bluetooth)
          .setOngoing(true)
          .build()
      } else {
        @Suppress("DEPRECATION")
        Notification.Builder(this)
          .setContentTitle("RoundOS")
          .setContentText("Watch linked")
          .setSmallIcon(android.R.drawable.stat_sys_data_bluetooth)
          .setOngoing(true)
          .build()
      }
    if (Build.VERSION.SDK_INT >= 34) {
      startForeground(ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE)
    } else {
      startForeground(ID, n)
    }
    return START_STICKY
  }

  companion object {
    private const val CHANNEL = "roundos-link"
    private const val ID = 71
  }
}
