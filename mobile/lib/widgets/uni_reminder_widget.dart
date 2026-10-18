import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../services/notification_service.dart';
import '../theme/app_theme.dart';
import 'phosphor.dart';

/// Les 6 états émotionnels et contextuels de la mascotte Uni, inspirés des
/// widgets dynamiques de Duolingo.
enum UniReminderType {
  streak(
    id: 'streak',
    title: 'Streak en danger !',
    punchline: 'Ne brise pas ta série de 14 jours ! Valide ton assiduité aujourd\'hui.',
    imageAsset: 'assets/mascot/uni_duo_streak_fire.png',
    badgeLabel: '🔥 14 jours de streak',
    ctaLabel: 'Protéger mon streak',
    targetRoute: '/quetes',
    primaryColor: Color(0xFFEA580C),
    gradientColors: [Color(0xFF7C2D12), Color(0xFFC2410C), Color(0xFFEA580C)],
    bubbleQuotes: [
      'Uni te surveille ! 🔥 Ne lâche rien aujourd\'hui !',
      '14 jours d\'affilée... ce serait trop bête de recommencer à zéro !',
      'Un petit coup d\'œil à tes cours et ton streak est sauvé !',
    ],
  ),
  upcomingClass(
    id: 'upcomingClass',
    title: 'Cours imminent !',
    punchline: 'INF4067 commence dans 20 min en Amphi 501. Prépare tes affaires !',
    imageAsset: 'assets/mascot/uni_duo_class_rush.png',
    badgeLabel: '⏰ Dans 20 min · Amphi 501',
    ctaLabel: 'Voir mon amphi',
    targetRoute: '/emploi-du-temps',
    primaryColor: Color(0xFF2563EB),
    gradientColors: [Color(0xFF0F172A), Color(0xFF1E3A8A), Color(0xFF2563EB)],
    bubbleQuotes: [
      'Vite vite ! Le prof n\'attend pas les retardataires ! 🏃💨',
      'Vérifie que ton bloc-notes et ton PC sont chargés !',
      'Amphi 501, 2ème étage aile Est ! On y va !',
    ],
  ),
  assignment(
    id: 'assignment',
    title: 'Devoir à rendre !',
    punchline: 'TP Réseau & Protocoles à soumettre avant 23h59. Ne remets pas à plus tard !',
    imageAsset: 'assets/mascot/uni_duo_assignment.png',
    badgeLabel: '📝 Échéance ce soir 23h59',
    ctaLabel: 'Déposer le devoir',
    targetRoute: '/devoirs',
    primaryColor: Color(0xFF7C3AED),
    gradientColors: [Color(0xFF2E1065), Color(0xFF5B21B6), Color(0xFF7C3AED)],
    bubbleQuotes: [
      'Une fois envoyé, tu seras tellement soulagé ! ✨',
      'Uni a lu ton devoir : c\'est prometteur, fignole la conclusion !',
      'Pas de panique, 1 heure de concentration et c\'est plié !',
    ],
  ),
  attendance(
    id: 'attendance',
    title: 'Émargement ouvert',
    punchline: 'Scanne le QR code de présence de ta promo pour certifier ton assiduité.',
    imageAsset: 'assets/mascot/uni_duo_qr_scan.png',
    badgeLabel: '🛡️ QR Code actif en cours',
    ctaLabel: 'Scanner ma présence',
    targetRoute: '/presence',
    primaryColor: Color(0xFF0D9488),
    gradientColors: [Color(0xFF064E3B), Color(0xFF0F766E), Color(0xFF0D9488)],
    bubbleQuotes: [
      'Présence certifiée cryptographiquement ! 🛡️',
      'Le délégué vient d\'afficher le QR, dégaine ton scanner !',
      'Être ponctuel, c\'est déjà 50% de la réussite !',
    ],
  ),
  nightRest(
    id: 'nightRest',
    title: 'Repos mérité',
    punchline: 'Excellente journée d\'apprentissage ! Uni recharge ses batteries, fais de même.',
    imageAsset: 'assets/mascot/uni_duo_night_rest.png',
    badgeLabel: '🌙 Mode repos · Nuit',
    ctaLabel: 'Programme de demain',
    targetRoute: '/emploi-du-temps',
    primaryColor: Color(0xFF3B82F6),
    gradientColors: [Color(0xFF0B132B), Color(0xFF1E293B), Color(0xFF334155)],
    bubbleQuotes: [
      'Chuuut... Uni dort paisiblement ! 😴',
      'Le cerveau consolide ses cours pendant le sommeil !',
      'Dors bien, demain est une nouvelle opportunité de briller !',
    ],
  ),
  celebrate(
    id: 'celebrate',
    title: 'Journée 100% validée !',
    punchline: 'Toutes tes présences et quêtes du jour sont validées. +50 XP remportés !',
    imageAsset: 'assets/mascot/uni_duo_celebrate_streak.png',
    badgeLabel: '🎉 Toutes quêtes validées',
    ctaLabel: 'Voir mes trophées',
    targetRoute: '/quetes',
    primaryColor: Color(0xFFF59E0B),
    gradientColors: [Color(0xFF78350F), Color(0xFFB45309), Color(0xFFF59E0B)],
    bubbleQuotes: [
      'CHAMPION ! 🏆 Tu as géré ta journée à la perfection !',
      'Niveau supérieur débloqué ! Tu es une machine ! 🌟',
      'Uni est tellement fier de toi aujourd\'hui !',
    ],
  );

