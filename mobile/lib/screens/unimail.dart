import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/appwrite_models.dart';
import '../providers/providers.dart';
import '../theme/app_theme.dart';
import '../widgets/common.dart';
import '../widgets/phosphor.dart';

/// Modèle d'un message électronique institutionnel `@uniflow.cm`.
class UniMailMessage {
  final String id;
  final String folder; // 'inbox', 'sent', 'starred', 'official'
  final String senderName;
  final String senderAddress;
  final String recipientAddress;
  final String subject;
  final String preview;
  final String body;
  final String timestamp;
  final bool unread;
  final bool starred;
  final bool signedByUniFlow;
  final List<String> attachments;

  const UniMailMessage({
    required this.id,
    required this.folder,
    required this.senderName,
    required this.senderAddress,
    required this.recipientAddress,
    required this.subject,
    required this.preview,
    required this.body,
    required this.timestamp,
    this.unread = false,
    this.starred = false,
    this.signedByUniFlow = true,
    this.attachments = const [],
  });

  UniMailMessage copyWith({
    bool? unread,
    bool? starred,
  }) {
    return UniMailMessage(
      id: id,
      folder: folder,
      senderName: senderName,
      senderAddress: senderAddress,
      recipientAddress: recipientAddress,
      subject: subject,
      preview: preview,
      body: body,
      timestamp: timestamp,
      unread: unread ?? this.unread,
      starred: starred ?? this.starred,
      signedByUniFlow: signedByUniFlow,
      attachments: attachments,
    );
  }
}

/// Génère l'adresse `@uniflow.cm` officielle attachée au compte utilisateur.
String buildUniMailAddress(UniFlowUser? user) {
  final rawName = (user?.name ?? '').trim().toLowerCase();
  if (rawName.isNotEmpty) {
    final normalized = rawName
        .replaceAll(RegExp(r'[àáâä]'), 'a')
        .replaceAll(RegExp(r'[èéêë]'), 'e')
        .replaceAll(RegExp(r'[ìíîï]'), 'i')
        .replaceAll(RegExp(r'[òóôö]'), 'o')
        .replaceAll(RegExp(r'[ùúûü]'), 'u')
        .replaceAll('ç', 'c')
        .replaceAll(RegExp(r'[^a-z0-9]+'), '.')
        .replaceAll(RegExp(r'^\.+|\.+$'), '');
    if (normalized.isNotEmpty) {
      return '$normalized@uniflow.cm';
    }
  }
  final rawEmail = (user?.email ?? '').trim().toLowerCase();
  if (rawEmail.contains('@')) {
    final local = rawEmail.split('@').first.replaceAll(RegExp(r'[^a-z0-9._-]'), '');
    if (local.isNotEmpty) return '$local@uniflow.cm';
  }
  return 'etudiant.campus@uniflow.cm';
}

