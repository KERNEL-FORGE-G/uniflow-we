import 'package:flutter/material.dart';

class QuestsScreen extends StatefulWidget {
  const QuestsScreen({super.key});

  @override
  State<QuestsScreen> createState() => _QuestsScreenState();
}

class _QuestsScreenState extends State<QuestsScreen> {
  int _xp = 3450;
  final int _maxXp = 5000;
  final int _level = 5;
  final int _streakDays = 14;

  final List<Map<String, dynamic>> _badges = [
    {
      'id': 'b1',
      'title': 'Assiduité d’Or',
      'desc': 'Présence certifiée à 100% des cours et amphis du semestre.',
      'icon': Icons.verified_rounded,
      'color': const Color(0xFFF59E0B),
      'unlocked': true,
      'date': 'Obtenu le 12 Oct.',
    },
    {
      'id': 'b2',
      'title': 'Major ICT4D',
      'desc': 'GPA semestriel supérieur à 3.8/4.0.',
      'icon': Icons.military_tech_rounded,
      'color': const Color(0xFF10B981),
      'unlocked': true,
      'date': 'Obtenu le 05 Oct.',
    },
    {
      'id': 'b3',
      'title': 'Bibliophile Z-Library',
      'desc': 'Plus de 30 manuels et publications académiques téléchargés.',
      'icon': Icons.menu_book_rounded,
      'color': const Color(0xFF38BDF8),
      'unlocked': true,
      'date': 'Obtenu le 16 Oct.',
    },
    {
      'id': 'b4',
      'title': 'Sentinelle de l’Amphi',
      'desc': 'Scan QR aux bornes Sentinelle en moins de 10 secondes.',
      'icon': Icons.security_rounded,
      'color': const Color(0xFF8B5CF6),
      'unlocked': true,
      'date': 'Obtenu hier',
    },
    {
      'id': 'b5',
      'title': 'Génie de l’Algorithmique',
      'desc': 'Valider 5 TP consécutifs en C / Java / Python avec 20/20.',
      'icon': Icons.psychology_rounded,
      'color': const Color(0xFFEC4899),
      'unlocked': false,
      'date': 'Progression : 4/5 TP',
    },
    {
      'id': 'b6',
      'title': 'Pilier Collaboratif',
      'desc': 'Aider 20 camarades sur les canaux de messagerie UniFlow.',
      'icon': Icons.handshake_rounded,
      'color': const Color(0xFF0D9488),
      'unlocked': false,
      'date': 'Progression : 14/20 aides',
    },
  ];

  final List<Map<String, dynamic>> _dailyQuests = [
    {
      'id': 'q1',
      'title': 'Émargement Amphi 501',
      'desc': 'Pointer votre présence au cours de Génie Logiciel via QR Code',
      'xp': 150,
      'completed': true,
      'claimed': true,
    },
    {
      'id': 'q2',
      'title': 'Lecture Z-Library',
      'desc': 'Consulter un chapitre du manuel Distributed Systems',
      'xp': 200,
      'completed': true,
      'claimed': false,
    },
    {
      'id': 'q3',
      'title': 'Résolution TP INF4077',
      'desc': 'Déposer le code source du TP Cryptographie sur UniFlow',
      'xp': 300,
      'completed': false,
      'claimed': false,
    },
    {
      'id': 'q4',
      'title': 'Participation Visio',
      'desc': 'Assister à la séance de TD interactive en visioconférence HD',
      'xp': 150,
      'completed': false,
      'claimed': false,
    },
  ];

  final List<Map<String, dynamic>> _leaderboard = [
    {
      'rank': 1,
      'name': 'Ravel Nghomsi',
      'level': 'Niveau 7',
      'xp': '6 240 XP',
      'filiere': 'ICT4D L3',
      'isMe': false,
    },
    {
      'rank': 2,
      'name': 'Sandra Febnchak',
      'level': 'Niveau 6',
      'xp': '5 180 XP',
      'filiere': 'ICT4D L3',
      'isMe': false,
    },
    {
      'rank': 3,
      'name': 'Marcel Tessoh (Moi)',
      'level': 'Niveau 5',
      'xp': '3 450 XP',
      'filiere': 'ICT4D L3',
      'isMe': true,
    },
    {
      'rank': 4,
      'name': 'Hassane Youssouf',
      'level': 'Niveau 5',
      'xp': '3 290 XP',
      'filiere': 'Génie Informatique',
      'isMe': false,
    },
    {
      'rank': 5,
      'name': 'Ivan Tsafack',
      'level': 'Niveau 4',
      'xp': '2 950 XP',
      'filiere': 'Sécurité Réseaux',
      'isMe': false,
    },
  ];

