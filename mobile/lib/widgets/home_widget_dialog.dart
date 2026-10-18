import 'package:flutter/material.dart';
import '../services/home_widget_service.dart';
import 'phosphor.dart';

/// Modal présentant les 3 widgets d'écran d'accueil natifs style Duolingo
/// et permettant à l'utilisateur de les ajouter en 1 clic sur son smartphone.
class HomeWidgetSheet extends StatelessWidget {
  const HomeWidgetSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const HomeWidgetSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.fromLTRB(
        20,
        14,
        20,
        MediaQuery.of(context).padding.bottom + 20,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Poignée
            Center(
              child: Container(
                width: 44,
                height: 5,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            const SizedBox(height: 18),

            // En-tête
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF0B132B), Color(0xFF1E3A8A), Color(0xFF0D9488)],
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Center(
                    child: Text('🔥', style: TextStyle(fontSize: 22)),
                  ),
                ),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Widgets Écran d\'Accueil',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Style Duolingo · Sans ouvrir l\'application',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF0D9488),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            const Text(
              'Ajoute la mascotte Uni directement sur l\'écran d\'accueil de ton téléphone pour suivre tes cours, ta présence et tes devoirs sans même lancer l\'app.',
              style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.4),
            ),
            const SizedBox(height: 18),

            // Carte 1 : Widget Série Flamme & Quêtes
            _WidgetCard(
              title: 'Série & Quêtes du Jour',
              subtitle: 'Uni te rappelle de valider ta présence ou tes devoirs pour garder ta flamme active 🔥',
              imagePath: 'assets/mascot/uni_duo_streak_fire.png',
              badgeText: 'Mascotte Flamme',
              badgeColor: const Color(0xFFEA580C),
              onPin: () => _pin(context, 'streak'),
            ),
            const SizedBox(height: 12),

            // Carte 2 : Widget Prochain Cours
            _WidgetCard(
              title: 'Prochain Cours & Amphi',
              subtitle: 'Heure, salle et matière affichées en direct avec Uni en pleine course ⏰',
              imagePath: 'assets/mascot/uni_duo_class_rush.png',
              badgeText: 'Horaires & Salle',
              badgeColor: const Color(0xFF0D9488),
              onPin: () => _pin(context, 'schedule'),
            ),
            const SizedBox(height: 12),

            // Carte 3 : Mascotte Duo Vivante
            _WidgetCard(
              title: 'Mascotte Duo Compacte',
              subtitle: 'Uni s\'adapte à ta journée : réveil matin, encouragement et repos le soir ✨',
              imagePath: 'assets/mascot/uni_duo_celebrate_streak.png',
              badgeText: 'Format 2×2',
              badgeColor: const Color(0xFF7C3AED),
              onPin: () => _pin(context, 'compact'),
            ),
            const SizedBox(height: 16),

            // Astuce ajout manuel Android
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFCBD5E1)),
              ),
              child: const Row(
                children: [
                  Icon(PhosphorIconsDuotone.info, size: 20, color: Color(0xFF1E3A8A)),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Astuce Android : Tu peux aussi maintenir appuyé sur ton écran d\'accueil > Widgets > UniFlow.',
                      style: TextStyle(fontSize: 11.5, color: Color(0xFF475569), fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pin(BuildContext context, String widgetType) async {
    final success = await HomeWidgetService.pinWidget(widgetType: widgetType);
    if (!context.mounted) return;
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Demande d\'ajout du widget envoyée à l\'écran d\'accueil !'),
          backgroundColor: Color(0xFF0D9488),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Maintiens appuyé sur ton écran d\'accueil Android > choisis "Widgets" > sélectionne UniFlow.',
          ),
          backgroundColor: Color(0xFF1E3A8A),
        ),
      );
    }
  }
}

class _WidgetCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final String imagePath;
  final String badgeText;
  final Color badgeColor;
  final VoidCallback onPin;

  const _WidgetCard({
    required this.title,
    required this.subtitle,
    required this.imagePath,
    required this.badgeText,
    required this.badgeColor,
    required this.onPin,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          // Mascot Avatar 3D
          ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: Container(
              width: 58,
              height: 58,
              color: Colors.white,
              child: Image.asset(
                imagePath,
                fit: BoxFit.contain,
                errorBuilder: (_, __, ___) => const Center(
                  child: Text('🤖', style: TextStyle(fontSize: 28)),
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        title,
                        style: const TextStyle(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF0F172A),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: badgeColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        badgeText,
                        style: TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w800,
                          color: badgeColor,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 11,
                    color: Color(0xFF64748B),
                    height: 1.3,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),

          // Action Button
          ElevatedButton(
            onPressed: onPin,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1E3A8A),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              minimumSize: const Size(40, 36),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 0,
            ),
            child: const Text(
              'Ajouter',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800),
            ),
          ),
        ],
      ),
    );
  }
}
