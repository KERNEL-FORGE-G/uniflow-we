import 'package:flutter/material.dart';
import '../services/local_visio_server.dart';
import 'dashboard_screen.dart';
import 'actualites_screen.dart';
import 'unimail_screen.dart';
import 'schedule_screen.dart';
import 'visio_screen.dart';
import 'courses_screen.dart';
import 'assignments_screen.dart';
import 'grades_screen.dart';
import 'attendance_screen.dart';
import 'zlibrary_screen.dart';
import 'assistant_screen.dart';
import 'settings_screen.dart';
import 'messages_screen.dart';
import 'sentinelle_screen.dart';
import 'quests_screen.dart';
import 'directory_screen.dart';
import 'subscription_screen.dart';
import 'package:flutter/services.dart';
import 'notifications_screen.dart';
import 'creator_member_screen.dart';
import 'enrollments_screen.dart';
import 'classrooms_screen.dart';
import 'help_screen.dart';

class DesktopShell extends StatefulWidget {
  final String userName;
  final String userEmail;
  final String userRole;
  final VoidCallback? onLogout;
  final VoidCallback? onShowOnboarding;

  const DesktopShell({
    super.key,
    this.userName = '',
    this.userEmail = '',
    this.userRole = 'Étudiant',
    this.onLogout,
    this.onShowOnboarding,
  });

  @override
  State<DesktopShell> createState() => _DesktopShellState();
}

class _DesktopShellState extends State<DesktopShell> {
  int _selectedIndex = 0;
  final LocalVisioServer _server = LocalVisioServer.instance;
  late String _currentUserName;
  late String _currentUserEmail;
  late String _currentUserRole;

  @override
  void initState() {
    super.initState();
    _currentUserName = widget.userName;
    _currentUserEmail = widget.userEmail;
    _currentUserRole = widget.userRole;
    // Démarrage automatique du serveur de visio local dès le lancement du desktop
    _server.startServer();
  }

  void _onNavigate(int index) {
    setState(() => _selectedIndex = index);
  }

  bool _isCreatorMember(String email, String role) {
    final e = email.toLowerCase();
    final r = role.toLowerCase();
    return e.contains('ravel') ||
        e.contains('founder') ||
        e.contains('kernelforge') ||
        e.contains('marcel') ||
        e.contains('admin') ||
        e.contains('sandra') ||
        e.contains('hassane') ||
        r.contains('fondateur') ||
        r.contains('kernel forge') ||
        r.contains('membre');
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      DashboardScreen(
        onNavigate: _onNavigate,
        userName: _currentUserName,
        userEmail: _currentUserEmail,
      ),
      const ActualitesScreen(),
      UniMailScreen(
        userName: _currentUserName,
        userEmail: _currentUserEmail,
      ),
      const ScheduleScreen(),
      VisioScreen(userName: _currentUserName),
      const CoursesScreen(),
      const AssignmentsScreen(),
      const GradesScreen(),
      AttendanceScreen(
        userName: _currentUserName,
        userEmail: _currentUserEmail,
      ),
      const ZLibraryScreen(),
      const AssistantScreen(),
      SettingsScreen(
        userName: _currentUserName,
        userEmail: _currentUserEmail,
        userRole: _currentUserRole,
        onLogout: widget.onLogout ?? () {},
        onRoleChanged: (newRole) {
          setState(() => _currentUserRole = newRole);
        },
      ),
      MessagesScreen(userName: _currentUserName),
      SentinelleScreen(userName: _currentUserName),
      QuestsScreen(userName: _currentUserName),
      DirectoryScreen(
        userName: _currentUserName,
        userEmail: _currentUserEmail,
      ),
      const SubscriptionScreen(),
      NotificationsScreen(onNavigate: _onNavigate),
      CreatorMemberScreen(
        userName: _currentUserName,
        userEmail: _currentUserEmail,
        userRole: _currentUserRole,
        onRoleChanged: (newRole) {
          setState(() => _currentUserRole = newRole);
        },
      ),
      EnrollmentsScreen(
        userName: _currentUserName,
        userEmail: _currentUserEmail,
      ),
      ClassroomsScreen(
        userName: _currentUserName,
        userEmail: _currentUserEmail,
      ),
      HelpScreen(onNavigate: _onNavigate),
    ];