List<UniMailMessage> _defaultMessagesFor(String myAddress) => [
      UniMailMessage(
        id: 'mail-cert-identite',
        folder: 'inbox',
        senderName: 'Autorité de Certification UniFlow',
        senderAddress: 'autorite.identite@uniflow.cm',
        recipientAddress: myAddress,
        subject: 'Activation officielle de votre boîte académique @uniflow.cm',
        preview:
            'Votre adresse électronique institutionnelle est désormais active, signée cryptographiquement par UniFlow et rattachée à votre compte.',
        body: 'Bonjour,\n\n'
            'Nous vous confirmons l\'activation de votre boîte aux lettres électronique académique officielle : $myAddress.\n\n'
            'Caractéristiques de votre identité UniMail :\n'
            '• Signature institutionnelle : chaque courriel émis depuis cette boîte porte le sceau vérifié UniFlow Campus.\n'
            '• Cycle de vie synchronisé : cette adresse est créée automatiquement avec votre compte UniFlow et suit votre statut académique.\n'
            '• Communications officielles : vos relevés de notes, convocations d\'examens et attestations de scolarité y sont acheminés en priorité.\n\n'
            'Cordialement,\nL\'Autorité de Certification UniFlow · KERNEL FORGE',
        timestamp: '10:15',
        unread: true,
        starred: true,
        attachments: const ['Certificat_Identite_UniMail_2026.pdf'],
      ),
      UniMailMessage(
        id: 'mail-beta-annonce',
        folder: 'inbox',
        senderName: 'Direction du Campus & Équipe UniFlow',
        senderAddress: 'direction.campus@uniflow.cm',
        recipientAddress: myAddress,
        subject: '[Officiel] Lancement de la phase de test bêta UniFlow & améliorations à venir',
        preview:
            'Découvrez la refonte Bento 3D, les Actualités Campus enrichies et le support hors-ligne amélioré.',
        body: 'Chère communauté universitaire,\n\n'
            'La plateforme UniFlow est actuellement en phase de test bêta actif. De nombreuses améliorations de performance, de design (grille Bento 3D) et de collaboration arrivent progressivement.\n\n'
            'Vous pouvez désormais consulter les annonces multimédias officielles dans la rubrique « Actualités Campus » et échanger avec vos enseignants et camarades via votre adresse @uniflow.cm.\n\n'
            'Bonne session académique sur UniFlow !',
        timestamp: 'Hier',
        unread: true,
        starred: true,
        attachments: const ['Note_Circulaire_Beta_UniFlow.pdf'],
      ),
      UniMailMessage(
        id: 'mail-scolarite-releve',
        folder: 'inbox',
        senderName: 'Service de la Scolarité & Examens',
        senderAddress: 'scolarite.sciences@uniflow.cm',
        recipientAddress: myAddress,
        subject: 'Validation de vos inscriptions aux Unités d\'Enseignement (Semestre en cours)',
        preview:
            'Votre fiche d\'inscription pédagogique et votre quitus de présence QR ont été synchronisés avec succès.',
        body: 'Bonjour,\n\n'
            'Le Service de la Scolarité vous informe que votre dossier d\'inscription aux Unités d\'Enseignement du semestre courant est complet et validé.\n\n'
            'Vous trouverez en pièce jointe le récapitulatif signé de vos crédits ECTS inscrits.\n\n'
            'Le Secrétariat Académique',
        timestamp: '14 oct.',
        unread: false,
        starred: false,
        attachments: const ['Attestation_Inscription_UE.pdf'],
      ),
      UniMailMessage(
        id: 'mail-sent-1',
        folder: 'sent',
        senderName: 'Moi ($myAddress)',
        senderAddress: myAddress,
        recipientAddress: 'coordination.ict4d@uniflow.cm',
        subject: 'Dépôt du rapport de projet tutoré & code source',
        preview: 'Bonjour Professeur, veuillez trouver ci-joint le rapport final de notre groupe.',
        body: 'Bonjour Professeur,\n\n'
            'Veuillez trouver ci-joint le rapport final de notre groupe ainsi que la synthèse de notre présentation.\n\n'
            'Respectueusement,\nEnvoyé depuis UniMail ($myAddress)',
        timestamp: '12 oct.',
        unread: false,
        starred: false,
        attachments: const ['Rapport_Projet_Tutore_Final.pdf'],
      ),
    ];

/// Écran UniMail `@uniflow.cm` (`/mail`) — Messagerie électronique académique signée UniFlow.
class UniMailScreen extends ConsumerStatefulWidget {
  const UniMailScreen({super.key});

  @override
  ConsumerState<UniMailScreen> createState() => _UniMailScreenState();
}

class _UniMailScreenState extends ConsumerState<UniMailScreen> {
  List<UniMailMessage>? _messages;
  String _selectedFolder = 'inbox'; // 'inbox', 'sent', 'starred'

  List<UniMailMessage> _ensureMessages(String myAddress) {
    return _messages ??= _defaultMessagesFor(myAddress);
  }

