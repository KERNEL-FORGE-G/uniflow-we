import 'package:flutter/material.dart';

class AssignmentsScreen extends StatefulWidget {
  const AssignmentsScreen({super.key});

  @override
  State<AssignmentsScreen> createState() => _AssignmentsScreenState();
}

class _AssignmentsScreenState extends State<AssignmentsScreen> {
  String _selectedFilter = 'Tous';
  final List<String> _filters = ['Tous', 'À rendre', 'Rendus', 'Notés'];

  final List<Map<String, dynamic>> _assignments = [
    {
      'id': 'asg-01',
      'title': 'Projet Mini-Compilateur LLVM & Arbre Syntaxique Abstrait',
      'courseCode': 'INF4018',
      'courseName': 'Compilation & Théorie des Langages',
      'dueDate': '28 Octobre 2026',
      'dueTime': '23:59',
      'status': 'À rendre',
      'points': 20,
      'grade': null,
      'instructions': 'Implémenter l’analyseur lexical Flex et syntaxique Bison pour un sous-ensemble impératif. Dépôt de l’archive tar.gz et rapport PDF.',
      'teacher': 'Pr. Alain Mbarga',
      'submittedFile': null,
    },
    {
      'id': 'asg-02',
      'title': 'TP Noté : Réseau de Neurones Convolutif PyTorch sur CIFAR-10',
      'courseCode': 'ICT401',
      'courseName': 'Intelligence Artificielle & Deep Learning',
      'dueDate': '24 Octobre 2026',
      'dueTime': '18:00',
      'status': 'Rendu',
      'points': 20,
      'grade': null,
      'instructions': 'Architecture ResNet-18 personnalisée, courbe de convergence TensorBoard et matrice de confusion.',
      'teacher': 'Dr. Christian Fouda',
      'submittedFile': 'TP_DeepLearning_Marcel_Tessoh.pdf',
    },
    {
      'id': 'asg-03',
      'title': 'Étude de Cas : Modélisation Cryptographique & Audit de Smart Contracts',
      'courseCode': 'SIGL403',
      'courseName': 'Sécurité Logicielle & Cryptographie',
      'dueDate': '15 Octobre 2026',
      'dueTime': '12:00',
      'status': 'Noté',
      'points': 20,
      'grade': 18.5,
      'instructions': 'Étude approfondie des vulnérabilités de contrats intelligents et preuves ZKP.',
      'feedback': 'Excellente analyse des failles de réentrance et des preuves de connaissance nulle (ZKP).',
      'teacher': 'Pr. Emmanuel Ndoundam',
      'submittedFile': 'Rapport_Audit_Crypto_Final.pdf',
    },
    {
      'id': 'asg-04',
      'title': 'Devoir Maison : Optimisation de Requêtes Distribuées et Sharding',
      'courseCode': 'INF4022',
      'courseName': 'Systèmes de Données Massives & NoSQL',
      'dueDate': '02 Novembre 2026',
      'dueTime': '20:00',
      'status': 'À rendre',
      'points': 20,
      'grade': null,
      'instructions': 'Benchmark des performances MapReduce et clustering ClickHouse sur jeu de données de 50 Go.',
      'teacher': 'Dr. Jean-Pierre Kouam',
      'submittedFile': null,
    },
  ];

