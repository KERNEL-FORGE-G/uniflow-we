import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:uniflow_mobile/services/notification_service.dart';
import 'package:uniflow_mobile/widgets/uni_reminder_widget.dart';

void main() {
  setUp(() {
    LocalNotifications.testDispatched.clear();
  });

  Widget buildTestWidget({UniReminderType? initialType, VoidCallback? onCustomAction}) {
    return MaterialApp(
      home: Scaffold(
        body: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: UniReminderWidget(
              initialType: initialType,
              onCustomAction: onCustomAction,
            ),
          ),
        ),
      ),
    );
  }

  group('UniReminderWidget (Duolingo Style)', () {
    testWidgets('affiche l\'état streak avec son titre et son bouton CTA', (tester) async {
      await tester.pumpWidget(buildTestWidget(initialType: UniReminderType.streak));
      await tester.pumpAndSettle();

      expect(find.text('Streak en danger !'), findsOneWidget);
      expect(find.text('🔥 14 jours de streak'), findsOneWidget);
      expect(find.text('Protéger mon streak'), findsOneWidget);
      expect(find.byType(Image), findsWidgets);
    });

    testWidgets('affiche l\'état upcomingClass avec le cours imminent', (tester) async {
      await tester.pumpWidget(buildTestWidget(initialType: UniReminderType.upcomingClass));
      await tester.pumpAndSettle();

      expect(find.text('Cours imminent !'), findsOneWidget);
      expect(find.text('⏰ Dans 20 min · Amphi 501'), findsOneWidget);
      expect(find.text('Voir mon amphi'), findsOneWidget);
    });

    testWidgets('affiche l\'état assignment avec le devoir à rendre', (tester) async {
      await tester.pumpWidget(buildTestWidget(initialType: UniReminderType.assignment));
      await tester.pumpAndSettle();

      expect(find.text('Devoir à rendre !'), findsOneWidget);
      expect(find.text('📝 Échéance ce soir 23h59'), findsOneWidget);
      expect(find.text('Déposer le devoir'), findsOneWidget);
    });

    testWidgets('affiche l\'état attendance avec le QR code', (tester) async {
      await tester.pumpWidget(buildTestWidget(initialType: UniReminderType.attendance));
      await tester.pumpAndSettle();

      expect(find.text('Émargement ouvert'), findsOneWidget);
      expect(find.text('🛡️ QR Code actif en cours'), findsOneWidget);
      expect(find.text('Scanner ma présence'), findsOneWidget);
    });

    testWidgets('affiche l\'état nightRest avec le repos mérité', (tester) async {
      await tester.pumpWidget(buildTestWidget(initialType: UniReminderType.nightRest));
      await tester.pumpAndSettle();

      expect(find.text('Repos mérité'), findsOneWidget);
      expect(find.text('🌙 Mode repos · Nuit'), findsOneWidget);
      expect(find.text('Programme de demain'), findsOneWidget);
    });

    testWidgets('affiche l\'état celebrate avec la félicitation', (tester) async {
      await tester.pumpWidget(buildTestWidget(initialType: UniReminderType.celebrate));
      await tester.pumpAndSettle();

      expect(find.text('Journée 100% validée !'), findsOneWidget);
      expect(find.text('🎉 Toutes quêtes validées'), findsOneWidget);
      expect(find.text('Voir mes trophées'), findsOneWidget);
    });

    testWidgets('taper la mascotte Uni affiche une bulle de dialogue Duolingo', (tester) async {
      await tester.pumpWidget(buildTestWidget(initialType: UniReminderType.streak));
      await tester.pumpAndSettle();

      // Pas de bulle au départ
      expect(find.text(UniReminderType.streak.bubbleQuotes.first), findsNothing);

      // Taper sur la mascotte
      final mascotGestureFinder = find.byKey(const Key('uni_mascot_avatar'));
      await tester.tap(mascotGestureFinder);
      await tester.pumpAndSettle();

      // La bulle apparaît
      expect(find.text(UniReminderType.streak.bubbleQuotes.first), findsOneWidget);
    });

    testWidgets('le bouton de cycle change l\'état du widget', (tester) async {
      await tester.pumpWidget(buildTestWidget(initialType: UniReminderType.streak));
      await tester.pumpAndSettle();

      expect(find.text('Streak en danger !'), findsOneWidget);

      // Taper sur le bouton de cycle
      final cycleButton = find.byKey(const Key('uni_reminder_cycle_btn'));
      expect(cycleButton, findsOneWidget);
      await tester.tap(cycleButton);
      await tester.pumpAndSettle();

      // Doit avoir changé d'état (upcomingClass)
      expect(find.text('Cours imminent !'), findsOneWidget);
    });

    testWidgets('le bouton Test Push ouvre le sheet et déclenche une notification réelle', (tester) async {
      await tester.pumpWidget(buildTestWidget(initialType: UniReminderType.streak));
      await tester.pumpAndSettle();

      // Taper sur "Test Push"
      final testPushButton = find.byKey(const Key('uni_reminder_test_push_btn'));
      expect(testPushButton, findsOneWidget);
      await tester.tap(testPushButton);
      await tester.pumpAndSettle();

      // Le modal bottom sheet s'ouvre
      expect(find.text('Tester une notification push / rappel'), findsOneWidget);
      expect(find.text('Déclencher'), findsWidgets);

      // Cliquer sur le premier "Déclencher"
      await tester.tap(find.text('Déclencher').first);
      await tester.pumpAndSettle();

      // La notification a été enregistrée dans testDispatched
      expect(LocalNotifications.testDispatched, isNotEmpty);
      expect(LocalNotifications.testDispatched.first['type'], 'reminder');
    });

    testWidgets('le bouton CTA principal appelle l\'action personnalisée', (tester) async {
      var called = false;
      await tester.pumpWidget(buildTestWidget(
        initialType: UniReminderType.streak,
        onCustomAction: () => called = true,
      ));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Protéger mon streak'));
      await tester.pumpAndSettle();

      expect(called, isTrue);
    });
  });
}
