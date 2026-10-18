package com.uniflow.kernelforge.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import com.uniflow.kernelforge.R

class UniStreakWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateStreakWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateStreakWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_uni_streak)

            val streakDays = UniWidgetDataHelper.getStreakDays(context)
            val title = UniWidgetDataHelper.getStreakTitle(context)
            val subtitle = UniWidgetDataHelper.getStreakSubtitle(context)

            views.setTextViewText(R.id.widget_streak_count, "🔥 $streakDays jours")
            views.setTextViewText(R.id.widget_title, title)
            views.setTextViewText(R.id.widget_subtitle, subtitle)

            // Image de mascotte : flamme vive
            views.setImageViewResource(R.id.widget_mascot_image, R.drawable.uni_duo_streak_fire)

            // PendingIntent pour ouvrir la page des quêtes et streak
            val pendingIntent = UniWidgetDataHelper.createPendingIntent(context, "quests", appWidgetId)
            views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)
            views.setOnClickPendingIntent(R.id.bottom_cta_bar, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
