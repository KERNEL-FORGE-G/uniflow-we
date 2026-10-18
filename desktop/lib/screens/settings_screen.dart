import 'package:flutter/material.dart';

class SettingsScreen extends StatefulWidget {
  final String userEmail;
  final String userRole;
  final String userName;
  final VoidCallback onLogout;
  final Function(String newRole)? onRoleChanged;

  const SettingsScreen({
    super.key,
    required this.userEmail,
    required this.userRole,
    required this.userName,
    required this.onLogout,
    this.onRoleChanged,
  });

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late bool _isMemberMode;
  late String _currentRole;
  String? _customAvatarPath;

  final List<Map<String, dynamic>> _memberTasks = [
    {
      'id': 'task-01',
      'title': 'Optimisation du pipeline WebRTC visioconférence P2P Linux/Windows',
      'priority': 'Haute',
      'deadline': '22 Octobre 2026',
      'done': true,
    },
    {
      'id': 'task-02',
      'title': 'Intégration du microservice Z-Library VPS avec streaming RAM vers Bucket BaaS',
      'priority': 'Critique',
      'deadline': '18 Octobre 2026',
      'done': true,
    },
    {
      'id': 'task-03',
      'title': 'Refonte Bento Grid & Design System Desktop avec 3D Heroes',
      'priority': 'Haute',
      'deadline': '25 Octobre 2026',
      'done': true,
    },
    {
      'id': 'task-04',
      'title': 'Validation des APKs Android & Binaires Windows MSIX pour les stores',
      'priority': 'Normale',
      'deadline': '30 Octobre 2026',
      'done': false,
    },
    {
      'id': 'task-05',
      'title': 'Audit de résilience hors-ligne et réconciliation des présences QR cryptographiques',
      'priority': 'Normale',
      'deadline': '05 Novembre 2026',
      'done': false,
    },
  ];

  @override
  void initState() {
    super.initState();
    _currentRole = widget.userRole;
    _isMemberMode = _isCreatorMember(widget.userEmail, widget.userRole);
  }

  bool _isCreatorMember(String email, String role) {
    final e = email.toLowerCase();
    final r = role.toLowerCase();
    return e.contains('ravel') ||
        e.contains('founder') ||
        e.contains('kernelforge') ||
        e.contains('marcel') ||
        e.contains('admin') ||
        r.contains('fondateur') ||
        r.contains('kernel forge');
  }

