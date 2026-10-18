import 'package:flutter/material.dart';
import '../data/sample_data.dart';
import '../services/local_visio_server.dart';

class DashboardScreen extends StatelessWidget {
  final Function(int) onNavigate;

  const DashboardScreen({super.key, required this.onNavigate});

  @override
  Widget build(BuildContext context) {
    final server = LocalVisioServer.instance;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // =================================================================
            // HERO BENTO DESKTOP 3D
            // =================================================================
            Container(
              padding: const EdgeInsets.all(24.0),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [
                    Color(0xFF0B132B),
                    Color(0xFF1E3A8A),
                    Color(0xFF0D9488)
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24.0),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF1E3A8A).withValues(alpha: 0.2),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Wrap(
                          spacing: 8,
                          runSpacing: 6,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                    color: Colors.white.withValues(alpha: 0.2)),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.school_rounded,
                                      color: Color(0xFF67E8F9), size: 14),
                                  SizedBox(width: 6),
                                  Text(
                                    'Université de Yaoundé I · Faculté des Sciences',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981)
                                    .withValues(alpha: 0.25),
                                borderRadius: BorderRadius.circular(20),
                                border:
                                    Border.all(color: const Color(0xFF34D399)),
                              ),
                              child: const Text(
                                'BÊTA OUVERTE · etudiant.uy1@uniflow.cm',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF38BDF8)
                                    .withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(20),
                                border:
                                    Border.all(color: const Color(0xFF38BDF8)),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.sync_rounded,
                                      color: Color(0xFF38BDF8), size: 13),
                                  SizedBox(width: 5),
                                  Text(
                                    'Résilience & Synchronisation Hors-Ligne',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 10,
                                        fontWeight: FontWeight.w800),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'Espace de Travail Académique Desktop & Hub Résilient',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Plateforme Universitaire Connectée conçue pour les réalités du campus : consultation instantanée hors-ligne, synchronisation intelligente, courriels institutionnels signés @uniflow.cm, actualités officielles en continu et visioconférence locale P2P.',
                          style: TextStyle(
                              color: Color(0xFFCBD5E1),
                              fontSize: 13,
                              height: 1.5),
                        ),
                        const SizedBox(height: 16),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: [
                            ElevatedButton.icon(
                              onPressed: () =>
                                  onNavigate(1), // Actualités Campus
                              icon:
                                  const Icon(Icons.campaign_rounded, size: 16),
                              label: const Text('Actualités Campus & Bêta'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: const Color(0xFF0B132B),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 14, vertical: 12),
                              ),
                            ),
                            ElevatedButton.icon(
                              onPressed: () => onNavigate(2), // UniMail
                              icon: const Icon(Icons.alternate_email_rounded,
                                  size: 16),
                              label: const Text('UniMail (@uniflow.cm)'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0D9488),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 14, vertical: 12),
                              ),
                            ),
                            ElevatedButton.icon(
                              onPressed: () => onNavigate(3), // Emploi du Temps
                              icon: const Icon(Icons.calendar_month_rounded,
                                  size: 16),
                              label: const Text('Emploi du Temps'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF1E3A8A),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 14, vertical: 12),
                              ),
                            ),
                            OutlinedButton.icon(
                              onPressed: () => onNavigate(4), // Visio
                              icon: const Icon(Icons.video_call_rounded,
                                  size: 16),
                              label: const Text('Visioconférence'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.white,
                                side: const BorderSide(color: Colors.white38),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 14, vertical: 12),
                              ),
                            ),
                            OutlinedButton.icon(
                              onPressed: () => onNavigate(19), // Inscriptions LMD
                              icon: const Icon(Icons.how_to_reg_rounded,
                                  size: 16),
                              label: const Text('Dossier LMD'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.white,
                                side: const BorderSide(color: Colors.white38),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 14, vertical: 12),
                              ),
                            ),
                            OutlinedButton.icon(
                              onPressed: () => onNavigate(20), // Salles & Amphis
                              icon: const Icon(Icons.meeting_room_rounded,
                                  size: 16),
                              label: const Text('Salles & Amphis'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.white,
                                side: const BorderSide(color: Colors.white38),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 14, vertical: 12),
                              ),
                            ),
                            OutlinedButton.icon(
                              onPressed: () => onNavigate(21), // Aide & Raccourcis
                              icon: const Icon(Icons.help_outline_rounded,
                                  size: 16),
                              label: const Text('Centre d\'Aide'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFF67E8F9),
                                side: const BorderSide(color: Color(0xFF67E8F9)),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 14, vertical: 12),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 24),
                  Container(
                    width: 140,
                    height: 140,
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                          color: Colors.white.withValues(alpha: 0.25)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Image.asset(
                        'assets/mascot/uni_copilot_3d.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // =================================================================
            // BENTO GRID : RACCOURCIS PRODUCTIVITÉ CAMPUS & RÉSILIENCE HORS-LIGNE
            // =================================================================
            Row(
              children: [
                // Carte 1 : Actualités Campus Bêta
                Expanded(
                  flex: 4,
                  child: InkWell(
                    onTap: () => onNavigate(1),
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                            color: const Color(0xFF1E3A8A)
                                .withValues(alpha: 0.22)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.02),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E3A8A)
                                      .withValues(alpha: 0.09),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Image.asset(
                                  'assets/icons/nav/analytics.png',
                                  fit: BoxFit.contain,
                                  errorBuilder: (_, __, ___) => const Icon(
                                      Icons.campaign_rounded,
                                      color: Color(0xFF1E3A8A)),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF1E3A8A)
                                            .withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Text(
                                        'ACTUALITÉS CAMPUS',
                                        style: TextStyle(
                                            fontSize: 9.5,
                                            fontWeight: FontWeight.w900,
                                            color: Color(0xFF1E3A8A)),
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    const Text(
                                      'Annonce Officielle : Plateforme en phase de test bêta',
                                      style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w900,
                                          color: Color(0xFF0F172A)),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          const Text(
                            'Des améliorations majeures arrivent ! Consultez les vidéos, images et notes PDF du campus →',
                            style: TextStyle(
                                fontSize: 11.5,
                                color: Color(0xFF64748B),
                                height: 1.4),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 14),

                // Carte 2 : UniMail @uniflow.cm
                Expanded(
                  flex: 4,
                  child: InkWell(
                    onTap: () => onNavigate(2),
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                            color: const Color(0xFF0D9488)
                                .withValues(alpha: 0.25)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.02),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0D9488)
                                      .withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Image.asset(
                                  'assets/icons/nav/messages.png',
                                  fit: BoxFit.contain,
                                  errorBuilder: (_, __, ___) => const Icon(
                                      Icons.mail_rounded,
                                      color: Color(0xFF0D9488)),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF0D9488)
                                            .withValues(alpha: 0.12),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Text(
                                        'UNIMAIL SOUVERAIN',
                                        style: TextStyle(
                                            fontSize: 9.5,
                                            fontWeight: FontWeight.w900,
                                            color: Color(0xFF0D9488)),
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    const Text(
                                      'Boîte Institutionnelle : etudiant.uy1@uniflow.cm',
                                      style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w900,
                                          color: Color(0xFF0F172A)),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          const Text(
                            'Courriels signés numériquement par UniFlow et liés au cycle de vie de votre compte →',
                            style: TextStyle(
                                fontSize: 11.5,
                                color: Color(0xFF0D9488),
                                fontWeight: FontWeight.w600,
                                height: 1.4),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 14),

                // Carte 3 : Résilience & Synchronisation Hors-Ligne
                Expanded(
                  flex: 3,
                  child: Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF334155)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
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
                            const Text(
                              'Résilience Active',
                              style: TextStyle(
                                  color: Color(0xFF34D399),
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900),
                            ),
                            const Spacer(),
                            const Icon(Icons.cloud_done_rounded,
                                color: Color(0xFF67E8F9), size: 16),
                          ],
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Synchronisation Hors-Ligne',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Cours, plannings & courriels indexés en cache local sécurisé.',
                          style: TextStyle(
                              color: Color(0xFF94A3B8),
                              fontSize: 11,
                              height: 1.3),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // =================================================================
            // 4 CARTES BENTO KPI AVEC ICÔNES 3D
            // =================================================================
            Row(
              children: [
                _buildKpiCard(
                  title: 'Cours Inscrits',
                  value: '${sampleCourses.length}',
                  subtitle: 'Filière ICT4D / L3 UY1',
                  assetPath: 'assets/icons/nav/courses.png',
                  fallbackIcon: Icons.menu_book_rounded,
                  color: const Color(0xFF1E3A8A),
                ),
                const SizedBox(width: 16),
                _buildKpiCard(
                  title: 'Crédits ECTS',
                  value: '30 ECTS',
                  subtitle: 'Semestre 1 LMD',
                  assetPath: 'assets/icons/nav/grades.png',
                  fallbackIcon: Icons.military_tech_rounded,
                  color: const Color(0xFF0D9488),
                ),
                const SizedBox(width: 16),
                _buildKpiCard(
                  title: 'Assiduité Certifiée',
                  value: '96.8%',
                  subtitle: 'Présence campus',
                  assetPath: 'assets/icons/nav/attendance.png',
                  fallbackIcon: Icons.check_circle_rounded,
                  color: const Color(0xFF059669),
                ),
                const SizedBox(width: 16),
                _buildKpiCard(
                  title: 'Serveur Visio',
                  value: server.isRunning ? 'En Ligne' : 'Prêt',
                  subtitle: 'Port ${server.port} · P2P LAN',
                  assetPath: 'assets/icons/nav/visio.png',
                  fallbackIcon: Icons.videocam_rounded,
                  color: const Color(0xFF7C3AED),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // =================================================================
            // PROCHAINE SÉANCE & COPILOTE GROQ
            // =================================================================
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Prochaine Séance
                Expanded(
                  flex: 3,
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Expanded(
                              child: Text(
                                'Prochaine Séance Universitaire',
                                style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF0F172A)),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0D9488)
                                    .withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: const Text(
                                'Aujourd\'hui',
                                style: TextStyle(
                                    color: Color(0xFF0D9488),
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 50,
                                height: 50,
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E3A8A)
                                      .withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: Image.asset(
                                  'assets/icons/nav/schedule.png',
                                  fit: BoxFit.contain,
                                  errorBuilder: (_, __, ___) => const Icon(
                                      Icons.school_rounded,
                                      color: Color(0xFF1E3A8A),
                                      size: 24),
                                ),
                              ),
                              const SizedBox(width: 14),
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'INF4067 · Génie Logiciel Avancé',
                                      style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF0F172A)),
                                    ),
                                    SizedBox(height: 4),
                                    Text(
                                      '08:00 – 11:00 · Amphi 501 UY1 · Prof. Melatagia Yonta',
                                      style: TextStyle(
                                          fontSize: 12,
                                          color: Color(0xFF64748B)),
                                    ),
                                  ],
                                ),
                              ),
                              ElevatedButton(
                                onPressed: () => onNavigate(4), // Visio
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF1E3A8A),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10)),
                                ),
                                child: const Text('Rejoindre Amphi'),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(width: 20),

                // Copilote Uni GROQ
                Expanded(
                  flex: 2,
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1E3A8A), Color(0xFF0D9488)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.auto_awesome_rounded,
                                color: Color(0xFF67E8F9), size: 20),
                            SizedBox(width: 8),
                            Text(
                              'Uni Copilot (GROQ)',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Inférence ultra-rapide propulsée par l\'API GROQ pour répondre à vos questions académiques et générer vos fiches de cours.',
                          style: TextStyle(
                              color: Color(0xFFE2E8F0),
                              fontSize: 12,
                              height: 1.4),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: () => onNavigate(10), // Assistant Uni Copilot
                          icon: const Icon(Icons.chat_bubble_outline_rounded,
                              size: 16),
                          label: const Text('Ouvrir l\'Assistant Uni'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: const Color(0xFF1E3A8A),
                            minimumSize: const Size(double.infinity, 40),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildKpiCard({
    required String title,
    required String value,
    required String subtitle,
    required String assetPath,
    required IconData fallbackIcon,
    required Color color,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 46,
              height: 46,
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Image.asset(
                assetPath,
                fit: BoxFit.contain,
                errorBuilder: (_, __, ___) =>
                    Icon(fallbackIcon, color: color, size: 24),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF64748B),
                        fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: color),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style:
                        const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
