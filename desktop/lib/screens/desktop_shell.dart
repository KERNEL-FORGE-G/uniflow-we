import 'package:flutter/material.dart';
import '../services/local_visio_server.dart';
import 'dashboard_screen.dart';
import 'actualites_screen.dart';
import 'unimail_screen.dart';
import 'schedule_screen.dart';
import 'visio_screen.dart';
import 'courses_screen.dart';
import 'zlibrary_screen.dart';
import 'assistant_screen.dart';

class DesktopShell extends StatefulWidget {
  const DesktopShell({super.key});

  @override
  State<DesktopShell> createState() => _DesktopShellState();
}

class _DesktopShellState extends State<DesktopShell> {
  int _selectedIndex = 0;
  final LocalVisioServer _server = LocalVisioServer.instance;

  @override
  void initState() {
    super.initState();
    // Démarrage automatique du serveur de visio local dès le lancement du desktop
    _server.startServer();
  }

  void _onNavigate(int index) {
    setState(() => _selectedIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      DashboardScreen(onNavigate: _onNavigate),
      const ActualitesScreen(),
      const UniMailScreen(),
      const ScheduleScreen(),
      const VisioScreen(),
      const CoursesScreen(),
      const ZLibraryScreen(),
      const AssistantScreen(),
    ];

    return Scaffold(
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
                      _buildNavItem(
                        0,
                        'Tableau de Bord',
                        'assets/icons/nav/dashboard.png',
                        Icons.dashboard_rounded,
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
                        3,
                        'Emploi du Temps',
                        'assets/icons/nav/schedule.png',
                        Icons.calendar_month_rounded,
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
                        'Bibliothèque Z-Library',
                        'assets/icons/nav/library.png',
                        Icons.local_library_rounded,
                      ),
                      _buildNavItem(
                        7,
                        'Uni Copilot IA',
                        'assets/icons/nav/aide.png',
                        Icons.auto_awesome_rounded,
                        badgeText: 'GROQ',
                        badgeColor: const Color(0xFF0D9488),
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
                      InkWell(
                        onTap: () => setState(() => _selectedIndex = 4),
                        child: const Text(
                          'Serveur P2P & Visioconférence →',
                          style: TextStyle(
                              color: Color(0xFF38BDF8),
                              fontSize: 10,
                              fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),

                // Carte Profil Utilisateur Bento Dégradé avec adresse @uniflow.cm
                Container(
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
                  child: const Row(
                    children: [
                      CircleAvatar(
                        radius: 19,
                        backgroundColor: Color(0xFF0F172A),
                        backgroundImage:
                            AssetImage('assets/mascot/uni_copilot_3d.png'),
                      ),
                      SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Étudiant UY1 · ICT4D L3',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w900),
                              overflow: TextOverflow.ellipsis,
                            ),
                            SizedBox(height: 2),
                            Text(
                              'etudiant.uy1@uniflow.cm',
                              style: TextStyle(
                                  color: Color(0xFF67E8F9),
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
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
