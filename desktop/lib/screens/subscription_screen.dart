import 'package:flutter/material.dart';

class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  State<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> {
  String _billingCycle = 'monthly'; // 'monthly', 'annual'
  String _selectedPlan = 'pro';

  final List<Map<String, dynamic>> _plans = [
    {
      'id': 'free',
      'title': 'Formule Étudiant Standard',
      'priceMonthly': '0 FCFA',
      'priceAnnual': '0 FCFA',
      'badge': 'Inclus d’office',
      'badgeColor': const Color(0xFF64748B),
      'desc': 'Accès aux cours fondamentaux, emploi du temps, notes et émargeur QR.',
      'features': [
        'Accès aux cours et emplois du temps LMD',
        'Émargement QR code de présence',
        'Z-Library jusqu’à 10 livres / jour',
        'UniMail académique @uniflow.cm',
        'Synchronisation locale 100% hors-ligne',
      ],
      'isPopular': false,
    },
    {
      'id': 'pro',
      'title': 'UniFlow Pro Campus',
      'priceMonthly': '2 500 FCFA',
      'priceAnnual': '24 000 FCFA',
      'badge': 'Recommandé Étudiants LMD',
      'badgeColor': const Color(0xFF0D9488),
      'desc': 'Téléchargements illimités, assistance IA Groq avancée et visio HD 1080p.',
      'features': [
        'Tout le forfait Standard inclus',
        'Z-Library ILLIMITÉ sans quota quotidien',
        'Uni Copilot IA (LLaMA 3.3 70B & Groq illimité)',
        'Visioconférence Amphi HD & Enregistrement local',
        'Certificats de scolarité cryptographiques instantanés',
        'Support prioritaire 24/7 sur WhatsApp',
      ],
      'isPopular': true,
    },
    {
      'id': 'institution',
      'title': 'Établissement & Faculté UY1',
      'priceMonthly': 'Sur Devis',
      'priceAnnual': 'Contrat Campus',
      'badge': 'Administration',
      'badgeColor': const Color(0xFF38BDF8),
      'desc': 'Gestion de filières entières, serveurs de présence Sentinelle IoT dédiés.',
      'features': [
        'Déploiement bornes Sentinelle IoT biométriques',
        'Portail d\'administration doyen & chef de département',
        'Génération automatique des procès-verbaux de notes',
        'Accès API directe et intégration SIGES UY1',
      ],
      'isPopular': false,
    },
  ];

  final List<Map<String, dynamic>> _scholarships = [
    {
      'title': 'Bourse d’Excellence Académique UY1',
      'amount': '50 000 FCFA / semestre',
      'criteria': 'GPA >= 3.75 en L3 ou Master 1 ICT4D',
      'deadline': '30 Novembre 2026',
      'status': 'Candidatures Ouvertes',
      'statusColor': const Color(0xFF10B981),
    },
    {
      'title': 'Aide à l’Équipement Numérique KERNEL FORGE',
      'amount': 'Ordinateur portable + Clé 4G',
      'criteria': 'Étudiants boursiers engagés dans des projets Open Source',
      'deadline': '15 Décembre 2026',
      'status': 'Sélection en cours',
      'statusColor': const Color(0xFFF59E0B),
    },
  ];

