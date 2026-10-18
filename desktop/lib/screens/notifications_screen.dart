import 'package:flutter/material.dart';

class NotificationsScreen extends StatefulWidget {
  final Function(int targetIndex)? onNavigate;

  const NotificationsScreen({super.key, this.onNavigate});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  String _activeFilter = 'Toutes';

  final List<Map<String, dynamic>> _notifications = [
    {
      'id': 'notif-1',
      'title': 'Notes du Contrôle Continu publiées en Génie Logiciel (INF4067)',
      'desc': 'Prof. Melatagia Yonta a publié les notes du CC. Votre note : 17.5/20. Consultez votre relevé numérique.',
      'category': 'Notes',
      'time': 'Il y a 25 minutes',
      'read': false,
      'icon': Icons.grade_rounded,
      'color': const Color(0xFF10B981),
      'targetIndex': 7, // Notes
    },
    {
      'id': 'notif-2',
      'title': 'Émargement certifié à la Borne Sentinelle #01 (Amphi 501)',
      'desc': 'Votre présence au cours magistral a été validée cryptographiquement avec succès.',
      'category': 'Sécurité',
      'time': 'Il y a 1 heure',
      'read': false,
      'icon': Icons.qr_code_2_rounded,
      'color': const Color(0xFF0D9488),
      'targetIndex': 8, // Présence
    },
    {
      'id': 'notif-3',
      'title': 'Rappel de rendu : TP Cryptographie & Courbes Elliptiques',
      'desc': 'Le délai de soumission du TP de Dr. Tapamo expire ce vendredi à 23h59.',
      'category': 'Devoirs',
      'time': 'Il y a 3 heures',
      'read': false,
      'icon': Icons.assignment_late_rounded,
      'color': const Color(0xFFF59E0B),
      'targetIndex': 6, // Devoirs
    },
    {
      'id': 'notif-4',
      'title': 'Nouveau manuel Z-Library ajouté à votre bibliothèque',
      'desc': '« Operating Systems: Three Easy Pieces » est désormais disponible hors-ligne dans vos favoris.',
      'category': 'Bibliothèque',
      'time': 'Hier à 18:30',
      'read': true,
      'icon': Icons.local_library_rounded,
      'color': const Color(0xFF38BDF8),
      'targetIndex': 9, // Z-Library
    },
    {
      'id': 'notif-5',
      'title': 'Annonce Campus : Séance de visioconférence délocalisée',
      'desc': 'La séance de TD INF3017 de demain 10h se déroulera en direct sur le serveur visio local.',
      'category': 'Campus',
      'time': 'Hier à 14:15',
      'read': true,
      'icon': Icons.videocam_rounded,
      'color': const Color(0xFF8B5CF6),
      'targetIndex': 4, // Visio
    },
  ];

  void _markAllAsRead() {
    setState(() {
      for (var n in _notifications) {
        n['read'] = true;
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Toutes les notifications ont été marquées comme lues.'),
        backgroundColor: Color(0xFF0D9488),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _notifications.where((n) {
      if (_activeFilter == 'Toutes') return true;
      if (_activeFilter == 'Non lues') return n['read'] == false;
      return n['category'] == _activeFilter;
    }).toList();

    final unreadCount = _notifications.where((n) => n['read'] == false).length;

    return Container(
      color: const Color(0xFF0B132B),
      child: ListView(
        padding: const EdgeInsets.all(28),
        children: [
          // =================================================================
          // HERO BENTO SECTION : CENTRE DE NOTIFICATIONS
          // =================================================================
          Container(
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0B132B), Color(0xFF1E3A8A), Color(0xFF0D9488)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.35),
                  blurRadius: 24,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.notifications_active_rounded, color: Color(0xFF67E8F9), size: 16),
                            const SizedBox(width: 8),
                            Text(
                              unreadCount > 0
                                  ? '$unreadCount nouvelle${unreadCount > 1 ? 's' : ''} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}'
                                  : 'Toutes les notifications sont à jour',
                              style: const TextStyle(
                                color: Color(0xFFBAE6FD),
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Centre de Notifications Académiques',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Restez informé en temps réel des notes publiées, rappels de devoirs, émargements certifiés aux bornes et annonces urgentes de vos enseignants.',
                        style: TextStyle(
                          color: Color(0xFFCBD5E1),
                          fontSize: 13.5,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Filtres Bento
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: ['Toutes', 'Non lues', 'Notes', 'Devoirs', 'Sécurité', 'Campus'].map((cat) {
                          final isSelected = _activeFilter == cat;
                          return InkWell(
                            onTap: () => setState(() => _activeFilter = cat),
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                color: isSelected ? const Color(0xFF0D9488) : Colors.white.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isSelected ? const Color(0xFF2DD4BF) : Colors.white.withValues(alpha: 0.15),
                                ),
                              ),
                              child: Text(
                                cat,
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 24),

                // Illustration 3D Cloche
                Container(
                  width: 140,
                  height: 140,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: Image.asset(
                      'assets/icons/nav/notifications.png',
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const Icon(Icons.notifications, size: 60, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Actions supérieures
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'NOTIFICATIONS RÉCENTES (${filtered.length})',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14, letterSpacing: 0.5),
              ),
              if (unreadCount > 0)
                TextButton.icon(
                  onPressed: _markAllAsRead,
                  icon: const Icon(Icons.done_all_rounded, color: Color(0xFF38BDF8), size: 16),
                  label: const Text('Tout marquer comme lu', style: TextStyle(color: Color(0xFF38BDF8), fontSize: 12)),
                ),
            ],
          ),

          const SizedBox(height: 14),

          // =================================================================
          // LISTE DES NOTIFICATIONS BENTO
          // =================================================================
          ...List.generate(filtered.length, (index) {
            final notif = filtered[index];
            final isRead = notif['read'] == true;

            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: !isRead ? const Color(0xFF0D9488) : const Color(0xFF1E293B),
                  width: !isRead ? 1.5 : 1,
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: (notif['color'] as Color).withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      notif['icon'] as IconData,
                      color: notif['color'] as Color,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                notif['title'] as String,
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: !isRead ? FontWeight.w900 : FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                            Text(
                              notif['time'] as String,
                              style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          notif['desc'] as String,
                          style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12.5, height: 1.4),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: (notif['color'] as Color).withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                notif['category'] as String,
                                style: TextStyle(color: notif['color'] as Color, fontSize: 10.5, fontWeight: FontWeight.bold),
                              ),
                            ),
                            const Spacer(),
                            if (widget.onNavigate != null && notif['targetIndex'] != null)
                              InkWell(
                                onTap: () {
                                  setState(() => notif['read'] = true);
                                  widget.onNavigate!(notif['targetIndex'] as int);
                                },
                                child: const Row(
                                  children: [
                                    Text('Voir la page correspondante', style: TextStyle(color: Color(0xFF38BDF8), fontSize: 11.5, fontWeight: FontWeight.bold)),
                                    SizedBox(width: 4),
                                    Icon(Icons.arrow_forward_rounded, color: Color(0xFF38BDF8), size: 14),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
