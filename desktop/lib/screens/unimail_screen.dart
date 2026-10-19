import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class UniMailMessage {
  final String id;
  final String
      folder; // Boîte de réception, Messages envoyés, Favoris, Brouillons, Corbeille
  final String senderName;
  final String senderEmail;
  final String recipientEmail;
  final String subject;
  final String preview;
  final String body;
  final String timestamp;
  final List<String> attachments;
  final bool isSignedByUniFlow;
  final String priority; // URGENT, OFFICIEL, COURS, NORMAL
  bool isRead;
  bool isStarred;

  UniMailMessage({
    required this.id,
    required this.folder,
    required this.senderName,
    required this.senderEmail,
    required this.recipientEmail,
    required this.subject,
    required this.preview,
    required this.body,
    required this.timestamp,
    this.attachments = const [],
    this.isSignedByUniFlow = true,
    this.priority = 'NORMAL',
    this.isRead = false,
    this.isStarred = false,
  });
}

class UniMailScreen extends StatefulWidget {
  final String userName;
  final String userEmail;

  const UniMailScreen({
    super.key,
    this.userName = '',
    this.userEmail = '',
  });

  @override
  State<UniMailScreen> createState() => _UniMailScreenState();
}

class _UniMailScreenState extends State<UniMailScreen> {
  String get _activeUserEmail =>
      widget.userEmail.isNotEmpty ? widget.userEmail : 'etudiant.officiel@uniflow.cm';
  String get _activeUserName =>
      widget.userName.isNotEmpty ? widget.userName : 'Étudiant UniFlow';

  String _selectedFolder = 'Boîte de réception';
  String _searchQuery = '';
  String? _selectedMessageId = 'mail-1';
  final TextEditingController _quickReplyController = TextEditingController();

  final List<String> _folders = [
    'Boîte de réception',
    'Messages envoyés',
    'Favoris',
    'Brouillons',
    'Corbeille',
  ];

  late final List<UniMailMessage> _messages;

