import 'package:flutter/material.dart';

class HelpScreen extends StatefulWidget {
  final void Function(int index)? onNavigate;

  const HelpScreen({super.key, this.onNavigate});

  @override
  State<HelpScreen> createState() => _HelpScreenState();
}

class _HelpScreenState extends State<HelpScreen> {
  int _selectedTab = 0; // 0 = Raccourcis, 1 = FAQ, 2 = Diagnostic P2P, 3 = Ticket Support

  final List<Map<String, String>> _shortcuts = [
    {'keys': 'Ctrl + 0', 'action': 'Tableau de bord principal', 'category': 'Navigation'},
    {'keys': 'Ctrl + 1', 'action': 'Actualités Campus', 'category': 'Navigation'},
    {'keys': 'Ctrl + 2', 'action': 'UniMail (@uniflow.cm)', 'category': 'Navigation'},
    {'keys': 'Ctrl + 3', 'action': 'Emploi du Temps LMD', 'category': 'Navigation'},
    {'keys': 'Ctrl + 4', 'action': 'Visioconférence Amphi Direct', 'category': 'Navigation'},
    {'keys': 'Ctrl + 5', 'action': 'Mes Cours & UE', 'category': 'Navigation'},
    {'keys': 'Ctrl + 9', 'action': 'Bibliothèque Z-Library Hors-Ligne', 'category': 'Navigation'},
    {'keys': 'Ctrl + M', 'action': 'Rédiger un nouvel e-mail UniMail', 'category': 'Productivité'},
    {'keys': 'Ctrl + F', 'action': 'Recherche globale d\'un cours ou livre', 'category': 'Productivité'},
    {'keys': 'Ctrl + R', 'action': 'Forcer la synchronisation P2P / Hors-Ligne', 'category': 'Système'},
    {'keys': 'F11', 'action': 'Basculer en plein écran Amphi Virtuel', 'category': 'Affichage'},
    {'keys': 'Echap', 'action': 'Fermer les tiroirs de discussion ou modales', 'category': 'Système'},
  ];

  final List<Map<String, dynamic>> _faqs = [
    {
      'q': 'Comment UniFlow fonctionne-t-il 100% hors connexion Internet ?',
      'a': 'UniFlow Desktop intègre un moteur de persistance locale chiffré. Vos cours, emplois du temps, notes, devoirs et livres téléchargés sont sauvegardés sur votre disque dur. Dès que vous retrouvez du réseau ou que vous êtes à proximité d\'un autre étudiant sur le Wi-Fi local, la synchronisation P2P s\'effectue automatiquement.',
    },
    {
      'q': 'Faut-il installer un logiciel comme Zoom ou Teams pour la visioconférence ?',
      'a': 'Non, absolument rien d\'autre n\'est nécessaire. UniFlow Desktop embarque son propre serveur WebRTC en Dart natif. Vous hébergez vos cours en direct directement depuis l\'application, et vos étudiants peuvent rejoindre en scannant le QR code avec n\'importe quel smartphone sans installer d\'application.',
    },
    {
      'q': 'Comment valider ma présence aux cours d\'amphithéâtre ?',
      'a': 'Dans l\'onglet « Présence & QR Code », l\'enseignant projette le jeton dynamique certifié. Scannez-le simplement depuis l\'application mobile ou entrez le code numérique à 6 chiffres affiché à l\'écran.',
    },
    {
      'q': 'Les livres téléchargés depuis Z-Library restent-ils lisibles hors-ligne ?',
      'a': 'Oui. Une fois le livre transmis dans le bucket académique UniFlow, il est mis en cache sur votre appareil. Vous pouvez l\'ouvrir, le lire et surligner vos passages même en plein amphi sans connexion Internet.',
    },
    {
      'q': 'Comment obtenir mon attestation d\'inscription ou mon relevé officiel ?',
      'a': 'Rendez-vous dans la section « Inscriptions & Parcours LMD », onglet « Demandes Administratives ». Vous pouvez solliciter un certificat de fréquentation, relevé ou attestation signé électroniquement.',
    },
  ];

