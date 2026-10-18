package com.uniflow.kernelforge.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import com.uniflow.kernelforge.R

class UniScheduleWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateScheduleWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateScheduleWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_uni_schedule)

            val courseTitle = UniWidgetDataHelper.getNextCourseTitle(context)
            val courseTime = UniWidgetDataHelper.getNextCourseTime(context)
            val courseRoom = UniWidgetDataHelper.getNextCourseRoom(context)

            views.setTextViewText(R.id.widget_course_title, courseTitle)
            views.setTextViewText(R.id.widget_class_time, courseTime)
            views.setTextViewText(R.id.widget_course_room, courseRoom)

            // Mascotte Uni qui court vers le cours
            views.setImageViewResource(R.id.widget_mascot_image, R.drawable.uni_duo_class_rush)

            // PendingIntent pour ouvrir l'emploi du temps
            val pendingIntent = UniWidgetDataHelper.createPendingIntent(context, "schedule", appWidgetId)
            views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)
            views.setOnClickPendingIntent(R.id.bottom_cta_bar, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
