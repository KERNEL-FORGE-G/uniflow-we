import 'package:flutter/material.dart';

class EnrollmentsScreen extends StatefulWidget {
  const EnrollmentsScreen({super.key});

  @override
  State<EnrollmentsScreen> createState() => _EnrollmentsScreenState();
}

class _EnrollmentsScreenState extends State<EnrollmentsScreen> {
  int _selectedTab = 0; // 0 = Dossier LMD, 1 = Parcours ECTS, 2 = Quittances, 3 = Demandes

  final List<Map<String, dynamic>> _semesters = [
    {
      'name': 'Semestre 1 (L1)',
      'year': '2024-2025',
      'credits': '30/30 ECTS',
      'status': 'Validé avec Mention',
      'gpa': '3.75 / 4.00',
      'isCompleted': true,
    },
    {
      'name': 'Semestre 2 (L1)',
      'year': '2024-2025',
      'credits': '30/30 ECTS',
      'status': 'Validé avec Mention',
      'gpa': '3.80 / 4.00',
      'isCompleted': true,
    },
    {
      'name': 'Semestre 3 (L2)',
      'year': '2025-2026',
      'credits': '30/30 ECTS',
      'status': 'Validé avec Mention',
      'gpa': '3.85 / 4.00',
      'isCompleted': true,
    },
    {
      'name': 'Semestre 4 (L2)',
      'year': '2025-2026',
      'credits': '30/30 ECTS',
      'status': 'Validé avec Mention',
      'gpa': '3.90 / 4.00',
      'isCompleted': true,
    },
    {
      'name': 'Semestre 5 (L3)',
      'year': '2026-2027',
      'credits': '30/30 ECTS',
      'status': 'En cours d\'évaluation',
      'gpa': '3.82 / 4.00',
      'isCompleted': false,
    },
    {
      'name': 'Semestre 6 (L3)',
      'year': '2026-2027',
      'credits': '04/30 ECTS',
      'status': 'Stage & Mémoire d\'Ingénierie',
      'gpa': 'En attente',
      'isCompleted': false,
    },
  ];

  final List<Map<String, dynamic>> _payments = [
    {
      'label': 'Frais d\'inscription · Tranche 1 (Obligatoire)',
      'amount': '25 000 FCFA',
      'date': '15 Septembre 2026',
      'operator': 'MTN Mobile Money',
      'ref': 'MM-UY1-9482103',
      'status': 'Validé',
      'isPaid': true,
    },
    {
      'label': 'Frais académiques · Tranche 2 (Scolarité LMD)',
      'amount': '25 000 FCFA',
      'date': '05 Octobre 2026',
      'operator': 'Orange Money',
      'ref': 'OM-UY1-1049281',
      'status': 'Validé',
      'isPaid': true,
    },
    {
      'label': 'Cotisation Mutuelle & Couverture Santé Campus',
      'amount': '5 000 FCFA',
      'date': '15 Septembre 2026',
      'operator': 'Paiement Centralisé',
      'ref': 'SANTE-2026-8831',
      'status': 'Inclus',
      'isPaid': true,
    },
  ];

  final List<Map<String, dynamic>> _requests = [
    {
      'type': 'Attestation de Scolarité 2026-2027',
      'date': '18 Octobre 2026',
      'status': 'Délivrée · Téléchargeable',
      'code': 'ATT-2026-L3-049',
    },
    {
      'type': 'Relevé de Notes Officiel L1-L2 (Certifié)',
      'date': '12 Octobre 2026',
      'status': 'Signé électroniquement',
      'code': 'REL-UY1-84920',
    },
    {
      'type': 'Convention de Stage en Entreprise (Kernel Forge)',
      'date': '02 Octobre 2026',
      'status': 'Approuvée par le Doyen',
      'code': 'STG-ICT4D-004',
    },
  ];