  void _openMomoPaymentDialog(Map<String, dynamic> plan) {
    final phoneController = TextEditingController();
    String operator = 'MTN';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDlgState) => AlertDialog(
          backgroundColor: const Color(0xFF0F172A),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF0D9488).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.payment_rounded, color: Color(0xFF34D399), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Activer ${plan['title']}',
                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          content: SizedBox(
            width: 440,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Montant à régler : ${_billingCycle == 'monthly' ? plan['priceMonthly'] : plan['priceAnnual']}',
                  style: const TextStyle(color: Color(0xFF67E8F9), fontWeight: FontWeight.bold, fontSize: 15),
                ),
                const SizedBox(height: 14),
                const Text(
                  'Choisissez votre opérateur Mobile Money au Cameroun :',
                  style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () => setDlgState(() => operator = 'MTN'),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: operator == 'MTN' ? const Color(0xFFFBBF24).withValues(alpha: 0.2) : const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: operator == 'MTN' ? const Color(0xFFFBBF24) : const Color(0xFF334155),
                            ),
                          ),
                          alignment: Alignment.center,
                          child: const Text('MTN MoMo (*126#)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: InkWell(
                        onTap: () => setDlgState(() => operator = 'Orange'),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: operator == 'Orange' ? const Color(0xFFF97316).withValues(alpha: 0.2) : const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: operator == 'Orange' ? const Color(0xFFF97316) : const Color(0xFF334155),
                            ),
                          ),
                          alignment: Alignment.center,
                          child: const Text('Orange Money (*150#)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: phoneController,
                  keyboardType: TextInputType.phone,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'Numéro de téléphone (+237 6...)',
                    labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                    hintText: '670 00 00 00',
                    hintStyle: const TextStyle(color: Colors.white30),
                    filled: true,
                    fillColor: const Color(0xFF1E293B),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
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
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      'Demande USSD $operator envoyée au numéro ${phoneController.text.isEmpty ? '6XX XX XX XX' : phoneController.text}. Veuillez valider sur votre téléphone avec votre code secret.',
                    ),
                    backgroundColor: const Color(0xFF10B981),
                    duration: const Duration(seconds: 4),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0D9488),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Valider le Paiement MoMo'),
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
          // HERO BENTO SECTION : ABONNEMENTS, PAIEMENTS & BOURSES
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
                            Icon(Icons.credit_card_rounded, color: Color(0xFF67E8F9), size: 16),
                            SizedBox(width: 8),
                            Text(
                              'Tarification Étudiante & Guichet Bourses · Université de Yaoundé 1',
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
                        'Abonnements Pro, Paiements MoMo & Bourses d’Excellence',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Bénéficiez des fonctionnalités avancées UniFlow, du streaming sans limite Z-Library, ou soumettez votre dossier de bourse et subvention sociale.',
                        style: TextStyle(
                          color: Color(0xFFCBD5E1),
                          fontSize: 13.5,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Sélecteur Mensuel / Annuel (-20%)
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A).withValues(alpha: 0.6),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            InkWell(
                              onTap: () => setState(() => _billingCycle = 'monthly'),
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: _billingCycle == 'monthly' ? const Color(0xFF0D9488) : Colors.transparent,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  'Paiement Mensuel',
                                  style: TextStyle(
                                    color: _billingCycle == 'monthly' ? Colors.white : const Color(0xFF94A3B8),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ),
                            InkWell(
                              onTap: () => setState(() => _billingCycle = 'annual'),
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: _billingCycle == 'annual' ? const Color(0xFF0D9488) : Colors.transparent,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  children: [
                                    Text(
                                      'Paiement Annuel',
                                      style: TextStyle(
                                        color: _billingCycle == 'annual' ? Colors.white : const Color(0xFF94A3B8),
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF59E0B),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: const Text('-20%', style: TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.w900)),
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
                const SizedBox(width: 24),

                // Illustration 3D Abonnement
                Container(
                  width: 140,
                  height: 140,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: Image.asset(
                      'assets/icons/nav/abonnement.png',
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const Icon(Icons.credit_card, size: 60, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // =================================================================
          // SECTION GRILLE DES FORMULES D'ABONNEMENT
          // =================================================================
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _plans.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 18,
              mainAxisSpacing: 18,
              mainAxisExtent: 380,
            ),
            itemBuilder: (context, i) {
              final plan = _plans[i];
              final isSelected = _selectedPlan == plan['id'];
              final isPopular = plan['isPopular'] == true;
              final price = _billingCycle == 'monthly' ? plan['priceMonthly'] : plan['priceAnnual'];

              return InkWell(
                onTap: () => setState(() => _selectedPlan = plan['id'] as String),
                borderRadius: BorderRadius.circular(24),
                child: Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: isSelected ? const Color(0xFF0D9488) : const Color(0xFF1E293B),
                      width: isSelected ? 2 : 1,
                    ),
                    boxShadow: isSelected || isPopular
                        ? [
                            BoxShadow(
                              color: const Color(0xFF0D9488).withValues(alpha: 0.2),
                              blurRadius: 16,
                              offset: const Offset(0, 4),
                            )
                          ]
                        : [],
                  ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            plan['title'] as String,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: (plan['badgeColor'] as Color).withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: plan['badgeColor'] as Color),
                          ),
                          child: Text(
                            plan['badge'] as String,
                            style: TextStyle(color: plan['badgeColor'] as Color, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      price as String,
                      style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
                    ),
                    Text(
                      _billingCycle == 'monthly' ? 'par mois / utilisateur' : 'facturé annuellement',
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      plan['desc'] as String,
                      style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11.5),
                    ),
                    const SizedBox(height: 14),
                    const Divider(color: Color(0xFF1E293B)),
                    const SizedBox(height: 8),
                    Expanded(
                      child: ListView(
                        physics: const NeverScrollableScrollPhysics(),
                        children: (plan['features'] as List<String>).map((feat) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 15),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    feat,
                                    style: const TextStyle(color: Color(0xFFE2E8F0), fontSize: 11),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          if (plan['id'] == 'free') {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Vous utilisez déjà la formule Standard incluse avec votre matricule UY1.'),
                                backgroundColor: Color(0xFF1E3A8A),
                              ),
                            );
                          } else {
                            _openMomoPaymentDialog(plan);
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isPopular ? const Color(0xFF0D9488) : const Color(0xFF1E293B),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        child: Text(
                          plan['id'] == 'free' ? 'Formule Active' : 'Souscrire par MoMo',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),

          const SizedBox(height: 24),

          // =================================================================
          // SECTION GUICHET BOURSES & AIDES UNIVERSITAIRES
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
                              color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.school_rounded, color: Color(0xFFFBBF24), size: 20),
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Guichet des Bourses & Aides Sociales UY1',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Text(
                                  'Financements pour étudiants méritants de la Faculté des Sciences',
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
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Ouverture du formulaire de candidature pour bourse académique...'),
                            backgroundColor: Color(0xFF0D9488),
                          ),
                        );
                      },
                      icon: const Icon(Icons.upload_file_rounded, size: 16),
                      label: const Text('Déposer un dossier'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0D9488),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Row(
                  children: _scholarships.map((sch) {
                    return Expanded(
                      child: Container(
                        margin: const EdgeInsets.only(right: 14),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: const Color(0xFF334155)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    sch['title'] as String,
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: (sch['statusColor'] as Color).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    sch['status'] as String,
                                    style: TextStyle(color: sch['statusColor'] as Color, fontSize: 10.5, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Dotation : ${sch['amount']}',
                              style: const TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Critères : ${sch['criteria']}',
                              style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Date limite : ${sch['deadline']}',
                              style: const TextStyle(color: Color(0xFF64748B), fontSize: 10.5),
                            ),
                          ],
                        ),
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
  }
}