  @override
  void initState() {
    super.initState();
    _messages = [
      UniMailMessage(
        id: 'mail-1',
        folder: 'Boîte de réception',
        senderName: 'Direction Académique UniFlow',
        senderEmail: 'rectorat.officiel@uniflow.cm',
        recipientEmail: _activeUserEmail,
        subject:
            'Activation officielle de votre boîte institutionnelle @uniflow.cm (Phase Bêta)',
        preview:
            'Votre adresse universitaire dédiée $_activeUserEmail est désormais active et signée numériquement...',
        body: 'Bonjour $_activeUserName,\n\n'
            'Bienvenue sur **UniMail (@uniflow.cm)**, le service de messagerie académique souverain intégré à la plateforme UniFlow.\n\n'
            '• **Cycle de vie lié au compte** : Votre adresse `$_activeUserEmail` a été provisionnée automatiquement à la création de votre compte UniFlow et suit l\'intégralité de votre parcours universitaire.\n'
            '• **Signature cryptographique UniFlow** : Chaque courriel sortant comporte un sceau d\'authenticité vérifié par Kernel Forge & l\'Université de Yaoundé I pour vos démarches administratives, stages et échanges avec vos enseignants.\n'
            '• **Phase de test bêta** : Notre plateforme est actuellement en phase de test bêta. Des améliorations majeures (chiffrement de bout en bout, partage direct de cahiers de TP et synchronisation mobile instantanée) arrivent très prochainement.\n\n'
            'Cordialement,\n'
            'La Direction des Systèmes d\'Information UniFlow',
        timestamp: 'Aujourd\'hui, 09:15',
        priority: 'OFFICIEL',
        attachments: [
          'Certificat_Authenticite_UniMail_UY1.pdf',
          'Guide_Messagerie_Institutionnelle_UniFlow.pdf',
        ],
        isRead: false,
        isStarred: true,
      ),
      UniMailMessage(
        id: 'mail-2',
        folder: 'Boîte de réception',
        senderName: 'Prof. Melatagia Yonta',
        senderEmail: 'melatagia.yonta@uniflow.cm',
        recipientEmail: _activeUserEmail,
        subject:
            '[INF4067] Dépôt du rapport d\'Architecture Distribuée & lien Visio Amphi 501',
        preview:
            'Veuillez transmettre votre archive de TP et la documentation UML via votre adresse @uniflow.cm avant vendredi...',
        body: 'Chers étudiants de Licence 3 ICT4D,\n\n'
            'Dans le cadre de l\'Unité d\'Enseignement INF4067 (Génie Logiciel Avancé & Architectures Distribuées), je vous rappelle que la remise des livrables du TP N°2 s\'effectue exclusivement par retour de courriel signé `@uniflow.cm`.\n\n'
            'Vous trouverez en pièce jointe le cahier des charges mis à jour ainsi que le protocole de test pour le serveur local P2P.\n\n'
            'Bonne préparation,\n'
            'Prof. Melatagia Yonta — Département d\'Informatique UY1',
        timestamp: 'Hier, 17:40',
        priority: 'COURS',
        attachments: ['TP2_Specifications_INF4067.pdf'],
        isRead: true,
        isStarred: true,
      ),
      UniMailMessage(
        id: 'mail-3',
        folder: 'Boîte de réception',
        senderName: 'Dr. Tapamo · Laboratoire Cybersécurité',
        senderEmail: 'tapamo.sec@uniflow.cm',
        recipientEmail: _activeUserEmail,
        subject: '[INF4077] Clés publiques TP Cryptographie & Signatures X.509',
        preview:
            'Voici le jeu de clés d\'essai pour la séance de travaux pratiques au Labo C205...',
        body: 'Bonjour,\n\n'
            'Pour la séance de travaux pratiques de Sécurité Informatique (INF4077) au Labo C205, veuillez télécharger l\'énoncé ci-joint et vérifier l\'empreinte SHA-256 de votre certificat étudiant UniMail.\n\n'
            'Dr. Tapamo',
        timestamp: '15 Oct. 2026',
        priority: 'URGENT',
        attachments: ['Enonce_TP_Crypto_X509.pdf'],
        isRead: true,
        isStarred: false,
      ),
      UniMailMessage(
        id: 'mail-4',
        folder: 'Messages envoyés',
        senderName: '$_activeUserName (Moi)',
        senderEmail: _activeUserEmail,
        recipientEmail: 'scolarite.sciences@uniflow.cm',
        subject: 'Demande d\'attestation de fréquentation Semestre 1 — L3 ICT4D',
        preview:
            'Bonjour, je souhaiterais obtenir mon attestation de scolarité signée pour mon dossier de bourse...',
        body: 'Madame, Monsieur,\n\n'
            'Étudiant régulièrement inscrit en Licence 3 ICT4D à la Faculté des Sciences, je vous prie de bien vouloir me transmettre mon attestation d\'inscription du Semestre 1 sur ma boîte officielle `$_activeUserEmail`.\n\n'
            'Respectueusement,\n'
            '$_activeUserName',
        timestamp: '14 Oct. 2026',
        priority: 'OFFICIEL',
        attachments: ['Quitus_Droits_Universitaires_2026.pdf'],
        isRead: true,
        isStarred: false,
      ),
      UniMailMessage(
        id: 'mail-5',
        folder: 'Brouillons',
        senderName: '$_activeUserName (Moi)',
        senderEmail: _activeUserEmail,
        recipientEmail: 'equipe.kernelforge@uniflow.cm',
        subject:
            '[Brouillon] Retour d\'expérience sur la phase bêta UniFlow Desktop',
        preview:
            'Super fluidité sur le nouveau Bento Grid et le serveur visio local...',
        body: 'Bonjour l\'équipe Kernel Forge,\n\n'
            'Voici mes retours suite aux tests de la version bêta Desktop...',
        timestamp: 'Brouillon enregistré',
        priority: 'NORMAL',
        isRead: true,
      ),
    ];
  }

  @override
  void dispose() {
    _quickReplyController.dispose();
    super.dispose();
  }

