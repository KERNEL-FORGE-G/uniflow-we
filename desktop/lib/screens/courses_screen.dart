import 'package:flutter/material.dart';
import '../models/models.dart';
import '../data/sample_data.dart';

class CoursesScreen extends StatefulWidget {
  const CoursesScreen({super.key});

  @override
  State<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends State<CoursesScreen> {
  String _searchQuery = '';
  String _selectedFilter = 'Tous';
  final List<String> _filters = ['Tous', 'CM', 'TD', 'TP'];

  Color _parseColor(String hex) {
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xFF')));
    } catch (_) {
      return const Color(0xFF1E3A8A);
    }
  }

  void _showCourseDetailsModal(DesktopCourse course, Color color) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                course.code,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                course.name,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        content: SizedBox(
          width: 540,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Wrap(
                spacing: 12,
                runSpacing: 8,
                children: [
                  _buildModalBadge('Type', course.type, color),
                  _buildModalBadge('Volume Horaire', '${course.hours} heures', const Color(0xFF1E3A8A)),
                  _buildModalBadge('Crédits', '${course.credits} ECTS', const Color(0xFF0D9488)),
                  _buildModalBadge('Salle', course.classroom, const Color(0xFFEA580C)),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 12),
              const Text('Enseignant Titulaire :', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.person_pin_rounded, color: Color(0xFF1E3A8A), size: 20),
                  const SizedBox(width: 8),
                  Text(course.teacher, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                ],
              ),
              const SizedBox(height: 14),
              const Text('Progression du Programme LMD :', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
              const SizedBox(height: 6),
              Row(
                children: [
                  Expanded(
                    child: LinearProgressIndicator(
                      value: course.progressPercent / 100.0,
                      backgroundColor: const Color(0xFFE2E8F0),
                      valueColor: AlwaysStoppedAnimation<Color>(color),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text('${course.progressPercent}%', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                ],
              ),
              const SizedBox(height: 18),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.picture_as_pdf_rounded, color: Color(0xFFDC2626), size: 28),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Syllabus & Diapositives ${course.code}.pdf', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                          const Text('Disponible hors connexion · 14.8 Mo · Validé UY1', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                        ],
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Support de cours ${course.code} ouvert en lecture locale.'),
                            backgroundColor: const Color(0xFF0D9488),
                          ),
                        );
                      },
                      icon: const Icon(Icons.download_rounded, size: 14),
                      label: const Text('Ouvrir'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1E3A8A),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Fermer', style: TextStyle(color: Color(0xFF64748B))),
          ),
        ],
      ),
    );
  }

  Widget _buildModalBadge(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('$label: ', style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w600)),
          Text(value, style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = sampleCourses.where((c) {
      final matchesFilter =
          _selectedFilter == 'Tous' || c.type == _selectedFilter;
      final q = _searchQuery.toLowerCase();
      final matchesSearch = q.isEmpty ||
          c.name.toLowerCase().contains(q) ||
          c.code.toLowerCase().contains(q) ||
          c.teacher.toLowerCase().contains(q);
      return matchesFilter && matchesSearch;
    }).toList();

    final avgProgress = sampleCourses.isEmpty
        ? 0
        : (sampleCourses.map((c) => c.progressPercent).reduce((a, b) => a + b) /
                sampleCourses.length)
            .round();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // =================================================================
            // HERO BENTO SECTION - MES COURS & UE
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
                        Wrap(
                          spacing: 8,
                          runSpacing: 6,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.14),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                    color:
                                        Colors.white.withValues(alpha: 0.25)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Image.asset(
                                    'assets/icons/nav/courses.png',
                                    width: 16,
                                    height: 16,
                                    errorBuilder: (_, __, ___) => const Icon(
                                        Icons.menu_book_rounded,
                                        color: Color(0xFF67E8F9),
                                        size: 14),
                                  ),
                                  const SizedBox(width: 6),
                                  const Text(
                                    'SYLLABUS OFFICIEL FACULTÉ DES SCIENCES · UY1',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 10,
                                        fontWeight: FontWeight.w800),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981)
                                    .withValues(alpha: 0.25),
                                borderRadius: BorderRadius.circular(20),
                                border:
                                    Border.all(color: const Color(0xFF34D399)),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.cloud_done_rounded,
                                      color: Color(0xFF34D399), size: 13),
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
                          'Mes Cours & Unités d\'Enseignement',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Suivez vos Cours Magistraux (CM), Travaux Dirigés (TD) et Travaux Pratiques (TP) du Semestre LMD avec progression en temps réel et supports téléchargés en cache local résilient.',
                          style: TextStyle(
                              color: Color(0xFFCBD5E1),
                              fontSize: 12.5,
                              height: 1.45),
                        ),
                        const SizedBox(height: 16),
                        Wrap(
                          spacing: 12,
                          runSpacing: 8,
                          children: [
                            _buildHeroStatPill('UE Inscrites',
                                '${sampleCourses.length} Cours'),
                            _buildHeroStatPill('Crédits ECTS', '30 ECTS'),
                            _buildHeroStatPill(
                                'Progression', '$avgProgress% Moyenne'),
                            _buildHeroStatPill(
                                'Résilience', 'Cache Local Prêt'),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 20),
                  Container(
                    width: 115,
                    height: 115,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(
                          color: Colors.white.withValues(alpha: 0.25)),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: Image.asset(
                        'assets/illustrations/course_study_hero_3d.png',
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Icon(
                            Icons.school_rounded,
                            color: Colors.white,
                            size: 48),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Barre de Recherche et Filtres
            Row(
              children: [
                Expanded(
                  child: TextField(
                    onChanged: (val) => setState(() => _searchQuery = val),
                    decoration: InputDecoration(
                      hintText:
                          'Rechercher par matière, code UE, enseignant...',
                      prefixIcon: const Icon(Icons.search_rounded,
                          color: Color(0xFF94A3B8)),
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: const EdgeInsets.symmetric(
                          vertical: 0, horizontal: 16),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    children: _filters.map((filter) {
                      final isSelected = filter == _selectedFilter;
                      return InkWell(
                        onTap: () => setState(() => _selectedFilter = filter),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? const Color(0xFF1E3A8A)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            filter,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isSelected
                                  ? Colors.white
                                  : const Color(0xFF64748B),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Grille Bento des Cours
            Expanded(
              child: filtered.isEmpty
                  ? const Center(child: Text('Aucun cours trouvé'))
                  : GridView.builder(
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 3,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        childAspectRatio: 1.35,
                      ),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        final course = filtered[index];
                        final color = _parseColor(course.colorHex);

                        return InkWell(
                          onTap: () => _showCourseDetailsModal(course, color),
                          borderRadius: BorderRadius.circular(24),
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.025),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Top Bar Card
                              Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: color.withValues(alpha: 0.08),
                                  borderRadius: const BorderRadius.only(
                                    topLeft: Radius.circular(24),
                                    topRight: Radius.circular(24),
                                  ),
                                ),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: color,
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Text(
                                        course.code,
                                        style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(
                                            color: const Color(0xFFE2E8F0)),
                                      ),
                                      child: Text(
                                        course.type,
                                        style: TextStyle(
                                            color: color,
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              // Corps
                              Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      course.name,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF0F172A)),
                                    ),
                                    const SizedBox(height: 6),
                                    Row(
                                      children: [
                                        CircleAvatar(
                                          radius: 9,
                                          backgroundImage: AssetImage(
                                            index % 4 == 0
                                                ? 'assets/team/avatar_marcel_anime.jpg'
                                                : index % 4 == 1
                                                    ? 'assets/team/avatar_judith_anime.jpg'
                                                    : index % 4 == 2
                                                        ? 'assets/team/avatar_juvenal_anime.jpg'
                                                        : 'assets/team/avatar_ravel_founder.jpg',
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Expanded(
                                          child: Text(
                                            course.teacher,
                                            style: const TextStyle(
                                                fontSize: 12,
                                                color: Color(0xFF64748B)),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),

                                    // Progression
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        const Text('Progression',
                                            style: TextStyle(
                                                fontSize: 10,
                                                color: Color(0xFF94A3B8))),
                                        Text(
                                          '${course.progressPercent}%',
                                          style: const TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFF0F172A)),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    LinearProgressIndicator(
                                      value: course.progressPercent / 100.0,
                                      backgroundColor: const Color(0xFFE2E8F0),
                                      valueColor:
                                          AlwaysStoppedAnimation<Color>(color),
                                      borderRadius: BorderRadius.circular(4),
                                    ),

                                    const SizedBox(height: 12),
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          '${course.hours}h · ${course.credits} ECTS',
                                          style: const TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFF1E3A8A)),
                                        ),
                                        Text(
                                          course.classroom,
                                          style: const TextStyle(
                                              fontSize: 11,
                                              color: Color(0xFF0D9488),
                                              fontWeight: FontWeight.w600),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
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

  Widget _buildHeroStatPill(String label, String val) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.18)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('$label : ',
              style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11)),
          Text(val,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11.5,
                  fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
