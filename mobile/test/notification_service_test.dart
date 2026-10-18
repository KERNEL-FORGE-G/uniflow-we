import 'package:flutter_test/flutter_test.dart';
import 'package:uniflow_mobile/services/notification_service.dart';

void main() {
  setUp(() {
    LocalNotifications.testDispatched.clear();
  });

  group('LocalNotifications & Push Service', () {
    test('showUrgent enregistre la notification urgente avec le bon format', () async {
      await LocalNotifications.showUrgent(
        title: 'Message critique',
        body: 'Le cours de 14h est déplacé en Amphi 200.',
        payload: '/messages/c123',
      );

      expect(LocalNotifications.testDispatched, hasLength(1));
      final notif = LocalNotifications.testDispatched.first;
      expect(notif['type'], 'urgent');
      expect(notif['title'], 'Message critique');
      expect(notif['body'], 'Le cours de 14h est déplacé en Amphi 200.');
      expect(notif['payload'], '/messages/c123');
    });

    test('showReminder enregistre le rappel avec le bon canal', () async {
      await LocalNotifications.showReminder(
        title: '🔥 Streak en danger !',
        body: 'Valide ton assiduité aujourd\'hui.',
        payload: '/quetes',
      );

      expect(LocalNotifications.testDispatched, hasLength(1));
      final notif = LocalNotifications.testDispatched.first;
      expect(notif['type'], 'reminder');
      expect(notif['title'], '🔥 Streak en danger !');
      expect(notif['payload'], '/quetes');
    });

    test('triggerTestReminder déclenche bien chaque type de rappel Duolingo', () async {
      final types = ['streak', 'upcomingClass', 'assignment', 'attendance', 'nightRest', 'celebrate'];

      for (final t in types) {
        LocalNotifications.testDispatched.clear();
        await LocalNotifications.triggerTestReminder(reminderType: t);

        expect(LocalNotifications.testDispatched, hasLength(1), reason: 'Échec pour le type $t');
        final notif = LocalNotifications.testDispatched.first;
        expect(notif['type'], 'reminder');
        expect(notif['title'], isNotEmpty);
        expect(notif['body'], isNotEmpty);
        expect(notif['payload'], isNotEmpty);
      }
    });

    test('isUrgentNotificationFor filtre correctement les événements temps réel', () {
      const userId = 'usr_student_42';

      // Bon événement : création de MESSAGE_URGENT pour l'utilisateur
      final valid = isUrgentNotificationFor(
        ['databases.default.collections.notifications.documents.create'],
        {'ownerId': userId, 'type': 'MESSAGE_URGENT', 'title': 'Alerte'},
        userId,
      );
      expect(valid, isTrue);

      // Mauvais type : message ordinaire
      final nonUrgent = isUrgentNotificationFor(
        ['databases.default.collections.notifications.documents.create'],
        {'ownerId': userId, 'type': 'MESSAGE_NORMAL', 'title': 'Coucou'},
        userId,
      );
      expect(nonUrgent, isFalse);

      // Mauvais propriétaire
      final otherUser = isUrgentNotificationFor(
        ['databases.default.collections.notifications.documents.create'],
        {'ownerId': 'usr_other', 'type': 'MESSAGE_URGENT'},
        userId,
      );
      expect(otherUser, isFalse);

      // Événement de mise à jour (pas de création)
      final updateEvent = isUrgentNotificationFor(
        ['databases.default.collections.notifications.documents.update'],
        {'ownerId': userId, 'type': 'MESSAGE_URGENT'},
        userId,
      );
      expect(updateEvent, isFalse);
    });
  });
}
