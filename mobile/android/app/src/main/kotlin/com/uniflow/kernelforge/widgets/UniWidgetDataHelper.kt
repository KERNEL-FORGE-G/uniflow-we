package com.uniflow.kernelforge.widgets

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import com.uniflow.kernelforge.MainActivity
import com.uniflow.kernelforge.R
import java.util.Calendar

object UniWidgetDataHelper {
    private const val PREFS_NAME = "uniflow_widget_prefs"

    const val KEY_STREAK_DAYS = "streak_days"
    const val KEY_STREAK_TITLE = "streak_title"
    const val KEY_STREAK_SUBTITLE = "streak_subtitle"

    const val KEY_NEXT_COURSE_TITLE = "next_course_title"
    const val KEY_NEXT_COURSE_TIME = "next_course_time"
    const val KEY_NEXT_COURSE_ROOM = "next_course_room"

    const val KEY_PENDING_TASKS = "pending_tasks"

    fun getPrefs(context: Context) =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun getStreakDays(context: Context): Int =
        getPrefs(context).getInt(KEY_STREAK_DAYS, 5)

    fun getStreakTitle(context: Context): String =
        getPrefs(context).getString(KEY_STREAK_TITLE, "Série en jeu ! 🔥") ?: "Série en jeu ! 🔥"

    fun getStreakSubtitle(context: Context): String {
        val days = getStreakDays(context)
        return getPrefs(context).getString(
            KEY_STREAK_SUBTITLE,
            "Uni veille sur toi : $days jours consécutifs ! Valide ta quête du jour."
        ) ?: "Uni veille sur toi : $days jours consécutifs ! Valide ta quête du jour."
    }

    fun getNextCourseTitle(context: Context): String =
        getPrefs(context).getString(KEY_NEXT_COURSE_TITLE, "Algorithmique & Graphes")
            ?: "Algorithmique & Graphes"

    fun getNextCourseTime(context: Context): String =
        getPrefs(context).getString(KEY_NEXT_COURSE_TIME, "⏰ 10:00")
            ?: "⏰ 10:00"

    fun getNextCourseRoom(context: Context): String =
        getPrefs(context).getString(KEY_NEXT_COURSE_ROOM, "📍 Amphi 250 · Dr. Mballa")
            ?: "📍 Amphi 250 · Dr. Mballa"

    fun getPendingTasks(context: Context): Int =
        getPrefs(context).getInt(KEY_PENDING_TASKS, 2)

    /**
     * Choisit dynamiquement l'image de la mascotte Uni en fonction de l'heure
     * de la journée ou du statut académique (Style Duolingo)
     */
    fun getDynamicMascotRes(): Int {
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        return when {
            hour >= 21 || hour < 6 -> R.drawable.uni_duo_night_rest
            hour in 6..9 -> R.drawable.uni_duo_class_rush
            hour in 10..15 -> R.drawable.uni_duo_streak_fire
            hour in 16..18 -> R.drawable.uni_duo_assignment
            else -> R.drawable.uni_duo_celebrate_streak
        }
    }

    fun getDynamicSpeechBubble(): String {
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        return when {
            hour >= 21 || hour < 6 -> "Bonne nuit, repose-toi bien ! 🌙"
            hour in 6..9 -> "Vite, le cours va débuter ! ⏰"
            hour in 10..13 -> "Concentration maximale ! 🔥"
            hour in 14..18 -> "N'oublie pas tes devoirs ! 📝"
            else -> "Super journée d'études ! ✨"
        }
    }

    fun createPendingIntent(context: Context, route: String, requestCode: Int): PendingIntent {
        val intent = Intent(context, MainActivity::class.java).apply {
            action = Intent.ACTION_VIEW
            data = Uri.parse("uniflow:///$route")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        return PendingIntent.getActivity(context, requestCode, intent, flags)
    }
}
