package com.uniflow.kernelforge.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import com.uniflow.kernelforge.R

class UniCompactWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateCompactWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateCompactWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_uni_compact)

            val speech = UniWidgetDataHelper.getDynamicSpeechBubble()
            val mascotRes = UniWidgetDataHelper.getDynamicMascotRes()

            views.setTextViewText(R.id.widget_speech_bubble, speech)
            views.setImageViewResource(R.id.widget_mascot_image, mascotRes)

            val pendingIntent = UniWidgetDataHelper.createPendingIntent(context, "dashboard", appWidgetId)
            views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