  void _submitAssignment(Map<String, dynamic> item) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.upload_file_rounded, color: Color(0xFF1E3A8A)),
            const SizedBox(width: 10),
            Expanded(child: Text('Déposer un devoir : ${item['courseCode']}')),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(item['title'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFCBD5E1), style: BorderStyle.solid),
              ),
              child: const Center(
                child: Column(
                  children: [
                    Icon(Icons.cloud_upload_outlined, size: 40, color: Color(0xFF2563EB)),
                    SizedBox(height: 8),
                    Text('Glissez-déposez votre archive ou fichier PDF ici', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                    Text('Format accepté : .pdf, .zip, .tar.gz (Max 100 Mo)', style: TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                  ],
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () {
              setState(() {
                item['status'] = 'Rendu';
                item['submittedFile'] = 'Devoir_${item['courseCode']}_Soumis.pdf';
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Devoir ${item['courseCode']} téléversé avec succès dans le BaaS Appwrite !'),
                  backgroundColor: const Color(0xFF0D9488),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1E3A8A),
              foregroundColor: Colors.white,
            ),
            child: const Text('Confirmer le dépôt'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _assignments.where((a) {
      if (_selectedFilter == 'Tous') return true;
      return a['status'] == _selectedFilter;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Padding(
        padding: const EdgeInsets.all(28.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // =================================================================
            // HERO BENTO SECTION - DEVOIRS & PROJETS ACADÉMIQUES
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
                              Icon(Icons.assignment_turned_in_rounded, size: 14, color: Color(0xFF67E8F9)),
                              SizedBox(width: 6),
                              Text(
                                'SUIVI PÉDAGOGIQUE LMD · EVALUATION CONTINUE',
                                style: TextStyle(
                                  color: Color(0xFF67E8F9),
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
                          'Devoirs & Projets Académiques',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Soumettez vos rapports de TP, devoirs sur table et projets semestriels avec horodatage cryptographique certifié.',
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
                    'assets/icons/nav/assignments.png',
                    width: 76,
                    height: 76,
                    errorBuilder: (_, __, ___) => const Icon(Icons.assignment_rounded, size: 70, color: Colors.white70),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Barre de filtres
            Row(
              children: [
                ..._filters.map((f) {
                  final active = _selectedFilter == f;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ChoiceChip(
                      label: Text(f),
                      selected: active,
                      onSelected: (_) => setState(() => _selectedFilter = f),
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
                Text(
                  '${filtered.length} devoir(s) affiché(s)',
                  style: const TextStyle(color: Color(0xFF64748B), fontSize: 12.5, fontWeight: FontWeight.w500),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Grille Bento des Devoirs
            Expanded(
              child: ListView.separated(
                itemCount: filtered.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (context, index) {
                  final item = filtered[index];
                  final status = item['status'] as String;

                  Color statusColor = const Color(0xFFF59E0B);
                  if (status == 'Rendu') statusColor = const Color(0xFF2563EB);
                  if (status == 'Noté') statusColor = const Color(0xFF10B981);

                  return Container(
                    padding: const EdgeInsets.all(20),
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
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E3A8A).withValues(alpha: 0.08),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                item['courseCode'],
                                style: const TextStyle(
                                  fontWeight: FontWeight.w900,
                                  fontSize: 12,
                                  color: Color(0xFF1E3A8A),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item['title'],
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A)),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${item['courseName']} · Enseignant : ${item['teacher']}',
                                    style: const TextStyle(color: Color(0xFF64748B), fontSize: 11.5),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: statusColor.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                              ),
                              child: Text(
                                status,
                                style: TextStyle(
                                  color: statusColor,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Text(
                          item['instructions'] as String? ?? item['feedback'] as String? ?? '',
                          style: const TextStyle(color: Color(0xFF475569), fontSize: 12.5, height: 1.4),
                        ),
                        const SizedBox(height: 16),
                        const Divider(color: Color(0xFFF1F5F9), height: 1),
                        const SizedBox(height: 14),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.schedule_rounded, size: 16, color: Color(0xFF64748B)),
                                const SizedBox(width: 6),
                                Text(
                                  'Échéance : ${item['dueDate']} à ${item['dueTime']}',
                                  style: const TextStyle(color: Color(0xFF64748B), fontSize: 11.5, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            if (status == 'Noté')
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFECFDF5),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  'Note obtenue : ${item['grade']} / ${item['points']}',
                                  style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF047857), fontSize: 12.5),
                                ),
                              )
                            else if (status == 'Rendu')
                              Row(
                                children: [
                                  const Icon(Icons.check_circle_rounded, size: 16, color: Color(0xFF10B981)),
                                  const SizedBox(width: 6),
                                  Text(
                                    item['submittedFile'] ?? 'Fichier déposé',
                                    style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              )
                            else
                              ElevatedButton.icon(
                                onPressed: () => _submitAssignment(item),
                                icon: const Icon(Icons.upload_file_rounded, size: 16),
                                label: const Text('Déposer mon travail', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF1E3A8A),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
