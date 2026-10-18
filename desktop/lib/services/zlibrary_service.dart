import 'dart:convert';
import 'package:http/http.dart' as http;

/// Modèle d'un livre Z-Library
class ZBook {
  final String id;
  final String title;
  final String author;
  final String year;
  final String publisher;
  final String extension;
  final String filesize;
  final String coverUrl;
  final String downloadUrl;

  ZBook({
    required this.id,
    required this.title,
    required this.author,
    required this.year,
    required this.publisher,
    required this.extension,
    required this.filesize,
    required this.coverUrl,
    required this.downloadUrl,
  });
}

/// Service de Bibliothèque Numérique Universitaire propulsé EXCLUSIVEMENT par Z-Library
class ZLibraryService {
  static const String _primaryBaseUrl = 'https://vps.kernelforge.codes/zlibrary/api';
  static const String _fallbackBaseUrl = 'http://5.189.146.147:7070/api';

  /// Recherche dans le catalogue Z-Library hébergé sur le VPS UniFlow
  static Future<List<ZBook>> searchBooks(String query) async {
    final cleanQuery = query.trim();

    // Tenter l'appel vers l'API VPS Z-Library (primaire puis fallback direct)
    final endpoints = [
      '$_primaryBaseUrl/books',
      '$_fallbackBaseUrl/books',
    ];

    for (final baseEndpoint in endpoints) {
      try {
        final uri = Uri.parse(baseEndpoint).replace(queryParameters: {
          'q': cleanQuery,
          'limit': '35',
        });

        final response =
            await http.get(uri).timeout(const Duration(seconds: 6));

        if (response.statusCode == 200) {
          final data = jsonDecode(utf8.decode(response.bodyBytes));
          final rawBooks = data is Map ? (data['books'] ?? data['results']) : null;
          if (rawBooks is List && rawBooks.isNotEmpty) {
            return rawBooks.map((b) {
              final id = b['id']?.toString() ?? '';
              final authors = b['authors'] is List
                  ? (b['authors'] as List).join(', ')
                  : (b['author']?.toString() ?? 'Auteur Universitaire');
              
              var dUrl = b['downloadUrl']?.toString() ?? '';
              if (dUrl.isEmpty || dUrl.startsWith('/api/books/download')) {
                dUrl = '$_primaryBaseUrl/books/download?id=${Uri.encodeComponent(id)}';
              }

              return ZBook(
                id: id,
                title: b['title']?.toString() ?? 'Titre académique',
                author: authors,
                year: b['year']?.toString() ?? '2025',
                publisher: b['publisher']?.toString() ?? 'Z-Library Edition',
                extension: b['format']?.toString() ?? 'PDF',
                filesize: b['size']?.toString() ?? '4.2 MB',
                coverUrl: b['coverUrl']?.toString() ?? (b['cover']?.toString() ?? ''),
                downloadUrl: dUrl,
              );
            }).toList();
          }
        }
      } catch (_) {
        // Essayer le fallback suivant
      }
    }

    // Repli de sécurité avec les ouvrages de référence pré-indexés
    if (cleanQuery.isEmpty) {
      return _getPopularAcademicBooks();
    }
    return _getPopularAcademicBooks().where((b) {
      final q = cleanQuery.toLowerCase();
      return b.title.toLowerCase().contains(q) ||
          b.author.toLowerCase().contains(q);
    }).toList();
  }

