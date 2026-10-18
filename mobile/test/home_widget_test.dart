import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:uniflow_mobile/services/home_widget_service.dart';
import 'package:uniflow_mobile/widgets/home_widget_dialog.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('HomeWidgetService (Android Duolingo-style Widgets)', () {
    test('updateWidgetData s\'exécute sans exception même hors Android réel', () async {
      final result = await HomeWidgetService.updateWidgetData(
        streakDays: 7,
        streakTitle: 'Série en jeu ! 🔥',
        streakSubtitle: 'Ne brise pas ta série aujourd\'hui !',
        nextCourseTitle: 'Algorithmique & Graphes',
        nextCourseTime: '⏰ 10:00',
        nextCourseRoom: '📍 Amphi 250',
        pendingTasks: 3,
      );
      // En test Flutter, MissingPluginException est géré silencieusement et rend false
      expect(result, isFalse);
    });

    test('pinWidget s\'exécute sans exception', () async {
      final result = await HomeWidgetService.pinWidget(widgetType: 'streak');
      expect(result, isFalse);
    });

    testWidgets('HomeWidgetSheet affiche les 3 widgets et les boutons d\'ajout', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: HomeWidgetSheet(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Widgets Écran d\'Accueil'), findsOneWidget);
      expect(find.text('Style Duolingo · Sans ouvrir l\'application'), findsOneWidget);

      // Carte 1 : Streak
      expect(find.text('Série & Quêtes du Jour'), findsOneWidget);
      expect(find.text('Mascotte Flamme'), findsOneWidget);

      // Carte 2 : Prochain Cours
      expect(find.text('Prochain Cours & Amphi'), findsOneWidget);
      expect(find.text('Horaires & Salle'), findsOneWidget);

      // Carte 3 : Mascotte Compacte
      expect(find.text('Mascotte Duo Compacte'), findsOneWidget);
      expect(find.text('Format 2×2'), findsOneWidget);

      // 3 Boutons "Ajouter"
      expect(find.text('Ajouter'), findsNWidgets(3));

      // Cliquer sur le bouton Ajouter de la première carte
      await tester.tap(find.text('Ajouter').first);
      await tester.pump();
    });
  });
}
