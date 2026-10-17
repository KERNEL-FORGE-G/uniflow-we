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
  List<ZBook> _books = [];
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _loadInitialBooks();
  }

  Future<void> _loadInitialBooks() async {
    setState(() => _loading = true);
    final results = await ZLibraryService.searchBooks('');
    if (mounted) {
      setState(() {
        _books = results;
        _loading = false;
      });
    }
  }

  Future<void> _search(String query) async {
    setState(() => _loading = true);
    final results = await ZLibraryService.searchBooks(query);
    if (mounted) {
      setState(() {
        _books = results;
        _loading = false;
      });
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // =================================================================
            // HERO BENTO SECTION - BIBLIOTHÈQUE NUMÉRIQUE Z-LIBRARY
            // =================================================================
            Container(
              padding: const EdgeInsets.all(24.0),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0B132B), Color(0xFF1E3A8A), Color(0xFF0D9488)],
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
                                errorBuilder: (_, __, ___) => const Icon(Icons.local_library_rounded, color: Color(0xFF67E8F9), size: 14),
                              ),
                              const SizedBox(width: 6),
                              const Text(
                                '100% Z-LIBRARY API · MANUELS & RECHERCHE SCIENTIFIQUE',
                                style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'Bibliothèque Numérique Z-Library · Officiel',
                          style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Recherche et téléchargement direct de manuels académiques d\'informatique, mathématiques, intelligence artificielle et génie logiciel.',
                          style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 12.5, height: 1.45),
                        ),
                        const SizedBox(height: 14),
                        Wrap(
                          spacing: 12,
                          runSpacing: 8,
                          children: [
                            _buildHeroTag('Catalogue Z-Library', '${_books.length} ouvrages chargés'),
                            _buildHeroTag('Formats PDF/EPUB', 'Accès intégral étudiant'),
                            _buildHeroTag('Téléchargement Direct', 'Mirrors vérifiés'),
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
                        errorBuilder: (_, __, ___) => const Icon(Icons.menu_book_rounded, color: Colors.white, size: 48),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Barre de Recherche
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    onSubmitted: _search,
                    decoration: InputDecoration(
                      hintText: 'Rechercher un ouvrage, auteur, algorithme, intelligence artificielle...',
                      prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF94A3B8)),
                      filled: true,
                      fillColor: Colors.white,
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
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Grille des livres
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator(color: Color(0xFF1E3A8A)))
                  : _books.isEmpty
                      ? const Center(child: Text('Aucun ouvrage trouvé dans le catalogue Z-Library.'))
                      : GridView.builder(
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 3,
                            crossAxisSpacing: 16,
                            mainAxisSpacing: 16,
                            childAspectRatio: 1.6,
                          ),
                          itemCount: _books.length,
                          itemBuilder: (context, index) {
                            final book = _books[index];
                            return _buildBookCard(book);
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroTag(String title, String val) {
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
          Text('$title : ', style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11)),
          Text(val, style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildBookCard(ZBook book) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Couverture
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Container(
              width: 70,
              height: 95,
              decoration: BoxDecoration(
                color: const Color(0xFF1E3A8A).withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: book.coverUrl.isNotEmpty
                  ? Image.network(
                      book.coverUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const Center(
                        child: Icon(Icons.menu_book_rounded, color: Color(0xFF1E3A8A), size: 30),
                      ),
                    )
                  : const Center(
                      child: Icon(Icons.book_rounded, color: Color(0xFF1E3A8A), size: 30),
                    ),
            ),
          ),
          const SizedBox(width: 14),

          // Infos
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
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      book.author,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 4),
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
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${book.extension} · ${book.filesize}',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1E3A8A)),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.download_rounded, size: 18, color: Color(0xFF0D9488)),
                      onPressed: () async {
                        final uri = Uri.parse(book.downloadUrl);
                        if (await canLaunchUrl(uri)) {
                          await launchUrl(uri, mode: LaunchMode.externalApplication);
                        }
                      },
                      tooltip: 'Télécharger via Z-Library',
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
}
