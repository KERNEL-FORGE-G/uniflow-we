import 'package:flutter/material.dart';

class DirectoryScreen extends StatefulWidget {
  const DirectoryScreen({super.key});

  @override
  State<DirectoryScreen> createState() => _DirectoryScreenState();
}

class _DirectoryScreenState extends State<DirectoryScreen> {
  String _activeTab = 'students'; // 'students', 'teachers'
  String _searchQuery = '';
  String _filiereFilter = 'Toutes';

  final List<Map<String, dynamic>> _teachers = [
    {
      'name': 'Prof. Melatagia Yonta',
      'title': 'Professeur Titulaire des Universités',
      'department': 'Département d\'Informatique · Faculté des Sciences',
      'specialty': 'Génie Logiciel Avancé & Systèmes Distribués (INF4067)',
      'email': 'melatagia.yonta@uniflow.cm',
      'office': 'Bureau C102 Bloc Enseignants',
      'courses': ['INF4067', 'INF3012', 'M1-GL'],
      'avatar': 'assets/icons/nav/teacher.png',
    },
    {
      'name': 'Dr. Tapamo',
      'title': 'Maître de Conférences',
      'department': 'Département d\'Informatique · Faculté des Sciences',
      'specialty': 'Sécurité Informatique, Cryptographie & Réseaux (INF4077)',
      'email': 'tapamo.securite@uniflow.cm',
      'office': 'Laboratoire C205',
      'courses': ['INF4077', 'ICT312'],
      'avatar': 'assets/icons/nav/teachers.png',
    },
    {
      'name': 'Prof. Atsa Etoundi',
      'title': 'Professeur & Chef de Département',
      'department': 'Département d\'Informatique · UY1',
      'specialty': 'Intelligence Artificielle & Apprentissage Automatique (ICT308)',
      'email': 'atsa.etoundi@uniflow.cm',
      'office': 'Bureau Décanat Sciences',
      'courses': ['ICT308', 'INF4099'],
      'avatar': 'assets/icons/nav/teacher.png',
    },
    {
      'name': 'Dr. Nlong',
      'title': 'Chargé de Cours',
      'department': 'Télécommunications & Réseaux Mobiles',
      'specialty': 'Systèmes Embarqués & Protocoles Sans-Fil (ICT312)',
      'email': 'nlong.telecom@uniflow.cm',
      'office': 'Salle Réseaux S12',
      'courses': ['ICT312', 'INF3022'],
      'avatar': 'assets/icons/nav/teachers.png',
    },
    {
      'name': 'M. Fotsing',
      'title': 'Assistant Pédagogique',
      'department': 'Département d\'Informatique',
      'specialty': 'Bases de Données & Architectures NoSQL (INF3017)',
      'email': 'fotsing.bdd@uniflow.cm',
      'office': 'Salle Serveurs Amphi 250',
      'courses': ['INF3017'],
      'avatar': 'assets/icons/nav/teacher.png',
    },
  ];

