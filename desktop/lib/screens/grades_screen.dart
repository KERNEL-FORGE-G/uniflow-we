import 'package:flutter/material.dart';

class GradesScreen extends StatefulWidget {
  const GradesScreen({super.key});

  @override
  State<GradesScreen> createState() => _GradesScreenState();
}

class _GradesScreenState extends State<GradesScreen> {
  String _selectedSemester = 'Semestre 1 (S1)';
  final List<String> _semesters = ['Semestre 1 (S1)', 'Semestre 2 (S2)', 'Bilan Annuel'];

  final List<Map<String, dynamic>> _gradesData = [
    {
      'code': 'INF4018',
      'title': 'Compilation & Théorie des Langages',
      'credits': 6,
      'cc': 15.5,
      'tp': 17.0,
      'sn': 16.0,
      'average': 16.15,
      'gradeLetter': 'A',
      'status': 'Validé',
      'mention': 'Très Bien',
    },
    {
      'code': 'ICT401',
      'title': 'Intelligence Artificielle & Deep Learning',
      'credits': 6,
      'cc': 18.0,
      'tp': 19.5,
      'sn': 17.5,
      'average': 18.15,
      'gradeLetter': 'A+',
      'status': 'Validé',
      'mention': 'Excellent',
    },
    {
      'code': 'SIGL403',
      'title': 'Sécurité Logicielle & Cryptographie',
      'credits': 6,
      'cc': 16.5,
      'tp': 18.0,
      'sn': 15.5,
      'average': 16.40,
      'gradeLetter': 'A',
      'status': 'Validé',
      'mention': 'Très Bien',
    },
    {
      'code': 'INF4022',
      'title': 'Systèmes de Données Massives & NoSQL',
      'credits': 6,
      'cc': 14.0,
      'tp': 16.5,
      'sn': 15.0,
      'average': 15.10,
      'gradeLetter': 'B+',
      'status': 'Validé',
      'mention': 'Bien',
    },
    {
      'code': 'ENG401',
      'title': 'Anglais Professionnel & Rédaction Scientifique',
      'credits': 6,
      'cc': 16.0,
      'tp': 17.5,
      'sn': 16.5,
      'average': 16.60,
      'gradeLetter': 'A',
      'status': 'Validé',
      'mention': 'Très Bien',
    },
  ];