  /// Ouvrages académiques de référence Z-Library pour la Faculté des Sciences
  static List<ZBook> _getPopularAcademicBooks() {
    return [
      ZBook(
        id: 'zlib-cs-101',
        title: 'Structure and Interpretation of Computer Programs (SICP)',
        author: 'Harold Abelson, Gerald Jay Sussman, Julie Sussman',
        year: '1996',
        publisher: 'MIT Press',
        extension: 'PDF',
        filesize: '7.4 MB (Intégral MIT)',
        coverUrl: 'https://covers.openlibrary.org/b/id/8315182-M.jpg',
        downloadUrl: 'https://web.mit.edu/6.001/6.037/sicp.pdf',
      ),
      ZBook(
        id: 'zlib-cs-102',
        title: 'Automate the Boring Stuff with Python',
        author: 'Al Sweigart',
        year: '2015',
        publisher: 'No Starch Press',
        extension: 'PDF',
        filesize: '14.8 MB (Édition Complète)',
        coverUrl: 'https://covers.openlibrary.org/b/id/8282361-M.jpg',
        downloadUrl: 'https://archive.org/download/automatetheboringstuffwithpython_new/automatetheboringstuffwithpython_new.pdf',
      ),
      ZBook(
        id: 'zlib-cs-103',
        title: 'Deep Learning (Adaptive Computation and Machine Learning)',
        author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
        year: '2016',
        publisher: 'MIT Press',
        extension: 'PDF',
        filesize: '16.0 MB (MIT Press)',
        coverUrl: 'https://covers.openlibrary.org/b/id/8231856-M.jpg',
        downloadUrl: 'https://archive.org/download/deep-learning-collection-pdf/%28Adaptive%20Computation%20and%20Machine%20Learning%20series%29%20Ian%20Goodfellow%2C%20Yoshua%20Bengio%2C%20Aaron%20Courville%20-%20Deep%20Learning-The%20MIT%20Press%20%282016%29.pdf',
      ),
      ZBook(
        id: 'zlib-cs-104',
        title: 'Linux Basics for Hackers: Networking, Scripting & Security',
        author: 'OccupyTheWeb',
        year: '2018',
        publisher: 'No Starch Press',
        extension: 'PDF',
        filesize: '14.0 MB (Livre Complet)',
        coverUrl: 'https://covers.openlibrary.org/b/id/12683921-M.jpg',
        downloadUrl: 'https://archive.org/download/linux-basics-for-hackers/OccupyTheWeb%20-%20Linux%20Basics%20for%20Hackers%20%282018%29.pdf',
      ),
      ZBook(
        id: 'zlib-cs-105',
        title: 'Hacking: The Art of Exploitation (2nd Edition)',
        author: 'Jon Erickson',
        year: '2008',
        publisher: 'No Starch Press',
        extension: 'PDF',
        filesize: '4.0 MB (Livre Complet)',
        coverUrl: 'https://covers.openlibrary.org/b/id/8314112-M.jpg',
        downloadUrl: 'https://archive.org/download/HackingTheArtOfExploitation/Hacking%20-%20The%20Art%20of%20Exploitation_2nd%20Ed.pdf',
      ),
      ZBook(
        id: 'zlib-cs-106',
        title: 'The Voynich Manuscript: Complete High-Resolution Edition',
        author: 'Wilfrid Voynich, Beinecke Rare Book Library',
        year: '1912',
        publisher: 'Beinecke Rare Book Library',
        extension: 'PDF',
        filesize: '56.0 MB (Haute Résolution)',
        coverUrl: 'https://covers.openlibrary.org/b/id/8276189-M.jpg',
        downloadUrl: 'https://archive.org/download/TheVoynichManuscript/Voynich_Manuscript.pdf',
      ),
      ZBook(
        id: 'zlib-math-201',
        title: 'Calculus: Early Transcendentals (9th Edition)',
        author: 'James Stewart, Daniel K. Clegg, Saleem Watson',
        year: '2020',
        publisher: 'Cengage Learning',
        extension: 'PDF',
        filesize: '44.0 MB (1394 Pages)',
        coverUrl: 'https://covers.openlibrary.org/b/id/8521094-M.jpg',
        downloadUrl: 'https://archive.org/download/stewart-j.-clegg-d.-watson-s.-calculus.-early-transcendentals-9ed-2020/Stewart%20J.%2C%20Clegg%20D.%2C%20Watson%20S.%20Calculus.%20Early%20Transcendentals%209ed%202020.pdf',
      ),
      ZBook(
        id: 'zlib-math-202',
        title: 'Algèbre - Tome II : Analyse algébrique et équations',
        author: 'Émile Borel',
        year: '1905',
        publisher: 'Gauthier-Villars',
        extension: 'PDF',
        filesize: '30.8 MB (Édition Complète)',
        coverUrl: 'https://covers.openlibrary.org/b/id/8521094-M.jpg',
        downloadUrl: 'https://archive.org/download/AlgebreIi/AlgebreIi.pdf',
      ),
      ZBook(
        id: 'zlib-math-203',
        title: 'Dictionnaire des Mathématiques : Algèbre, Analyse, Géométrie',
        author: 'Alain Bouvier, Michel George, François Le Lionnais',
        year: '1993',
        publisher: 'PUF',
        extension: 'PDF',
        filesize: '47.6 MB (Manuel de Référence)',
        coverUrl: 'https://covers.openlibrary.org/b/id/8521094-M.jpg',
        downloadUrl: 'https://archive.org/download/dictionnaire-des-mathematiques-algebre-analyse-geometrie-pdf/Dictionnaire.Des.Mathematiques.Algebre.Analyse.Geometrie.pdf',
      ),
      ZBook(
        id: 'zlib-phys-301',
        title: 'Relativity: The Special and the General Theory',
        author: 'Albert Einstein',
        year: '1920',
        publisher: 'Methuen & Co',
        extension: 'PDF',
        filesize: '8.5 MB (Ouvrage Intégral)',
        coverUrl: 'https://covers.openlibrary.org/b/id/8231856-M.jpg',
        downloadUrl: 'https://archive.org/download/relativitythespe00einsuoft/relativitythespe00einsuoft.pdf',
      ),
      ZBook(
        id: 'zlib-law-401',
        title: 'Du contrat social ou Principes du droit politique',
        author: 'Jean-Jacques Rousseau',
        year: '1762',
        publisher: 'Marc-Michel Rey',
        extension: 'PDF',
        filesize: '2.6 MB (Texte Intégral)',
        coverUrl: 'https://covers.openlibrary.org/b/id/8276189-M.jpg',
        downloadUrl: 'https://archive.org/download/ducontratsocial00rousgoog/ducontratsocial00rousgoog.pdf',
      ),
      ZBook(
        id: 'zlib-econ-501',
        title: 'The Wealth of Nations (An Inquiry into Nature and Causes)',
        author: 'Adam Smith',
        year: '1776',
        publisher: 'W. Strahan and T. Cadell',
        extension: 'PDF',
        filesize: '35.8 MB (Édition Complète)',
        coverUrl: 'https://covers.openlibrary.org/b/id/8276189-M.jpg',
        downloadUrl: 'https://archive.org/download/wealthofnations00smituoft/wealthofnations00smituoft.pdf',
      ),
      ZBook(
        id: 'zlib-med-601',
        title: 'Anatomy of the Human Body (Gray’s Anatomy)',
        author: 'Henry Gray, Warren H. Lewis',
        year: '1918',
        publisher: 'Lea & Febiger',
        extension: 'PDF',
        filesize: '139.2 MB (Édition Illustrée)',
        coverUrl: 'https://covers.openlibrary.org/b/id/8231856-M.jpg',
        downloadUrl: 'https://archive.org/download/anatomyofhumanbo1918gray/anatomyofhumanbo1918gray.pdf',
      ),
      ZBook(
        id: 'zlib-lit-701',
        title: 'Les Misérables (Tome I à V - Édition Intégrale)',
        author: 'Victor Hugo',
        year: '1862',
        publisher: 'A. Lacroix, Verboeckhoven & Cie',
        extension: 'PDF',
        filesize: '17.0 MB (Texte Intégral)',
        coverUrl: 'https://covers.openlibrary.org/b/id/8276189-M.jpg',
        downloadUrl: 'https://archive.org/download/bub_gb_Oo0NAAAAQAAJ/bub_gb_Oo0NAAAAQAAJ.pdf',
      ),
      ZBook(
        id: 'zlib-lit-702',
        title: 'Discours de la méthode pour bien conduire sa raison',
        author: 'René Descartes',
        year: '1637',
        publisher: 'Jan Maire',
        extension: 'PDF',
        filesize: '5.5 MB (Texte Intégral)',
        coverUrl: 'https://covers.openlibrary.org/b/id/8276189-M.jpg',
        downloadUrl: 'https://archive.org/download/discoursdelamth00descgoog/discoursdelamth00descgoog.pdf',
      ),
      ZBook(
        id: 'zlib-lit-703',
        title: 'Don Quijote de la Mancha (Edición Completa)',
        author: 'Miguel de Cervantes Saavedra',
        year: '1605',
        publisher: 'Juan de la Cuesta',
        extension: 'PDF',
        filesize: '54.0 MB (Edición Crítica)',
        coverUrl: 'https://covers.openlibrary.org/b/id/8276189-M.jpg',
        downloadUrl: 'https://archive.org/download/donquijote00cervuoft/donquijote00cervuoft.pdf',
      ),
      ZBook(
        id: 'zlib-lit-704',
        title: 'Faust: Eine Tragödie (Erster und zweiter Teil)',
        author: 'Johann Wolfgang von Goethe',
        year: '1808',
        publisher: 'Cotta’sche Verlagsbuchhandlung',
        extension: 'PDF',
        filesize: '20.0 MB (Vollständige Ausgabe)',
        coverUrl: 'https://covers.openlibrary.org/b/id/8276189-M.jpg',
        downloadUrl: 'https://archive.org/download/faustpartsiii00goetuoft/faustpartsiii00goetuoft.pdf',
      ),
    ];
  }
}
