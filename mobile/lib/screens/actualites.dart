import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user_role.dart';
import '../providers/providers.dart';
import '../theme/app_theme.dart';
import '../widgets/common.dart';
import '../widgets/phosphor.dart';

/// Modèle d'une actualité officielle du campus UniFlow.
class CampusNewsItem {
  final String id;
  final String title;
  final String category;
  final String author;
  final String authorRole;
  final String publishedAt;
  final String summary;
  final String content;
  final String imageAsset;
  final String imageCaption;
  final String? videoTitle;
  final String? videoDuration;
  final String? videoUrl;
  final String? documentTitle;
  final String? documentSize;
  final String? externalLinkLabel;
  final String? externalLinkUrl;
  final bool isPinned;
  final int likes;
  final int views;

  const CampusNewsItem({
    required this.id,
    required this.title,
    required this.category,
    required this.author,
    required this.authorRole,
    required this.publishedAt,
    required this.summary,
    required this.content,
    required this.imageAsset,
    required this.imageCaption,
    this.videoTitle,
    this.videoDuration,
    this.videoUrl,
    this.documentTitle,
    this.documentSize,
    this.externalLinkLabel,
    this.externalLinkUrl,
    this.isPinned = false,
    this.likes = 0,
    this.views = 0,
  });
}