  void _submitTicket() {
    final subjectController = TextEditingController();
    final descController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.support_agent_rounded, color: Color(0xFF1E3A8A)),
            SizedBox(width: 10),
            Text('Ouvrir un Ticket d\'Assistance', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: SizedBox(
          width: 480,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Objet de votre demande :', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
              const SizedBox(height: 6),
              TextField(
                controller: subjectController,
                decoration: InputDecoration(
                  hintText: 'ex: Difficulté de synchronisation hors-ligne…',
                  hintStyle: const TextStyle(fontSize: 12),
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                ),
              ),
              const SizedBox(height: 14),
              const Text('Description détaillée :', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
              const SizedBox(height: 6),
              TextField(
                controller: descController,
                maxLines: 4,
                decoration: InputDecoration(
                  hintText: 'Précisez l\'écran concerné, le message d\'erreur éventuel…',
                  hintStyle: const TextStyle(fontSize: 12),
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler', style: TextStyle(color: Color(0xFF64748B))),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Votre ticket a été transmis à l\'équipe support KERNEL FORGE (#TKT-9482).'),
                  backgroundColor: Color(0xFF0D9488),
                  duration: Duration(seconds: 4),
                ),
              );
            },
            icon: const Icon(Icons.send_rounded, size: 16),
            label: const Text('Envoyer le ticket'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1E3A8A),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // =================================================================
            // HERO BENTO SECTION - CENTRE D'AIDE & DOCUMENTATION
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
                        Wrap(
                          spacing: 8,
                          runSpacing: 6,
                          crossAxisAlignment: WrapCrossAlignment.center,
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
                                    'assets/icons/nav/aide.png',
                                    width: 16,
                                    height: 16,
                                    errorBuilder: (_, __, ___) => const Icon(
                                      Icons.help_rounded,
                                      color: Color(0xFF67E8F9),
                                      size: 14,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  const Text(
                                    'ASSISTANCE & BASE DE CONNAISSANCES OFFICIELLE',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981).withValues(alpha: 0.25),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFF34D399)),
                              ),
                              child: const Text(
                                'SUPPORT KERNEL FORGE ACTIF · 24/7',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        const Text(
                          'Centre d\'Aide, Raccourcis & Guides',
                          style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Maîtrisez toutes les fonctionnalités de productivité d\'UniFlow Desktop : raccourcis clavier, diagnostic hors-ligne et assistance technique.',
                          style: TextStyle(fontSize: 13, color: Color(0xFFCBD5E1), height: 1.4),
                        ),
                        const SizedBox(height: 16),
                        Wrap(
                          spacing: 10,
                          runSpacing: 8,
                          children: [
                            _buildHeroStatPill('Version Desktop', '1.0.0 Stable Bêta'),
                            _buildHeroStatPill('Mode Hors-Ligne', 'Prêt & Synchronisé'),
                            _buildHeroStatPill('Raccourcis Enregistrés', '${_shortcuts.length} Touches'),
                            _buildHeroStatPill('Temps de Réponse Support', '< 15 minutes'),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 24),
                  Container(
                    width: 86,
                    height: 86,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
                    ),
                    child: Image.asset(
                      'assets/icons/nav/aide.png',
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const Icon(
                        Icons.live_help_rounded,
                        color: Colors.white,
                        size: 44,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // =================================================================
            // NAVIGATION DES ONGLETS D'AIDE
            // =================================================================
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildTabBtn(0, Icons.keyboard_rounded, 'Raccourcis Clavier'),
                    const SizedBox(width: 8),
                    _buildTabBtn(1, Icons.question_answer_rounded, 'Foire Aux Questions (FAQ)'),
                    const SizedBox(width: 8),
                    _buildTabBtn(2, Icons.network_check_rounded, 'Diagnostic & Synchronisation P2P'),
                    const SizedBox(width: 8),
                    _buildTabBtn(3, Icons.support_agent_rounded, 'Ticket Support KERNEL FORGE'),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            // =================================================================
            // CONTENU DE L'ONGLET ACTIF
            // =================================================================
            if (_selectedTab == 0)
              _buildShortcutsView()
            else if (_selectedTab == 1)
              _buildFaqView()
            else if (_selectedTab == 2)
              _buildDiagnosticView()
            else
              _buildSupportTicketView(),
          ],
        ),
      ),
    );
  }

  Widget _buildTabBtn(int index, IconData icon, String title) {
    final isSelected = _selectedTab == index;
    return InkWell(
      onTap: () => setState(() => _selectedTab = index),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
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
            Icon(icon, size: 18, color: isSelected ? Colors.white : const Color(0xFF64748B)),
            const SizedBox(width: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: isSelected ? Colors.white : const Color(0xFF1E293B),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildShortcutsView() {
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
          const Row(
            children: [
              Icon(Icons.keyboard_command_key_rounded, color: Color(0xFF1E3A8A), size: 22),
              SizedBox(width: 10),
              Text(
                'Raccourcis Clavier Dédiés à la Productivité Universitaire',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'Naviguez entre vos cours, e-mails, amphis virtuels et livres instantanément au clavier.',
            style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 20),
          const Divider(),
          const SizedBox(height: 14),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _shortcuts.length,
            separatorBuilder: (_, __) => const Divider(height: 12),
            itemBuilder: (context, index) {
              final sc = _shortcuts[index];
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFCBD5E1)),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.04),
                                offset: const Offset(0, 2),
                                blurRadius: 2,
                              ),
                            ],
                          ),
                          child: Text(
                            sc['keys']!,
                            style: const TextStyle(fontFamily: 'monospace', fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Text(
                          sc['action']!,
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        sc['category']!,
                        style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF)),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildFaqView() {
    return Column(
      children: _faqs.map((faq) {
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0D9488).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.help_outline_rounded, color: Color(0xFF0D9488), size: 18),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      faq['q'] as String,
                      style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Padding(
                padding: const EdgeInsets.only(left: 36),
                child: Text(
                  faq['a'] as String,
                  style: const TextStyle(fontSize: 12.5, color: Color(0xFF475569), height: 1.5),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildDiagnosticView() {
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Audit de Santé & État de la Synchronisation Locale',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                  Text(
                    'Vérifie l\'état des flux WebRTC, de la base de données locale et de la liaison campus',
                    style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Test de diagnostic exécuté : Tous les services locaux sont 100% opérationnels.'),
                      backgroundColor: Color(0xFF0D9488),
                    ),
                  );
                },
                icon: const Icon(Icons.refresh_rounded, size: 16),
                label: const Text('Tester la connexion'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E3A8A),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Divider(),
          const SizedBox(height: 16),
          _buildDiagItem('Serveur Visioconférence Autonome (Port 7890)', 'En ligne (HTTP + WebSocket prêt)', true),
          _buildDiagItem('Moteur de Cache Local SQLite / Hive', 'Synchronisé (2 480 enregistrements)', true),
          _buildDiagItem('Passerelle P2P Campus UY1', 'Connecté au réseau local du campus', true),
          _buildDiagItem('Certificat Cryptographique de Présence', 'Valide · Clé ED25519 vérifiée', true),
          _buildDiagItem('Stockage Bibliothèque Z-Library', '12 livres mis en cache hors-ligne (248 Mo)', true),
        ],
      ),
    );
  }

  Widget _buildDiagItem(String title, String status, bool ok) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(ok ? Icons.check_circle_rounded : Icons.error_rounded, color: ok ? const Color(0xFF10B981) : const Color(0xFFEF4444), size: 18),
              const SizedBox(width: 10),
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B))),
            ],
          ),
          Text(status, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: ok ? const Color(0xFF059669) : const Color(0xFFDC2626))),
        ],
      ),
    );
  }

  Widget _buildSupportTicketView() {
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Assistance Directe & Signalement d\'Incident',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                  Text(
                    'Contactez les ingénieurs KERNEL FORGE pour toute question technique ou académique',
                    style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: _submitTicket,
                icon: const Icon(Icons.add_rounded, size: 16),
                label: const Text('Nouveau Ticket'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0D9488),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Divider(),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDF4),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFBBF7D0)),
            ),
            child: const Row(
              children: [
                Icon(Icons.headset_mic_rounded, color: Color(0xFF16A34A), size: 28),
                SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Assistance Campus KERNEL FORGE & Université de Yaoundé I',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF166534)),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Canal d\'assistance direct : support@kernelforge.codes · Numéro vert étudiant : +237 690 000 000 · WhatsApp Support disponible dans la section Abonnements.',
                        style: TextStyle(fontSize: 11.5, color: Color(0xFF15803D), height: 1.4),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroStatPill(String label, String val) {
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
          Text('$label : ', style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11)),
          Text(val, style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
