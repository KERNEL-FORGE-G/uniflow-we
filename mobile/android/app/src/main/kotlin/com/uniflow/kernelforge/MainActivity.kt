package com.uniflow.kernelforge

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import com.uniflow.kernelforge.widgets.UniCompactWidgetProvider
import com.uniflow.kernelforge.widgets.UniScheduleWidgetProvider
import com.uniflow.kernelforge.widgets.UniStreakWidgetProvider
import com.uniflow.kernelforge.widgets.UniWidgetDataHelper
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val widgetChannelName = "com.uniflow/widget"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, widgetChannelName).setMethodCallHandler { call, result ->
            when (call.method) {
                "updateWidgetData" -> {
                    val streakDays = call.argument<Int>("streakDays")
                    val streakTitle = call.argument<String>("streakTitle")
                    val streakSubtitle = call.argument<String>("streakSubtitle")
                    val nextCourseTitle = call.argument<String>("nextCourseTitle")
                    val nextCourseTime = call.argument<String>("nextCourseTime")
                    val nextCourseRoom = call.argument<String>("nextCourseRoom")
                    val pendingTasks = call.argument<Int>("pendingTasks")

                    val prefs = UniWidgetDataHelper.getPrefs(context)
                    val editor = prefs.edit()

                    if (streakDays != null) editor.putInt(UniWidgetDataHelper.KEY_STREAK_DAYS, streakDays)
                    if (streakTitle != null) editor.putString(UniWidgetDataHelper.KEY_STREAK_TITLE, streakTitle)
                    if (streakSubtitle != null) editor.putString(UniWidgetDataHelper.KEY_STREAK_SUBTITLE, streakSubtitle)
                    if (nextCourseTitle != null) editor.putString(UniWidgetDataHelper.KEY_NEXT_COURSE_TITLE, nextCourseTitle)
                    if (nextCourseTime != null) editor.putString(UniWidgetDataHelper.KEY_NEXT_COURSE_TIME, nextCourseTime)
                    if (nextCourseRoom != null) editor.putString(UniWidgetDataHelper.KEY_NEXT_COURSE_ROOM, nextCourseRoom)
                    if (pendingTasks != null) editor.putInt(UniWidgetDataHelper.KEY_PENDING_TASKS, pendingTasks)

                    editor.apply()

                    // Rafraîchir immédiatement tous les widgets actifs
                    refreshAllWidgets(context)

                    result.success(true)
                }
                "pinWidget" -> {
                    val widgetType = call.argument<String>("widgetType") ?: "streak"
                    val success = requestPinWidget(context, widgetType)
                    result.success(success)
                }
                "isPinningSupported" -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        val appWidgetManager = getSystemService(AppWidgetManager::class.java)
                        result.success(appWidgetManager?.isRequestPinAppWidgetSupported == true)
                    } else {
                        result.success(false)
                    }
                }
                else -> result.notImplemented()
            }
        }
    }

    private fun refreshAllWidgets(context: Context) {
        val appWidgetManager = AppWidgetManager.getInstance(context)

        // 1. Streak Widget
        val streakIds = appWidgetManager.getAppWidgetIds(
            ComponentName(context, UniStreakWidgetProvider::class.java)
        )
        if (streakIds.isNotEmpty()) {
            val intent = Intent(context, UniStreakWidgetProvider::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, streakIds)
            }
            context.sendBroadcast(intent)
        }

        // 2. Schedule Widget
        val scheduleIds = appWidgetManager.getAppWidgetIds(
            ComponentName(context, UniScheduleWidgetProvider::class.java)
        )
        if (scheduleIds.isNotEmpty()) {
            val intent = Intent(context, UniScheduleWidgetProvider::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, scheduleIds)
            }
            context.sendBroadcast(intent)
        }

        // 3. Compact Mascot Widget
        val compactIds = appWidgetManager.getAppWidgetIds(
            ComponentName(context, UniCompactWidgetProvider::class.java)
        )
        if (compactIds.isNotEmpty()) {
            val intent = Intent(context, UniCompactWidgetProvider::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, compactIds)
            }
            context.sendBroadcast(intent)
        }
    }

    private fun requestPinWidget(context: Context, widgetType: String): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val appWidgetManager = getSystemService(AppWidgetManager::class.java) ?: return false
            if (!appWidgetManager.isRequestPinAppWidgetSupported) return false

            val providerClass = when (widgetType) {
                "schedule" -> UniScheduleWidgetProvider::class.java
                "compact" -> UniCompactWidgetProvider::class.java
                else -> UniStreakWidgetProvider::class.java
            }
            val provider = ComponentName(context, providerClass)
            return appWidgetManager.requestPinAppWidget(provider, null, null)
        }
        return false
    }
}
