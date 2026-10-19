import 'package:flutter/material.dart';

class CreatorMemberScreen extends StatefulWidget {
  final String userName;
  final String userEmail;
  final String userRole;
  final Function(String newRole)? onRoleChanged;

  const CreatorMemberScreen({
    super.key,
    this.userName = '',
    this.userEmail = '',
    this.userRole = 'Membre Fondateur KERNEL FORGE',
    this.onRoleChanged,
  });

  @override
  State<CreatorMemberScreen> createState() => _CreatorMemberScreenState();
}

class _CreatorMemberScreenState extends State<CreatorMemberScreen> {
  bool _isMemberInterface = true;
  String _selectedAvatar = 'assets/illustrations/photo_1_2026-10-02_13-20-47.jpg';
  late String _currentRole;
  late String _currentBio;
  late String _currentSubTeam;

  final List<String> _myStacks = [
    'Flutter Desktop & Mobile',
    'Dart',
    'Appwrite BaaS',
    'LiveKit WebRTC',
    'TypeScript',
    'Offline Sync / SQLite',
  ];

  final List<String> _availableStacks = [
    'NestJS Microservices',
    'Docker & Linux SysAdmin',
    'Cybersécurité & Cryptographie',
    'Tailwind CSS',
    'Python & IA',
    'PostgreSQL',
    'UI/UX Figma 3D',
  ];

  final List<Map<String, dynamic>> _myTasks = [
    {
      'id': 'tsk-1',
      'title': 'Pipeline WebRTC visioconférence P2P Linux & Windows',
      'status': 'Terminé',
      'priority': 'Haute',
      'deadline': '18 Octobre 2026',
      'done': true,
      'category': 'Architecture',
    },
    {
      'id': 'tsk-2',
      'title': 'Streaming Z-Library RAM vers Bucket Appwrite sans stockage VPS',
      'status': 'Terminé',
      'priority': 'Critique',
      'deadline': '18 Octobre 2026',
      'done': true,
      'category': 'Backend VPS',
    },
    {
      'id': 'tsk-3',
      'title': 'Intégration Bento Grid 3D Hero sur toutes les plateformes Desktop',
      'status': 'En cours',
      'priority': 'Haute',
      'deadline': '22 Octobre 2026',
      'done': false,
      'category': 'UI/UX',
    },
    {
      'id': 'tsk-4',
      'title': 'Synchronisation hors-ligne des présences QR cryptographiques',
      'status': 'En cours',
      'priority': 'Moyenne',
      'deadline': '25 Octobre 2026',
      'done': false,
      'category': 'Sécurité',
    },
    {
      'id': 'tsk-5',
      'title': 'Packaging MSIX et AppImage pour les postes des amphis UY1',
      'status': 'À faire',
      'priority': 'Normale',
      'deadline': '30 Octobre 2026',
      'done': false,
      'category': 'DevOps',
    },
  ];

