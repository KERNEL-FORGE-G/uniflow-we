import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

/// Service permettant de synchroniser les données de l'application avec les
/// widgets de l'écran d'accueil Android (Style Duolingo) et de proposer
/// l'épinglage direct sur l'écran d'accueil sans même ouvrir l'application.
class HomeWidgetService {
  static const MethodChannel _channel = MethodChannel('com.uniflow/widget');

  /// Met à jour les données affichées sur les widgets de l'écran d'accueil.
  /// En cas de plateforme non-Android ou environnement de test, l'appel
  /// est ignoré silencieusement.
  static Future<bool> updateWidgetData({
    int? streakDays,
    String? streakTitle,
    String? streakSubtitle,
    String? nextCourseTitle,
    String? nextCourseTime,
    String? nextCourseRoom,
    int? pendingTasks,
  }) async {
    if (kIsWeb) return false;
    try {
      final success = await _channel.invokeMethod<bool>('updateWidgetData', {
        if (streakDays != null) 'streakDays': streakDays,
        if (streakTitle != null) 'streakTitle': streakTitle,
        if (streakSubtitle != null) 'streakSubtitle': streakSubtitle,
        if (nextCourseTitle != null) 'nextCourseTitle': nextCourseTitle,
        if (nextCourseTime != null) 'nextCourseTime': nextCourseTime,
        if (nextCourseRoom != null) 'nextCourseRoom': nextCourseRoom,
        if (pendingTasks != null) 'pendingTasks': pendingTasks,
      });
      return success ?? false;
    } catch (e) {
      debugPrint('[HomeWidgetService] updateWidgetData non supporté ou ignoré: $e');
      return false;
    }
  }

  /// Propose à l'utilisateur d'épingler le widget directement sur l'écran d'accueil Android (Android 8.0+).
  /// Types disponibles : 'streak', 'schedule', 'compact'
  static Future<bool> pinWidget({String widgetType = 'streak'}) async {
    if (kIsWeb) return false;
    try {
      final success = await _channel.invokeMethod<bool>('pinWidget', {
        'widgetType': widgetType,
      });
      return success ?? false;
    } catch (e) {
      debugPrint('[HomeWidgetService] pinWidget non supporté: $e');
      return false;
    }
  }

  /// Indique si l'épinglage programmatique de widget est supporté sur cet appareil.
  static Future<bool> isPinningSupported() async {
    if (kIsWeb) return false;
    try {
      final supported = await _channel.invokeMethod<bool>('isPinningSupported');
      return supported ?? false;
    } catch (e) {
      return false;
    }
  }
}