  @override
  Widget build(BuildContext context) {
    const double gpa = 16.48;
    const int totalCredits = 30;
    const int earnedCredits = 30;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Padding(
        padding: const EdgeInsets.all(28.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // =================================================================
            // HERO BENTO SECTION - NOTES & ÉVALUATIONS LMD
            // =================================================================
            Container(
              padding: const EdgeInsets.all(24.0),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [
                    Color(0xFF0B132B),
                    Color(0xFF1E3A8A),
                    Color(0xFF0D9488),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24.0),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF1E3A8A).withValues(alpha: 0.22),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.14),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.workspace_premium_rounded, size: 14, color: Color(0xFFFDE047)),
                              SizedBox(width: 6),
                              Text(
                                'RELEVÉ ACADÉMIQUE OFFICIEL · SYSTÈME LMD',
                                style: TextStyle(
                                  color: Color(0xFFFDE047),
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'Notes & Évaluations Semestrielles',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Consultez vos moyennes pondérées par Unité d’Enseignement, vos crédits ECTS capitalisés et votre rang de promotion.',
                          style: TextStyle(
                            color: Color(0xFFE2E8F0),
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 20),
                  Image.asset(
                    'assets/icons/nav/grades.png',
                    width: 76,
                    height: 76,
                    errorBuilder: (_, __, ___) => const Icon(Icons.school_rounded, size: 70, color: Colors.white70),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Cartes Bento KPI académiques
            Row(
              children: [
                _buildKpiCard(
                  title: 'Moyenne Générale',
                  value: '${gpa.toStringAsFixed(2)} / 20',
                  subtitle: 'Mention Très Bien',
                  icon: Icons.trending_up_rounded,
                  color: const Color(0xFF2563EB),
                ),
                const SizedBox(width: 14),
                _buildKpiCard(
                  title: 'Crédits ECTS Capitalisés',
                  value: '$earnedCredits / $totalCredits ECTS',
                  subtitle: '100% des UEs validées',
                  icon: Icons.check_circle_outline_rounded,
                  color: const Color(0xFF10B981),
                ),
                const SizedBox(width: 14),
                _buildKpiCard(
                  title: 'Rang de Promotion',
                  value: '2e / 142 étudiants',
                  subtitle: 'Filière Informatique & ICT4D',
                  icon: Icons.leaderboard_rounded,
                  color: const Color(0xFF8B5CF6),
                ),
                const SizedBox(width: 14),
                _buildKpiCard(
                  title: 'Décision Jury LMD',
                  value: 'ADMIS',
                  subtitle: 'Session Normale Janvier 2026',
                  icon: Icons.verified_user_rounded,
                  color: const Color(0xFF0D9488),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Sélecteur de semestre & Action Télécharger
            Row(
              children: [
                ..._semesters.map((s) {
                  final active = _selectedSemester == s;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ChoiceChip(
                      label: Text(s),
                      selected: active,
                      onSelected: (_) => setState(() => _selectedSemester = s),
                      selectedColor: const Color(0xFF1E3A8A),
                      labelStyle: TextStyle(
                        color: active ? Colors.white : const Color(0xFF475569),
                        fontWeight: FontWeight.bold,
                        fontSize: 12.5,
                      ),
                      backgroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  );
                }),
                const Spacer(),
                OutlinedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Relevé officiel certifié généré et disponible en téléchargement.'),
                        backgroundColor: Color(0xFF1E3A8A),
                      ),
                    );
                  },
                  icon: const Icon(Icons.download_rounded, size: 16),
                  label: const Text('Télécharger le relevé officiel (PDF)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF1E3A8A),
                    side: const BorderSide(color: Color(0xFFCBD5E1)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 14),

            // Tableau Bento des Notes LMD
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                clipBehavior: Clip.antiAlias,
                child: SingleChildScrollView(
                  scrollDirection: Axis.vertical,
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: DataTable(
                    headingRowColor: WidgetStateProperty.all(const Color(0xFFF8FAFC)),
                    headingTextStyle: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF475569), fontSize: 12),
                    dataRowMinHeight: 52,
                    dataRowMaxHeight: 58,
                    columns: const [
                      DataColumn(label: Text('Code UE')),
                      DataColumn(label: Text('Intitulé de l’UE')),
                      DataColumn(label: Text('Crédits')),
                      DataColumn(label: Text('CC (/20)')),
                      DataColumn(label: Text('TP (/20)')),
                      DataColumn(label: Text('SN (/20)')),
                      DataColumn(label: Text('Moyenne (/20)')),
                      DataColumn(label: Text('Mention')),
                      DataColumn(label: Text('Statut')),
                    ],
                    rows: _gradesData.map((item) {
                      return DataRow(
                        cells: [
                          DataCell(
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E3A8A).withValues(alpha: 0.08),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                item['code'],
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E3A8A), fontSize: 11.5),
                              ),
                            ),
                          ),
                          DataCell(Text(item['title'], style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12.5))),
                          DataCell(Text('${item['credits']} ECTS', style: const TextStyle(fontSize: 12))),
                          DataCell(Text('${item['cc']}', style: const TextStyle(fontSize: 12))),
                          DataCell(Text('${item['tp']}', style: const TextStyle(fontSize: 12))),
                          DataCell(Text('${item['sn']}', style: const TextStyle(fontSize: 12))),
                          DataCell(
                            Text(
                              '${item['average']}',
                              style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF1E3A8A), fontSize: 13),
                            ),
                          ),
                          DataCell(
                            Text(item['mention'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                          DataCell(
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFECFDF5),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFFA7F3D0)),
                              ),
                              child: Text(
                                item['status'],
                                style: const TextStyle(color: Color(0xFF047857), fontWeight: FontWeight.bold, fontSize: 11),
                              ),
                            ),
                          ),
                        ],
                      );
                    }).toList(),
                  ),
                ),
              ),
            ),
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
    required IconData icon,
    required Color color,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, size: 24, color: color),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 3),
                  Text(value, style: const TextStyle(color: Color(0xFF0F172A), fontSize: 16, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: TextStyle(color: color, fontSize: 10.5, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