  void _downloadDocument(String title) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Document certifié généré : $title'),
        backgroundColor: const Color(0xFF0D9488),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _showNewRequestDialog() {
    final typeController = TextEditingController(text: 'Certificat de Fréquentation');
    final reasonController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.assignment_add, color: Color(0xFF1E3A8A)),
            SizedBox(width: 10),
            Text('Nouvelle Demande Administrative', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: SizedBox(
          width: 480,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Type de pièce administrative sollicitée :', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                initialValue: 'Certificat de Fréquentation',
                decoration: InputDecoration(
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                ),
                items: const [
                  DropdownMenuItem(value: 'Certificat de Fréquentation', child: Text('Certificat de Fréquentation')),
                  DropdownMenuItem(value: 'Attestation de Réussite', child: Text('Attestation de Réussite')),
                  DropdownMenuItem(value: 'Relevé de Notes Provisoire', child: Text('Relevé de Notes Provisoire')),
                  DropdownMenuItem(value: 'Recommandation pour Bourse', child: Text('Recommandation pour Bourse')),
                ],
                onChanged: (val) {
                  if (val != null) typeController.text = val;
                },
              ),
              const SizedBox(height: 14),
              const Text('Motif ou Destination (ex: Consulat, Concours, Stage) :', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
              const SizedBox(height: 6),
              TextField(
                controller: reasonController,
                maxLines: 2,
                decoration: InputDecoration(
                  hintText: 'Précisez l\'organisme destinataire…',
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
              setState(() {
                _requests.insert(0, {
                  'type': typeController.text,
                  'date': 'Aujourd\'hui',
                  'status': 'En cours de validation Doyen',
                  'code': 'REQ-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
                });
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Demande transmise avec succès au secrétariat académique.'),
                  backgroundColor: Color(0xFF0D9488),
                ),
              );
            },
            icon: const Icon(Icons.send_rounded, size: 16),
            label: const Text('Soumettre la demande'),
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
            // HERO BENTO SECTION - INSCRIPTIONS & PARCOURS LMD
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
                                    'assets/icons/nav/inscriptions.png',
                                    width: 16,
                                    height: 16,
                                    errorBuilder: (_, __, ___) => const Icon(
                                      Icons.badge_rounded,
                                      color: Color(0xFF67E8F9),
                                      size: 14,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  const Text(
                                    'DOSSIER ACADÉMIQUE OFFICIEL · MATRICULE 21T2894',
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
                                'INSCRIPTION EN RÈGLE · VALIDÉE',
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
                          'Inscriptions, Dossier & Cycle LMD',
                          style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Université de Yaoundé I · Faculté des Sciences · Département d\'Informatique · Parcours Génie Logiciel & ICT4D',
                          style: TextStyle(fontSize: 13, color: Color(0xFFCBD5E1), height: 1.4),
                        ),
                        const SizedBox(height: 16),
                        Wrap(
                          spacing: 10,
                          runSpacing: 8,
                          children: [
                            _buildHeroStatPill('Crédits ECTS Validés', '154 / 180 ECTS'),
                            _buildHeroStatPill('Moyenne Cumulative (GPA)', '3.82 / 4.00'),
                            _buildHeroStatPill('Scolarité Annuelle', '100% Soldée (50 000 F)'),
                            _buildHeroStatPill('Niveau Actuel', 'Licence 3 (LMD)'),
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
                      'assets/icons/nav/inscriptions.png',
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const Icon(
                        Icons.school_rounded,
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
            // NAVIGATION DES ONGLETS DU DOSSIER
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
                    _buildTabBtn(0, Icons.folder_shared_rounded, 'Dossier Étudiant'),
                    const SizedBox(width: 8),
                    _buildTabBtn(1, Icons.auto_graph_rounded, 'Parcours LMD & Semestres'),
                    const SizedBox(width: 8),
                    _buildTabBtn(2, Icons.receipt_long_rounded, 'Quittances & Frais'),
                    const SizedBox(width: 8),
                    _buildTabBtn(3, Icons.document_scanner_rounded, 'Demandes Administratives'),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            // =================================================================
            // CONTENU DE L'ONGLET ACTIF
            // =================================================================
            if (_selectedTab == 0)
              _buildIdentityCard()
            else if (_selectedTab == 1)
              _buildSemestersView()
            else if (_selectedTab == 2)
              _buildPaymentsView()
            else
              _buildRequestsView(),
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

  Widget _buildIdentityCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 16,
            runSpacing: 12,
            children: [
              const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.verified_rounded, color: Color(0xFF10B981), size: 22),
                  SizedBox(width: 10),
                  Text(
                    'Fiche d\'Inscription Pédagogique & Administrative Certifiée',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                ],
              ),
              OutlinedButton.icon(
                onPressed: () => _downloadDocument('Attestation_Inscription_2026_2027.pdf'),
                icon: const Icon(Icons.download_rounded, size: 16),
                label: const Text('Attestation Officielle (PDF)'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF1E3A8A),
                  side: const BorderSide(color: Color(0xFF1E3A8A)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Divider(),
          const SizedBox(height: 16),
          Wrap(
            spacing: 24,
            runSpacing: 16,
            children: [
              _buildField('Nom & Prénom', 'Marcel Tessoh'),
              _buildField('Matricule Étudiant', '21T2894 (Signé UY1)'),
              _buildField('Cycle & Degré', 'Licence Professionnelle (LMD)'),
              _buildField('Filière Spécialisée', 'Génie Logiciel & ICT4D'),
              _buildField('Faculté & Établissement', 'Faculté des Sciences (UY1)'),
              _buildField('Courriel Institutionnel', 'etudiant.uy1@uniflow.cm'),
              _buildField('Régime d\'Études', 'Formation Initiale en Présentiel'),
              _buildField('Année Académique', '2026 / 2027'),
            ],
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFBFDBFE)),
            ),
            child: const Row(
              children: [
                Icon(Icons.security_rounded, color: Color(0xFF2563EB), size: 24),
                SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Authentification Cryptographique KERNEL FORGE',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF)),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Ce dossier est scellé par l\'empreinte SHA-256 de l\'Université de Yaoundé I. Il est vérifiable à tout moment auprès des ambassades, universités partenaires et employeurs via le jeton de validation.',
                        style: TextStyle(fontSize: 11.5, color: Color(0xFF3B82F6), height: 1.4),
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

  Widget _buildSemestersView() {
    return Column(
      children: _semesters.map((sem) {
        final isDone = sem['isCompleted'] == true;
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDone ? const Color(0xFF10B981).withValues(alpha: 0.1) : const Color(0xFF1E3A8A).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  isDone ? Icons.check_circle_rounded : Icons.pending_rounded,
                  color: isDone ? const Color(0xFF10B981) : const Color(0xFF1E3A8A),
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          sem['name'] as String,
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                          decoration: BoxDecoration(
                            color: isDone ? const Color(0xFFECFDF5) : const Color(0xFFEFF6FF),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: isDone ? const Color(0xFFA7F3D0) : const Color(0xFFBFDBFE)),
                          ),
                          child: Text(
                            sem['status'] as String,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: isDone ? const Color(0xFF065F46) : const Color(0xFF1E40AF),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Année : ${sem['year']} · Crédits : ${sem['credits']} · GPA : ${sem['gpa']}',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildPaymentsView() {
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
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 16,
            runSpacing: 12,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Quittances de Frais Académiques & Droits Universitaires',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                  Text(
                    'Année académique 2026-2027 · Paiements sécurisés MoMo / Orange Money',
                    style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () => _downloadDocument('Recu_Global_Scolarite_UY1.pdf'),
                icon: const Icon(Icons.receipt_rounded, size: 16),
                label: const Text('Reçu Global Officiel'),
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
          Column(
            children: _payments.map((p) {
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 20),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(p['label'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B))),
                            const SizedBox(height: 3),
                            Text('Date : ${p['date']} · ${p['operator']} · Réf: ${p['ref']}', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                          ],
                        ),
                      ],
                    ),
                    Text(
                      p['amount'] as String,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF1E3A8A)),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildRequestsView() {
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
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 16,
            runSpacing: 12,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Demandes de Pièces Administratives & Certificats',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                  Text(
                    'Délivrance numérique certifiée sans file d\'attente au secrétariat',
                    style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: _showNewRequestDialog,
                icon: const Icon(Icons.add_rounded, size: 16),
                label: const Text('Nouvelle demande'),
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
          Column(
            children: _requests.map((r) {
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.file_copy_rounded, color: Color(0xFF1E3A8A), size: 20),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(r['type'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B))),
                            const SizedBox(height: 3),
                            Text('Date : ${r['date']} · Numéro : ${r['code']}', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                          ],
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFA7F3D0)),
                          ),
                          child: Text(
                            r['status'] as String,
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF065F46)),
                          ),
                        ),
                        const SizedBox(width: 10),
                        IconButton(
                          onPressed: () => _downloadDocument(r['type'] as String),
                          icon: const Icon(Icons.download_rounded, size: 18),
                          color: const Color(0xFF1E3A8A),
                          tooltip: 'Télécharger',
                        ),
                      ],
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildField(String label, String value) {
    return SizedBox(
      width: 280,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
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