  const UniReminderType({
    required this.id,
    required this.title,
    required this.punchline,
    required this.imageAsset,
    required this.badgeLabel,
    required this.ctaLabel,
    required this.targetRoute,
    required this.primaryColor,
    required this.gradientColors,
    required this.bubbleQuotes,
  });

  final String id;
  final String title;
  final String punchline;
  final String imageAsset;
  final String badgeLabel;
  final String ctaLabel;
  final String targetRoute;
  final Color primaryColor;
  final List<Color> gradientColors;
  final List<String> bubbleQuotes;
}

/// Widget dynamique Duolingo pour l'accueil de l'application mobile.
///
/// Affiche la mascotte Uni dans un état émotionnel adapté aux événements du
/// campus (streak, cours, devoirs, présence, nuit, victoire), avec des répliques
/// amusantes, des micro-badges et la possibilité de tester en direct le service
/// réel de notifications push locales.
class UniReminderWidget extends StatefulWidget {
  final UniReminderType? initialType;
  final VoidCallback? onCustomAction;

  const UniReminderWidget({
    super.key,
    this.initialType,
    this.onCustomAction,
  });

  @override
  State<UniReminderWidget> createState() => _UniReminderWidgetState();
}

class _UniReminderWidgetState extends State<UniReminderWidget> with SingleTickerProviderStateMixin {
  late UniReminderType _currentType;
  int _quoteIndex = 0;
  bool _showBubble = false;
  late AnimationController _bounceController;
  late Animation<double> _bounceAnimation;

  @override
  void initState() {
    super.initState();
    _currentType = widget.initialType ?? _detectContextualType();

    _bounceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _bounceAnimation = Tween<double>(begin: 1.0, end: 1.12).chain(
      CurveTween(curve: Curves.elasticOut),
    ).animate(_bounceController);
  }

  @override
  void dispose() {
    _bounceController.dispose();
    super.dispose();
  }

  /// Détecte l'état le plus pertinent selon l'heure de la journée.
  static UniReminderType _detectContextualType() {
    final now = DateTime.now();
    final hour = now.hour;
    if (hour >= 22 || hour < 6) {
      return UniReminderType.nightRest;
    } else if (const [7, 8, 9, 13, 14].contains(hour)) {
      return UniReminderType.upcomingClass;
    } else if (const [10, 11, 15, 16].contains(hour)) {
      return UniReminderType.attendance;
    } else if (const [17, 18, 19].contains(hour)) {
      return UniReminderType.assignment;
    } else if (const [20, 21].contains(hour)) {
      return UniReminderType.streak;
    }
    return UniReminderType.streak;
  }

  void _cycleType() {
    setState(() {
      const types = UniReminderType.values;
      final nextIdx = (types.indexOf(_currentType) + 1) % types.length;
      _currentType = types[nextIdx];
      _showBubble = false;
      _quoteIndex = 0;
    });
  }

  void _tapMascot() {
    _bounceController.forward(from: 0.0);
    setState(() {
      if (_showBubble) {
        _quoteIndex = (_quoteIndex + 1) % _currentType.bubbleQuotes.length;
      } else {
        _showBubble = true;
      }
    });
  }

