import 'dart:io';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/zlibrary_service.dart';

class ZLibraryScreen extends StatefulWidget {
  const ZLibraryScreen({super.key});

  @override
  State<ZLibraryScreen> createState() => _ZLibraryScreenState();
}

class _ZLibraryScreenState extends State<ZLibraryScreen> {
  final TextEditingController _searchController = TextEditingController();
  int _activeTab = 0; // 0 = Supports de Cours Campus UY1, 1 = Manuels Z-Library
  
  List<CampusResource> _campusResources = [];
  List<ZBook> _books = [];
  bool _loading = false;
  final Set<String> _downloadingIds = <String>{};

  String _selectedCampusCategory = 'Tous';
  final List<String> _campusCategories = [
    'Tous',
    'Polycopié',
    'Travaux Dirigés',
    'Travaux Pratiques',
    'Annales d’examens',
    'Mémoires',
  ];

  @override
  void initState() {
    super.initState();
    _loadAll();
  }

  Future<void> _loadAll() async {
    setState(() => _loading = true);
    final campus = await ZLibraryService.fetchCampusResources('');
    final books = await ZLibraryService.searchBooks('');
    if (mounted) {
      setState(() {
        _campusResources = campus;
        _books = books;
        _loading = false;
      });
    }
  }

  Future<void> _search(String query) async {
    setState(() => _loading = true);
    if (_activeTab == 0) {
      final campus = await ZLibraryService.fetchCampusResources(query);
      if (campus.isEmpty && query.trim().isNotEmpty) {
        final books = await ZLibraryService.searchBooks(query);
        if (mounted) {
          setState(() {
            _activeTab = 1;
            _books = books;
            _campusResources = campus;
            _loading = false;
          });
          return;
        }
      }
      if (mounted) setState(() { _campusResources = campus; _loading = false; });
    } else {
      final books = await ZLibraryService.searchBooks(query);
      if (mounted) setState(() { _books = books; _loading = false; });
    }
  }