  void _addNewTask() {
    final titleController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Ajouter une tâche membre KERNEL FORGE'),
        content: TextField(
          controller: titleController,
          decoration: const InputDecoration(
            hintText: 'Intitulé de la tâche ou jalon...',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () {
              if (titleController.text.trim().isNotEmpty) {
                setState(() {
                  _memberTasks.add({
                    'id': 'task-${DateTime.now().millisecondsSinceEpoch}',
                    'title': titleController.text.trim(),
                    'priority': 'Haute',
                    'deadline': 'Bientôt',
                    'done': false,
                  });
                });
                Navigator.pop(ctx);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0D9488),
              foregroundColor: Colors.white,
            ),
            child: const Text('Ajouter'),
          ),
        ],
      ),
    );
  }

  void _changeAvatar() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Choisir votre photo de profil Membre'),
        content: SizedBox(
          width: 400,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Sélectionnez votre avatar officiel KERNEL FORGE ou photo d’équipe :'),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _avatarChoice('assets/team/avatar_ravel_founder.jpg', 'Ravel'),
                  _avatarChoice('assets/team/avatar_marcel.jpg', 'Marcel'),
                  _avatarChoice('assets/team/avatar_william.jpg', 'William'),
                  _avatarChoice('assets/team/avatar_aliya.jpg', 'Aliya'),
                ],
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Fermer')),
        ],
      ),
    );
  }

  Widget _avatarChoice(String assetPath, String name) {
    return InkWell(
      onTap: () {
        setState(() => _customAvatarPath = assetPath);
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Photo de profil mise à jour : $name'),
            backgroundColor: const Color(0xFF0D9488),
          ),
        );
      },
      borderRadius: BorderRadius.circular(30),
      child: Column(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundImage: AssetImage(assetPath),
          ),
          const SizedBox(height: 6),
          Text(name, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isRecognizedAsCreator = _isCreatorMember(widget.userEmail, _currentRole);
    final avatarImg = _customAvatarPath ??
        (widget.userEmail.contains('ravel')
            ? 'assets/team/avatar_ravel_founder.jpg'
            : (widget.userEmail.contains('marcel') ? 'assets/team/avatar_marcel.jpg' : 'assets/team/avatar_william.jpg'));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Padding(
        padding: const EdgeInsets.all(28.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // =================================================================
            // HERO BENTO SECTION - PARAMÈTRES & PROFIL
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
                              Icon(
                                isRecognizedAsCreator ? Icons.shield_rounded : Icons.person_rounded,
                                size: 14,
                                color: const Color(0xFF67E8F9),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                isRecognizedAsCreator
                                    ? 'MEMBRE CRÉATEUR · KERNEL FORGE'
                                    : 'ESPACE UTILISATEUR · UNIVERSITÉ DE YAOUNDÉ I',
                                style: const TextStyle(
                                  color: Color(0xFF67E8F9),
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Paramètres & Profil : ${widget.userName}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          isRecognizedAsCreator
                              ? 'Compte créateur certifié. Vous pouvez basculer entre la vue membre personnalisée (avec tâches & photo) et la vue utilisateur standard.'
                              : 'Gérez votre compte académique, vos préférences système et vos accès d’études.',
                          style: const TextStyle(
                            color: Color(0xFFE2E8F0),
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 20),
                  Image.asset(
                    'assets/icons/nav/settings.png',
                    width: 76,
                    height: 76,
                    errorBuilder: (_, __, ___) => const Icon(Icons.settings_rounded, size: 70, color: Colors.white70),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // SÉLECTEUR DE VUE SI MEMBRE CRÉATEUR DU PROJET (Demande explicite de l'utilisateur)
            if (isRecognizedAsCreator) ...[
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF0D9488), width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0D9488).withValues(alpha: 0.15),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0D9488).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.swap_horiz_rounded, color: Color(0xFF2DD4BF), size: 24),
                    ),
                    const SizedBox(width: 16),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Sélecteur d’Interface Membre Créateur',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          Text(
                            'Choisissez entre la vue membre fondateur (gestion de tâches & photo personnalisée) ou l’interface étudiant standard.',
                            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    SegmentedButton<bool>(
                      segments: const [
                        ButtonSegment(
                          value: false,
                          label: Text('Vue Étudiant Standard'),
                          icon: Icon(Icons.person_outline_rounded, size: 16),
                        ),
                        ButtonSegment(
                          value: true,
                          label: Text('Vue Membre Créateur'),
                          icon: Icon(Icons.verified_rounded, size: 16),
                        ),
                      ],
                      selected: {_isMemberMode},
                      onSelectionChanged: (set) {
                        setState(() {
                          _isMemberMode = set.first;
                        });
                        widget.onRoleChanged?.call(_isMemberMode ? 'Membre Fondateur KERNEL FORGE' : 'Étudiant');
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(_isMemberMode ? 'Bascule vers l’interface Membre Fondateur KERNEL FORGE.' : 'Bascule vers l’interface Étudiant Standard.'),
                            backgroundColor: const Color(0xFF0D9488),
                          ),
                        );
                      },
                      style: SegmentedButton.styleFrom(
                        selectedBackgroundColor: const Color(0xFF0D9488),
                        selectedForegroundColor: Colors.white,
                        foregroundColor: const Color(0xFF94A3B8),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // CONTENU PRINCIPAL DES PARAMÈTRES
            Expanded(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // CARTE PROFIL & AVATAR
                  Container(
                    width: 340,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Stack(
                          children: [
                            CircleAvatar(
                              radius: 50,
                              backgroundColor: const Color(0xFF1E3A8A).withValues(alpha: 0.1),
                              backgroundImage: AssetImage(avatarImg),
                            ),
                            Positioned(
                              bottom: 0,
                              right: 0,
                              child: InkWell(
                                onTap: _changeAvatar,
                                borderRadius: BorderRadius.circular(20),
                                child: Container(
                                  padding: const EdgeInsets.all(7),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0D9488),
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 2),
                                  ),
                                  child: const Icon(Icons.camera_alt_rounded, size: 15, color: Colors.white),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Text(
                          widget.userName,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          widget.userEmail,
                          style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFCCFBF1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            _isMemberMode ? 'Membre KERNEL FORGE' : _currentRole,
                            style: const TextStyle(
                              color: Color(0xFF0F766E),
                              fontWeight: FontWeight.bold,
                              fontSize: 11,
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        const Divider(color: Color(0xFFF1F5F9)),
                        const SizedBox(height: 12),
                        _profileDetailRow('Matricule :', '21T2401'),
                        _profileDetailRow('Université :', 'Yaoundé I'),
                        _profileDetailRow('Faculté :', 'Sciences'),
                        _profileDetailRow('Filière :', 'ICT4D / Master 1'),
                        const Spacer(),
                        SizedBox(
                          width: double.infinity,
                          height: 44,
                          child: OutlinedButton.icon(
                            onPressed: widget.onLogout,
                            icon: const Icon(Icons.logout_rounded, size: 16, color: Colors.redAccent),
                            label: const Text('Se déconnecter', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Color(0xFFFECACA)),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(width: 24),

                  // SI VUE MEMBRE CRÉATEUR : TÂCHES & ROADMAP ASSIGNÉES
                  if (_isMemberMode)
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.03),
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
                                const Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Tâches Assignées · Membre KERNEL FORGE',
                                      style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                                    ),
                                    Text(
                                      'Suivi du développement et des jalons du projet UniFlow',
                                      style: TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                                    ),
                                  ],
                                ),
                                ElevatedButton.icon(
                                  onPressed: _addNewTask,
                                  icon: const Icon(Icons.add_rounded, size: 16),
                                  label: const Text('Nouvelle tâche', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF0D9488),
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 18),
                            Expanded(
                              child: ListView.separated(
                                itemCount: _memberTasks.length,
                                separatorBuilder: (_, __) => const SizedBox(height: 10),
                                itemBuilder: (context, idx) {
                                  final t = _memberTasks[idx];
                                  final isDone = t['done'] as bool;

                                  return Container(
                                    padding: const EdgeInsets.all(14),
                                    decoration: BoxDecoration(
                                      color: isDone ? const Color(0xFFF8FAFC) : Colors.white,
                                      borderRadius: BorderRadius.circular(14),
                                      border: Border.all(
                                        color: isDone ? const Color(0xFFE2E8F0) : const Color(0xFF0D9488).withValues(alpha: 0.35),
                                      ),
                                    ),
                                    child: Row(
                                      children: [
                                        Checkbox(
                                          value: isDone,
                                          onChanged: (v) {
                                            setState(() => t['done'] = v ?? false);
                                          },
                                          activeColor: const Color(0xFF0D9488),
                                        ),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                t['title'],
                                                style: TextStyle(
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.bold,
                                                  decoration: isDone ? TextDecoration.lineThrough : null,
                                                  color: isDone ? const Color(0xFF94A3B8) : const Color(0xFF0F172A),
                                                ),
                                              ),
                                              const SizedBox(height: 2),
                                              Text(
                                                'Priorité : ${t['priority']} · Échéance : ${t['deadline']}',
                                                style: const TextStyle(fontSize: 10.5, color: Color(0xFF64748B)),
                                              ),
                                            ],
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: (isDone ? const Color(0xFFECFDF5) : const Color(0xFFFEF3C7)),
                                            borderRadius: BorderRadius.circular(10),
                                          ),
                                          child: Text(
                                            isDone ? 'Terminé' : 'En cours',
                                            style: TextStyle(
                                              color: isDone ? const Color(0xFF047857) : const Color(0xFFB45309),
                                              fontSize: 10.5,
                                              fontWeight: FontWeight.bold,
                                            ),
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
                    )
                  else
                    // SI VUE STANDARD : PRÉFÉRENCES ÉTUDIANT & SYSTÈME
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.03),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Configuration & Services Connectés',
                              style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                            ),
                            const Text(
                              'État des services embarqués et des connexions réseau',
                              style: TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                            ),
                            const SizedBox(height: 20),
                            _buildServiceStatusTile(
                              title: 'Microservice Z-Library VPS Multi-Shadow',
                              status: 'Opérationnel (Port 7070 · Zéro stockage VPS)',
                              isOnline: true,
                              icon: Icons.menu_book_rounded,
                            ),
                            const SizedBox(height: 12),
                            _buildServiceStatusTile(
                              title: 'Serveur Visio Local Embarqué P2P',
                              status: 'Actif sur 127.0.0.1:7880',
                              isOnline: true,
                              icon: Icons.video_call_rounded,
                            ),
                            const SizedBox(height: 12),
                            _buildServiceStatusTile(
                              title: 'Synchronisation BaaS Appwrite Cloud',
                              status: 'Connecté (vps.kernelforge.codes/v1)',
                              isOnline: true,
                              icon: Icons.cloud_done_rounded,
                            ),
                            const SizedBox(height: 12),
                            _buildServiceStatusTile(
                              title: 'Messagerie UniMail @uniflow.cm',
                              status: 'Actif & Certifié KERNEL FORGE',
                              isOnline: true,
                              icon: Icons.mark_email_read_rounded,
                            ),
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
    );
  }

  Widget _profileDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              value,
              style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 12.5),
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceStatusTile({
    required String title,
    required String status,
    required bool isOnline,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF1E3A8A).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFF1E3A8A), size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
                Text(status, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: isOnline ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 7,
                  height: 7,
                  decoration: BoxDecoration(
                    color: isOnline ? const Color(0xFF10B981) : Colors.red,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 5),
                Text(
                  isOnline ? 'En ligne' : 'Hors-ligne',
                  style: TextStyle(
                    color: isOnline ? const Color(0xFF047857) : Colors.red,
                    fontSize: 10.5,
                    fontWeight: FontWeight.bold,
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