  void _openComposeDialog({String? initialTo, String? initialSubject}) {
    final toCtrl = TextEditingController(text: initialTo ?? '');
    final subjectCtrl = TextEditingController(text: initialSubject ?? '');
    final bodyCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) {
        return Dialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          child: Container(
            width: 600,
            padding: const EdgeInsets.all(26),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Image.asset(
                      'assets/icons/nav/messages.png',
                      width: 28,
                      height: 28,
                      errorBuilder: (_, __, ___) => const Icon(
                          Icons.mail_rounded,
                          color: Color(0xFF1E3A8A)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Nouveau message UniMail (@uniflow.cm)',
                            style: TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF0F172A)),
                          ),
                          Text(
                            'Expéditeur certifié : $_activeUserEmail · Signature automatique UniFlow',
                            style: const TextStyle(
                                fontSize: 11,
                                color: Color(0xFF0D9488),
                                fontWeight: FontWeight.bold),
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
                const SizedBox(height: 18),
                TextField(
                  controller: toCtrl,
                  decoration: InputDecoration(
                    labelText: 'Destinataire (@uniflow.cm ou externe)',
                    hintText:
                        'ex: prof.melatagia@uniflow.cm, scolarite@uniflow.cm',
                    prefixIcon:
                        const Icon(Icons.alternate_email_rounded, size: 18),
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: subjectCtrl,
                  decoration: InputDecoration(
                    labelText: 'Objet du courriel',
                    hintText: 'ex: Remise du projet INF4067 - Groupe 3',
                    prefixIcon: const Icon(Icons.subject_rounded, size: 18),
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: bodyCtrl,
                  maxLines: 6,
                  decoration: InputDecoration(
                    labelText: 'Message',
                    hintText: 'Rédigez votre courriel académique...',
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0D9488).withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: const Color(0xFF0D9488).withValues(alpha: 0.25)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.verified_rounded,
                          color: Color(0xFF0D9488), size: 18),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Signature numérique appliquée : « Envoyé et certifié via UniMail (@uniflow.cm) · Compte vérifié Université de Yaoundé I »',
                          style: TextStyle(
                              fontSize: 11,
                              color: Color(0xFF0F172A),
                              fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () => Navigator.of(ctx).pop(),
                      child: const Text('Annuler'),
                    ),
                    const SizedBox(width: 10),
                    ElevatedButton.icon(
                      onPressed: () {
                        if (toCtrl.text.trim().isEmpty ||
                            subjectCtrl.text.trim().isEmpty) {
                          return;
                        }
                        final newMsg = UniMailMessage(
                          id: 'mail-${DateTime.now().millisecondsSinceEpoch}',
                          folder: 'Messages envoyés',
                          senderName: '$_activeUserName (Moi)',
                          senderEmail: _activeUserEmail,
                          recipientEmail: toCtrl.text.trim(),
                          subject: subjectCtrl.text.trim(),
                          preview: bodyCtrl.text.trim(),
                          body: bodyCtrl.text.trim(),
                          timestamp: 'À l\'instant',
                          isRead: true,
                        );
                        setState(() {
                          _messages.insert(0, newMsg);
                          _selectedFolder = 'Messages envoyés';
                          _selectedMessageId = newMsg.id;
                        });
                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                                'Courriel signé @uniflow.cm envoyé à ${newMsg.recipientEmail} !'),
                            backgroundColor: const Color(0xFF0D9488),
                          ),
                        );
                      },
                      icon: const Icon(Icons.send_rounded, size: 16),
                      label: const Text('Envoyer avec signature UniFlow'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1E3A8A),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 14),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final visibleMessages = _messages.where((m) {
      final matchesFolder = _selectedFolder == 'Favoris'
          ? m.isStarred
          : m.folder == _selectedFolder;
      final q = _searchQuery.toLowerCase();
      final matchesSearch = q.isEmpty ||
          m.subject.toLowerCase().contains(q) ||
          m.senderName.toLowerCase().contains(q) ||
          m.senderEmail.toLowerCase().contains(q) ||
          m.body.toLowerCase().contains(q);
      return matchesFolder && matchesSearch;
    }).toList();

    final selectedMessage =
        visibleMessages.where((m) => m.id == _selectedMessageId).firstOrNull ??
            (visibleMessages.isNotEmpty ? visibleMessages.first : null);

    final unreadCount = _messages
        .where((m) => m.folder == 'Boîte de réception' && !m.isRead)
        .length;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // =================================================================
            // 3D HERO BENTO SECTION - UNIMAIL (@UNIFLOW.CM)
            // =================================================================
            Container(
              padding: const EdgeInsets.all(24.0),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [
                    Color(0xFF0B132B),
                    Color(0xFF1E3A8A),
                    Color(0xFF0D9488)
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
                        Wrap(
                          spacing: 10,
                          runSpacing: 6,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.14),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                    color:
                                        Colors.white.withValues(alpha: 0.25)),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.verified_user_rounded,
                                      color: Color(0xFF34D399), size: 14),
                                  SizedBox(width: 6),
                                  Text(
                                    'IDENTITÉ NUMÉRIQUE ACADÉMIQUE SIGNÉE UNIFLOW',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 10,
                                        fontWeight: FontWeight.w800),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981)
                                    .withValues(alpha: 0.25),
                                borderRadius: BorderRadius.circular(20),
                                border:
                                    Border.all(color: const Color(0xFF34D399)),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.cloud_done_rounded,
                                      color: Color(0xFF34D399), size: 13),
                                  SizedBox(width: 5),
                                  Text(
                                    'Résilience & Synchronisation Hors-Ligne',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 10,
                                        fontWeight: FontWeight.w800),
                                  ),
                                ],
                              ),
                            ),
                            InkWell(
                              onTap: () {
                                Clipboard.setData(ClipboardData(
                                    text: _activeUserEmail));
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                        'Adresse $_activeUserEmail copiée dans le presse-papier !'),
                                    backgroundColor: const Color(0xFF0D9488),
                                  ),
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 5),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0D9488)
                                      .withValues(alpha: 0.35),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                      color: const Color(0xFF67E8F9)
                                          .withValues(alpha: 0.4)),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.alternate_email_rounded,
                                        color: Color(0xFF67E8F9), size: 13),
                                    const SizedBox(width: 5),
                                    Text(
                                      _activeUserEmail,
                                      style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w900),
                                    ),
                                    const SizedBox(width: 6),
                                    const Icon(Icons.copy_rounded,
                                        color: Colors.white70, size: 12),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'UniMail · Messagerie Universitaire @uniflow.cm',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Votre adresse électronique dédiée est générée à la création de votre compte UniFlow, signée cryptographiquement par la plateforme, synchronisée avec votre statut étudiant et consultable 100% hors-ligne.',
                          style: TextStyle(
                              color: Color(0xFFCBD5E1),
                              fontSize: 12.5,
                              height: 1.45),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 20),
                  Container(
                    width: 86,
                    height: 86,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(
                          color: Colors.white.withValues(alpha: 0.25)),
                    ),
                    child: Image.asset(
                      'assets/icons/nav/messages.png',
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const Icon(
                          Icons.mark_email_unread_rounded,
                          color: Colors.white,
                          size: 42),
                    ),
                  ),
                  const SizedBox(width: 16),
                  ElevatedButton.icon(
                    onPressed: () => _openComposeDialog(),
                    icon: const Icon(Icons.edit_square, size: 17),
                    label: const Text('Nouveau message'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF0B132B),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 18, vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // =================================================================
            // BARRE DE DOSSIERS & RECHERCHE BENTO
            // =================================================================
            Row(
              children: [
                // Sélecteur de dossiers
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    children: _folders.map((folder) {
                      final isSelected = folder == _selectedFolder;
                      return InkWell(
                        onTap: () {
                          setState(() {
                            _selectedFolder = folder;
                            _selectedMessageId = null;
                          });
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 9),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? const Color(0xFF1E3A8A)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Text(
                                folder,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected
                                      ? Colors.white
                                      : const Color(0xFF64748B),
                                ),
                              ),
                              if (folder == 'Boîte de réception' &&
                                  unreadCount > 0) ...[
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 6, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0D9488),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    '$unreadCount',
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: TextField(
                    onChanged: (val) => setState(() => _searchQuery = val),
                    decoration: InputDecoration(
                      hintText:
                          'Rechercher un courriel @uniflow.cm, enseignant, pièce jointe...',
                      prefixIcon: const Icon(Icons.search_rounded,
                          color: Color(0xFF94A3B8)),
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: const EdgeInsets.symmetric(
                          vertical: 0, horizontal: 16),
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
              ],
            ),

            const SizedBox(height: 18),

            // =================================================================
            // SPLIT-PANE BENTO : LISTE DES COURRIELS + LECTEUR COMPLET
            // =================================================================
            Expanded(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Colonne Gauche : Liste des messages
                  Expanded(
                    flex: 2,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: visibleMessages.isEmpty
                          ? const Center(
                              child: Text(
                                'Aucun message dans ce dossier.',
                                style: TextStyle(
                                    color: Color(0xFF94A3B8),
                                    fontWeight: FontWeight.w600),
                              ),
                            )
                          : ListView.separated(
                              padding: const EdgeInsets.all(12),
                              itemCount: visibleMessages.length,
                              separatorBuilder: (_, __) =>
                                  const SizedBox(height: 8),
                              itemBuilder: (context, index) {
                                final msg = visibleMessages[index];
                                final isSelected =
                                    selectedMessage?.id == msg.id;

                                return InkWell(
                                  onTap: () {
                                    setState(() {
                                      _selectedMessageId = msg.id;
                                      msg.isRead = true;
                                    });
                                  },
                                  borderRadius: BorderRadius.circular(16),
                                  child: Container(
                                    padding: const EdgeInsets.all(14),
                                    decoration: BoxDecoration(
                                      color: isSelected
                                          ? const Color(0xFF1E3A8A)
                                              .withValues(alpha: 0.08)
                                          : (msg.isRead
                                              ? Colors.white
                                              : const Color(0xFFF0FDFA)),
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(
                                        color: isSelected
                                            ? const Color(0xFF1E3A8A)
                                                .withValues(alpha: 0.35)
                                            : const Color(0xFFE2E8F0),
                                      ),
                                    ),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Expanded(
                                              child: Row(
                                                children: [
                                                  if (!msg.isRead)
                                                    Container(
                                                      width: 8,
                                                      height: 8,
                                                      margin:
                                                          const EdgeInsets.only(
                                                              right: 6),
                                                      decoration:
                                                          const BoxDecoration(
                                                        color:
                                                            Color(0xFF0D9488),
                                                        shape: BoxShape.circle,
                                                      ),
                                                    ),
                                                  Expanded(
                                                    child: Text(
                                                      msg.senderName,
                                                      style: TextStyle(
                                                        fontSize: 13,
                                                        fontWeight: msg.isRead
                                                            ? FontWeight.w700
                                                            : FontWeight.w900,
                                                        color: const Color(
                                                            0xFF0F172A),
                                                      ),
                                                      overflow:
                                                          TextOverflow.ellipsis,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            Text(
                                              msg.timestamp,
                                              style: const TextStyle(
                                                  fontSize: 10,
                                                  color: Color(0xFF64748B)),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 5),
                                        Row(
                                          children: [
                                            // Badge de Priorité
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 7,
                                                      vertical: 2),
                                              decoration: BoxDecoration(
                                                color: _getPriorityColor(
                                                        msg.priority)
                                                    .withValues(alpha: 0.12),
                                                borderRadius:
                                                    BorderRadius.circular(6),
                                                border: Border.all(
                                                    color: _getPriorityColor(
                                                            msg.priority)
                                                        .withValues(
                                                            alpha: 0.3)),
                                              ),
                                              child: Text(
                                                msg.priority,
                                                style: TextStyle(
                                                  fontSize: 9,
                                                  fontWeight: FontWeight.w900,
                                                  color: _getPriorityColor(
                                                      msg.priority),
                                                ),
                                              ),
                                            ),
                                            const SizedBox(width: 6),
                                            Expanded(
                                              child: Text(
                                                msg.senderEmail,
                                                style: const TextStyle(
                                                    fontSize: 11,
                                                    color: Color(0xFF0D9488),
                                                    fontWeight:
                                                        FontWeight.w600),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                            if (msg.attachments.isNotEmpty)
                                              Container(
                                                margin: const EdgeInsets.only(
                                                    left: 4),
                                                child: const Icon(
                                                    Icons.attach_file_rounded,
                                                    size: 14,
                                                    color: Color(0xFF64748B)),
                                              ),
                                          ],
                                        ),
                                        const SizedBox(height: 6),
                                        Text(
                                          msg.subject,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(
                                              fontSize: 12.5,
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFF1E293B)),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          msg.preview,
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(
                                              fontSize: 11.5,
                                              color: Color(0xFF64748B)),
                                        ),
                                        const SizedBox(height: 6),
                                        Row(
                                          children: [
                                            const Icon(
                                                Icons.offline_pin_rounded,
                                                size: 12,
                                                color: Color(0xFF10B981)),
                                            const SizedBox(width: 4),
                                            const Text(
                                              'Cache Local Synchro',
                                              style: TextStyle(
                                                  fontSize: 9.5,
                                                  color: Color(0xFF059669),
                                                  fontWeight: FontWeight.w600),
                                            ),
                                            const Spacer(),
                                            if (msg.attachments.isNotEmpty)
                                              Text(
                                                '${msg.attachments.length} PJ',
                                                style: const TextStyle(
                                                    fontSize: 10,
                                                    color: Color(0xFF94A3B8),
                                                    fontWeight:
                                                        FontWeight.bold),
                                              ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                    ),
                  ),

                  const SizedBox(width: 18),

                  // Colonne Droite : Lecteur d'e-mail complet
                  Expanded(
                    flex: 3,
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: selectedMessage == null
                          ? const Center(
                              child: Text(
                                  'Sélectionnez un courriel pour l\'afficher.'),
                            )
                          : Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 6,
                                  crossAxisAlignment: WrapCrossAlignment.center,
                                  alignment: WrapAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: _getPriorityColor(
                                                selectedMessage.priority)
                                            .withValues(alpha: 0.12),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(
                                            color: _getPriorityColor(
                                                    selectedMessage.priority)
                                                .withValues(alpha: 0.3)),
                                      ),
                                      child: Text(
                                        'PRIORITÉ : ${selectedMessage.priority}',
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w900,
                                          color: _getPriorityColor(
                                              selectedMessage.priority),
                                        ),
                                      ),
                                    ),
                                    Wrap(
                                      spacing: 6,
                                      runSpacing: 6,
                                      crossAxisAlignment:
                                          WrapCrossAlignment.center,
                                      children: [
                                        OutlinedButton.icon(
                                          onPressed: () => _openComposeDialog(
                                            initialTo:
                                                selectedMessage.senderEmail,
                                            initialSubject:
                                                'Re: ${selectedMessage.subject}',
                                          ),
                                          icon: const Icon(Icons.reply_rounded,
                                              size: 14),
                                          label: const Text('Répondre',
                                              style: TextStyle(fontSize: 11)),
                                          style: OutlinedButton.styleFrom(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 10, vertical: 8),
                                            shape: RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(10)),
                                          ),
                                        ),
                                        OutlinedButton.icon(
                                          onPressed: () => _openComposeDialog(
                                            initialSubject:
                                                'Fwd: ${selectedMessage.subject}',
                                          ),
                                          icon: const Icon(
                                              Icons.forward_rounded,
                                              size: 14),
                                          label: const Text('Transférer',
                                              style: TextStyle(fontSize: 11)),
                                          style: OutlinedButton.styleFrom(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 10, vertical: 8),
                                            shape: RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(10)),
                                          ),
                                        ),
                                        IconButton(
                                          onPressed: () {
                                            ScaffoldMessenger.of(context)
                                                .showSnackBar(
                                              const SnackBar(
                                                content: Text(
                                                    'Exportation du courriel certifié au format PDF...'),
                                                backgroundColor:
                                                    Color(0xFF1E3A8A),
                                              ),
                                            );
                                          },
                                          icon: const Icon(
                                              Icons.picture_as_pdf_rounded,
                                              size: 18,
                                              color: Color(0xFF1E3A8A)),
                                          tooltip: 'Exporter en PDF',
                                        ),
                                        IconButton(
                                          onPressed: () {
                                            setState(() {
                                              selectedMessage.isStarred =
                                                  !selectedMessage.isStarred;
                                            });
                                          },
                                          icon: Icon(
                                            selectedMessage.isStarred
                                                ? Icons.star_rounded
                                                : Icons.star_border_rounded,
                                            color: selectedMessage.isStarred
                                                ? Colors.amber
                                                : const Color(0xFF94A3B8),
                                          ),
                                          tooltip: 'Ajouter aux favoris',
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                // En-tête du courriel
                                Text(
                                  selectedMessage.subject,
                                  style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w900,
                                      color: Color(0xFF0F172A)),
                                ),
                                const SizedBox(height: 10),
                                // Badge de signature cryptographique UniFlow
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 12, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0D9488)
                                        .withValues(alpha: 0.08),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                        color: const Color(0xFF0D9488)
                                            .withValues(alpha: 0.25)),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.verified_rounded,
                                          color: Color(0xFF0D9488), size: 16),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          'Signé numériquement par UniFlow (X.509) · De: ${selectedMessage.senderEmail} → À: ${selectedMessage.recipientEmail}',
                                          style: const TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFF0F172A)),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF10B981)
                                              .withValues(alpha: 0.2),
                                          borderRadius:
                                              BorderRadius.circular(6),
                                        ),
                                        child: const Text('Certifié UY1',
                                            style: TextStyle(
                                                fontSize: 9,
                                                fontWeight: FontWeight.bold,
                                                color: Color(0xFF059669))),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 16),
                                // Corps du message
                                Expanded(
                                  child: SingleChildScrollView(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          selectedMessage.body,
                                          style: const TextStyle(
                                              fontSize: 13.5,
                                              color: Color(0xFF334155),
                                              height: 1.6),
                                        ),
                                        if (selectedMessage
                                            .attachments.isNotEmpty) ...[
                                          const SizedBox(height: 20),
                                          const Text(
                                            'Pièces jointes certifiées',
                                            style: TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.bold,
                                                color: Color(0xFF0F172A)),
                                          ),
                                          const SizedBox(height: 8),
                                          Wrap(
                                            spacing: 10,
                                            runSpacing: 8,
                                            children: selectedMessage
                                                .attachments
                                                .map((att) {
                                              return InkWell(
                                                onTap: () {
                                                  ScaffoldMessenger.of(context)
                                                      .showSnackBar(
                                                    SnackBar(
                                                      content: Text(
                                                          'Téléchargement de $att...'),
                                                      backgroundColor:
                                                          const Color(
                                                              0xFF1E3A8A),
                                                    ),
                                                  );
                                                },
                                                child: Container(
                                                  padding: const EdgeInsets
                                                      .symmetric(
                                                      horizontal: 12,
                                                      vertical: 8),
                                                  decoration: BoxDecoration(
                                                    color:
                                                        const Color(0xFFF8FAFC),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            10),
                                                    border: Border.all(
                                                        color: const Color(
                                                            0xFFE2E8F0)),
                                                  ),
                                                  child: Row(
                                                    mainAxisSize:
                                                        MainAxisSize.min,
                                                    children: [
                                                      const Icon(
                                                          Icons
                                                              .attach_file_rounded,
                                                          size: 15,
                                                          color: Color(
                                                              0xFF1E3A8A)),
                                                      const SizedBox(width: 6),
                                                      Text(att,
                                                          style: const TextStyle(
                                                              fontSize: 11.5,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w600)),
                                                      const SizedBox(width: 6),
                                                      const Icon(
                                                          Icons
                                                              .download_rounded,
                                                          size: 15,
                                                          color: Color(
                                                              0xFF0D9488)),
                                                    ],
                                                  ),
                                                ),
                                              );
                                            }).toList(),
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                ),
                                const Divider(color: Color(0xFFE2E8F0)),
                                // Réponse rapide
                                Row(
                                  children: [
                                    Expanded(
                                      child: TextField(
                                        controller: _quickReplyController,
                                        decoration: InputDecoration(
                                          hintText:
                                              'Répondre rapidement avec votre signature @uniflow.cm...',
                                          filled: true,
                                          fillColor: const Color(0xFFF8FAFC),
                                          contentPadding:
                                              const EdgeInsets.symmetric(
                                                  horizontal: 14, vertical: 10),
                                          border: OutlineInputBorder(
                                            borderRadius:
                                                BorderRadius.circular(12),
                                            borderSide: const BorderSide(
                                                color: Color(0xFFE2E8F0)),
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    ElevatedButton.icon(
                                      onPressed: () {
                                        if (_quickReplyController.text
                                            .trim()
                                            .isEmpty) {
                                          _openComposeDialog(
                                            initialTo:
                                                selectedMessage.senderEmail,
                                            initialSubject:
                                                'Re: ${selectedMessage.subject}',
                                          );
                                          return;
                                        }
                                        final replyText =
                                            _quickReplyController.text.trim();
                                        _quickReplyController.clear();
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          SnackBar(
                                            content: Text(
                                                'Réponse envoyée à ${selectedMessage.senderEmail} : "$replyText"'),
                                            backgroundColor:
                                                const Color(0xFF0D9488),
                                          ),
                                        );
                                      },
                                      icon: const Icon(Icons.reply_rounded,
                                          size: 16),
                                      label: const Text('Répondre'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor:
                                            const Color(0xFF1E3A8A),
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 16, vertical: 14),
                                        shape: RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(12)),
                                      ),
                                    ),
                                  ],
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

  Color _getPriorityColor(String priority) {
    switch (priority) {
      case 'URGENT':
        return const Color(0xFFE11D48);
      case 'OFFICIEL':
        return const Color(0xFF0284C7);
      case 'COURS':
        return const Color(0xFF0D9488);
      case 'NORMAL':
      default:
        return const Color(0xFF64748B);
    }
  }
}