  void _openComposeSheet(String myAddress) {
    final toCtrl = TextEditingController();
    final subjectCtrl = TextEditingController();
    final bodyCtrl = TextEditingController();

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (sheetCtx) {
        return Padding(
          padding: EdgeInsets.fromLTRB(
            20,
            16,
            20,
            MediaQuery.of(sheetCtx).viewInsets.bottom + 24,
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
                        PhosphorIconsDuotone.paperPlaneTilt,
                        color: AppColors.primaryBlue,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Nouveau courriel @uniflow.cm',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            'De : $myAddress · Signé UniFlow',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 11.5, color: AppColors.teal, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: toCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Destinataire (@uniflow.cm)',
                    hintText: 'Ex: scolarite@uniflow.cm ou enseignant@uniflow.cm',
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: subjectCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Objet du courriel',
                    hintText: 'Ex: Demande d\'attestation de scolarité',
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: bodyCtrl,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    labelText: 'Message',
                    hintText: 'Rédigez votre courriel académique...',
                  ),
                ),
                const SizedBox(height: 18),
                InkWell(
                  onTap: () {
                    final to = toCtrl.text.trim().isEmpty ? 'scolarite@uniflow.cm' : toCtrl.text.trim();
                    final subject = subjectCtrl.text.trim();
                    final body = bodyCtrl.text.trim();
                    if (subject.isEmpty || body.isEmpty) return;

                    setState(() {
                      _ensureMessages(myAddress).insert(
                        0,
                        UniMailMessage(
                          id: 'sent-${DateTime.now().millisecondsSinceEpoch}',
                          folder: 'sent',
                          senderName: 'Moi ($myAddress)',
                          senderAddress: myAddress,
                          recipientAddress: to.contains('@') ? to : '$to@uniflow.cm',
                          subject: subject,
                          preview: body,
                          body: body,
                          timestamp: 'À l\'instant',
                          unread: false,
                          starred: false,
                        ),
                      );
                      _selectedFolder = 'sent';
                    });
                    Navigator.of(sheetCtx).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Courriel signé @uniflow.cm envoyé avec succès !'),
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
                      'Envoyer avec signature UniFlow',
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
  }

  void _openMailDetail(UniMailMessage msg, String myAddress) {
    setState(() {
      final list = _ensureMessages(myAddress);
      final idx = list.indexWhere((m) => m.id == msg.id);
      if (idx != -1 && list[idx].unread) {
        list[idx] = list[idx].copyWith(unread: false);
      }
    });

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
          initialChildSize: 0.78,
          minChildSize: 0.5,
          maxChildSize: 0.94,
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
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.teal50,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: AppColors.teal.withValues(alpha: 0.3)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          PhosphorIcon(PhosphorIconsFill.shieldCheck, size: 13, color: AppColors.teal),
                          SizedBox(width: 5),
                          Text(
                            'Signé UniFlow (@uniflow.cm)',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.tealDark,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    Text(
                      msg.timestamp,
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  msg.subject,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                    height: 1.25,
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.inputBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        msg.senderName,
                        style: const TextStyle(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'De : ${msg.senderAddress}',
                        style: const TextStyle(fontSize: 12, color: AppColors.primaryBlue, fontWeight: FontWeight.w600),
                      ),
                      Text(
                        'À : ${msg.recipientAddress}',
                        style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  msg.body,
                  style: const TextStyle(
                    fontSize: 14,
                    height: 1.55,
                    color: AppColors.textPrimary,
                  ),
                ),
                if (msg.attachments.isNotEmpty) ...[
                  const SizedBox(height: 18),
                  const Text(
                    'Pièces jointes certifiées',
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  for (final file in msg.attachments)
                    Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.primary50,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          const PhosphorIcon(PhosphorIconsFill.filePdf, size: 20, color: AppColors.primaryBlue),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              file,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 12.5,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primaryBlue,
                              ),
                            ),
                          ),
                        ],
                      ),
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
    final user = ref.watch(currentUserProvider);
    final role = ref.watch(currentRoleProvider);
    final myAddress = buildUniMailAddress(user);
    final allMessages = _ensureMessages(myAddress);

    final filtered = switch (_selectedFolder) {
      'sent' => allMessages.where((m) => m.folder == 'sent').toList(),
      'starred' => allMessages.where((m) => m.starred).toList(),
      _ => allMessages.where((m) => m.folder == 'inbox').toList(),
    };
    final unreadCount = allMessages.where((m) => m.folder == 'inbox' && m.unread).length;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Column(
        children: [
          GradientHeader(
            title: 'UniMail @uniflow.cm',
            subtitle: 'Messagerie électronique académique signée UniFlow',
            trailing: InkWell(
              onTap: () => _openComposeSheet(myAddress),
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
                    PhosphorIcon(PhosphorIconsBold.notePencil, size: 13, color: Colors.white),
                    SizedBox(width: 5),
                    Text(
                      'Écrire',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, uniClearance + 40),
              children: [
                // ── Carte Bento d'identité UniMail @uniflow.cm ─────────────────
                _UniMailIdentityCard(
                  address: myAddress,
                  roleLabel: role.label,
                  onCopy: () {
                    Clipboard.setData(ClipboardData(text: myAddress));
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Adresse $myAddress copiée !'),
                        backgroundColor: AppColors.primaryBlue,
                      ),
                    );
                  },
                  onCompose: () => _openComposeSheet(myAddress),
                ),
                const SizedBox(height: 16),

                // ── Onglets Bento des dossiers ─────────────────────────────────
                Row(
                  children: [
                    Expanded(
                      child: _FolderTab(
                        label: 'Réception ($unreadCount)',
                        icon: PhosphorIconsDuotone.tray,
                        selected: _selectedFolder == 'inbox',
                        onTap: () => setState(() => _selectedFolder = 'inbox'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _FolderTab(
                        label: 'Envoyés',
                        icon: PhosphorIconsDuotone.paperPlaneRight,
                        selected: _selectedFolder == 'sent',
                        onTap: () => setState(() => _selectedFolder = 'sent'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _FolderTab(
                        label: 'Favoris',
                        icon: PhosphorIconsDuotone.star,
                        selected: _selectedFolder == 'starred',
                        onTap: () => setState(() => _selectedFolder = 'starred'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // ── Liste des courriels ────────────────────────────────────────
                if (filtered.isEmpty)
                  const SectionCard(
                    child: EmptyState(
                      icon: PhosphorIconsDuotone.envelope,
                      title: 'Aucun courriel dans ce dossier',
                      message: 'Vos messages électroniques @uniflow.cm apparaîtront ici.',
                    ),
                  )
                else
                  for (final msg in filtered)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _MailRowCard(
                        message: msg,
                        onTap: () => _openMailDetail(msg, myAddress),
                        onToggleStar: () {
                          setState(() {
                            final idx = allMessages.indexWhere((m) => m.id == msg.id);
                            if (idx != -1) {
                              allMessages[idx] = allMessages[idx].copyWith(starred: !allMessages[idx].starred);
                            }
                          });
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

class _UniMailIdentityCard extends StatelessWidget {
  final String address;
  final String roleLabel;
  final VoidCallback onCopy;
  final VoidCallback onCompose;

  const _UniMailIdentityCard({
    required this.address,
    required this.roleLabel,
    required this.onCopy,
    required this.onCompose,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
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
            children: [
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.16),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: Image.asset(
                          'assets/brand/uniflow_logo_final.png',
                          width: 14,
                          height: 14,
                          fit: BoxFit.contain,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Flexible(
                        child: Text(
                          'IDENTITÉ SIGNÉE UNIFLOW',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: Colors.white,
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
              Text(
                roleLabel.toUpperCase(),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Color(0xFFBAE6FD),
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      address,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Adresse rattachée au cycle de vie de votre compte UniFlow (création & révocation automatiques).',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.82),
                        fontSize: 11.5,
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: 44,
                height: 44,
                margin: const EdgeInsets.only(left: 10),
                padding: const EdgeInsets.all(5),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.22)),
                ),
                child: Image.asset(
                  'assets/icons/nav/messages.png',
                  fit: BoxFit.contain,
                  errorBuilder: (_, __, ___) => const PhosphorIcon(PhosphorIconsDuotone.envelope, color: Colors.white, size: 22),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              InkWell(
                onTap: onCopy,
                borderRadius: BorderRadius.circular(999),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.16),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      PhosphorIcon(PhosphorIconsBold.clipboardText, size: 13, color: Colors.white),
                      SizedBox(width: 5),
                      Flexible(
                        child: Text(
                          'Copier mon adresse',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              InkWell(
                onTap: onCompose,
                borderRadius: BorderRadius.circular(999),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      PhosphorIcon(PhosphorIconsBold.paperPlaneTilt, size: 13, color: AppColors.primaryBlue),
                      SizedBox(width: 5),
                      Flexible(
                        child: Text(
                          'Nouveau courriel',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: AppColors.primaryBlue,
                            fontSize: 11.5,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _FolderTab extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  const _FolderTab({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? AppColors.primaryBlue : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: selected ? AppColors.primaryBlue : AppColors.inputBorder,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 15,
              color: selected ? Colors.white : AppColors.textSecondary,
            ),
            const SizedBox(width: 6),
            Flexible(
              child: Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w700,
                  color: selected ? Colors.white : AppColors.textSecondary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MailRowCard extends StatelessWidget {
  final UniMailMessage message;
  final VoidCallback onTap;
  final VoidCallback onToggleStar;

  const _MailRowCard({
    required this.message,
    required this.onTap,
    required this.onToggleStar,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: message.unread ? AppColors.primaryBlue.withValues(alpha: 0.35) : AppColors.inputBorder,
              width: message.unread ? 1.4 : 1.0,
            ),
            boxShadow: AppColors.cardShadow,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  if (message.unread)
                    Container(
                      width: 8,
                      height: 8,
                      margin: const EdgeInsets.only(right: 8),
                      decoration: const BoxDecoration(
                        color: AppColors.primaryBlue,
                        shape: BoxShape.circle,
                      ),
                    ),
                  Expanded(
                    child: Text(
                      message.senderName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: message.unread ? FontWeight.w800 : FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    message.timestamp,
                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(width: 6),
                  InkWell(
                    onTap: onToggleStar,
                    borderRadius: BorderRadius.circular(999),
                    child: Padding(
                      padding: const EdgeInsets.all(2),
                      child: PhosphorIcon(
                        message.starred ? PhosphorIconsFill.star : PhosphorIconsBold.star,
                        size: 15,
                        color: message.starred ? AppColors.amber : AppColors.textMuted,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 3),
              Text(
                message.senderAddress,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppColors.teal,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                message.subject,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: message.unread ? FontWeight.w800 : FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                message.preview,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                  height: 1.35,
                ),
              ),
              if (message.attachments.isNotEmpty) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    const PhosphorIcon(PhosphorIconsFill.filePdf, size: 13, color: AppColors.primaryBlue),
                    const SizedBox(width: 5),
                    Expanded(
                      child: Text(
                        message.attachments.first,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primaryBlue,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
