import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:uniflow_desktop/screens/onboarding_screen.dart';
import 'package:uniflow_desktop/screens/auth_screen.dart';
import 'package:uniflow_desktop/screens/assignments_screen.dart';
import 'package:uniflow_desktop/screens/grades_screen.dart';
import 'package:uniflow_desktop/screens/attendance_screen.dart';
import 'package:uniflow_desktop/screens/settings_screen.dart';
import 'package:uniflow_desktop/screens/creator_member_screen.dart';
import 'package:uniflow_desktop/screens/messages_screen.dart';
import 'package:uniflow_desktop/screens/sentinelle_screen.dart';
import 'package:uniflow_desktop/screens/quests_screen.dart';
import 'package:uniflow_desktop/screens/subscription_screen.dart';
import 'package:uniflow_desktop/screens/directory_screen.dart';
import 'package:uniflow_desktop/screens/notifications_screen.dart';

void main() {
  setUp(() {
    TestWidgetsFlutterBinding.ensureInitialized();
  });

  testWidgets('OnboardingScreen displays 4 slides and finishes correctly',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    bool finished = false;
    await tester.pumpWidget(MaterialApp(
      home: OnboardingScreen(onFinish: () => finished = true),
    ));

    expect(find.text('Campus Universitaire Connecté'), findsWidgets);
    expect(find.textContaining('Passer l’introduction'), findsWidgets);

    // Tap "Suivant"
    await tester.tap(find.text('Suivant').first);
    await tester.pumpAndSettle();
    expect(find.text('Bibliothèque Numérique Z-Library VPS'), findsWidgets);

    // Tap "Passer l’introduction"
    await tester.tap(find.textContaining('Passer l’introduction').first);
    await tester.pumpAndSettle();
    expect(finished, isTrue);
  });

  testWidgets('AuthScreen allows switching modes and 1-click test profiles',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    String? loggedEmail;
    String? loggedRole;
    String? loggedName;

    await tester.pumpWidget(MaterialApp(
      home: AuthScreen(
        onLoginSuccess: (email, role, name) {
          loggedEmail = email;
          loggedRole = role;
          loggedName = name;
        },
        onBackToOnboarding: () {},
      ),
    ));

    expect(find.textContaining('Bon retour parmi nous'), findsWidgets);

    // Click demo profile "Fondateur"
    final founderDemoBtn = find.text('Fondateur');
    expect(founderDemoBtn, findsWidgets);
    await tester.tap(founderDemoBtn.first);
    await tester.pumpAndSettle();

    expect(loggedEmail, equals('ravel.founder@uniflow.cm'));
    expect(loggedRole, equals('Membre Fondateur KERNEL FORGE'));
    expect(loggedName, equals('Ravel'));
  });

  testWidgets('Academic screens render properly (Assignments, Grades, Attendance)',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    // Test Assignments
    await tester.pumpWidget(const MaterialApp(home: AssignmentsScreen()));
    expect(find.text('Devoirs & Projets Académiques'), findsWidgets);
    expect(find.textContaining('LLVM'), findsWidgets);

    // Test Grades
    await tester.pumpWidget(const MaterialApp(home: GradesScreen()));
    expect(find.text('Notes & Évaluations Semestrielles'), findsWidgets);
    expect(find.text('Moyenne Générale'), findsWidgets);

    // Test Attendance
    await tester.pumpWidget(const MaterialApp(home: AttendanceScreen()));
    expect(find.textContaining('Émargement & Assiduité'), findsWidgets);
    expect(find.textContaining('Régénérer le jeton QR'), findsWidgets);
  });

  testWidgets('SettingsScreen allows switching between Standard and Founder views',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    bool loggedOut = false;
    String? updatedRole;

    await tester.pumpWidget(MaterialApp(
      home: SettingsScreen(
        userName: 'Marcel Tessoh',
        userEmail: 'founder@kernelforge.codes',
        userRole: 'Membre Fondateur KERNEL FORGE',
        onLogout: () => loggedOut = true,
        onRoleChanged: (role) => updatedRole = role,
      ),
    ));

    expect(find.textContaining('Paramètres & Profil'), findsWidgets);
    expect(find.text('Vue Membre Créateur'), findsWidgets);
    expect(find.textContaining('Tâches Assignées'), findsWidgets);

    // Toggle to Student standard view
    final standardViewBtn = find.text('Vue Étudiant Standard');
    expect(standardViewBtn, findsWidgets);
    await tester.tap(standardViewBtn.first);
    await tester.pumpAndSettle();

    expect(updatedRole, equals('Étudiant'));

    // Toggle back to Founder view
    final founderViewBtn = find.text('Vue Membre Créateur');
    await tester.tap(founderViewBtn.first);
    await tester.pumpAndSettle();
    expect(updatedRole, equals('Membre Fondateur KERNEL FORGE'));

    // Logout button
    final logoutBtn = find.text('Se déconnecter');
    expect(logoutBtn, findsWidgets);
    await tester.tap(logoutBtn.first);
    await tester.pumpAndSettle();
    expect(loggedOut, isTrue);
  });

  testWidgets('New Parity Screens render properly (CreatorMember, Messages, Sentinelle, Quests, Subscription, Directory, Notifications)',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    // 1. CreatorMemberScreen
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: CreatorMemberScreen())));
    await tester.pumpAndSettle();
    expect(find.textContaining('Espace Développeur & Membre Créateur'), findsWidgets);
    expect(find.text('Interface Membre Créateur'), findsWidgets);
    expect(find.text('Interface Utilisateur Standard'), findsWidgets);
    expect(find.textContaining('Mes Tâches & Jalons Membre'), findsWidgets);

    // 2. MessagesScreen
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: MessagesScreen())));
    await tester.pumpAndSettle();
    expect(find.textContaining('Messagerie Instantanée P2P'), findsWidgets);
    expect(find.textContaining('Génie Logiciel (INF4067)'), findsWidgets);

    // 3. SentinelleScreen
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: SentinelleScreen())));
    await tester.pumpAndSettle();
    expect(find.textContaining('Supervision Campus, Caméras CCTV'), findsWidgets);
    expect(find.textContaining('FLUX CCTV EN DIRECT'), findsWidgets);

    // 4. QuestsScreen
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: QuestsScreen())));
    await tester.pumpAndSettle();
    expect(find.textContaining('Quêtes, Badges d’Honneur & Classement Campus'), findsWidgets);
    expect(find.textContaining('Assiduité d’Or'), findsWidgets);

    // 5. SubscriptionScreen
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: SubscriptionScreen())));
    await tester.pumpAndSettle();
    expect(find.textContaining('Abonnements Pro, Paiements MoMo & Bourses'), findsWidgets);
    expect(find.text('UniFlow Pro Campus'), findsWidgets);

    // 6. DirectoryScreen
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: DirectoryScreen())));
    await tester.pumpAndSettle();
    expect(find.textContaining('Annuaire des Étudiants & Corps Enseignant UY1'), findsWidgets);
    expect(find.textContaining('Marcel Tessoh'), findsWidgets);

    // 7. NotificationsScreen
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: NotificationsScreen())));
    await tester.pumpAndSettle();
    expect(find.textContaining('Centre de Notifications Académiques'), findsWidgets);
    expect(find.textContaining('Notes du Contrôle Continu'), findsWidgets);
  });
}
