import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class CampusNewsItem {
  final String id;
  final String title;
  final String category; // Annonces, Images, Vidéos, Documents
  final String author;
  final String authorRole;
  final String date;
  final String content;
  final bool isPinned;
  final String? imageAsset;
  final String? imageCaption;
  final String? videoTitle;
  final String? videoDuration;
  final String? videoUrl;
  final String? documentTitle;
  final String? documentSize;
  final String? externalLink;
  int likes;
  bool isLiked;

  CampusNewsItem({
    required this.id,
    required this.title,
    required this.category,
    required this.author,
    required this.authorRole,
    required this.date,
    required this.content,
    this.isPinned = false,
    this.imageAsset,
    this.imageCaption,
    this.videoTitle,
    this.videoDuration,
    this.videoUrl,
    this.documentTitle,
    this.documentSize,
    this.externalLink,
    this.likes = 0,
    this.isLiked = false,
  });
}

class ActualitesScreen extends StatefulWidget {
  const ActualitesScreen({super.key});

  @override
  State<ActualitesScreen> createState() => _ActualitesScreenState();
}

class _ActualitesScreenState extends State<ActualitesScreen> {
  String _selectedCategory = 'Tout';
  String _searchQuery = '';
  final List<String> _categories = ['Tout', 'Annonces', 'Images', 'Vidéos', 'Documents'];

  final List<CampusNewsItem> _newsItems = [
    CampusNewsItem(
      id: 'news-beta-pinned',
      title: 'Plateforme UniFlow en phase de test bêta — Des améliorations majeures arrivent !',
      category: 'Annonces',
      author: 'Direction Technique KERNEL FORGE & Rectorat UY1',
      authorRole: 'Communiqué Officiel Épinglé',
      date: 'Aujourd\'hui · Octobre 2026',
      isPinned: true,
      content:
          'Chers étudiants et enseignants de l\'Université de Yaoundé I,\n\n'
          'La plateforme académique unifiée UniFlow (Web, Desktop & Mobile) est actuellement déployée en phase de test bêta ouverte sur le campus de Ngoa-Ekellé. '
          'Cette version introduit notre nouvelle identité visuelle Pinterest Bento Grid & 3D Hero, le serveur de visioconférence P2P local sans installation, '
          'l\'intégration directe de la bibliothèque numérique Z-Library, ainsi que le nouveau service de messagerie institutionnelle sécurisée UniMail (@uniflow.cm).\n\n'
          'Vos retours d\'expérience nous permettent d\'affiner chaque module en continu. Des améliorations majeures de performance, de synchronisation hors-ligne et d\'intelligence artificielle (Uni Copilot GROQ) arrivent très prochainement !',
      imageAsset: 'assets/illustrations/about_campus_hero.png',
      imageCaption: 'Déploiement pilote UniFlow Bêta sur le campus de la Faculté des Sciences — Université de Yaoundé I.',
      videoTitle: 'Présentation Vidéo : Nouveautés UniFlow Bêta & Architecture Hybride',
      videoDuration: '04:35 · 1080p HD',
      videoUrl: 'https://uniflow.cm/beta-keynote',
      documentTitle: 'Feuille_de_Route_UniFlow_Beta_2026_UY1.pdf',
      documentSize: '2.4 MB · PDF Signé',
      externalLink: 'https://uniflow.cm/roadmap',
      likes: 248,
      isLiked: true,
    ),
    CampusNewsItem(
      id: 'news-2',
      title: 'Calendrier officiel des examens de fin de Premier Semestre (L1, L2, L3, Master)',
      category: 'Documents',
      author: 'Vice-Doyen chargé de la Programmation et du Suivi Académique',
      authorRole: 'Faculté des Sciences · UY1',
      date: 'Il y a 2 heures',
      content:
          'Le calendrier révisé des évaluations de fin de semestre et la répartition par amphithéâtre (Amphi 1001, Amphi 501, Amphi 250 et Bloc Pédagogique) sont désormais disponibles en téléchargement. Veuillez vérifier vos codes UE et vos créneaux horaires.',
      documentTitle: 'Calendrier_Examens_S1_FacSciences_UY1_2026.pdf',
      documentSize: '1.8 MB · PDF Officiel',
      externalLink: 'https://uy1.uninet.cm/examens-s1',
      likes: 112,
    ),
    CampusNewsItem(
      id: 'news-3',
      title: 'Inauguration du nouveau Laboratoire IA & Systèmes Embarqués Sentinelle',
      category: 'Images',
      author: 'Département d\'Informatique & ICT4D',
      authorRole: 'Vie de Campus',
      date: 'Hier · 16:30',
      content:
          'Découvrez en images les nouvelles stations de travail GPU et les bancs d\'essai IoT mis à la disposition des étudiants de Licence 3 et Master pour leurs projets intégrateurs et travaux pratiques.',
      imageAsset: 'assets/illustrations/about_team_lab.png',
      imageCaption: 'Séance inaugurale au Laboratoire IA & IoT avec les étudiants de la filière ICT4D.',
      likes: 94,
    ),
    CampusNewsItem(
      id: 'news-4',
      title: 'Replay Masterclass : Architectures Distribuées & Sécurité Cryptographique',
      category: 'Vidéos',
      author: 'Prof. Melatagia Yonta & Dr. Tapamo',
      authorRole: 'Séminaire Académique INF4067 / INF4077',
      date: '14 Octobre 2026',
      content:
          'Retrouvez l\'enregistrement intégral de la conférence conjointe sur la résilience des systèmes distribués et la signature numérique des diplômes et courriels universitaires.',
      imageAsset: 'assets/illustrations/course_study_hero_3d.png',
      imageCaption: 'Support visuel 3D du séminaire conjoint Génie Logiciel & Cryptographie.',
      videoTitle: 'Masterclass_Architectures_Distribuees_UY1.mp4',
      videoDuration: '58:12 · Replay Amphi 501',
      videoUrl: 'https://uniflow.cm/visio/replay-inf4067',
      documentTitle: 'Slides_Masterclass_INF4067_Cryptographie.pdf',
      documentSize: '5.1 MB · Support CM',
      likes: 167,
    ),
  ];

