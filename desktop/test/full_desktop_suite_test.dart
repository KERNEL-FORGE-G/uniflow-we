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
import 'package:uniflow_desktop/screens/visio_screen.dart';
import 'package:uniflow_desktop/screens/enrollments_screen.dart';
import 'package:uniflow_desktop/screens/classrooms_screen.dart';
import 'package:uniflow_desktop/screens/help_screen.dart';
import 'package:uniflow_desktop/screens/courses_screen.dart';
import 'package:uniflow_desktop/screens/schedule_screen.dart';
import 'package:uniflow_desktop/screens/desktop_shell.dart';

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

    // Enter login credentials
    await tester.enterText(find.byType(TextField).first, 'etudiant.test@uniflow.cm');
    await tester.enterText(find.byType(TextField).at(1), 'Secret123!');
    final submitBtn = find.text('Connexion sécurisée');
    expect(submitBtn, findsOneWidget);
    await tester.tap(submitBtn);
    await tester.pumpAndSettle();

    expect(loggedEmail, equals('etudiant.test@uniflow.cm'));
    expect(loggedRole, equals('Étudiant'));
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
    expect(find.textContaining('Ravel Nghomsi'), findsWidgets);

    // 7. NotificationsScreen
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: NotificationsScreen())));
    await tester.pumpAndSettle();
    expect(find.textContaining('Centre de Notifications Académiques'), findsWidgets);
    expect(find.textContaining('Notes du Contrôle Continu'), findsWidgets);
  });

  testWidgets('VisioScreen renders properly (Console Amphi & Service Embarqué 100% Autonome)',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: VisioScreen())));
    await tester.pumpAndSettle();
    expect(find.textContaining('Amphi Virtuel & Visio Campus HD'), findsWidgets);
    expect(find.text('Console Amphi en Direct'), findsWidgets);
    expect(find.text('Accès Invités & QR Code'), findsWidgets);
    expect(find.text('Zéro Dépendance & Moteur'), findsWidgets);
    expect(find.text('EN DIRECT'), findsWidgets);

    // Switch to Guest / QR Code tab
    final qrTab = find.text('Accès Invités & QR Code');
    expect(qrTab, findsWidgets);
    await tester.tap(qrTab.first);
    await tester.pumpAndSettle();
    expect(find.text('Scanner pour rejoindre'), findsWidgets);

    // Switch to Zero Dependency Architecture tab
    final zeroDepTab = find.text('Zéro Dépendance & Moteur');
    expect(zeroDepTab, findsWidgets);
    await tester.tap(zeroDepTab.first);
    await tester.pumpAndSettle();
    expect(find.textContaining('Architecture Visioconférence Autonome'), findsWidgets);
  });

  testWidgets('EnrollmentsScreen renders administrative records and requests modal',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: EnrollmentsScreen())));
    await tester.pumpAndSettle();

    expect(find.textContaining('Inscriptions, Dossier & Cycle LMD'), findsWidgets);
    expect(find.textContaining('154 / 180 ECTS'), findsWidgets);
    expect(find.textContaining('21T2894'), findsWidgets);

    // Switch to payments tab
    final paymentsTab = find.text('Quittances & Frais');
    await tester.tap(paymentsTab.first);
    await tester.pumpAndSettle();
    expect(find.textContaining('Quittances de Frais Académiques'), findsWidgets);
    expect(find.textContaining('50 000'), findsWidgets);

    // Switch to requests tab and open administrative request modal
    final requestsTab = find.text('Demandes Administratives');
    await tester.tap(requestsTab.first);
    await tester.pumpAndSettle();
    final reqBtn = find.text('Nouvelle demande');
    expect(reqBtn, findsWidgets);
    await tester.tap(reqBtn.first);
    await tester.pumpAndSettle();
    expect(find.text('Nouvelle Demande Administrative'), findsWidgets);
    expect(find.text('Annuler'), findsWidgets);
    await tester.tap(find.text('Annuler').first);
    await tester.pumpAndSettle();
  });

  testWidgets('ClassroomsScreen renders amphitheaters occupancy and reservation modal',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: ClassroomsScreen())));
    await tester.pumpAndSettle();

    expect(find.textContaining('Salles, Amphithéâtres & Laboratoires'), findsWidgets);
    expect(find.textContaining('Amphithéâtre 1001'), findsWidgets);
    expect(find.textContaining('Amphithéâtre 501'), findsWidgets);
    expect(find.textContaining('Laboratoire C205'), findsWidgets);

    // Open reservation dialog
    final reserveBtn = find.text('Réserver');
    await tester.ensureVisible(reserveBtn.first);
    expect(reserveBtn, findsWidgets);
    await tester.tap(reserveBtn.first);
    await tester.pumpAndSettle();
    expect(find.textContaining('Réserver la salle'), findsWidgets);
    expect(find.text('Annuler'), findsWidgets);
    await tester.tap(find.text('Annuler').first);
    await tester.pumpAndSettle();
  });

  testWidgets('HelpScreen renders shortcuts table, FAQ, diagnostic tool, and support modal',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: HelpScreen())));
    await tester.pumpAndSettle();

    expect(find.textContaining("Centre d'Aide, Raccourcis & Guides"), findsWidgets);
    expect(find.text('Raccourcis Clavier'), findsWidgets);
    expect(find.text('Foire Aux Questions (FAQ)'), findsWidgets);
    expect(find.text('Diagnostic & Synchronisation P2P'), findsWidgets);
    expect(find.text('Ticket Support KERNEL FORGE'), findsWidgets);

    // Check keyboard shortcuts
    expect(find.text('Ctrl + 0'), findsWidgets);
    expect(find.text('F11'), findsWidgets);

    // Switch to FAQ
    await tester.tap(find.text('Foire Aux Questions (FAQ)').first);
    await tester.pumpAndSettle();
    expect(find.textContaining('hors connexion Internet'), findsWidgets);

    // Switch to Support view and open modal
    final supportTab = find.text('Ticket Support KERNEL FORGE');
    await tester.ensureVisible(supportTab.first);
    await tester.tap(supportTab.first);
    await tester.pumpAndSettle();
    expect(find.text('Nouveau Ticket'), findsWidgets);
    await tester.tap(find.text('Nouveau Ticket').first);
    await tester.pumpAndSettle();
    expect(find.textContaining('Ouvrir un Ticket'), findsWidgets);
    expect(find.text('Annuler'), findsWidgets);
    await tester.tap(find.text('Annuler').first);
    await tester.pumpAndSettle();
  });

  testWidgets('CoursesScreen and ScheduleScreen render Bento layout with interactive modals',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    // Test CoursesScreen
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: CoursesScreen())));
    await tester.pumpAndSettle();
    expect(find.text("Mes Cours & Unités d'Enseignement"), findsWidgets);
    expect(find.textContaining('Génie Logiciel Avancé'), findsWidgets);

    // Tap first course card to open details modal
    await tester.tap(find.textContaining('Génie Logiciel Avancé').first);
    await tester.pumpAndSettle();
    expect(find.text('Fermer'), findsWidgets);
    await tester.tap(find.text('Fermer').first);
    await tester.pumpAndSettle();

    // Test ScheduleScreen
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: ScheduleScreen())));
    await tester.pumpAndSettle();
    expect(find.textContaining('Emploi du Temps Universitaire UY1'), findsWidgets);
    expect(find.textContaining('Sécurité Informatique'), findsWidgets);
  });

  testWidgets('DesktopShell renders all navigation items and switches screens correctly',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(const MaterialApp(home: DesktopShell()));
    await tester.pumpAndSettle();

    // Verify main dashboard renders
    expect(find.text('UniFlow'), findsWidgets);
    expect(find.text('Plateforme Universitaire Connectée'), findsWidgets);
    expect(find.text('Tableau de Bord'), findsWidgets);

    // Navigate to Inscriptions & Dossier LMD
    final enrollmentsNav = find.text('Inscriptions & Dossier LMD');
    expect(enrollmentsNav, findsWidgets);
    await tester.ensureVisible(enrollmentsNav.first);
    await tester.tap(enrollmentsNav.first);
    await tester.pumpAndSettle();
    expect(find.textContaining('Inscriptions, Dossier & Cycle LMD'), findsWidgets);

    // Navigate to Salles & Amphis Campus
    final classroomsNav = find.text('Salles & Amphis Campus');
    expect(classroomsNav, findsWidgets);
    await tester.ensureVisible(classroomsNav.first);
    await tester.tap(classroomsNav.first);
    await tester.pumpAndSettle();
    expect(find.textContaining('Salles, Amphithéâtres & Laboratoires'), findsWidgets);

    // Navigate to Centre d'Aide & FAQ
    final helpNav = find.text('Centre d\'Aide & FAQ');
    expect(helpNav, findsWidgets);
    await tester.ensureVisible(helpNav.first);
    await tester.tap(helpNav.first);
    await tester.pumpAndSettle();
    expect(find.textContaining("Centre d'Aide, Raccourcis & Guides"), findsWidgets);
  });
}