  void _claimXp(Map<String, dynamic> quest) {
    if (quest['completed'] == true && quest['claimed'] != true) {
      setState(() {
        quest['claimed'] = true;
        _xp += (quest['xp'] as int);
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('+${quest['xp']} XP récupérés ! Félicitations !'),
          backgroundColor: const Color(0xFF10B981),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF0B132B),
      child: ListView(
        padding: const EdgeInsets.all(28),
        children: [
          // =================================================================
          // HERO BENTO SECTION : GAMIFICATION & QUÊTES
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
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.emoji_events_rounded, color: Color(0xFFFBBF24), size: 16),
                            SizedBox(width: 8),
                            Text(
                              'Gamification Académique · Université de Yaoundé 1',
                              style: TextStyle(
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
                        'Quêtes, Badges d’Honneur & Classement Campus',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Valorisez votre engagement universitaire, maintenez votre série quotidienne de présence et débloquez des titres honorifiques reconnus par la faculté des sciences.',
                        style: TextStyle(
                          color: Color(0xFFCBD5E1),
                          fontSize: 13.5,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Carte Bento XP & Progression
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A).withValues(alpha: 0.7),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF0D9488),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Text(
                                        'Niveau $_level · Érudit Numérique',
                                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Row(
                                      children: [
                                        const Icon(Icons.local_fire_department_rounded, color: Color(0xFFF97316), size: 18),
                                        const SizedBox(width: 4),
                                        Text(
                                          'Série : $_streakDays jours d\'affilée',
                                          style: const TextStyle(color: Color(0xFFFDBA74), fontWeight: FontWeight.bold, fontSize: 12),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                Text(
                                  '$_xp / $_maxXp XP',
                                  style: const TextStyle(color: Color(0xFF67E8F9), fontWeight: FontWeight.bold, fontSize: 13, fontFamily: 'monospace'),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              child: LinearProgressIndicator(
                                value: _xp / _maxXp,
                                minHeight: 10,
                                backgroundColor: const Color(0xFF1E293B),
                                valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF0D9488)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 24),

                // Illustration 3D Trophée
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
                      'assets/icons/nav/gamification.png',
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const Icon(Icons.emoji_events, size: 60, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // =================================================================
          // SECTION QUÊTES QUOTIDIENNES + CLASSEMENT BENTO
          // =================================================================
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Quêtes du jour (60%)
              Expanded(
                flex: 60,
                child: Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.assignment_turned_in_rounded, color: Color(0xFF10B981), size: 20),
                          SizedBox(width: 10),
                          Text(
                            'Quêtes Académiques du Jour',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      ...List.generate(_dailyQuests.length, (index) {
                        final q = _dailyQuests[index];
                        final isCompleted = q['completed'] == true;
                        final isClaimed = q['claimed'] == true;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isCompleted
                                  ? const Color(0xFF10B981).withValues(alpha: 0.3)
                                  : const Color(0xFF334155),
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: isCompleted
                                      ? const Color(0xFF10B981).withValues(alpha: 0.15)
                                      : const Color(0xFF334155),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  isCompleted ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                                  color: isCompleted ? const Color(0xFF34D399) : const Color(0xFF94A3B8),
                                  size: 18,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      q['title'] as String,
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                        decoration: isClaimed ? TextDecoration.lineThrough : null,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      q['desc'] as String,
                                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0F172A),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  '+${q['xp']} XP',
                                  style: const TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold, fontSize: 11),
                                ),
                              ),
                              const SizedBox(width: 8),
                              if (isCompleted && !isClaimed)
                                ElevatedButton(
                                  onPressed: () => _claimXp(q),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF10B981),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                  child: const Text('Réclamer', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                )
                              else if (isClaimed)
                                const Text('Réclamé ✓', style: TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),

              const SizedBox(width: 20),

              // Classement Campus (40%)
              Expanded(
                flex: 40,
                child: Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.leaderboard_rounded, color: Color(0xFFF59E0B), size: 20),
                          SizedBox(width: 10),
                          Text(
                            'Classement L3 ICT4D',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      ...List.generate(_leaderboard.length, (index) {
                        final item = _leaderboard[index];
                        final isMe = item['isMe'] == true;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: isMe ? const Color(0xFF1E3A8A).withValues(alpha: 0.5) : const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: isMe ? const Color(0xFF38BDF8) : Colors.transparent,
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 26,
                                height: 26,
                                decoration: BoxDecoration(
                                  color: index == 0
                                      ? const Color(0xFFF59E0B)
                                      : index == 1
                                          ? const Color(0xFF94A3B8)
                                          : index == 2
                                              ? const Color(0xFFB45309)
                                              : const Color(0xFF0F172A),
                                  shape: BoxShape.circle,
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  '${item['rank']}',
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item['name'] as String,
                                      style: TextStyle(
                                        color: isMe ? const Color(0xFF38BDF8) : Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                    Text(
                                      '${item['filiere']} · ${item['level']}',
                                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 10),
                                    ),
                                  ],
                                ),
                              ),
                              Text(
                                item['xp'] as String,
                                style: const TextStyle(color: Color(0xFF67E8F9), fontWeight: FontWeight.bold, fontSize: 11.5),
                              ),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // =================================================================
          // SECTION BADGES D'HONNEUR & SUCCÈS ACADÉMIQUES
          // =================================================================
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.workspace_premium_rounded, color: Color(0xFF38BDF8), size: 20),
                    SizedBox(width: 10),
                    Text(
                      'Badges d’Honneur & Distinctions Académiques',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _badges.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    mainAxisExtent: 135,
                  ),
                  itemBuilder: (context, i) {
                    final b = _badges[i];
                    final unlocked = b['unlocked'] == true;

                    return Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(
                          color: unlocked ? (b['color'] as Color).withValues(alpha: 0.5) : const Color(0xFF334155),
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: unlocked ? (b['color'] as Color).withValues(alpha: 0.15) : const Color(0xFF0F172A),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              b['icon'] as IconData,
                              color: unlocked ? (b['color'] as Color) : const Color(0xFF64748B),
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  b['title'] as String,
                                  style: TextStyle(
                                    color: unlocked ? Colors.white : const Color(0xFF94A3B8),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12.5,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  b['desc'] as String,
                                  style: const TextStyle(color: Color(0xFF64748B), fontSize: 10),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  b['date'] as String,
                                  style: TextStyle(
                                    color: unlocked ? const Color(0xFF34D399) : const Color(0xFFF59E0B),
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