    final scaffold = Scaffold(
      body: Row(
        children: [
          // =================================================================
          // SIDEBAR DESKTOP PINTEREST BENTO + ICÔNES 3D
          // =================================================================
          Container(
            width: 288,
            decoration: const BoxDecoration(
              color: Color(0xFF0F172A), // Slate 900
              border: Border(
                right: BorderSide(color: Color(0xFF1E293B)),
              ),
            ),
            child: Column(
              children: [
                // Logo & Header
                Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 22),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.asset(
                          'assets/brand/uniflow_logo_final.png',
                          width: 42,
                          height: 42,
                          fit: BoxFit.contain,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'UniFlow',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 18,
                                  letterSpacing: -0.5),
                            ),
                            Text(
                              'Plateforme Universitaire Connectée',
                              style: TextStyle(
                                  color: Color(0xFF67E8F9),
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.bold),
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              'Résilience & Synchronisation Hors-Ligne',
                              style: TextStyle(
                                  color: Color(0xFF94A3B8),
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.w600),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const Divider(color: Color(0xFF1E293B), height: 1),

                // Éléments de Navigation avec Icônes 3D
                const SizedBox(height: 12),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    children: [
                      // --- SECTION 1 : PRINCIPAL & COLLABORATION ---
                      _buildSectionHeader('PRINCIPAL & COLLABORATION'),
                      _buildNavItem(
                        0,
                        'Tableau de Bord',
                        'assets/icons/nav/dashboard.png',
                        Icons.dashboard_rounded,
                      ),
                      if (_isCreatorMember(_currentUserEmail, _currentUserRole))
                        _buildNavItem(
                          18,
                          'Espace Membre KERNEL FORGE',
                          'assets/icons/nav/coordination.png',
                          Icons.developer_mode_rounded,
                          badgeText: 'Créateur',
                          badgeColor: const Color(0xFF0D9488),
                        ),
                      _buildNavItem(
                        1,
                        'Actualités Campus',
                        'assets/icons/nav/analytics.png',
                        Icons.campaign_rounded,
                        badgeText: 'Bêta',
                        badgeColor: const Color(0xFF38BDF8),
                      ),
                      _buildNavItem(
                        2,
                        'UniMail (@uniflow.cm)',
                        'assets/icons/nav/messages.png',
                        Icons.mark_email_unread_rounded,
                        badgeText: 'Signé',
                        badgeColor: const Color(0xFF10B981),
                      ),
                      _buildNavItem(
                        12,
                        'Messagerie & Canaux P2P',
                        'assets/icons/nav/messages.png',
                        Icons.chat_bubble_rounded,
                        badgeText: 'Direct',
                        badgeColor: const Color(0xFF38BDF8),
                      ),
                      _buildNavItem(
                        17,
                        'Centre de Notifications',
                        'assets/icons/nav/notifications.png',
                        Icons.notifications_rounded,
                        badgeText: '3',
                        badgeColor: const Color(0xFFF59E0B),
                      ),

                      // --- SECTION 2 : ACADÉMIQUE LMD ---
                      _buildSectionHeader('ACADÉMIQUE LMD'),
                      _buildNavItem(
                        3,
                        'Emploi du Temps',
                        'assets/icons/nav/schedule.png',
                        Icons.calendar_month_rounded,
                      ),
                      _buildNavItem(
                        19,
                        'Inscriptions & Dossier LMD',
                        'assets/icons/nav/inscriptions.png',
                        Icons.how_to_reg_rounded,
                        badgeText: '154 ECTS',
                        badgeColor: const Color(0xFF10B981),
                      ),
                      _buildNavItem(
                        4,
                        'Visioconférence Amphi',
                        'assets/icons/nav/visio.png',
                        Icons.videocam_rounded,
                        badgeText: _server.isRunning ? 'Direct' : null,
                        badgeColor: const Color(0xFF10B981),
                      ),
                      _buildNavItem(
                        5,
                        'Mes Cours & UE',
                        'assets/icons/nav/courses.png',
                        Icons.menu_book_rounded,
                      ),
                      _buildNavItem(
                        6,
                        'Devoirs & Projets',
                        'assets/icons/nav/assignments.png',
                        Icons.assignment_rounded,
                        badgeText: '3 Actifs',
                        badgeColor: const Color(0xFFF59E0B),
                      ),
                      _buildNavItem(
                        7,
                        'Notes & Bulletins LMD',
                        'assets/icons/nav/grades.png',
                        Icons.grade_rounded,
                        badgeText: 'GPA 3.82',
                        badgeColor: const Color(0xFF10B981),
                      ),
                      _buildNavItem(
                        8,
                        'Présence & QR Code',
                        'assets/icons/nav/attendance.png',
                        Icons.qr_code_scanner_rounded,
                        badgeText: '98.5%',
                        badgeColor: const Color(0xFF0D9488),
                      ),
                      _buildNavItem(
                        9,
                        'Bibliothèque Z-Library',
                        'assets/icons/nav/library.png',
                        Icons.local_library_rounded,
                        badgeText: 'VPS',
                        badgeColor: const Color(0xFF38BDF8),
                      ),

                      // --- SECTION 3 : CAMPUS & SERVICES ---
                      _buildSectionHeader('CAMPUS & SERVICES'),
                      _buildNavItem(
                        20,
                        'Salles & Amphis Campus',
                        'assets/icons/nav/rooms.png',
                        Icons.meeting_room_rounded,
                        badgeText: '8 Salles',
                        badgeColor: const Color(0xFF38BDF8),
                      ),
                      _buildNavItem(
                        13,
                        'Sentinelle IoT & Caméras',
                        'assets/icons/nav/sentinelle.png',
                        Icons.shield_rounded,
                        badgeText: '4 CCTV',
                        badgeColor: const Color(0xFFEF4444),
                      ),
                      _buildNavItem(
                        14,
                        'Quêtes & Gamification',
                        'assets/icons/nav/gamification.png',
                        Icons.emoji_events_rounded,
                        badgeText: 'Niv. 5',
                        badgeColor: const Color(0xFFFBBF24),
                      ),
                      _buildNavItem(
                        15,
                        'Annuaire Campus UY1',
                        'assets/icons/nav/students.png',
                        Icons.badge_rounded,
                      ),
                      _buildNavItem(
                        16,
                        'Abonnements & Bourses',
                        'assets/icons/nav/abonnement.png',
                        Icons.credit_card_rounded,
                        badgeText: 'MoMo',
                        badgeColor: const Color(0xFF10B981),
                      ),
                      _buildNavItem(
                        10,
                        'Uni Copilot IA',
                        'assets/mascot/uni_copilot_3d.png',
                        Icons.auto_awesome_rounded,
                        badgeText: 'GROQ',
                        badgeColor: const Color(0xFF0D9488),
                      ),
                      _buildNavItem(
                        21,
                        'Centre d\'Aide & FAQ',
                        'assets/icons/nav/aide.png',
                        Icons.help_outline_rounded,
                        badgeText: 'F11 / FAQ',
                        badgeColor: const Color(0xFF0D9488),
                      ),
                      _buildNavItem(
                        11,
                        'Paramètres & Profil',
                        'assets/icons/nav/settings.png',
                        Icons.settings_rounded,
                        badgeText: _currentUserRole.contains('Membre') ? 'Fondateur' : null,
                        badgeColor: const Color(0xFFF59E0B),
                      ),
                    ],
                  ),
                ),

                // Footer de la Sidebar : Statut Résilience & Synchronisation Hors-Ligne + Serveur Visio Local
                Container(
                  margin:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Color(0xFF10B981),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Expanded(
                            child: Text(
                              'Synchro Hors-Ligne Active',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 5, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981)
                                  .withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text('Résilient',
                                style: TextStyle(
                                    color: Color(0xFF34D399),
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 5),
                      Text(
                        'Données locales sécurisées · Visio Port ${_server.port}',
                        style: const TextStyle(
                            color: Color(0xFF94A3B8), fontSize: 10),
                      ),
                      const SizedBox(height: 6),
                      Wrap(
                        spacing: 8,
                        runSpacing: 4,
                        alignment: WrapAlignment.spaceBetween,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          InkWell(
                            onTap: () => setState(() => _selectedIndex = 4),
                            child: const Text(
                              'Serveur Visio →',
                              style: TextStyle(
                                  color: Color(0xFF38BDF8),
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold),
                            ),
                          ),
                          if (widget.onShowOnboarding != null)
                            InkWell(
                              onTap: widget.onShowOnboarding,
                              child: const Text(
                                'Onboarding ↺',
                                style: TextStyle(
                                    color: Color(0xFF94A3B8),
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Carte Profil Utilisateur Bento Dégradé avec adresse @uniflow.cm & action Paramètres / Déconnexion
                InkWell(
                  onTap: () => setState(() => _selectedIndex = 11),
                  borderRadius: BorderRadius.circular(18),
                  child: Container(
                    margin: const EdgeInsets.fromLTRB(12, 4, 12, 14),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1E3A8A), Color(0xFF0D9488)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(18),
                      border:
                          Border.all(color: Colors.white.withValues(alpha: 0.2)),
                    ),
                    child: Row(
                      children: [
                        const CircleAvatar(
                          radius: 19,
                          backgroundColor: Color(0xFF0F172A),
                          backgroundImage:
                              AssetImage('assets/mascot/uni_copilot_3d.png'),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _currentUserName.isNotEmpty
                                    ? '$_currentUserName · $_currentUserRole'
                                    : 'Étudiant · $_currentUserRole',
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w900),
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                _currentUserEmail.isNotEmpty
                                    ? _currentUserEmail
                                    : 'Session Sécurisée',
                                style: const TextStyle(
                                    color: Color(0xFF67E8F9),
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        if (_isCreatorMember(_currentUserEmail, _currentUserRole)) ...[
                          IconButton(
                            icon: const Icon(Icons.workspace_premium_rounded, color: Color(0xFF67E8F9), size: 19),
                            tooltip: 'Espace Membre Créateur',
                            onPressed: () => setState(() => _selectedIndex = 18),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                          const SizedBox(width: 6),
                        ],
                        IconButton(
                          icon: const Icon(Icons.settings, color: Colors.white70, size: 18),
                          tooltip: 'Paramètres & Profil',
                          onPressed: () => setState(() => _selectedIndex = 11),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                        if (widget.onLogout != null) ...[
                          const SizedBox(width: 8),
                          IconButton(
                            icon: const Icon(Icons.logout_rounded, color: Colors.white70, size: 18),
                            tooltip: 'Se déconnecter',
                            onPressed: widget.onLogout,
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // =================================================================
          // CONTENU PRINCIPAL
          // =================================================================
          Expanded(
            child: screens[_selectedIndex],
          ),
        ],
      ),
    );

    return CallbackShortcuts(
      bindings: <ShortcutActivator, VoidCallback>{
        const SingleActivator(LogicalKeyboardKey.digit0, control: true): () => _onNavigate(0),
        const SingleActivator(LogicalKeyboardKey.digit1, control: true): () => _onNavigate(1),
        const SingleActivator(LogicalKeyboardKey.digit2, control: true): () => _onNavigate(2),
        const SingleActivator(LogicalKeyboardKey.digit3, control: true): () => _onNavigate(3),
        const SingleActivator(LogicalKeyboardKey.digit4, control: true): () => _onNavigate(4),
        const SingleActivator(LogicalKeyboardKey.digit5, control: true): () => _onNavigate(5),
        const SingleActivator(LogicalKeyboardKey.digit6, control: true): () => _onNavigate(6),
        const SingleActivator(LogicalKeyboardKey.digit7, control: true): () => _onNavigate(7),
        const SingleActivator(LogicalKeyboardKey.digit8, control: true): () => _onNavigate(8),
        const SingleActivator(LogicalKeyboardKey.digit9, control: true): () => _onNavigate(9),
        const SingleActivator(LogicalKeyboardKey.keyH, control: true): () => _onNavigate(21),
        const SingleActivator(LogicalKeyboardKey.f1): () => _onNavigate(21),
      },
      child: Focus(
        autofocus: true,
        child: scaffold,
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 14, 8, 6),
      child: Text(
        title,
        style: const TextStyle(
          color: Color(0xFF64748B),
          fontSize: 9.5,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.8,
        ),
      ),
    );
  }

  Widget _buildNavItem(
    int index,
    String title,
    String iconAssetPath,
    IconData fallbackIcon, {
    String? badgeText,
    Color? badgeColor,
  }) {
    final isSelected = _selectedIndex == index;

    return Padding(
      padding: const EdgeInsets.only(bottom: 5.0),
      child: InkWell(
        onTap: () => setState(() => _selectedIndex = index),
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
          decoration: BoxDecoration(
            gradient: isSelected
                ? const LinearGradient(
                    colors: [Color(0xFF1E3A8A), Color(0xFF0D9488)],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  )
                : null,
            color: isSelected ? null : Colors.transparent,
            borderRadius: BorderRadius.circular(14),
            border: isSelected
                ? Border.all(color: Colors.white.withValues(alpha: 0.2))
                : null,
          ),
          child: Row(
            children: [
              Container(
                width: 28,
                height: 28,
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  color: isSelected
                      ? Colors.white.withValues(alpha: 0.16)
                      : const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Image.asset(
                  iconAssetPath,
                  fit: BoxFit.contain,
                  errorBuilder: (_, __, ___) => Icon(
                    fallbackIcon,
                    color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                    size: 16,
                  ),
                ),
              ),
              const SizedBox(width: 11),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    color: isSelected ? Colors.white : const Color(0xFFCBD5E1),
                    fontSize: 12.5,
                    fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (badgeText != null)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? Colors.white.withValues(alpha: 0.22)
                        : (badgeColor ?? const Color(0xFF0D9488))
                            .withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: isSelected
                          ? Colors.white.withValues(alpha: 0.4)
                          : (badgeColor ?? const Color(0xFF0D9488))
                              .withValues(alpha: 0.4),
                    ),
                  ),
                  child: Text(
                    badgeText,
                    style: TextStyle(
                      color: isSelected
                          ? Colors.white
                          : (badgeColor ?? const Color(0xFF0D9488)),
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