const List<CampusNewsItem> _initialCampusNews = [
  CampusNewsItem(
    id: 'news-beta-uniflow',
    title: 'Plateforme UniFlow en phase de test bêta — Des améliorations majeures arrivent !',
    category: 'Annonces',
    author: 'Direction KERNEL FORGE & Rectorat',
    authorRole: 'Communiqué Officiel',
    publishedAt: 'À l\'instant · Épinglé',
    summary:
        'Bienvenue sur la version bêta d\'UniFlow ! Découvrez le nouveau design Bento 3D, la messagerie académique @uniflow.cm, le mode hors-ligne intégral et le copilote IA Uni.',
    content:
        'Chers étudiants, délégués, enseignants et membres de l\'administration,\n\n'
        'La plateforme académique unifiée UniFlow est actuellement déployée en phase de test bêta grandeur nature sur le campus. '
        'Cette mise à jour majeure inaugure l\'architecture visuelle « Pinterest Bento Grid & 3D Hero », pensée pour offrir une lisibilité optimale sur mobile, tablette et ordinateur.\n\n'
        'Parmi les nouveautés majeures disponibles dès aujourd\'hui :\n'
        '• Identité UniMail (@uniflow.cm) : chaque étudiant, enseignant et cadre dispose désormais d\'une adresse électronique institutionnelle signée UniFlow, synchronisée avec le cycle de vie de son compte.\n'
        '• Synchronisation LAN 0 ms & Mode Hors-Ligne : consultez vos cours, emplois du temps, notes et livres Z-Library même sans connexion Internet.\n'
        '• Copilote IA Uni & Quêtes XP : révisez vos unités d\'enseignement avec des parcours gamifiés.\n\n'
        'Vos retours sont précieux : signalez toute suggestion via le Centre d\'aide ou directement par UniMail à support@uniflow.cm.',
    imageAsset: 'assets/illustrations/about_campus_hero.png',
    imageCaption: 'Déploiement officiel de la bêta UniFlow sur le campus universitaire avec synchronisation temps réel.',
    videoTitle: 'Présentation vidéo : Tour d\'horizon d\'UniFlow Bêta 3D (2 min 45)',
    videoDuration: '02:45',
    videoUrl: 'https://uniflow.cm/beta-tour',
    documentTitle: 'Guide_Officiel_Beta_UniFlow_2026.pdf',
    documentSize: '2.4 Mo · PDF Signé',
    externalLinkLabel: 'Consulter la feuille de route officielle (uniflow.cm)',
    externalLinkUrl: 'https://uniflow.cm/roadmap',
    isPinned: true,
    likes: 342,
    views: 1280,
  ),
  CampusNewsItem(
    id: 'news-calendrier-semestre',
    title: 'Calendrier des examens semestriels & publication des salles d\'évaluation',
    category: 'Académique',
    author: 'Vice-Doyen chargé de la Scolarité',
    authorRole: 'Faculté des Sciences',
    publishedAt: 'Il y a 3 heures',
    summary:
        'Les plannings définitifs des sessions normales et les répartitions par amphithéâtre (Amphi 1000, Amphi 500, Bloc Pédagogique) sont disponibles.',
    content:
        'Les étudiants des filières Informatique (ICT4D, SIGL, Réseaux & Sécurité), Mathématiques et Physique sont informés que le calendrier consolidé des évaluations de fin de semestre a été arrêté.\n\n'
        'Chaque étudiant est invité à vérifier la validité de son inscription pédagogique dans le module « Inscriptions » et à présenter son QR Code UniFlow à l\'entrée des salles d\'examen.',
    imageAsset: 'assets/illustrations/schedule_calendar_hero_3d.png',
    imageCaption: 'Répartition numérique des créneaux d\'évaluation et contrôle d\'accès QR.',
    documentTitle: 'Calendrier_Examens_Semestre_Officiel.pdf',
    documentSize: '1.8 Mo · PDF Officiel',
    externalLinkLabel: 'Vérifier mon emploi du temps',
    externalLinkUrl: 'https://uniflow.cm/schedule',
    likes: 189,
    views: 845,
  ),
  CampusNewsItem(
    id: 'news-hackathon-forge',
    title: 'Grand Hackathon Campus IA & Cybersécurité — Inscriptions ouvertes',
    category: 'Événements',
    author: 'Club Tech & KERNEL FORGE',
    authorRole: 'Innovation & Recherche',
    publishedAt: 'Hier à 16:30',
    summary:
        '48 heures d\'innovation intensive autour de l\'intelligence artificielle embarquée, de la santé connectée et des réseaux résilients.',
    content:
        'Formez votre équipe de 3 à 5 étudiants et participez au Grand Hackathon annuel du Campus ! Les meilleures équipes bénéficieront d\'un accompagnement technique, de bourses d\'excellence et d\'une intégration directe au laboratoire d\'innovation.\n\n'
        'Des ateliers préparatoires en visioconférence LAN et des ressources dédiées sont dès à présent accessibles dans la Bibliothèque Uni Book.',
    imageAsset: 'assets/illustrations/about_team_lab.png',
    imageCaption: 'Les équipes lauréates lors de la session préparatoire au laboratoire informatique.',
    videoTitle: 'Teaser Hackathon Campus & Interviews des mentors',
    videoDuration: '01:50',
    videoUrl: 'https://uniflow.cm/hackathon-teaser',
    documentTitle: 'Reglement_Hackathon_Campus_2026.pdf',
    documentSize: '940 Ko · PDF',
    likes: 276,
    views: 990,
  ),
  CampusNewsItem(
    id: 'news-bibliotheque-zlib',
    title: 'Extension du catalogue numérique : +50 000 ouvrages scientifiques indexés',
    category: 'Médias & Docs',
    author: 'Conservateur de la Bibliothèque Universitaire',
    authorRole: 'Documentation & Recherche',
    publishedAt: 'Il y a 2 jours',
    summary:
        'Accédez instantanément aux manuels de référence en informatique, médecine, droit et ingénierie avec mise en cache locale sur votre téléphone.',
    content:
        'Grâce à l\'interconnexion du module Uni Book avec le stockage institutionnel Appwrite, les ouvrages téléchargés par les enseignants et étudiants restent accessibles en cache rapide sur le réseau du campus.',
    imageAsset: 'assets/illustrations/course_study_hero_3d.png',
    imageCaption: 'Nouvelle interface de lecture et d\'archivage hors-ligne dans la Bibliothèque UniFlow.',
    externalLinkLabel: 'Explorer le catalogue numérique',
    externalLinkUrl: 'https://uniflow.cm/library',
    likes: 215,
    views: 710,
  ),
];

/// Écran Actualités Campus (`/actualites`) — Design Bento Grid + Hero 3D.
class ActualitesScreen extends ConsumerStatefulWidget {
  const ActualitesScreen({super.key});

  @override
  ConsumerState<ActualitesScreen> createState() => _ActualitesScreenState();
}

class _ActualitesScreenState extends ConsumerState<ActualitesScreen> {
  final List<CampusNewsItem> _news = List<CampusNewsItem>.from(_initialCampusNews);
  String _selectedCategory = 'Toutes';
  final Set<String> _likedIds = {'news-beta-uniflow'};

  static const List<String> _categories = [
    'Toutes',
    'Annonces',
    'Académique',
    'Événements',
    'Médias & Docs',
  ];

  void _toggleLike(String id) {
    setState(() {
      if (_likedIds.contains(id)) {
        _likedIds.remove(id);
      } else {
        _likedIds.add(id);
      }
    });
  }