  final List<Map<String, dynamic>> _teamRoster = [
    {
      'name': 'NGHOMSI FEUKOUO RAVEL',
      'role': 'Fondateur KERNEL FORGE & Lead Architect',
      'email': 'ravelnghomsi@gmail.com',
      'github': 'Archlord12345',
      'subTeam': 'Architecture & Direction',
      'avatar': 'assets/illustrations/photo_1_2026-10-02_13-20-47.jpg',
      'stacks': ['Flutter', 'LiveKit', 'Appwrite', 'NestJS', 'Linux'],
      'isLead': true,
    },
    {
      'name': 'HASSANE YOUSSOUF OUMAR',
      'role': 'Backend Developer & Systèmes',
      'email': 'h.hawadja1@gmail.com',
      'github': 'Hawadja',
      'subTeam': 'Backend Microservices & Réseaux',
      'avatar': 'assets/illustrations/photo_2_2026-10-02_13-20-47.jpg',
      'stacks': ['NestJS', 'Docker', 'PostgreSQL', 'Microservices'],
      'isLead': false,
    },
    {
      'name': 'FEBNCHAK SANDRA BORELLE',
      'role': 'Développeuse Full-Stack & Mobile UI/UX',
      'email': 'sandraborelle0@gmail.com',
      'github': 'FEBNCHAK',
      'subTeam': 'Frontend Mobile App & Web',
      'avatar': 'assets/illustrations/photo_3_2026-10-02_13-20-47.jpg',
      'stacks': ['React', 'Flutter', 'Tailwind CSS', 'Figma'],
      'isLead': false,
    },
    {
      'name': 'TESSOH MARCEL',
      'role': 'Ingénieur Logiciel & Co-Architecte',
      'email': 'marcel.tessoh@kernelforge.codes',
      'github': 'MarcelTessoh',
      'subTeam': 'Core Engine & Desktop Platform',
      'avatar': 'assets/illustrations/photo_4_2026-10-02_13-20-47.jpg',
      'stacks': ['Flutter Desktop', 'Dart', 'WebRTC', 'Drift DB'],
      'isLead': false,
    },
    {
      'name': 'TSAFACK IVAN JUNIOR',
      'role': 'Ingénieur DevOps & Cloud Infra',
      'email': 'ivan.tsafack@kernelforge.codes',
      'github': 'IvanTsafack',
      'subTeam': 'Infrastructure & CI/CD',
      'avatar': 'assets/illustrations/photo_5_2026-10-02_13-20-47.jpg',
      'stacks': ['Kubernetes', 'Docker', 'VPS Linux', 'Nginx Reverse Proxy'],
      'isLead': false,
    },
    {
      'name': 'POUANI CHRISTIAN',
      'role': 'Spécialiste Cybersécurité & IoT',
      'email': 'christian.pouani@kernelforge.codes',
      'github': 'ChristianPouani',
      'subTeam': 'Sentinelle IoT & Biométrie',
      'avatar': 'assets/illustrations/photo_6_2026-10-02_13-20-47.jpg',
      'stacks': ['Edge AI', 'Biométrie QR', 'ESP32', 'Python IoT'],
      'isLead': false,
    },
  ];

  @override
  void initState() {
    super.initState();
    _currentRole = widget.userRole;
    _currentBio = 'Ingénieur de développement chez KERNEL FORGE. Travaille sur l\'écosystème académique unifié UniFlow pour l\'Université de Yaoundé 1.';
    _currentSubTeam = 'Core Platform & Desktop Architecture';
  }