  Future<void> _testPushNotification(BuildContext context) async {
    await LocalNotifications.triggerTestReminder(
      reminderType: _currentType.id,
      customTitle: '${_currentType.badgeLabel} · ${_currentType.title}',
      customBody: _currentType.punchline,
    );

    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF0F172A),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        content: Row(
          children: [
            const PhosphorIcon(PhosphorIconsFill.bellRinging, color: Color(0xFF38BDF8), size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Alerte push envoyée : ${_currentType.title}',
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _showTestSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => _PushNotificationTestSheet(
        currentType: _currentType,
        onSelectType: (type) {
          setState(() {
            _currentType = type;
            _showBubble = false;
          });
          Navigator.of(ctx).pop();
          _testPushNotification(context);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final type = _currentType;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: type.gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: type.primaryColor.withValues(alpha: 0.28),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.16),
          width: 1.2,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          children: [
            // Halos lumineux d'ambiance
            Positioned(
              right: -25,
              top: -25,
              child: Container(
                width: 130,
                height: 130,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.08),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Positioned(
              left: 40,
              bottom: -35,
              child: Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: type.primaryColor.withValues(alpha: 0.25),
                  shape: BoxShape.circle,
                ),
              ),
            ),

            // Contenu principal
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // En-tête : Badge pill + Boutons d'action rapides (Cycle / Test Push)
                  Row(
                    children: [
                      Expanded(
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.16),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
                            ),
                            child: Text(
                              type.badgeLabel,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10.5,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.2,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Bouton changer d'état / carousel
                      InkWell(
                        key: const Key('uni_reminder_cycle_btn'),
                        onTap: _cycleType,
                        borderRadius: BorderRadius.circular(14),
                        child: Container(
                          padding: const EdgeInsets.all(5),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.12),
                            shape: BoxShape.circle,
                          ),
                          child: const PhosphorIcon(PhosphorIconsBold.arrowsClockwise, color: Colors.white, size: 13),
                        ),
                      ),
                      const SizedBox(width: 6),
                      // Bouton tester notification push
                      InkWell(
                        key: const Key('uni_reminder_test_push_btn'),
                        onTap: () => _showTestSheet(context),
                        borderRadius: BorderRadius.circular(14),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3.5),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.22),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              PhosphorIcon(PhosphorIconsFill.bellRinging, color: Colors.amber, size: 12),
                              SizedBox(width: 3.5),
                              Text(
                                'Test Push',
                                style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  // Corps : Mascotte Duolingo à gauche / droite + Bulle & Texte
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Texte et CTA à gauche
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              type.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 15,
                                fontWeight: FontWeight.w900,
                                letterSpacing: -0.2,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              type.punchline,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.9),
                                fontSize: 11,
                                height: 1.25,
                              ),
                            ),
                            const SizedBox(height: 9),
                            // Bouton Action CTA Duolingo
                            InkWell(
                              onTap: () {
                                if (widget.onCustomAction != null) {
                                  widget.onCustomAction!();
                                } else {
                                  context.push(type.targetRoute);
                                }
                              },
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 6),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.15),
                                      blurRadius: 6,
                                      offset: const Offset(0, 3),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Flexible(
                                      child: Text(
                                        type.ctaLabel,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          color: type.primaryColor,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    PhosphorIcon(PhosphorIconsBold.arrowRight, size: 11, color: type.primaryColor),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(width: 8),

                      // Avatar Mascotte Uni interactive style Duolingo
                      GestureDetector(
                        key: const Key('uni_mascot_avatar'),
                        onTap: _tapMascot,
                        child: ScaleTransition(
                          scale: _bounceAnimation,
                          child: Stack(
                            clipBehavior: Clip.none,
                            alignment: Alignment.center,
                            children: [
                              // Image mascotte Uni 3D avec fallback WebP
                              Container(
                                width: 76,
                                height: 76,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.2),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Image.asset(
                                  type.imageAsset,
                                  fit: BoxFit.contain,
                                  errorBuilder: (_, __, ___) => Image.asset(
                                    'assets/mascot/uni_celebrate.webp',
                                    fit: BoxFit.contain,
                                  ),
                                ),
                              ),

                              // Bulle de dialogue si tapée
                              if (_showBubble)
                                Positioned(
                                  top: -30,
                                  right: 0,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(10),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withValues(alpha: 0.2),
                                          blurRadius: 6,
                                        ),
                                      ],
                                    ),
                                    child: Text(
                                      type.bubbleQuotes[_quoteIndex],
                                      style: const TextStyle(
                                        color: Color(0xFF0F172A),
                                        fontSize: 9.5,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Indicateurs de pagination discrets (6 états)
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      for (final t in UniReminderType.values)
                        Container(
                          margin: const EdgeInsets.symmetric(horizontal: 2.5),
                          width: t == type ? 14 : 5,
                          height: 4,
                          decoration: BoxDecoration(
                            color: t == type ? Colors.white : Colors.white.withValues(alpha: 0.3),
                            borderRadius: BorderRadius.circular(2),
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
    );
  }
}

/// Modal Bottom Sheet pour tester en direct chaque type de push notification.
class _PushNotificationTestSheet extends StatelessWidget {
  final UniReminderType currentType;
  final ValueChanged<UniReminderType> onSelectType;

  const _PushNotificationTestSheet({
    required this.currentType,
    required this.onSelectType,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Row(
                children: [
                  PhosphorIcon(PhosphorIconsFill.bellRinging, color: AppColors.primaryBlue, size: 22),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Tester une notification push / rappel',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              const Text(
                'Sélectionnez un rappel pour déclencher immédiatement une alerte locale / push réelle sur l\'appareil :',
                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 14),
          for (final t in UniReminderType.values)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: InkWell(
                onTap: () => onSelectType(t),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                  decoration: BoxDecoration(
                    color: t == currentType ? t.primaryColor.withValues(alpha: 0.08) : Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: t == currentType ? t.primaryColor : Colors.grey.shade200,
                      width: 1.2,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: t.primaryColor.withValues(alpha: 0.12),
                          shape: BoxShape.circle,
                        ),
                        child: ClipOval(
                          child: Image.asset(
                            t.imageAsset,
                            fit: BoxFit.contain,
                            errorBuilder: (_, __, ___) => const Center(
                              child: PhosphorIcon(PhosphorIconsFill.sparkle, size: 18),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              t.title,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: t == currentType ? t.primaryColor : AppColors.textPrimary,
                              ),
                            ),
                            Text(
                              t.punchline,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: t.primaryColor,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text(
                          'Déclencher',
                          style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
          ),
        ),
      ),
    );
  }
}