  void _openPublishSheet() {
    final titleCtrl = TextEditingController();
    final summaryCtrl = TextEditingController();
    final captionCtrl = TextEditingController();
    final docCtrl = TextEditingController();
    final videoCtrl = TextEditingController();
    String category = 'Annonces';

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (sheetCtx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(
                20,
                16,
                20,
                MediaQuery.of(ctx).viewInsets.bottom + 24,
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
                            color: AppColors.primary50,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const PhosphorIcon(
                            PhosphorIconsDuotone.broadcast,
                            color: AppColors.primaryBlue,
                            size: 22,
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Publier une actualité officielle',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              Text(
                                'Diffusion immédiate avec médias, légendes et PDF',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        for (final cat in _categories.where((c) => c != 'Toutes'))
                          InkWell(
                            onTap: () => setSheetState(() => category = cat),
                            borderRadius: BorderRadius.circular(999),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: category == cat ? AppColors.primaryBlue : AppColors.surfaceMuted,
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: Text(
                                cat,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: category == cat ? Colors.white : AppColors.textSecondary,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    TextField(
                      controller: titleCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Titre de l\'annonce *',
                        hintText: 'Ex: Ouverture des candidatures Master 2',
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: summaryCtrl,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: 'Contenu & détails *',
                        hintText: 'Rédigez le communiqué officiel...',
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: captionCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Légende de l\'image de couverture',
                        hintText: 'Ex: Cérémonie de présentation à l\'Amphi 1000',
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: docCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Document PDF joint',
                              hintText: 'Note_Officielle.pdf',
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: videoCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Lien vidéo / média',
                              hintText: 'https://uniflow.cm/...',
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),
                    InkWell(
                      onTap: () {
                        final title = titleCtrl.text.trim();
                        final body = summaryCtrl.text.trim();
                        if (title.isEmpty || body.isEmpty) return;
                        final user = ref.read(currentUserProvider);
                        setState(() {
                          _news.insert(
                            0,
                            CampusNewsItem(
                              id: 'custom-${DateTime.now().millisecondsSinceEpoch}',
                              title: title,
                              category: category,
                              author: user?.name.isNotEmpty == true ? user!.name : 'Administration Campus',
                              authorRole: 'Publication Officielle',
                              publishedAt: 'À l\'instant',
                              summary: body,
                              content: body,
                              imageAsset: 'assets/illustrations/about_campus_hero.png',
                              imageCaption: captionCtrl.text.trim().isNotEmpty
                                  ? captionCtrl.text.trim()
                                  : 'Illustration officielle campus UniFlow.',
                              documentTitle: docCtrl.text.trim().isNotEmpty ? docCtrl.text.trim() : null,
                              documentSize: docCtrl.text.trim().isNotEmpty ? '1.2 Mo · PDF' : null,
                              videoTitle: videoCtrl.text.trim().isNotEmpty ? 'Média vidéo attaché' : null,
                              videoDuration: videoCtrl.text.trim().isNotEmpty ? 'Vidéo HD' : null,
                              videoUrl: videoCtrl.text.trim().isNotEmpty ? videoCtrl.text.trim() : null,
                              isPinned: true,
                              likes: 1,
                              views: 1,
                            ),
                          );
                        });
                        Navigator.of(sheetCtx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Actualité officielle publiée sur le campus !'),
                            backgroundColor: AppColors.teal,
                          ),
                        );
                      },
                      borderRadius: BorderRadius.circular(14),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          gradient: AppColors.headerGradient,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        alignment: Alignment.center,
                        child: const Text(
                          'Publier sur le fil du campus',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _openNewsDetail(CampusNewsItem item) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.82,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          builder: (_, controller) {
            return ListView(
              controller: controller,
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
              children: [
                Center(
                  child: Container(
                    width: 42,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.inputBorder,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  children: [
                    StatusBadge(label: item.category),
                    if (item.isPinned)
                      const StatusBadge(
                        label: 'Épinglé · Officiel',
                        backgroundColor: Color(0xFFFEF3C7),
                        foregroundColor: Color(0xFFB45309),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  item.title,
                  style: const TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                    height: 1.25,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${item.author} · ${item.authorRole} · ${item.publishedAt}',
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 16),
                ClipRRect(
                  borderRadius: BorderRadius.circular(18),
                  child: Image.asset(
                    item.imageAsset,
                    height: 190,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 140,
                      color: AppColors.primary50,
                      alignment: Alignment.center,
                      child: const PhosphorIcon(PhosphorIconsDuotone.image, size: 40, color: AppColors.primaryBlue),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.inputBorder),
                  ),
                  child: Row(
                    children: [
                      const PhosphorIcon(PhosphorIconsDuotone.camera, size: 15, color: AppColors.teal),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          item.imageCaption,
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontStyle: FontStyle.italic,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  item.content,
                  style: const TextStyle(
                    fontSize: 14,
                    height: 1.55,
                    color: AppColors.textPrimary,
                  ),
                ),
                if (item.videoTitle != null) ...[
                  const SizedBox(height: 16),
                  _MediaAttachmentTile(
                    icon: PhosphorIconsFill.fileVideo,
                    color: const Color(0xFF7C3AED),
                    title: item.videoTitle!,
                    subtitle: 'Vidéo HD Campus · ${item.videoDuration ?? "Lecture directe"}',
                    badge: 'VIDÉO',
                  ),
                ],
                if (item.documentTitle != null) ...[
                  const SizedBox(height: 10),
                  _MediaAttachmentTile(
                    icon: PhosphorIconsFill.filePdf,
                    color: const Color(0xFFEF4444),
                    title: item.documentTitle!,
                    subtitle: item.documentSize ?? 'Document officiel PDF',
                    badge: 'PDF',
                  ),
                ],
                if (item.externalLinkLabel != null) ...[
                  const SizedBox(height: 10),
                  _MediaAttachmentTile(
                    icon: PhosphorIconsBold.arrowSquareOut,
                    color: AppColors.teal,
                    title: item.externalLinkLabel!,
                    subtitle: item.externalLinkUrl ?? 'https://uniflow.cm',
                    badge: 'LIEN',
                  ),
                ],
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final role = ref.watch(currentRoleProvider);
    final canPublish = role == UniFlowRole.admin || role == UniFlowRole.teacher || role == UniFlowRole.delegate;
    final filtered = _selectedCategory == 'Toutes'
        ? _news
        : _news.where((n) => n.category == _selectedCategory).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Column(
        children: [
          GradientHeader(
            title: 'Actualités Campus',
            subtitle: 'Annonces officielles, médias & documents',
            trailing: canPublish
                ? InkWell(
                    onTap: _openPublishSheet,
                    borderRadius: BorderRadius.circular(999),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          PhosphorIcon(PhosphorIconsBold.plus, size: 13, color: Colors.white),
                          SizedBox(width: 5),
                          Text(
                            'Publier',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                : null,
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, uniClearance + 40),
              children: [
                // ── Bandeau Hero Bêta Test Officiel (Bento Highlight) ──────────
                _BetaAnnouncementBanner(
                  onTap: () => _openNewsDetail(_news.first),
                ),
                const SizedBox(height: 16),

                // ── Filtres Bento par catégorie ───────────────────────────────
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      for (final cat in _categories)
                        Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: InkWell(
                            onTap: () => setState(() => _selectedCategory = cat),
                            borderRadius: BorderRadius.circular(999),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                color: _selectedCategory == cat ? AppColors.primaryBlue : Colors.white,
                                borderRadius: BorderRadius.circular(999),
                                border: Border.all(
                                  color: _selectedCategory == cat ? AppColors.primaryBlue : AppColors.inputBorder,
                                ),
                              ),
                              child: Text(
                                cat,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: _selectedCategory == cat ? Colors.white : AppColors.textSecondary,
                                ),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // ── Liste des cartes d'actualités Bento ───────────────────────
                for (final item in filtered)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: _NewsBentoCard(
                      item: item,
                      liked: _likedIds.contains(item.id),
                      onLike: () => _toggleLike(item.id),
                      onTap: () => _openNewsDetail(item),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _BetaAnnouncementBanner extends StatelessWidget {
  final VoidCallback onTap;
  const _BetaAnnouncementBanner({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(22),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF0B132B), Color(0xFF1E3A8A), Color(0xFF0D9488)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(22),
          boxShadow: [
            BoxShadow(
              color: AppColors.primaryBlue.withValues(alpha: 0.18),
              blurRadius: 18,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Flexible(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF59E0B).withValues(alpha: 0.22),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: const Color(0xFFFBBF24).withValues(alpha: 0.5)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        PhosphorIcon(PhosphorIconsFill.sparkle, size: 12, color: Color(0xFFFBBF24)),
                        SizedBox(width: 5),
                        Flexible(
                          child: Text(
                            'COMMUNIQUÉ OFFICIEL · BÊTA',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: Color(0xFFFEF3C7),
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.3,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                const PhosphorIcon(PhosphorIconsBold.tag, size: 15, color: Colors.white70),
              ],
            ),
            const SizedBox(height: 10),
            const Text(
              'Plateforme UniFlow en phase de test bêta — Des améliorations majeures arrivent !',
              style: TextStyle(
                color: Colors.white,
                fontSize: 15.5,
                fontWeight: FontWeight.w800,
                height: 1.25,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Architecture Bento 3D, messagerie @uniflow.cm signée, synchronisation hors-ligne et nouveaux outils d\'apprentissage.',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.85),
                fontSize: 12,
                height: 1.35,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NewsBentoCard extends StatelessWidget {
  final CampusNewsItem item;
  final bool liked;
  final VoidCallback onLike;
  final VoidCallback onTap;

  const _NewsBentoCard({
    required this.item,
    required this.liked,
    required this.onLike,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final likesCount = item.likes + (liked ? 1 : 0);

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(22),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(22),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
            border: Border.all(
              color: item.isPinned ? AppColors.primaryBlue.withValues(alpha: 0.28) : AppColors.inputBorder,
            ),
            boxShadow: AppColors.cardShadow,
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Image avec badge catégorie et durée vidéo éventuelle
              Stack(
                children: [
                  Image.asset(
                    item.imageAsset,
                    height: 168,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 140,
                      color: AppColors.primary50,
                      alignment: Alignment.center,
                      child: const PhosphorIcon(PhosphorIconsDuotone.image, size: 36, color: AppColors.primaryBlue),
                    ),
                  ),
                  Positioned(
                    left: 12,
                    top: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0B132B).withValues(alpha: 0.78),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        item.category,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10.5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                  if (item.videoDuration != null)
                    Positioned(
                      right: 12,
                      bottom: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: const Color(0xFF7C3AED).withValues(alpha: 0.92),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const PhosphorIcon(PhosphorIconsFill.videoCamera, size: 11, color: Colors.white),
                            const SizedBox(width: 5),
                            Text(
                              item.videoDuration!,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10.5,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
              // Légende photo sous l'image
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                color: const Color(0xFFF1F5F9),
                child: Row(
                  children: [
                    const PhosphorIcon(PhosphorIconsDuotone.camera, size: 14, color: AppColors.teal),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        item.imageCaption,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 11,
                          fontStyle: FontStyle.italic,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Contenu texte et pièces jointes
              Padding(
                padding: const EdgeInsets.all(15),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            '${item.author} · ${item.publishedAt}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                              color: AppColors.teal,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      item.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 15.5,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      item.summary,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12.5,
                        color: AppColors.textSecondary,
                        height: 1.4,
                      ),
                    ),
                    if (item.documentTitle != null || item.videoTitle != null || item.externalLinkLabel != null) ...[
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 6,
                        children: [
                          if (item.documentTitle != null)
                            _AttachmentChip(
                              icon: PhosphorIconsFill.filePdf,
                              label: item.documentTitle!,
                              color: const Color(0xFFEF4444),
                            ),
                          if (item.videoTitle != null)
                            const _AttachmentChip(
                              icon: PhosphorIconsFill.videoCamera,
                              label: 'Vidéo jointe',
                              color: Color(0xFF7C3AED),
                            ),
                          if (item.externalLinkLabel != null)
                            const _AttachmentChip(
                              icon: PhosphorIconsBold.arrowSquareOut,
                              label: 'Lien officiel',
                              color: AppColors.primaryBlue,
                            ),
                        ],
                      ),
                    ],
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        InkWell(
                          onTap: onLike,
                          borderRadius: BorderRadius.circular(999),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: liked ? AppColors.primary50 : AppColors.surfaceMuted,
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                PhosphorIcon(
                                  liked ? PhosphorIconsFill.thumbsUp : PhosphorIconsBold.thumbsUp,
                                  size: 13,
                                  color: liked ? AppColors.primaryBlue : AppColors.textSecondary,
                                ),
                                const SizedBox(width: 5),
                                Text(
                                  '$likesCount',
                                  style: TextStyle(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w700,
                                    color: liked ? AppColors.primaryBlue : AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            '${item.views} lectures',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted),
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Flexible(
                          child: Text(
                            'Lire la suite →',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primaryBlue,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AttachmentChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _AttachmentChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxWidth: 210),
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: color),
          const SizedBox(width: 5),
          Flexible(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: color,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MediaAttachmentTile extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final String badge;

  const _MediaAttachmentTile({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.badge,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.22)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 20, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              badge,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 10,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