  void _toggleInterfaceMode(bool isMember) {
    setState(() {
      _isMemberInterface = isMember;
    });
    if (!isMember) {
      widget.onRoleChanged?.call('Étudiant');
    } else {
      widget.onRoleChanged?.call('Membre Fondateur KERNEL FORGE');
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          isMember
              ? 'Basculé sur l\'interface Membre Créateur KERNEL FORGE'
              : 'Basculé sur l\'interface Utilisateur Standard (Étudiant)',
        ),
        backgroundColor: isMember ? const Color(0xFF0D9488) : const Color(0xFF1E3A8A),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _showAvatarSelector() {
    final availableAvatars = [
      'assets/illustrations/photo_1_2026-10-02_13-20-47.jpg',
      'assets/illustrations/photo_2_2026-10-02_13-20-47.jpg',
      'assets/illustrations/photo_3_2026-10-02_13-20-47.jpg',
      'assets/illustrations/photo_4_2026-10-02_13-20-47.jpg',
      'assets/illustrations/photo_5_2026-10-02_13-20-47.jpg',
      'assets/illustrations/photo_6_2026-10-02_13-20-47.jpg',
      'assets/illustrations/photo_7_2026-10-02_13-20-47.jpg',
      'assets/illustrations/photo_8_2026-10-02_13-20-47.jpg',
      'assets/illustrations/photo_9_2026-10-02_13-20-47.jpg',
      'assets/illustrations/about_team_anime.jpg',
      'assets/mascot/uni_copilot_3d.png',
    ];

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0F172A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Row(
          children: [
            Icon(Icons.camera_alt_rounded, color: Color(0xFF38BDF8)),
            SizedBox(width: 10),
            Text(
              'Choisir ou changer votre photo de membre',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: SizedBox(
          width: 500,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Sélectionnez votre photo officielle réelle ou votre avatar de membre du projet :',
                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: availableAvatars.map((path) {
                  final isCurrent = _selectedAvatar == path;
                  return InkWell(
                    onTap: () {
                      setState(() => _selectedAvatar = path);
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Photo de membre mise à jour avec succès !'),
                          backgroundColor: Color(0xFF0D9488),
                        ),
                      );
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isCurrent ? const Color(0xFF38BDF8) : Colors.transparent,
                          width: 3,
                        ),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(13),
                        child: Image.asset(
                          path,
                          width: 70,
                          height: 70,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            width: 70,
                            height: 70,
                            color: const Color(0xFF1E293B),
                            child: const Icon(Icons.person, color: Colors.white54),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Fermer', style: TextStyle(color: Color(0xFF94A3B8))),
          ),
        ],
      ),
    );
  }

  void _showAddTaskDialog() {
    final titleCtrl = TextEditingController();
    String priority = 'Haute';
    String category = 'Core App';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDlgState) => AlertDialog(
          backgroundColor: const Color(0xFF0F172A),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Row(
            children: [
              Icon(Icons.add_task_rounded, color: Color(0xFF10B981)),
              SizedBox(width: 10),
              Text(
                'Ajouter une tâche à votre tableau de bord',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          content: SizedBox(
            width: 440,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: titleCtrl,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'Intitulé de la tâche / jalon',
                    labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                    hintText: 'Ex: Optimisation du cache Z-Library...',
                    hintStyle: const TextStyle(color: Colors.white30),
                    filled: true,
                    fillColor: const Color(0xFF1E293B),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Color(0xFF334155)),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: priority,
                        dropdownColor: const Color(0xFF1E293B),
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          labelText: 'Priorité',
                          labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                          filled: true,
                          fillColor: const Color(0xFF1E293B),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        items: ['Basse', 'Moyenne', 'Haute', 'Critique']
                            .map((p) => DropdownMenuItem(value: p, child: Text(p)))
                            .toList(),
                        onChanged: (v) => setDlgState(() => priority = v!),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: category,
                        dropdownColor: const Color(0xFF1E293B),
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          labelText: 'Domaine',
                          labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                          filled: true,
                          fillColor: const Color(0xFF1E293B),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        items: ['Core App', 'Architecture', 'UI/UX', 'DevOps', 'Sécurité']
                            .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                            .toList(),
                        onChanged: (v) => setDlgState(() => category = v!),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Annuler', style: TextStyle(color: Color(0xFF94A3B8))),
            ),
            ElevatedButton(
              onPressed: () {
                if (titleCtrl.text.trim().isNotEmpty) {
                  setState(() {
                    _myTasks.insert(0, {
                      'id': 'tsk-${DateTime.now().millisecondsSinceEpoch}',
                      'title': titleCtrl.text.trim(),
                      'status': 'En cours',
                      'priority': priority,
                      'deadline': 'Cette semaine',
                      'done': false,
                      'category': category,
                    });
                  });
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Tâche ajoutée avec succès à votre backlog membre !'),
                      backgroundColor: Color(0xFF10B981),
                    ),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0D9488),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Ajouter'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF0B132B),
      child: ListView(
        padding: const EdgeInsets.all(28),
        children: [
          // =================================================================
          // HERO BENTO SECTION : ESPACE MEMBRE CRÉATEUR KERNEL FORGE
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
                      // Badge Pill
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
                            Icon(Icons.workspace_premium_rounded, color: Color(0xFF67E8F9), size: 16),
                            SizedBox(width: 8),
                            Text(
                              'Compte Reconnu : Membre Créateur KERNEL FORGE · UniFlow UY1',
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
                        'Espace Développeur & Membre Créateur',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '$_currentBio Vous disposez des prérogatives de créateur du projet UniFlow. Choisissez votre mode d\'affichage actif, gérez votre profil public, votre photo officielle, votre pile technologique et vos tâches de roadmap.',
                        style: const TextStyle(
                          color: Color(0xFFCBD5E1),
                          fontSize: 13.5,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // BASCULEUR D'INTERFACE : Standard vs Membre Créateur
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A).withValues(alpha: 0.6),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
                        ),
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            // Option 1 : Interface Membre Créateur
                            InkWell(
                              onTap: () => _toggleInterfaceMode(true),
                              borderRadius: BorderRadius.circular(14),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                                decoration: BoxDecoration(
                                  gradient: _isMemberInterface
                                      ? const LinearGradient(
                                          colors: [Color(0xFF0D9488), Color(0xFF2563EB)],
                                        )
                                      : null,
                                  borderRadius: BorderRadius.circular(14),
                                  boxShadow: _isMemberInterface
                                      ? [
                                          BoxShadow(
                                            color: const Color(0xFF0D9488).withValues(alpha: 0.4),
                                            blurRadius: 10,
                                          )
                                        ]
                                      : [],
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.developer_mode_rounded,
                                      color: _isMemberInterface ? Colors.white : const Color(0xFF94A3B8),
                                      size: 18,
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      'Interface Membre Créateur',
                                      style: TextStyle(
                                        color: _isMemberInterface ? Colors.white : const Color(0xFF94A3B8),
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                      ),
                                    ),
                                    if (_isMemberInterface) ...[
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withValues(alpha: 0.25),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: const Text('Actif', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ),

                            // Option 2 : Interface Utilisateur Standard
                            InkWell(
                              onTap: () => _toggleInterfaceMode(false),
                              borderRadius: BorderRadius.circular(14),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                                decoration: BoxDecoration(
                                  gradient: !_isMemberInterface
                                      ? const LinearGradient(
                                          colors: [Color(0xFF1E3A8A), Color(0xFF3B82F6)],
                                        )
                                      : null,
                                  borderRadius: BorderRadius.circular(14),
                                  boxShadow: !_isMemberInterface
                                      ? [
                                          BoxShadow(
                                            color: const Color(0xFF3B82F6).withValues(alpha: 0.4),
                                            blurRadius: 10,
                                          )
                                        ]
                                      : [],
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.school_rounded,
                                      color: !_isMemberInterface ? Colors.white : const Color(0xFF94A3B8),
                                      size: 18,
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      'Interface Utilisateur Standard',
                                      style: TextStyle(
                                        color: !_isMemberInterface ? Colors.white : const Color(0xFF94A3B8),
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                      ),
                                    ),
                                    if (!_isMemberInterface) ...[
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withValues(alpha: 0.25),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: const Text('Actif', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 24),
                // 3D Avatar Card
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                  ),
                  child: Column(
                    children: [
                      Stack(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(20),
                            child: Image.asset(
                              _selectedAvatar,
                              width: 100,
                              height: 100,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                width: 100,
                                height: 100,
                                color: const Color(0xFF1E293B),
                                child: const Icon(Icons.person, size: 50, color: Colors.white),
                              ),
                            ),
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: InkWell(
                              onTap: _showAvatarSelector,
                              child: Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0D9488),
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white, width: 2),
                                ),
                                child: const Icon(Icons.camera_alt, color: Colors.white, size: 14),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        widget.userName,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _currentRole,
                        style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        _currentSubTeam,
                        style: const TextStyle(color: Color(0xFF67E8F9), fontSize: 10.5),
                      ),
                      const SizedBox(height: 8),
                      OutlinedButton.icon(
                        onPressed: _showAvatarSelector,
                        icon: const Icon(Icons.upload_file_rounded, size: 14),
                        label: const Text('Changer ma photo', style: TextStyle(fontSize: 11)),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: BorderSide(color: Colors.white.withValues(alpha: 0.3)),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // =================================================================
          // SECTION 1 : GESTION DES TÂCHES & ROADMAP CRÉATEUR
          // =================================================================
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Colonne Tâches (65%)
              Expanded(
                flex: 65,
                child: Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(Icons.checklist_rounded, color: Color(0xFF10B981), size: 20),
                                ),
                                const SizedBox(width: 12),
                                const Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Mes Tâches & Jalons Membre (Roadmap KERNEL FORGE)',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      Text(
                                        'Gérez vos livrables de production, vos jalons et vos modules',
                                        style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          ElevatedButton.icon(
                            onPressed: _showAddTaskDialog,
                            icon: const Icon(Icons.add, size: 16),
                            label: const Text('Nouvelle tâche'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0D9488),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      // Liste des tâches
                      ...List.generate(_myTasks.length, (index) {
                        final task = _myTasks[index];
                        final isDone = task['done'] == true;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isDone ? const Color(0xFF10B981).withValues(alpha: 0.3) : const Color(0xFF334155),
                            ),
                          ),
                          child: Row(
                            children: [
                              Checkbox(
                                value: isDone,
                                activeColor: const Color(0xFF10B981),
                                checkColor: Colors.white,
                                onChanged: (val) {
                                  setState(() {
                                    task['done'] = val;
                                    task['status'] = val == true ? 'Terminé' : 'En cours';
                                  });
                                },
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      task['title'] as String,
                                      style: TextStyle(
                                        color: isDone ? const Color(0xFF94A3B8) : Colors.white,
                                        fontSize: 13.5,
                                        fontWeight: FontWeight.w600,
                                        decoration: isDone ? TextDecoration.lineThrough : null,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF0F172A),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            task['category'] as String,
                                            style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 10),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          'Échéance : ${task['deadline']}',
                                          style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: isDone
                                      ? const Color(0xFF10B981).withValues(alpha: 0.15)
                                      : const Color(0xFFF59E0B).withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  task['priority'] as String,
                                  style: TextStyle(
                                    color: isDone ? const Color(0xFF34D399) : const Color(0xFFFBBF24),
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),

              const SizedBox(width: 20),

              // Colonne Stacks & Outils (35%)
              Expanded(
                flex: 35,
                child: Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFF38BDF8).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.code_rounded, color: Color(0xFF38BDF8), size: 20),
                          ),
                          const SizedBox(width: 12),
                          const Text(
                            'Mes Stacks & Expertises',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Vos compétences techniques visibles sur le Roster officiel :',
                        style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5),
                      ),
                      const SizedBox(height: 14),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _myStacks.map((stk) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF1E3A8A), Color(0xFF0D9488)],
                              ),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(stk, style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
                                const SizedBox(width: 6),
                                InkWell(
                                  onTap: () {
                                    setState(() {
                                      _myStacks.remove(stk);
                                      _availableStacks.add(stk);
                                    });
                                  },
                                  child: const Icon(Icons.close, color: Colors.white70, size: 14),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 16),
                      const Divider(color: Color(0xFF1E293B)),
                      const SizedBox(height: 10),
                      const Text(
                        'Ajouter une stack :',
                        style: TextStyle(color: Color(0xFF64748B), fontSize: 11),
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: _availableStacks.map((stk) {
                          return InkWell(
                            onTap: () {
                              setState(() {
                                _availableStacks.remove(stk);
                                _myStacks.add(stk);
                              });
                            },
                            borderRadius: BorderRadius.circular(8),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E293B),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: const Color(0xFF334155)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.add, color: Color(0xFF38BDF8), size: 12),
                                  const SizedBox(width: 4),
                                  Text(stk, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // =================================================================
          // SECTION 2 : ÉQUIPE KERNEL FORGE (ROSTER OFFICIEL DES 9 MEMBRES)
          // =================================================================
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFF2563EB).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.groups_rounded, color: Color(0xFF38BDF8), size: 20),
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Roster Officiel des Fondateurs & Développeurs KERNEL FORGE',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Text(
                                  'L\'équipe créatrice d\'UniFlow pour l\'Université de Yaoundé 1',
                                  style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Text('BaaS Synchronisé', style: TextStyle(color: Color(0xFF34D399), fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                // Grille Bento des membres
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _teamRoster.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    mainAxisExtent: 165,
                  ),
                  itemBuilder: (context, i) {
                    final member = _teamRoster[i];
                    return Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(
                          color: member['isLead'] == true
                              ? const Color(0xFF0D9488)
                              : const Color(0xFF334155),
                          width: member['isLead'] == true ? 1.5 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(14),
                            child: Image.asset(
                              member['avatar'] as String,
                              width: 64,
                              height: 64,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                width: 64,
                                height: 64,
                                color: const Color(0xFF0F172A),
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
                                  member['name'] as String,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  member['role'] as String,
                                  style: const TextStyle(
                                    color: Color(0xFF38BDF8),
                                    fontSize: 10.5,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  member['subTeam'] as String,
                                  style: const TextStyle(
                                    color: Color(0xFF94A3B8),
                                    fontSize: 9.5,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 8),
                                Wrap(
                                  spacing: 4,
                                  runSpacing: 4,
                                  children: (member['stacks'] as List<String>).take(3).map((stk) {
                                    return Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF0F172A),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        stk,
                                        style: const TextStyle(color: Color(0xFF67E8F9), fontSize: 9),
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
          ),
        ],
      ),
    );
  }
}