  Future<void> _handleDownload({
    required String id,
    required String title,
    required String downloadUrl,
  }) async {
    if (_downloadingIds.contains(id)) return;
    setState(() => _downloadingIds.add(id));

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
            ),
            const SizedBox(width: 12),
            Expanded(child: Text('Téléchargement en cours : « $title »...')),
          ],
        ),
        duration: const Duration(seconds: 4),
        behavior: SnackBarBehavior.floating,
      ),
    );

    try {
      final safeFilename = '${title.replaceAll(RegExp(r'[^a-zA-Z0-9_\-\.]'), '_').trim()}.pdf';
      final file = await ZLibraryService.downloadFileToDisk(downloadUrl, safeFilename);

      if (mounted) {
        setState(() => _downloadingIds.remove(id));
        final exists = file != null && file.existsSync();
        if (exists) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: const Color(0xFF0D9488),
              content: Row(
                children: [
                  const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      '✓ « $title » enregistré dans Téléchargements !',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              action: SnackBarAction(
                label: 'Ouvrir',
                textColor: Colors.white,
                onPressed: () async {
                  try {
                    await launchUrl(Uri.file(file.path));
                  } catch (_) {
                    if (Platform.isLinux) {
                      Process.run('xdg-open', [file.path]);
                    }
                  }
                },
              ),
              duration: const Duration(seconds: 7),
              behavior: SnackBarBehavior.floating,
            ),
          );
        } else {
          // Si le téléchargement direct disque a échoué, ouvrir le lien dans le navigateur
          final uri = Uri.parse(downloadUrl);
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _downloadingIds.remove(id));
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.red.shade700,
            content: Text('Erreur de téléchargement : $e'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filteredCampus = _selectedCampusCategory == 'Tous'
        ? _campusResources
        : _campusResources.where((r) => r.category == _selectedCampusCategory).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // =================================================================
            // HERO BENTO SECTION - BIBLIOTHÈQUE NUMÉRIQUE & CAMPUS UY1
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
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Image.asset(
                                'assets/icons/nav/library.png',
                                width: 16,
                                height: 16,
                                errorBuilder: (_, __, ___) => const Icon(
                                  Icons.local_library_rounded,
                                  color: Color(0xFF67E8F9),
                                  size: 14,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Text(
                                'CAMPUS UY1 & 100% Z-LIBRARY API · MANUELS & POLICIES',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'Bibliothèque Universitaire · UniFlow Desktop',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Accédez à l\'intégralité des polycopiés officiels, fiches de TD/TP, annales d\'examens LMD de l\'Université de Yaoundé I et au catalogue Z-Library.',
                          style: TextStyle(
                            color: Color(0xFFCBD5E1),
                            fontSize: 12.5,
                            height: 1.45,
                          ),
                        ),
                        const SizedBox(height: 14),
                        Wrap(
                          spacing: 12,
                          runSpacing: 8,
                          children: [
                            _buildHeroTag(
                              'Supports Campus UY1',
                              '${_campusResources.length} ressources officielles',
                            ),
                            _buildHeroTag(
                              'Catalogue Z-Library',
                              '${_books.length} manuels scientifiques',
                            ),
                            _buildHeroTag(
                              'Téléchargement Direct',
                              'Enregistrement local automatique',
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 20),
                  Container(
                    width: 110,
                    height: 110,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: Image.asset(
                        'assets/illustrations/course_study_hero_3d.png',
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Icon(
                          Icons.menu_book_rounded,
                          color: Colors.white,
                          size: 48,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // =================================================================
            // SELECTEUR D'ONGLET PRINCIPAL (CAMPUS UY1 vs MANUELS Z-LIB)
            // =================================================================
            Row(
              children: [
                _buildTabButton(
                  index: 0,
                  label: 'Supports de Cours & Campus UY1',
                  count: _campusResources.length,
                  icon: Icons.school_rounded,
                ),
                const SizedBox(width: 10),
                _buildTabButton(
                  index: 1,
                  label: 'Manuels Numériques & Z-Library',
                  count: _books.length,
                  icon: Icons.menu_book_rounded,
                ),
              ],
            ),

            const SizedBox(height: 16),

            // =================================================================
            // BARRE DE RECHERCHE ET FILTRES CATÉGORIES
            // =================================================================
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    onSubmitted: _search,
                    decoration: InputDecoration(
                      hintText: _activeTab == 0
                          ? 'Rechercher un polycopié, TD, TP, annale d\'examen (ex: Algorithmique, BDD, ICT102)...'
                          : 'Rechercher un manuel Z-Library, auteur, sujet (ex: Python, Intelligence Artificielle)...',
                      prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF94A3B8)),
                      filled: true,
                      fillColor: Colors.white,
                      isDense: true,
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
                const SizedBox(width: 12),
                ElevatedButton.icon(
                  onPressed: () => _search(_searchController.text),
                  icon: const Icon(Icons.search_rounded, size: 16),
                  label: const Text('Rechercher'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E3A8A),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ],
            ),

            if (_activeTab == 0) ...[
              const SizedBox(height: 12),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _campusCategories.map((cat) {
                    final selected = _selectedCampusCategory == cat;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: FilterChip(
                        label: Text(cat),
                        selected: selected,
                        onSelected: (_) {
                          setState(() => _selectedCampusCategory = cat);
                        },
                        selectedColor: const Color(0xFF1E3A8A),
                        labelStyle: TextStyle(
                          color: selected ? Colors.white : const Color(0xFF475569),
                          fontWeight: selected ? FontWeight.bold : FontWeight.w500,
                          fontSize: 12,
                        ),
                        backgroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                          side: BorderSide(
                            color: selected ? const Color(0xFF1E3A8A) : const Color(0xFFE2E8F0),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],

            const SizedBox(height: 16),

            // =================================================================
            // GRILLE DE CONTENU SELON L'ONGLET ACTIF
            // =================================================================
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator(color: Color(0xFF1E3A8A)))
                  : _activeTab == 0
                      ? filteredCampus.isEmpty
                          ? const Center(child: Text('Aucun document de cours trouvé.'))
                          : GridView.builder(
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 3,
                                crossAxisSpacing: 16,
                                mainAxisSpacing: 16,
                                childAspectRatio: 2.1,
                              ),
                              itemCount: filteredCampus.length,
                              itemBuilder: (context, index) {
                                return _buildCampusCard(filteredCampus[index]);
                              },
                            )
                      : _books.isEmpty
                          ? const Center(child: Text('Aucun ouvrage trouvé dans le catalogue Z-Library.'))
                          : GridView.builder(
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 3,
                                crossAxisSpacing: 16,
                                mainAxisSpacing: 16,
                                childAspectRatio: 2.3,
                              ),
                              itemCount: _books.length,
                              itemBuilder: (context, index) {
                                return _buildBookCard(_books[index]);
                              },
                            ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabButton({
    required int index,
    required String label,
    required int count,
    required IconData icon,
  }) {
    final active = _activeTab == index;
    return InkWell(
      onTap: () {
        setState(() {
          _activeTab = index;
          _searchController.clear();
        });
        _search('');
      },
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
        decoration: BoxDecoration(
          color: active ? const Color(0xFF1E3A8A) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: active ? const Color(0xFF1E3A8A) : const Color(0xFFE2E8F0),
          ),
          boxShadow: active
              ? [
                  BoxShadow(
                    color: const Color(0xFF1E3A8A).withValues(alpha: 0.18),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: active ? Colors.white : const Color(0xFF64748B)),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: active ? Colors.white : const Color(0xFF334155),
                fontSize: 13,
                fontWeight: active ? FontWeight.bold : FontWeight.w600,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(
                color: active ? Colors.white.withValues(alpha: 0.2) : const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '$count',
                style: TextStyle(
                  color: active ? Colors.white : const Color(0xFF475569),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroTag(String title, String subtitle) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Color(0xFF67E8F9),
              fontSize: 10,
              fontWeight: FontWeight.w700,
            ),
          ),
          Text(
            subtitle,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 11.5,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCampusCard(CampusResource res) {
    final isDownloading = _downloadingIds.contains(res.id);
    return Container(
      padding: const EdgeInsets.all(14),
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
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: _typeColor(res.type).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              _typeIcon(res.type),
              color: _typeColor(res.type),
              size: 24,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            res.category.toUpperCase(),
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              color: _typeColor(res.type),
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            res.course,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF64748B),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 5),
                    Text(
                      res.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0F172A),
                        height: 1.25,
                      ),
                    ),
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      res.size,
                      style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                    ),
                    IconButton(
                      icon: isDownloading
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Color(0xFF0D9488),
                              ),
                            )
                          : const Icon(Icons.download_rounded, size: 20, color: Color(0xFF0D9488)),
                      onPressed: isDownloading
                          ? null
                          : () => _handleDownload(
                                id: res.id,
                                title: res.title,
                                downloadUrl: res.downloadUrl,
                              ),
                      tooltip: 'Télécharger le document officiel (PDF)',
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookCard(ZBook book) {
    final isDownloading = _downloadingIds.contains(book.id);
    return Container(
      padding: const EdgeInsets.all(12),
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
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Container(
              width: 65,
              height: 90,
              decoration: BoxDecoration(
                color: const Color(0xFF1E3A8A).withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: book.coverUrl.isNotEmpty
                  ? (book.coverUrl.startsWith('assets/')
                      ? Image.asset(
                          book.coverUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => const Center(
                            child: Icon(Icons.menu_book_rounded, color: Color(0xFF1E3A8A), size: 28),
                          ),
                        )
                      : Image.network(
                          book.coverUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => const Center(
                            child: Icon(Icons.menu_book_rounded, color: Color(0xFF1E3A8A), size: 28),
                          ),
                        ))
                  : const Center(
                      child: Icon(Icons.book_rounded, color: Color(0xFF1E3A8A), size: 28),
                    ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      book.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0F172A),
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      book.author,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${book.year} · ${book.publisher}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                    ),
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '${book.extension} · ${book.filesize}',
                        style: const TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1E3A8A),
                        ),
                      ),
                    ),
                    IconButton(
                      icon: isDownloading
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Color(0xFF0D9488),
                              ),
                            )
                          : const Icon(Icons.download_rounded, size: 20, color: Color(0xFF0D9488)),
                      onPressed: isDownloading
                          ? null
                          : () => _handleDownload(
                                id: book.id,
                                title: book.title,
                                downloadUrl: book.downloadUrl,
                              ),
                      tooltip: 'Télécharger le manuel intégral (PDF)',
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _typeColor(String type) {
    switch (type.toUpperCase()) {
      case 'COURS':
        return const Color(0xFF1E3A8A);
      case 'TD':
        return const Color(0xFF0D9488);
      case 'TP':
        return const Color(0xFFF59E0B);
      case 'ANNALE':
        return const Color(0xFFDC2626);
      case 'MEMOIRE':
        return const Color(0xFF7C3AED);
      default:
        return const Color(0xFF2563EB);
    }
  }

  IconData _typeIcon(String type) {
    switch (type.toUpperCase()) {
      case 'COURS':
        return Icons.menu_book_rounded;
      case 'TD':
        return Icons.edit_note_rounded;
      case 'TP':
        return Icons.terminal_rounded;
      case 'ANNALE':
        return Icons.history_edu_rounded;
      case 'MEMOIRE':
        return Icons.workspace_premium_rounded;
      default:
        return Icons.description_rounded;
    }
  }
}