  void _openPublishModal() {
    final titleCtrl = TextEditingController();
    final contentCtrl = TextEditingController();
    final captionCtrl = TextEditingController();
    final linkCtrl = TextEditingController();
    final docCtrl = TextEditingController();
    String selectedCat = 'Annonces';
    String selectedAsset = 'assets/illustrations/about_campus_hero.png';
    bool includeImage = true;

    final availableAssets = [
      'assets/illustrations/about_campus_hero.png',
      'assets/illustrations/about_team_lab.png',
      'assets/illustrations/course_study_hero_3d.png',
      'assets/illustrations/schedule_calendar_hero_3d.png',
      'assets/illustrations/library.jpg',
    ];

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Dialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              child: Container(
                width: 620,
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E3A8A).withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Image.asset(
                              'assets/icons/nav/analytics.png',
                              width: 28,
                              height: 28,
                              errorBuilder: (_, __, ___) => const Icon(Icons.campaign_rounded, color: Color(0xFF1E3A8A)),
                            ),
                          ),
                          const SizedBox(width: 14),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Publier une Actualité Officielle (Admin)',
                                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                                ),
                                Text(
                                  'Diffusion instantanée sur le fil Campus UniFlow (Texte, Image, Vidéo, PDF ou Lien)',
                                  style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            onPressed: () => Navigator.of(ctx).pop(),
                            icon: const Icon(Icons.close_rounded),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      DropdownButtonFormField<String>(
                        initialValue: selectedCat,
                        decoration: InputDecoration(
                          labelText: 'Catégorie de publication',
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        items: ['Annonces', 'Images', 'Vidéos', 'Documents']
                            .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                            .toList(),
                        onChanged: (val) {
                          if (val != null) setModalState(() => selectedCat = val);
                        },
                      ),
                      const SizedBox(height: 14),
                      TextField(
                        controller: titleCtrl,
                        decoration: InputDecoration(
                          labelText: 'Titre de l\'actualité *',
                          hintText: 'Ex: Ouverture des inscriptions au Hackathon Kernel Forge...',
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                      const SizedBox(height: 14),
                      TextField(
                        controller: contentCtrl,
                        maxLines: 4,
                        decoration: InputDecoration(
                          labelText: 'Contenu détaillé de l\'annonce *',
                          hintText: 'Rédigez le corps du communiqué officiel...',
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                      const SizedBox(height: 14),
                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        title: const Text('Joindre une illustration avec légende', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        value: includeImage,
                        activeThumbColor: const Color(0xFF0D9488),
                        onChanged: (v) => setModalState(() => includeImage = v),
                      ),
                      if (includeImage) ...[
                        DropdownButtonFormField<String>(
                          initialValue: selectedAsset,
                          decoration: InputDecoration(
                            labelText: 'Visuel Campus',
                            filled: true,
                            fillColor: const Color(0xFFF8FAFC),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          items: availableAssets
                              .map((a) => DropdownMenuItem(value: a, child: Text(a.split('/').last)))
                              .toList(),
                          onChanged: (val) {
                            if (val != null) setModalState(() => selectedAsset = val);
                          },
                        ),
                        const SizedBox(height: 10),
                        TextField(
                          controller: captionCtrl,
                          decoration: InputDecoration(
                            labelText: 'Légende de l\'image',
                            hintText: 'Ex: Vue de l\'amphithéâtre 501 lors de la présentation...',
                            filled: true,
                            fillColor: const Color(0xFFF8FAFC),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                        ),
                      ],
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: docCtrl,
                              decoration: InputDecoration(
                                labelText: 'Document PDF joint (optionnel)',
                                hintText: 'Ex: Note_Officielle_UY1.pdf',
                                prefixIcon: const Icon(Icons.picture_as_pdf_rounded, size: 18),
                                filled: true,
                                fillColor: const Color(0xFFF8FAFC),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextField(
                              controller: linkCtrl,
                              decoration: InputDecoration(
                                labelText: 'Lien ou Vidéo URL (optionnel)',
                                hintText: 'https://uniflow.cm/...',
                                prefixIcon: const Icon(Icons.link_rounded, size: 18),
                                filled: true,
                                fillColor: const Color(0xFFF8FAFC),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 22),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton(
                            onPressed: () => Navigator.of(ctx).pop(),
                            child: const Text('Annuler'),
                          ),
                          const SizedBox(width: 12),
                          ElevatedButton.icon(
                            onPressed: () {
                              if (titleCtrl.text.trim().isEmpty || contentCtrl.text.trim().isEmpty) {
                                return;
                              }
                              setState(() {
                                _newsItems.insert(
                                  1,
                                  CampusNewsItem(
                                    id: 'news-${DateTime.now().millisecondsSinceEpoch}',
                                    title: titleCtrl.text.trim(),
                                    category: selectedCat,
                                    author: 'Administration Campus UY1',
                                    authorRole: 'Publication Directe',
                                    date: 'À l\'instant',
                                    content: contentCtrl.text.trim(),
                                    imageAsset: includeImage ? selectedAsset : null,
                                    imageCaption: includeImage && captionCtrl.text.trim().isNotEmpty
                                        ? captionCtrl.text.trim()
                                        : (includeImage ? 'Illustration officielle UniFlow Campus' : null),
                                    documentTitle: docCtrl.text.trim().isNotEmpty ? docCtrl.text.trim() : null,
                                    documentSize: docCtrl.text.trim().isNotEmpty ? '1.2 MB · PDF' : null,
                                    externalLink: linkCtrl.text.trim().isNotEmpty ? linkCtrl.text.trim() : null,
                                    videoTitle: selectedCat == 'Vidéos' ? ' Capsule Vidéo Campus HD' : null,
                                    videoDuration: selectedCat == 'Vidéos' ? '03:20 · Direct' : null,
                                    likes: 1,
                                  ),
                                );
                              });
                              Navigator.of(ctx).pop();
                              ScaffoldMessenger.of(this.context).showSnackBar(
                                const SnackBar(
                                  content: Text('Actualité officielle publiée avec succès sur le fil Campus !'),
                                  backgroundColor: Color(0xFF0D9488),
                                ),
                              );
                            },
                            icon: const Icon(Icons.publish_rounded, size: 18),
                            label: const Text('Publier maintenant'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF1E3A8A),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredNews = _newsItems.where((item) {
      final matchesCategory = _selectedCategory == 'Tout' || item.category == _selectedCategory;
      final q = _searchQuery.toLowerCase();
      final matchesSearch = q.isEmpty ||
          item.title.toLowerCase().contains(q) ||
          item.content.toLowerCase().contains(q) ||
          item.author.toLowerCase().contains(q);
      return matchesCategory && matchesSearch;
    }).toList();

    final pinnedItem = filteredNews.where((i) => i.isPinned).firstOrNull;
    final otherItems = filteredNews.where((i) => !i.isPinned).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // =================================================================
            // 3D HERO BENTO SECTION - ACTUALITÉS & ANNONCES OFFICIELLES
            // =================================================================
            Container(
              padding: const EdgeInsets.all(26.0),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0B132B), Color(0xFF1E3A8A), Color(0xFF0D9488)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(26.0),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF1E3A8A).withValues(alpha: 0.25),
                    blurRadius: 24,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    flex: 3,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Badges positionnement et canal
                        Wrap(
                          spacing: 8,
                          runSpacing: 6,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.14),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Image.asset(
                                    'assets/icons/nav/analytics.png',
                                    width: 16,
                                    height: 16,
                                    errorBuilder: (_, __, ___) => const Icon(Icons.campaign_rounded, color: Color(0xFF67E8F9), size: 15),
                                  ),
                                  const SizedBox(width: 8),
                                  const Text(
                                    'CANAL OFFICIEL D\'INFORMATION · UY1',
                                    style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.4),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981).withValues(alpha: 0.25),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFF34D399)),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.wifi_off_rounded, color: Color(0xFF34D399), size: 13),
                                  SizedBox(width: 5),
                                  Text(
                                    'Résilience & Synchronisation Hors-Ligne',
                                    style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        const Text(
                          'Actualités Campus & Annonces Officielles',
                          style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Suivez en temps réel les communiqués rectoraux, l\'évolution de la bêta UniFlow, les supports vidéo de cours, les galeries photos commentées et les notes administratives PDF — avec mise en cache locale permanente pour consultation sans connexion Internet.',
                          style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 13, height: 1.5),
                        ),
                        const SizedBox(height: 18),
                        // Micro-cartes Bento KPIs dans le Hero
                        Wrap(
                          spacing: 12,
                          runSpacing: 10,
                          children: [
                            _buildHeroMicroBento(Icons.verified_rounded, 'Statut Plateforme', 'Phase Test Bêta Active', const Color(0xFF34D399)),
                            _buildHeroMicroBento(Icons.dynamic_feed_rounded, 'Publications', '${_newsItems.length} Médias & Notes', const Color(0xFF38BDF8)),
                            _buildHeroMicroBento(Icons.cloud_done_rounded, 'Résilience', 'Cache Local Synchro', const Color(0xFFFBBF24)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 24),
                  // Illustration 3D + Bouton Admin
                  Column(
                    children: [
                      Container(
                        width: 125,
                        height: 125,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
                        ),
                        child: Image.asset(
                          'assets/icons/nav/analytics.png',
                          fit: BoxFit.contain,
                          errorBuilder: (_, __, ___) => const Icon(Icons.newspaper_rounded, color: Colors.white, size: 56),
                        ),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton.icon(
                        onPressed: _openPublishModal,
                        icon: const Icon(Icons.add_circle_outline_rounded, size: 16),
                        label: const Text('Publier une actualité (Admin)'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF0B132B),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 22),

            // =================================================================
            // BARRE DE RECHERCHE & FILTRES PINTEREST BENTO
            // =================================================================
            Row(
              children: [
                Expanded(
                  child: TextField(
                    onChanged: (val) => setState(() => _searchQuery = val),
                    decoration: InputDecoration(
                      hintText: 'Rechercher une annonce, bêta UniFlow, calendrier d\'examen, vidéo...',
                      prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF94A3B8)),
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
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
                    children: _categories.map((cat) {
                      final isSelected = cat == _selectedCategory;
                      return InkWell(
                        onTap: () => setState(() => _selectedCategory = cat),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF1E3A8A) : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            cat,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isSelected ? Colors.white : const Color(0xFF64748B),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 22),

            // =================================================================
            // GRANDE CARTE BENTO ÉPINGLÉE : ANNONCE BÊTA UNIFLOW
            // =================================================================
            if (pinnedItem != null) ...[
              _buildPinnedBetaCard(pinnedItem),
              const SizedBox(height: 24),
            ],

            // =================================================================
            // GRILLE BENTO DES AUTRES ACTUALITÉS MULTIMÉDIAS
            // =================================================================
            if (otherItems.isNotEmpty) ...[
              const Text(
                'Fil Multimédia du Campus (Images, Vidéos & Documents Officiels)',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 14),
              LayoutBuilder(
                builder: (context, constraints) {
                  return Wrap(
                    spacing: 18,
                    runSpacing: 18,
                    children: otherItems.map((item) {
                      final width = (constraints.maxWidth - 18) / 2;
                      return SizedBox(
                        width: width > 320 ? width : constraints.maxWidth,
                        child: _buildNewsBentoCard(item),
                      );
                    }).toList(),
                  );
                },
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildHeroMicroBento(IconData icon, String label, String value, Color accent) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.18)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: accent, size: 18),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 10)),
              Text(value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPinnedBetaCard(CampusNewsItem item) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFF0D9488).withValues(alpha: 0.4), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1E3A8A).withValues(alpha: 0.06),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Colonne Texte & Actions
            Expanded(
              flex: 3,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Wrap(
                    spacing: 10,
                    runSpacing: 6,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [Color(0xFF1E3A8A), Color(0xFF0D9488)]),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.push_pin_rounded, color: Colors.white, size: 13),
                            SizedBox(width: 4),
                            Text(
                              'ANNONCE OFFICIELLE ÉPINGLÉE · BÊTA UNIFLOW',
                              style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        item.date,
                        style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    item.title,
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), height: 1.25),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    item.content,
                    style: const TextStyle(fontSize: 13, color: Color(0xFF334155), height: 1.55),
                  ),
                  const SizedBox(height: 16),
                  // Widgets Multimédias joints (Vidéo + PDF + Lien)
                  Wrap(
                    spacing: 12,
                    runSpacing: 10,
                    children: [
                      if (item.videoTitle != null)
                        InkWell(
                          onTap: () => _launchExternal(item.videoUrl ?? 'https://uniflow.cm'),
                          borderRadius: BorderRadius.circular(14),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E3A8A).withValues(alpha: 0.07),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: const Color(0xFF1E3A8A).withValues(alpha: 0.2)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.play_circle_fill_rounded, color: Color(0xFF1E3A8A), size: 22),
                                const SizedBox(width: 8),
                                Flexible(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(item.videoTitle!, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)), overflow: TextOverflow.ellipsis),
                                      Text(item.videoDuration ?? 'Vidéo HD', style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      if (item.documentTitle != null)
                        InkWell(
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Téléchargement de ${item.documentTitle} lancé...'),
                                backgroundColor: const Color(0xFF0D9488),
                              ),
                            );
                          },
                          borderRadius: BorderRadius.circular(14),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0D9488).withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: const Color(0xFF0D9488).withValues(alpha: 0.25)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.picture_as_pdf_rounded, color: Color(0xFF0D9488), size: 20),
                                const SizedBox(width: 8),
                                Flexible(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(item.documentTitle!, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)), overflow: TextOverflow.ellipsis),
                                      Text(item.documentSize ?? 'PDF', style: const TextStyle(fontSize: 10, color: Color(0xFF0D9488))),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      IconButton(
                        onPressed: () {
                          setState(() {
                            item.isLiked = !item.isLiked;
                            item.likes += item.isLiked ? 1 : -1;
                          });
                        },
                        icon: Icon(
                          item.isLiked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                          color: item.isLiked ? const Color(0xFFE11D48) : const Color(0xFF64748B),
                        ),
                      ),
                      Text('${item.likes} réactions', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                      const SizedBox(width: 16),
                      const Icon(Icons.verified_user_rounded, size: 15, color: Color(0xFF0D9488)),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          item.author,
                          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 24),
            // Colonne Illustration + Légende
            if (item.imageAsset != null)
              Expanded(
                flex: 2,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(18),
                      child: Image.asset(
                        item.imageAsset!,
                        height: 230,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          height: 230,
                          color: const Color(0xFF1E3A8A).withValues(alpha: 0.1),
                          child: const Center(child: Icon(Icons.image_rounded, size: 48, color: Color(0xFF1E3A8A))),
                        ),
                      ),
                    ),
                    if (item.imageCaption != null) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.photo_camera_back_rounded, size: 15, color: Color(0xFF0D9488)),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                item.imageCaption!,
                                style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Color(0xFF475569)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildNewsBentoCard(CampusNewsItem item) {
    Color catColor = const Color(0xFF1E3A8A);
    IconData catIcon = Icons.campaign_rounded;
    if (item.category == 'Images') {
      catColor = const Color(0xFF0D9488);
      catIcon = Icons.photo_camera_rounded;
    } else if (item.category == 'Vidéos') {
      catColor = const Color(0xFF7C3AED);
      catIcon = Icons.play_circle_fill_rounded;
    } else if (item.category == 'Documents') {
      catColor = const Color(0xFFEA580C);
      catIcon = Icons.description_rounded;
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
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
                      color: catColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(catIcon, size: 13, color: catColor),
                        const SizedBox(width: 5),
                        Text(
                          item.category,
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: catColor),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.offline_pin_rounded, size: 11, color: Color(0xFF059669)),
                        SizedBox(width: 4),
                        Text(
                          'Hors-Ligne',
                          style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF059669)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              Text(item.date, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            item.title,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
          ),
          const SizedBox(height: 8),
          if (item.imageAsset != null) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.asset(
                item.imageAsset!,
                height: 160,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const SizedBox.shrink(),
              ),
            ),
            if (item.imageCaption != null) ...[
              const SizedBox(height: 6),
              Text(
                '📷 ${item.imageCaption!}',
                style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Color(0xFF64748B)),
              ),
            ],
            const SizedBox(height: 10),
          ],
          Text(
            item.content,
            style: const TextStyle(fontSize: 12.5, color: Color(0xFF475569), height: 1.5),
          ),
          const SizedBox(height: 12),
          if (item.videoTitle != null)
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.ondemand_video_rounded, color: Color(0xFF1E3A8A), size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '${item.videoTitle!} (${item.videoDuration ?? "HD"})',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E3A8A)),
                    ),
                  ),
                ],
              ),
            ),
          if (item.documentTitle != null)
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF0D9488).withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.description_rounded, color: Color(0xFF0D9488), size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '${item.documentTitle!} · ${item.documentSize ?? "PDF"}',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0D9488)),
                    ),
                  ),
                ],
              ),
            ),
          const Divider(color: Color(0xFFE2E8F0)),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  item.author,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              InkWell(
                onTap: () {
                  setState(() {
                    item.isLiked = !item.isLiked;
                    item.likes += item.isLiked ? 1 : -1;
                  });
                },
                child: Row(
                  children: [
                    Icon(
                      item.isLiked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                      size: 16,
                      color: item.isLiked ? const Color(0xFFE11D48) : const Color(0xFF64748B),
                    ),
                    const SizedBox(width: 4),
                    Text('${item.likes}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _launchExternal(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}
