import 'package:flutter/material.dart';

class OnboardingScreen extends StatefulWidget {
  final VoidCallback onFinish;

  const OnboardingScreen({super.key, required this.onFinish});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<Map<String, dynamic>> _slides = [
    {
      'title': 'Campus Universitaire Connecté',
      'subtitle': 'L’environnement académique nouvelle génération pour l’Université de Yaoundé I',
      'description':
          'Accédez à votre emploi du temps LMD dynamique, aux actualités officielles du campus et à la coordination pédagogique en temps réel.',
      'image': 'assets/onboarding/onboarding_1_welcome.jpg',
      'badge': 'CYCLE LMD · UY1',
      'tagline': 'Temps réel & Mobilité',
      'accent': const Color(0xFF2563EB),
    },
    {
      'title': 'Bibliothèque Numérique Z-Library VPS',
      'subtitle': 'Des milliers de manuels universitaires en accès libre et sans quota',
      'description':
          'Moteur de recherche multi-shadow ultra-rapide hébergé sur le VPS UniFlow. Téléchargements directs diffusés via le BaaS Appwrite sans saturer votre machine.',
      'image': 'assets/onboarding/onboarding_2_courses.jpg',
      'badge': 'Z-LIBRARY ILLIMITÉ',
      'tagline': 'SICP, Calculus, Algorithmes',
      'accent': const Color(0xFF0D9488),
    },
    {
      'title': 'Visioconférence HD P2P & Présence QR',
      'subtitle': 'Collaborez à distance et validez votre assiduité instantanément',
      'description':
          'Serveur de visioconférence local embarqué pour des salons d’étude haute définition à faible latence, couplé à l’émargement certifié par QR code.',
      'image': 'assets/onboarding/onboarding_3_community.jpg',
      'badge': 'P2P EMBARQUÉ · QR CODE',
      'tagline': 'Visioconférence locale',
      'accent': const Color(0xFF8B5CF6),
    },
    {
      'title': 'Résilience & Hybride KERNEL FORGE',
      'subtitle': 'Conçu pour fonctionner en ligne avec synchronisation automatique',
      'description':
          'UniFlow synchronise vos devoirs, vos cours et vos notes en arrière-plan avec le BaaS Cloud tout en préservant votre continuité d’apprentissage en cas de coupure réseau.',
      'image': 'assets/onboarding/onboarding_4_forge.jpg',
      'badge': 'SÉCURITÉ & SYNCHRO',
      'tagline': 'Signé KERNEL FORGE',
      'accent': const Color(0xFFF59E0B),
    },
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < _slides.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOutCubic,
      );
    } else {
      widget.onFinish();
    }
  }

  void _prevPage() {
    if (_currentPage > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOutCubic,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B132B),
      body: Stack(
        children: [
          // Halos lumineux d'arrière-plan
          Positioned(
            top: -120,
            left: -100,
            child: Container(
              width: 500,
              height: 500,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF1E3A8A).withValues(alpha: 0.35),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -100,
            right: -80,
            child: Container(
              width: 550,
              height: 550,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF0D9488).withValues(alpha: 0.28),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Contenu principal Desktop (Layout 2 colonnes)
          SafeArea(
            child: Column(
              children: [
                // Header Bar supérieure avec Logo et bouton Passer
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 24),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.asset(
                              'assets/brand/uniflow_logo_final.png',
                              width: 44,
                              height: 44,
                              fit: BoxFit.contain,
                            ),
                          ),
                          const SizedBox(width: 14),
                          const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'UniFlow Desktop',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 20,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              Text(
                                'Plateforme Universitaire Connectée · UY1',
                                style: TextStyle(
                                  color: Color(0xFF67E8F9),
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      TextButton(
                        onPressed: widget.onFinish,
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          backgroundColor: Colors.white.withValues(alpha: 0.08),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                            side: BorderSide(color: Colors.white.withValues(alpha: 0.15)),
                          ),
                        ),
                        child: const Text(
                          'Passer l’introduction →',
                          style: TextStyle(
                            color: Color(0xFFBAE6FD),
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Vue carrousel Desktop
                Expanded(
                  child: PageView.builder(
                    controller: _pageController,
                    onPageChanged: (idx) => setState(() => _currentPage = idx),
                    itemCount: _slides.length,
                    itemBuilder: (context, index) {
                      final slide = _slides[index];
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
                        child: Row(
                          children: [
                            // COLONNE GAUCHE : Showcase Image Desktop
                            Expanded(
                              flex: 6,
                              child: Container(
                                height: double.infinity,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(32),
                                  boxShadow: [
                                    BoxShadow(
                                      color: (slide['accent'] as Color).withValues(alpha: 0.3),
                                      blurRadius: 40,
                                      offset: const Offset(0, 16),
                                    ),
                                  ],
                                  border: Border.all(
                                    color: Colors.white.withValues(alpha: 0.18),
                                    width: 1.5,
                                  ),
                                ),
                                clipBehavior: Clip.antiAlias,
                                child: Stack(
                                  fit: StackFit.expand,
                                  children: [
                                    Image.asset(
                                      slide['image'],
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => Container(
                                        color: const Color(0xFF1E293B),
                                        child: const Center(
                                          child: Icon(Icons.school_rounded, size: 80, color: Colors.white38),
                                        ),
                                      ),
                                    ),
                                    // Dégradé sombre en bas de l'image
                                    Container(
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          colors: [
                                            Colors.transparent,
                                            Colors.black.withValues(alpha: 0.85),
                                          ],
                                          begin: Alignment.topCenter,
                                          end: Alignment.bottomCenter,
                                        ),
                                      ),
                                    ),
                                    // Légende en bas de l'illustration
                                    Positioned(
                                      bottom: 24,
                                      left: 24,
                                      right: 24,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withValues(alpha: 0.12),
                                          borderRadius: BorderRadius.circular(16),
                                          border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                                        ),
                                        child: Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Row(
                                              children: [
                                                Icon(Icons.verified_rounded, size: 18, color: slide['accent']),
                                                const SizedBox(width: 8),
                                                Text(
                                                  slide['tagline'],
                                                  style: const TextStyle(
                                                    color: Colors.white,
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 12,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            Text(
                                              'Étape ${index + 1} / ${_slides.length}',
                                              style: const TextStyle(color: Colors.white70, fontSize: 11),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),

                            const SizedBox(width: 48),

                            // COLONNE DROITE : Textes, Bento Highlights et Actions
                            Expanded(
                              flex: 5,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  // Badge Pill
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: (slide['accent'] as Color).withValues(alpha: 0.2),
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(
                                        color: (slide['accent'] as Color).withValues(alpha: 0.4),
                                      ),
                                    ),
                                    child: Text(
                                      slide['badge'],
                                      style: TextStyle(
                                        color: slide['accent'],
                                        fontSize: 11,
                                        fontWeight: FontWeight.w900,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                  ),

                                  const SizedBox(height: 18),

                                  // Titre
                                  Text(
                                    slide['title'],
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 34,
                                      fontWeight: FontWeight.w900,
                                      height: 1.15,
                                      letterSpacing: -0.5,
                                    ),
                                  ),

                                  const SizedBox(height: 12),

                                  // Sous-titre
                                  Text(
                                    slide['subtitle'],
                                    style: const TextStyle(
                                      color: Color(0xFF67E8F9),
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      height: 1.35,
                                    ),
                                  ),

                                  const SizedBox(height: 16),

                                  // Description
                                  Text(
                                    slide['description'],
                                    style: const TextStyle(
                                      color: Color(0xFF94A3B8),
                                      fontSize: 14,
                                      height: 1.6,
                                    ),
                                  ),

                                  const SizedBox(height: 32),

                                  // Micro Bento Cards d'atouts clés
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Container(
                                          padding: const EdgeInsets.all(14),
                                          decoration: BoxDecoration(
                                            color: Colors.white.withValues(alpha: 0.05),
                                            borderRadius: BorderRadius.circular(16),
                                            border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                                          ),
                                          child: const Row(
                                            children: [
                                              Icon(Icons.speed_rounded, size: 20, color: Color(0xFF38BDF8)),
                                              SizedBox(width: 10),
                                              Expanded(
                                                child: Text(
                                                  'Haute performance native Flutter',
                                                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Container(
                                          padding: const EdgeInsets.all(14),
                                          decoration: BoxDecoration(
                                            color: Colors.white.withValues(alpha: 0.05),
                                            borderRadius: BorderRadius.circular(16),
                                            border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                                          ),
                                          child: const Row(
                                            children: [
                                              Icon(Icons.cloud_sync_rounded, size: 20, color: Color(0xFF34D399)),
                                              SizedBox(width: 10),
                                              Expanded(
                                                child: Text(
                                                  'Synchronisation BaaS automatique',
                                                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),

                                  const SizedBox(height: 40),

                                  // Indicateurs de page + Boutons d'action
                                  Row(
                                    children: [
                                      // Dots
                                      Row(
                                        children: List.generate(
                                          _slides.length,
                                          (dotIdx) => AnimatedContainer(
                                            duration: const Duration(milliseconds: 300),
                                            margin: const EdgeInsets.only(right: 8),
                                            width: _currentPage == dotIdx ? 32 : 10,
                                            height: 8,
                                            decoration: BoxDecoration(
                                              borderRadius: BorderRadius.circular(4),
                                              color: _currentPage == dotIdx
                                                  ? slide['accent']
                                                  : Colors.white.withValues(alpha: 0.25),
                                            ),
                                          ),
                                        ),
                                      ),

                                      const Spacer(),

                                      if (_currentPage > 0)
                                        IconButton(
                                          onPressed: _prevPage,
                                          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white70),
                                          tooltip: 'Précédent',
                                        ),

                                      const SizedBox(width: 12),

                                      ElevatedButton(
                                        onPressed: _nextPage,
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: slide['accent'],
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
                                          elevation: 8,
                                          shadowColor: (slide['accent'] as Color).withValues(alpha: 0.5),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(20),
                                          ),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Text(
                                              _currentPage == _slides.length - 1
                                                  ? 'Commencer l’expérience'
                                                  : 'Suivant',
                                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                            ),
                                            const SizedBox(width: 8),
                                            const Icon(Icons.arrow_forward_rounded, size: 18),
                                          ],
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