  final List<Map<String, dynamic>> _students = [
    {
      'name': 'Marcel Tessoh',
      'matricule': '21T2044',
      'filiere': 'ICT4D',
      'level': 'Licence 3',
      'email': 'etudiant.uy1@uniflow.cm',
      'gpa': 'GPA 3.82',
      'status': 'Inscrit Régulier',
      'avatar': 'assets/illustrations/photo_4_2026-10-02_13-20-47.jpg',
    },
    {
      'name': 'Ravel Nghomsi Feukouo',
      'matricule': '21T2045',
      'filiere': 'ICT4D',
      'level': 'Licence 3',
      'email': 'ravelnghomsi@gmail.com',
      'gpa': 'GPA 3.94',
      'status': 'Délégué de Filière',
      'avatar': 'assets/illustrations/photo_1_2026-10-02_13-20-47.jpg',
    },
    {
      'name': 'Sandra Febnchak Borelle',
      'matricule': '21T2098',
      'filiere': 'ICT4D',
      'level': 'Licence 3',
      'email': 'sandraborelle0@gmail.com',
      'gpa': 'GPA 3.88',
      'status': 'Inscrite Régulière',
      'avatar': 'assets/illustrations/photo_3_2026-10-02_13-20-47.jpg',
    },
    {
      'name': 'Hassane Youssouf Oumar',
      'matricule': '21T2102',
      'filiere': 'Génie Informatique',
      'level': 'Licence 3',
      'email': 'h.hawadja1@gmail.com',
      'gpa': 'GPA 3.79',
      'status': 'Inscrit Régulier',
      'avatar': 'assets/illustrations/photo_2_2026-10-02_13-20-47.jpg',
    },
    {
      'name': 'Ivan Tsafack Junior',
      'matricule': '21T2140',
      'filiere': 'Sécurité Réseaux',
      'level': 'Licence 3',
      'email': 'ivan.tsafack@kernelforge.codes',
      'gpa': 'GPA 3.75',
      'status': 'Inscrit Régulier',
      'avatar': 'assets/illustrations/photo_5_2026-10-02_13-20-47.jpg',
    },
    {
      'name': 'Christian Pouani',
      'matricule': '21T2188',
      'filiere': 'Systèmes Embarqués',
      'level': 'Licence 3',
      'email': 'christian.pouani@kernelforge.codes',
      'gpa': 'GPA 3.80',
      'status': 'Inscrit Régulier',
      'avatar': 'assets/illustrations/photo_6_2026-10-02_13-20-47.jpg',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filteredStudents = _students.where((s) {
      final matchQ = s['name'].toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
          s['matricule'].toString().toLowerCase().contains(_searchQuery.toLowerCase());
      final matchF = _filiereFilter == 'Toutes' || s['filiere'] == _filiereFilter;
      return matchQ && matchF;
    }).toList();

    final filteredTeachers = _teachers.where((t) {
      return t['name'].toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
          t['specialty'].toString().toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();

    return Container(
      color: const Color(0xFF0B132B),
      child: ListView(
        padding: const EdgeInsets.all(28),
        children: [
          // =================================================================
          // HERO BENTO SECTION : ANNUAIRE CAMPUS UY1
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
                            Icon(Icons.badge_rounded, color: Color(0xFF67E8F9), size: 16),
                            SizedBox(width: 8),
                            Text(
                              'Répertoire Académique Officiel · Université de Yaoundé 1',
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
                        'Annuaire des Étudiants & Corps Enseignant UY1',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Retrouvez facilement vos camarades de promotion, délégués et professeurs. Envoyez un message ou planifiez une séance de tutorat en direct.',
                        style: TextStyle(
                          color: Color(0xFFCBD5E1),
                          fontSize: 13.5,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Onglets Étudiants vs Enseignants
                      Row(
                        children: [
                          InkWell(
                            onTap: () => setState(() => _activeTab = 'students'),
                            borderRadius: BorderRadius.circular(14),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                              decoration: BoxDecoration(
                                color: _activeTab == 'students' ? const Color(0xFF0D9488) : Colors.white.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: _activeTab == 'students' ? const Color(0xFF2DD4BF) : Colors.white.withValues(alpha: 0.15),
                                ),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.school_rounded, color: Colors.white, size: 18),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Étudiants (${_students.length})',
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          InkWell(
                            onTap: () => setState(() => _activeTab = 'teachers'),
                            borderRadius: BorderRadius.circular(14),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                              decoration: BoxDecoration(
                                color: _activeTab == 'teachers' ? const Color(0xFF0D9488) : Colors.white.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: _activeTab == 'teachers' ? const Color(0xFF2DD4BF) : Colors.white.withValues(alpha: 0.15),
                                ),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.co_present_rounded, color: Colors.white, size: 18),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Enseignants & Chercheurs (${_teachers.length})',
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
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
                const SizedBox(width: 24),

                // Illustration 3D
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
                      _activeTab == 'students' ? 'assets/icons/nav/students.png' : 'assets/icons/nav/teachers.png',
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const Icon(Icons.people, size: 60, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // =================================================================
          // BARRE DE RECHERCHE & FILTRES
          // =================================================================
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    onChanged: (v) => setState(() => _searchQuery = v),
                    decoration: InputDecoration(
                      hintText: _activeTab == 'students'
                          ? 'Rechercher un étudiant par nom ou matricule...'
                          : 'Rechercher un enseignant ou une matière...',
                      hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                      prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF64748B), size: 18),
                      filled: true,
                      fillColor: const Color(0xFF1E293B),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                if (_activeTab == 'students') ...[
                  const SizedBox(width: 14),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: DropdownButton<String>(
                      value: _filiereFilter,
                      underline: const SizedBox(),
                      dropdownColor: const Color(0xFF1E293B),
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                      items: ['Toutes', 'ICT4D', 'Génie Informatique', 'Sécurité Réseaux', 'Systèmes Embarqués']
                          .map((f) => DropdownMenuItem(value: f, child: Text(f)))
                          .toList(),
                      onChanged: (v) => setState(() => _filiereFilter = v!),
                    ),
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 20),

          // =================================================================
          // LISTE DES RÉSULTATS BENTO
          // =================================================================
          if (_activeTab == 'students')
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: filteredStudents.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                mainAxisExtent: 170,
              ),
              itemBuilder: (context, i) {
                final s = filteredStudents[i];
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.asset(
                          s['avatar'] as String,
                          width: 60,
                          height: 60,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            width: 60,
                            height: 60,
                            color: const Color(0xFF1E293B),
                            child: const Icon(Icons.person, color: Colors.white),
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              s['name'] as String,
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${s['matricule']} · ${s['filiere']}',
                              style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              s['level'] as String,
                              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    s['gpa'] as String,
                                    style: const TextStyle(color: Color(0xFF34D399), fontSize: 9.5, fontWeight: FontWeight.bold),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    s['status'] as String,
                                    style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 9.5),
                                    overflow: TextOverflow.ellipsis,
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
              },
            )
          else
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: filteredTeachers.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 18,
                mainAxisSpacing: 18,
                mainAxisExtent: 190,
              ),
              itemBuilder: (context, i) {
                final t = filteredTeachers[i];
                return Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: Image.asset(
                          t['avatar'] as String,
                          width: 48,
                          height: 48,
                          fit: BoxFit.contain,
                          errorBuilder: (_, __, ___) => const Icon(Icons.school, size: 40, color: Colors.white),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              t['name'] as String,
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              t['title'] as String,
                              style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              t['specialty'] as String,
                              style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Bureau : ${t['office']}',
                              style: const TextStyle(color: Color(0xFF64748B), fontSize: 10),
                            ),
                            const SizedBox(height: 6),
                            Wrap(
                              spacing: 6,
                              children: (t['courses'] as List<String>).map((c) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0D9488).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    c,
                                    style: const TextStyle(color: Color(0xFF2DD4BF), fontSize: 9.5, fontWeight: FontWeight.bold),
                                  ),
                                );
                              }).toList(),
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
    );
  }
}
