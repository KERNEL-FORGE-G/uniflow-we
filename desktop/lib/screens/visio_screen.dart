import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/local_visio_server.dart';

class VisioScreen extends StatefulWidget {
  final String userName;

  const VisioScreen({
    super.key,
    this.userName = '',
  });

  @override
  State<VisioScreen> createState() => _VisioScreenState();
}

class _VisioScreenState extends State<VisioScreen>
    with SingleTickerProviderStateMixin {
  final LocalVisioServer _server = LocalVisioServer.instance;
  final TextEditingController _roomController =
      TextEditingController(text: 'AMPHI-VIRTUEL-UY1');
  final TextEditingController _chatController = TextEditingController();

  // Onglet sélectionné : 0 = Console Direct, 1 = Accès Invités / QR, 2 = Architecture Zéro-Dépendance
  int _selectedTab = 0;

  // Contrôles de séance en direct
  bool _isMuted = false;
  bool _isCameraOff = false;
  bool _isScreenSharing = false;
  bool _isHandRaised = false;
  bool _isRecording = false;
  int _recordingSeconds = 0;
  Timer? _recordingTimer;
  bool _showChatPanel = false;
  bool _copied = false;

  // Diapo active pour le partage d'écran
  int _currentSlide = 1;
  final int _totalSlides = 6;

  // Messages du chat de séance
  late final List<Map<String, dynamic>> _chatMessages;

  // Participants connectés
  late final List<Map<String, dynamic>> _participants;

  @override
  void initState() {
    super.initState();
    final effectiveUser = widget.userName.isNotEmpty ? widget.userName : 'Moi (Connecté)';
    _chatMessages = [
      {
        'sender': 'UniBot IA',
        'role': 'Copilote Amphi',
        'time': '10:00',
        'text':
            'Bienvenue dans l\'Amphi Virtuel UniFlow. La transcription et l\'émargement automatique sont actifs.',
        'isBot': true,
      },
      {
        'sender': effectiveUser,
        'role': 'Étudiant Certifié',
        'time': '10:02',
        'text':
            'Bonjour Professeur, le son et le partage d\'écran sont parfaitement nets sur nos écrans.',
        'isBot': false,
      },
      {
        'sender': 'Audrey Kenfack',
        'role': 'Étudiante',
        'time': '10:05',
        'text':
            'Dr. Kamga, pourriez-vous réexpliquer la différence entre consensus Raft et PBFT ?',
        'isBot': false,
      },
    ];

    _participants = [
      {
        'name': 'Dr. Kamga (Hôte)',
        'role': 'Enseignant',
        'isHost': true,
        'isMuted': false,
        'handRaised': false,
        'avatar': 'K',
        'color': const Color(0xFF1E3A8A),
      },
      {
        'name': effectiveUser,
        'role': 'Étudiant Certifié',
        'isHost': false,
        'isMuted': true,
        'handRaised': false,
        'avatar': effectiveUser.isNotEmpty ? effectiveUser[0].toUpperCase() : 'M',
        'color': const Color(0xFF0D9488),
      },
      {
        'name': 'Audrey Kenfack',
        'role': 'Étudiante',
        'isHost': false,
        'isMuted': true,
        'handRaised': true,
        'avatar': 'A',
        'color': const Color(0xFF7C3AED),
      },
      {
        'name': 'Junior Etoa',
        'role': 'Étudiant',
        'isHost': false,
        'isMuted': true,
        'handRaised': false,
        'avatar': 'J',
        'color': const Color(0xFFEA580C),
      },
      {
        'name': 'UniBot Campus',
        'role': 'Assistant IA',
        'isHost': false,
        'isMuted': false,
        'handRaised': false,
        'avatar': '🤖',
        'color': const Color(0xFF0284C7),
      },
    ];
    _ensureServerRunning();
  }

  Future<void> _ensureServerRunning() async {
    if (!_server.isRunning) {
      await _server.startServer(room: _roomController.text.trim());
      if (mounted) setState(() {});
    }
  }

  @override
  void dispose() {
    _roomController.dispose();
    _chatController.dispose();
    _recordingTimer?.cancel();
    super.dispose();
  }

  void _toggleRecording() {
    setState(() {
      _isRecording = !_isRecording;
      if (_isRecording) {
        _recordingSeconds = 0;
        _recordingTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
          if (mounted) {
            setState(() => _recordingSeconds++);
          }
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
                '🔴 Enregistrement de l\'amphi démarré (sauvegarde locale directe sans cloud)'),
            backgroundColor: Color(0xFFDC2626),
            duration: Duration(seconds: 3),
          ),
        );
      } else {
        _recordingTimer?.cancel();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
                '✅ Séance enregistrée dans Documents/UniFlow/Enregistrements/'),
            backgroundColor: Color(0xFF0D9488),
            duration: Duration(seconds: 3),
          ),
        );
      }
    });
  }

  String _formatTimer(int totalSeconds) {
    final minutes = (totalSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (totalSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  void _sendMessage() {
    final text = _chatController.text.trim();
    if (text.isEmpty) return;
    final now = DateTime.now();
    final timeStr =
        '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    setState(() {
      _chatMessages.add({
        'sender': 'Dr. Kamga (Hôte)',
        'role': 'Enseignant',
        'time': timeStr,
        'text': text,
        'isBot': false,
      });
      _chatController.clear();
    });
  }

  void _copyUrl(String url) {
    Clipboard.setData(ClipboardData(text: url));
    setState(() => _copied = true);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Lien de visioconférence copié dans le presse-papier !'),
        backgroundColor: Color(0xFF0D9488),
        duration: Duration(seconds: 2),
      ),
    );
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) setState(() => _copied = false);
    });
  }

  Future<void> _openInBrowser(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final networkUrl = _server.getShareableNetworkUrl();
    final localUrl = _server.getLocalUrl();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Header Bento principal
            _buildHeroHeader(),

            const SizedBox(height: 20),

            // 2. Sélecteur d'onglets Bento (Direct, Accès Invités, Zéro Dépendance)
            _buildTabSelector(),

            const SizedBox(height: 20),

            // 3. Contenu de l'onglet actif
            if (_selectedTab == 0)
              _buildLiveConsoleView(networkUrl, localUrl)
            else if (_selectedTab == 1)
              _buildGuestAccessView(networkUrl, localUrl)
            else
              _buildZeroDependencyArchitectureView(),
          ],
        ),
      ),
    );
  }

  /// Header Hero Bento avec badge et indicateurs d'état
  Widget _buildHeroHeader() {
    return Container(
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
            color: const Color(0xFF1E3A8A).withValues(alpha: 0.25),
            blurRadius: 18,
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
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                    border:
                        Border.all(color: Colors.white.withValues(alpha: 0.2)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Color(0xFF34D399),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Text(
                        'Service Visioconférence Embarqué 100% Autonome',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Amphi Virtuel & Visio Campus HD',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Service entièrement intégré dans le binaire UniFlow Desktop. Aucune installation externe requise (pas de Zoom, ni Teams, ni serveur Node). Vous animez vos amphis en direct et les participants rejoignent instantanément via leur navigateur.',
                  style: TextStyle(
                      color: Color(0xFFCBD5E1), fontSize: 13, height: 1.5),
                ),
              ],
            ),
          ),
          const SizedBox(width: 24),
          Container(
            width: 80,
            height: 80,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
            ),
            child: Image.asset(
              'assets/icons/nav/visio.png',
              fit: BoxFit.contain,
              errorBuilder: (_, __, ___) => const Icon(
                Icons.videocam_rounded,
                color: Colors.white,
                size: 40,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
            ),
            child: Column(
              children: [
                const Icon(Icons.people_alt_rounded,
                    color: Colors.white, size: 26),
                const SizedBox(height: 4),
                Text(
                  '${_participants.length}',
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w900),
                ),
                const Text(
                  'Présents amphi',
                  style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Sélecteur d'onglets moderne style Bento
  Widget _buildTabSelector() {
    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildTabButton(
              index: 0,
              icon: Icons.videocam_rounded,
              title: 'Console Amphi en Direct',
              subtitle: 'Scène, Partage & Commandes',
            ),
            const SizedBox(width: 8),
            _buildTabButton(
              index: 1,
              icon: Icons.qr_code_rounded,
              title: 'Accès Invités & QR Code',
              subtitle: 'Lien web pour smartphones',
            ),
            const SizedBox(width: 8),
            _buildTabButton(
              index: 2,
              icon: Icons.security_rounded,
              title: 'Zéro Dépendance & Moteur',
              subtitle: 'Compilé en natif sans tiers',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabButton({
    required int index,
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    final isSelected = _selectedTab == index;
    return InkWell(
      onTap: () => setState(() => _selectedTab = index),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF1E3A8A) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF1E3A8A).withValues(alpha: 0.25),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isSelected ? Colors.white : const Color(0xFF64748B),
              size: 20,
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: isSelected ? Colors.white : const Color(0xFF1E293B),
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 10,
                    color: isSelected
                        ? const Color(0xFF93C5FD)
                        : const Color(0xFF94A3B8),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  /// Onglet 0 : Console Amphi en direct avec scène interactive & contrôles
  Widget _buildLiveConsoleView(String networkUrl, String localUrl) {
    return Column(
      children: [
        // Zone Principale : Scène Amphi + Panneau Chat latéral
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Scène de diffusion principale
            Expanded(
              flex: _showChatPanel ? 7 : 10,
              child: Container(
                height: 520,
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF1E293B)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.15),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Stack(
                  children: [
                    // Arrière-plan de la scène (Partage d'écran OU Vidéo enseignant)
                    Positioned.fill(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: _isScreenSharing
                            ? _buildScreenSharingCanvas()
                            : _buildInstructorVideoStage(),
                      ),
                    ),

                    // Badge d'état en haut à gauche
                    Positioned(
                      top: 16,
                      left: 16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.65),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                              color: Colors.white.withValues(alpha: 0.15)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: Color(0xFFEF4444),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'EN DIRECT',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 0.5),
                            ),
                            const SizedBox(width: 8),
                            Container(
                                width: 1, height: 12, color: Colors.white24),
                            const SizedBox(width: 8),
                            Text(
                              _roomController.text,
                              style: const TextStyle(
                                  color: Color(0xFF38BDF8),
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Badge Enregistrement actif
                    if (_isRecording)
                      Positioned(
                        top: 16,
                        left: 230,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFDC2626),
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFFDC2626)
                                    .withValues(alpha: 0.5),
                                blurRadius: 10,
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.fiber_manual_record_rounded,
                                  color: Colors.white, size: 14),
                              const SizedBox(width: 6),
                              Text(
                                'REC ${_formatTimer(_recordingSeconds)}',
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w900),
                              ),
                            ],
                          ),
                        ),
                      ),

                    // Badge Qualité & Participants en haut à droite
                    Positioned(
                      top: 16,
                      right: 16,
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.65),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                  color: Colors.white.withValues(alpha: 0.15)),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.hd_rounded,
                                    color: Color(0xFF34D399), size: 16),
                                SizedBox(width: 6),
                                Text(
                                  '1080p WebRTC P2P',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Tooltip(
                            message: 'Ouvrir miroir plein écran',
                            child: InkWell(
                              onTap: () => _openInBrowser(localUrl),
                              borderRadius: BorderRadius.circular(20),
                              child: Container(
                                padding: const EdgeInsets.all(7),
                                decoration: BoxDecoration(
                                  color: Colors.black.withValues(alpha: 0.65),
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                      color:
                                          Colors.white.withValues(alpha: 0.15)),
                                ),
                                child: const Icon(Icons.fullscreen_rounded,
                                    color: Colors.white, size: 18),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Miniatures des participants en bas de scène
                    Positioned(
                      bottom: 80,
                      left: 16,
                      right: 16,
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: _participants.map((p) {
                            final isHost = p['isHost'] == true;
                            return Container(
                              margin: const EdgeInsets.only(right: 10),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.75),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: p['handRaised'] == true
                                      ? const Color(0xFFF59E0B)
                                      : Colors.white.withValues(alpha: 0.15),
                                  width: p['handRaised'] == true ? 2 : 1,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  CircleAvatar(
                                    radius: 12,
                                    backgroundColor: p['color'] as Color,
                                    child: Text(
                                      p['avatar'] as String,
                                      style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    p['name'] as String,
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(width: 6),
                                  Icon(
                                    p['isMuted'] == true
                                        ? Icons.mic_off_rounded
                                        : Icons.mic_rounded,
                                    color: p['isMuted'] == true
                                        ? const Color(0xFFEF4444)
                                        : const Color(0xFF34D399),
                                    size: 14,
                                  ),
                                  if (p['handRaised'] == true) ...[
                                    const SizedBox(width: 4),
                                    const Icon(Icons.front_hand_rounded,
                                        color: Color(0xFFF59E0B), size: 14),
                                  ],
                                  if (isHost) ...[
                                    const SizedBox(width: 4),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 4, vertical: 1),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF1E3A8A),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: const Text('Hôte',
                                          style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 8,
                                              fontWeight: FontWeight.w900)),
                                    ),
                                  ],
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ),

                    // Barre de contrôle flottante en bas
                    Positioned(
                      bottom: 14,
                      left: 16,
                      right: 16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B)
                              .withValues(alpha: 0.95),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                              color: Colors.white.withValues(alpha: 0.1)),
                        ),
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              // Groupe Micro & Caméra
                              Row(
                                children: [
                                  _buildMeetingControlButton(
                                    icon: _isMuted
                                        ? Icons.mic_off_rounded
                                        : Icons.mic_rounded,
                                    label: _isMuted ? 'Activer' : 'Muet',
                                    isActive: !_isMuted,
                                    activeColor: const Color(0xFF0D9488),
                                    inactiveColor: const Color(0xFFEF4444),
                                    onTap: () =>
                                        setState(() => _isMuted = !_isMuted),
                                  ),
                                  const SizedBox(width: 8),
                                  _buildMeetingControlButton(
                                    icon: _isCameraOff
                                        ? Icons.videocam_off_rounded
                                        : Icons.videocam_rounded,
                                    label:
                                        _isCameraOff ? 'Caméra OFF' : 'Caméra',
                                    isActive: !_isCameraOff,
                                    activeColor: const Color(0xFF0D9488),
                                    inactiveColor: const Color(0xFFEF4444),
                                    onTap: () => setState(
                                        () => _isCameraOff = !_isCameraOff),
                                  ),
                                ],
                              ),

                              const SizedBox(width: 16),

                              // Groupe Partage d'écran, Lever la main, Enregistrement
                              Row(
                                children: [
                                  _buildMeetingControlButton(
                                    icon: _isScreenSharing
                                        ? Icons.stop_screen_share_rounded
                                        : Icons.screen_share_rounded,
                                    label: _isScreenSharing
                                        ? 'Arrêter Partage'
                                        : 'Partager',
                                    isActive: _isScreenSharing,
                                    activeColor: const Color(0xFF2563EB),
                                    onTap: () => setState(() =>
                                        _isScreenSharing = !_isScreenSharing),
                                  ),
                                  const SizedBox(width: 8),
                                  _buildMeetingControlButton(
                                    icon: Icons.front_hand_rounded,
                                    label: _isHandRaised
                                        ? 'Main levée'
                                        : 'Lever la main',
                                    isActive: _isHandRaised,
                                    activeColor: const Color(0xFFF59E0B),
                                    onTap: () => setState(
                                        () => _isHandRaised = !_isHandRaised),
                                  ),
                                  const SizedBox(width: 8),
                                  _buildMeetingControlButton(
                                    icon: _isRecording
                                        ? Icons.stop_circle_rounded
                                        : Icons.radio_button_checked_rounded,
                                    label: _isRecording ? 'Arrêter REC' : 'REC',
                                    isActive: _isRecording,
                                    activeColor: const Color(0xFFDC2626),
                                    onTap: _toggleRecording,
                                  ),
                                ],
                              ),

                              const SizedBox(width: 16),

                              // Groupe Chat & Quitter
                              Row(
                                children: [
                                  _buildMeetingControlButton(
                                    icon: Icons.chat_bubble_rounded,
                                    label: 'Chat',
                                    isActive: _showChatPanel,
                                    activeColor: const Color(0xFF0D9488),
                                    onTap: () => setState(
                                        () => _showChatPanel = !_showChatPanel),
                                  ),
                                  const SizedBox(width: 8),
                                  ElevatedButton.icon(
                                    onPressed: () {
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(
                                        const SnackBar(
                                          content: Text(
                                              'Séance amphi toujours active en arrière-plan.'),
                                          backgroundColor: Color(0xFF1E3A8A),
                                        ),
                                      );
                                    },
                                    icon: const Icon(Icons.call_end_rounded,
                                        size: 16),
                                    label: const Text('Fin séance'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFFDC2626),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 14, vertical: 10),
                                      shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(10),
                                      ),
                                    ),
                                  ),
                                ],
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

            // Panneau Chat latéral déployé
            if (_showChatPanel) ...[
              const SizedBox(width: 16),
              Expanded(
                flex: 3,
                child: Container(
                  height: 520,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 10,
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
                          const Row(
                            children: [
                              Icon(Icons.chat_bubble_outline_rounded,
                                  color: Color(0xFF1E3A8A), size: 18),
                              SizedBox(width: 8),
                              Text(
                                'Questions & Chat',
                                style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF0F172A)),
                              ),
                            ],
                          ),
                          IconButton(
                            onPressed: () =>
                                setState(() => _showChatPanel = false),
                            icon: const Icon(Icons.close_rounded, size: 18),
                            color: const Color(0xFF64748B),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                        ],
                      ),
                      const Divider(height: 16),
                      Expanded(
                        child: ListView.builder(
                          itemCount: _chatMessages.length,
                          itemBuilder: (context, index) {
                            final msg = _chatMessages[index];
                            final isBot = msg['isBot'] == true;
                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: isBot
                                    ? const Color(0xFFEFF6FF)
                                    : const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isBot
                                      ? const Color(0xFFBFDBFE)
                                      : const Color(0xFFE2E8F0),
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        msg['sender'] as String,
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: isBot
                                              ? const Color(0xFF1E40AF)
                                              : const Color(0xFF1E293B),
                                        ),
                                      ),
                                      Text(
                                        msg['time'] as String,
                                        style: const TextStyle(
                                            fontSize: 9,
                                            color: Color(0xFF94A3B8)),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    msg['text'] as String,
                                    style: const TextStyle(
                                        fontSize: 12,
                                        color: Color(0xFF334155),
                                        height: 1.3),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _chatController,
                              onSubmitted: (_) => _sendMessage(),
                              decoration: InputDecoration(
                                hintText: 'Répondre à l\'amphi…',
                                hintStyle: const TextStyle(fontSize: 12),
                                contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 8),
                                filled: true,
                                fillColor: const Color(0xFFF1F5F9),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          IconButton(
                            onPressed: _sendMessage,
                            icon: const Icon(Icons.send_rounded, size: 18),
                            color: const Color(0xFF1E3A8A),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),

        const SizedBox(height: 20),

        // Bandeau d'actions rapides sous la console
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0D9488).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.hub_rounded,
                        color: Color(0xFF0D9488), size: 20),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Accès Réseau Local pour Étudiants & Invités',
                        style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0F172A)),
                      ),
                      Text(
                        networkUrl,
                        style: const TextStyle(
                            fontSize: 11,
                            fontFamily: 'monospace',
                            color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                ],
              ),
              Wrap(
                spacing: 10,
                runSpacing: 8,
                children: [
                  OutlinedButton.icon(
                    onPressed: () => _copyUrl(networkUrl),
                    icon: Icon(
                        _copied
                            ? Icons.check_circle_rounded
                            : Icons.copy_rounded,
                        size: 16),
                    label: Text(_copied ? 'Lien copié' : 'Copier le lien'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF0D9488),
                      side: const BorderSide(color: Color(0xFF0D9488)),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: () => setState(() => _selectedTab = 1),
                    icon: const Icon(Icons.qr_code_rounded, size: 16),
                    label: const Text('Afficher le QR Code'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E3A8A),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// Toile de partage d'écran de l'amphithéâtre
  Widget _buildScreenSharingCanvas() {
    return Container(
      color: const Color(0xFF1E293B),
      child: Column(
        children: [
          // Barre d'état du partage d'écran
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: const Color(0xFF0F172A),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.screen_share_rounded,
                        color: Color(0xFF38BDF8), size: 18),
                    SizedBox(width: 8),
                    Text(
                      'Partage de Diapositive · INF4067 (Systèmes Distribués)',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                Row(
                  children: [
                    IconButton(
                      onPressed: _currentSlide > 1
                          ? () => setState(() => _currentSlide--)
                          : null,
                      icon: const Icon(Icons.chevron_left_rounded,
                          color: Colors.white, size: 20),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Diapo $_currentSlide / $_totalSlides',
                      style: const TextStyle(
                          color: Color(0xFF94A3B8),
                          fontSize: 11,
                          fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      onPressed: _currentSlide < _totalSlides
                          ? () => setState(() => _currentSlide++)
                          : null,
                      icon: const Icon(Icons.chevron_right_rounded,
                          color: Colors.white, size: 20),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Zone diapo
          Expanded(
            child: Center(
              child: Container(
                margin: const EdgeInsets.all(24),
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.3),
                      blurRadius: 20,
                    ),
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'CHAPITRE 4 · ALGORITHMES DISTRIBUÉS & TOLÉRANCE AUX PANNES',
                        style: TextStyle(
                            color: Color(0xFF1E3A8A),
                            fontSize: 11,
                            fontWeight: FontWeight.w900),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Consensus Décentralisé & Signalling WebRTC Local',
                      style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      '1. Négociation P2P directe sans serveur de relais externe (STUN/TURN en réseau privé campus).\n'
                      '2. Tolérance aux partitions réseau du campus UY1 grâce au cache distribué local.\n'
                      '3. Synchronisation cryptographique des présences étudiantes par jeton dynamique.',
                      style: TextStyle(
                          fontSize: 14, height: 1.6, color: Color(0xFF475569)),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF0FDF4),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFBBF7D0)),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.check_circle_rounded,
                                  color: Color(0xFF16A34A), size: 16),
                              SizedBox(width: 6),
                              Text('Diffusion synchrone 1080p active',
                                  style: TextStyle(
                                      color: Color(0xFF166534),
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Scène vidéo / avatar de l'enseignant (Hôte)
  Widget _buildInstructorVideoStage() {
    return Container(
      color: const Color(0xFF0B132B),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              alignment: Alignment.center,
              children: [
                // Onde audio animée si micro actif
                if (!_isMuted)
                  Container(
                    width: 140,
                    height: 140,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: const Color(0xFF0D9488).withValues(alpha: 0.35),
                        width: 3,
                      ),
                    ),
                  ),
                Container(
                  width: 110,
                  height: 110,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(
                      colors: [Color(0xFF1E3A8A), Color(0xFF0D9488)],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0D9488).withValues(alpha: 0.4),
                        blurRadius: 20,
                      ),
                    ],
                  ),
                  child: Center(
                    child: _isCameraOff
                        ? const Icon(Icons.videocam_off_rounded,
                            color: Colors.white, size: 48)
                        : const Text(
                            'K',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 44,
                                fontWeight: FontWeight.w900),
                          ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              'Dr. Kamga (Hôte & Enseignant)',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 6),
            Text(
              _isCameraOff
                  ? 'Caméra désactivée · Flux audio en cours'
                  : 'Caméra HD active · Amphi connecté',
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMeetingControlButton({
    required IconData icon,
    required String label,
    required bool isActive,
    Color activeColor = const Color(0xFF1E3A8A),
    Color inactiveColor = const Color(0xFF64748B),
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isActive
              ? activeColor.withValues(alpha: 0.2)
              : Colors.black.withValues(alpha: 0.3),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isActive
                ? activeColor.withValues(alpha: 0.6)
                : Colors.white.withValues(alpha: 0.1),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isActive ? activeColor : inactiveColor,
              size: 16,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: isActive ? Colors.white : const Color(0xFF94A3B8),
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Onglet 1 : Accès Invités & QR Code pour smartphones sans installation
  Widget _buildGuestAccessView(String networkUrl, String localUrl) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Colonne Gauche : Configuration du salon & Liens
        Expanded(
          flex: 3,
          child: Column(
            children: [
              // Bento Card : Configuration du salon
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Configuration de la séance',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 14),
                    TextField(
                      controller: _roomController,
                      decoration: InputDecoration(
                        labelText: 'Nom du Salon / Code du cours',
                        hintText: 'ex: AMPHI-501-INF4067',
                        prefixIcon: const Icon(Icons.meeting_room_rounded,
                            color: Color(0xFF1E3A8A)),
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide:
                              const BorderSide(color: Color(0xFFE2E8F0)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 12,
                      runSpacing: 10,
                      children: [
                        ElevatedButton.icon(
                          onPressed: () async {
                            await _server.stopServer();
                            await _server.startServer(
                                room: _roomController.text.trim());
                            setState(() {});
                          },
                          icon: const Icon(Icons.refresh_rounded, size: 16),
                          label: const Text('Actualiser le salon'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1E3A8A),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                        OutlinedButton.icon(
                          onPressed: () => _openInBrowser(localUrl),
                          icon: const Icon(Icons.open_in_new_rounded, size: 16),
                          label:
                              const Text('Ouvrir l\'amphi dans mon navigateur'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF1E3A8A),
                            side: const BorderSide(color: Color(0xFF1E3A8A)),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Bento Card : Liens d'accès pour les invités (Sans Appli)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color:
                                const Color(0xFF0D9488).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.share_rounded,
                              color: Color(0xFF0D9488), size: 20),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Lien direct pour invités sans l\'application',
                                style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF0F172A)),
                              ),
                              Text(
                                'Ouvre une session web HD optimisée sur tout navigateur',
                                style: TextStyle(
                                    fontSize: 12, color: Color(0xFF64748B)),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFCBD5E1)),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              networkUrl,
                              style: const TextStyle(
                                fontFamily: 'monospace',
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0F172A),
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          IconButton(
                            onPressed: () => _copyUrl(networkUrl),
                            icon: Icon(
                              _copied
                                  ? Icons.check_circle_rounded
                                  : Icons.copy_rounded,
                              color: _copied
                                  ? const Color(0xFF0D9488)
                                  : const Color(0xFF64748B),
                              size: 18,
                            ),
                            tooltip: 'Copier le lien',
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      '💡 Conseil : Assurez-vous que les participants soient connectés au même réseau Wi-Fi local ou hotspot du campus UY1.',
                      style: TextStyle(
                          fontSize: 11,
                          color: Color(0xFF64748B),
                          fontStyle: FontStyle.italic),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(width: 20),

        // Colonne Droite : Flashcode QR & Accès Mobile
        Expanded(
          flex: 2,
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Text(
                  'Scanner pour rejoindre',
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A)),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Aucune installation requise sur smartphone',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: QrImageView(
                    data: networkUrl,
                    version: QrVersions.auto,
                    size: 180.0,
                    eyeStyle: const QrEyeStyle(
                      eyeShape: QrEyeShape.square,
                      color: Color(0xFF1E3A8A),
                    ),
                    dataModuleStyle: const QrDataModuleStyle(
                      dataModuleShape: QrDataModuleShape.circle,
                      color: Color(0xFF0D9488),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: () => _copyUrl(networkUrl),
                  icon: const Icon(Icons.share_rounded, size: 16),
                  label: const Text('Partager le lien de séance'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0D9488),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 44),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  /// Onglet 2 : Architecture Zéro Dépendance & Sécurité
  Widget _buildZeroDependencyArchitectureView() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E3A8A).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.verified_user_rounded,
                    color: Color(0xFF1E3A8A), size: 24),
              ),
              const SizedBox(width: 14),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Architecture Visioconférence Autonome UniFlow Desktop',
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0F172A)),
                  ),
                  Text(
                    'Pourquoi les utilisateurs n\'ont absolument rien d\'autre à installer',
                    style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Divider(),
          const SizedBox(height: 16),
          _buildFeatureRow(
            icon: Icons.check_circle_rounded,
            title: '1. Serveur HTTP/WebSocket compilé en Dart Natif',
            description:
                'Le serveur de signalement et de distribution WebRTC est directement intégré dans le code binaire de l\'application UniFlow Desktop. Zéro Node.js, zéro runtime Python, zéro configuration Nginx nécessaire.',
          ),
          const SizedBox(height: 14),
          _buildFeatureRow(
            icon: Icons.check_circle_rounded,
            title: '2. Protocole WebRTC P2P direct et chiffré de bout en bout',
            description:
                'Le flux vidéo et audio transite directement entre les postes sur le réseau local ou Wi-Fi du campus sans quitter l\'université. Confidentialité absolue et consommation minimale de bande passante Internet.',
          ),
          const SizedBox(height: 14),
          _buildFeatureRow(
            icon: Icons.check_circle_rounded,
            title: '3. Client Web HTML5 universel pour les étudiants',
            description:
                'Les étudiants ou collègues rejoignent depuis n\'importe quel smartphone (Android, iOS) ou ordinateur via leur navigateur web habituel en scannant le QR code. Aucun compte tiers ni téléchargement supplémentaire n\'est imposé.',
          ),
          const SizedBox(height: 14),
          _buildFeatureRow(
            icon: Icons.check_circle_rounded,
            title: '4. Enregistrement local des cours sans quota cloud',
            description:
                'L\'enregistrement des cours s\'écrit directement sur le stockage local de la machine en haute définition (1080p). Aucune limitation de durée ni frais de stockage cloud.',
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureRow({
    required IconData icon,
    required String title,
    required String description,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: const Color(0xFF10B981), size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B)),
              ),
              const SizedBox(height: 4),
              Text(
                description,
                style: const TextStyle(
                    fontSize: 12, color: Color(0xFF64748B), height: 1.4),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
