import 'package:flutter/material.dart';

class ClassroomsScreen extends StatefulWidget {
  final String userName;
  final String userEmail;

  const ClassroomsScreen({
    super.key,
    this.userName = '',
    this.userEmail = '',
  });

  @override
  State<ClassroomsScreen> createState() => _ClassroomsScreenState();
}

class _ClassroomsScreenState extends State<ClassroomsScreen> {
  String _selectedFilter = 'Tous';
  final List<String> _filters = [
    'Tous',
    'Amphithéâtres (>300)',
    'Salles de TD',
    'Laboratoires Informatiques',
    'Salles Libres',
  ];

  final List<Map<String, dynamic>> _rooms = [
    {
      'code': 'AMPHI-1001',
      'name': 'Amphithéâtre 1001 (Nouveau Bloc)',
      'capacity': 1200,
      'category': 'Amphithéâtres (>300)',
      'status': 'Occupé',
      'currentCourse': 'INF4067 · Systèmes Distribués & P2P',
      'teacher': 'Dr. Kamga',
      'equipment': ['Vidéoprojecteur 4K Laser', 'Sonorisation 4 Micros HF', 'Climatisation Active', 'Wi-Fi 6E Campus'],
      'isAvailable': false,
      'nextFree': '12:30',
    },
    {
      'code': 'AMPHI-501',
      'name': 'Amphithéâtre 501 (Bloc Central)',
      'capacity': 600,
      'category': 'Amphithéâtres (>300)',
      'status': 'Occupé',
      'currentCourse': 'INF4018 · Théorie des Langages & Compilation',
      'teacher': 'Pr. Alain Mbarga',
      'equipment': ['Vidéoprojecteur HD', 'Micro Cravate HF', 'Tableau Blanc Double', 'Prises 220V Étudiants'],
      'isAvailable': false,
      'nextFree': '13:00',
    },
    {
      'code': 'AMPHI-250',
      'name': 'Amphithéâtre 250 (Faculté des Sciences)',
      'capacity': 300,
      'category': 'Amphithéâtres (>300)',
      'status': 'Libre',
      'currentCourse': 'Aucun cours en cours · Espace révision calme',
      'teacher': 'Accès libre étudiants',
      'equipment': ['Vidéoprojecteur HD', 'Wi-Fi 6E Campus', 'Éclairage LED', 'Sonorisation'],
      'isAvailable': true,
      'nextFree': 'Disponible jusqu\'à 14:00',
    },
    {
      'code': 'LAB-C205',
      'name': 'Laboratoire C205 · Réseaux, Télécoms & IoT',
      'capacity': 60,
      'category': 'Laboratoires Informatiques',
      'status': 'Occupé',
      'currentCourse': 'TP Noté : Supervision Campus Sentinelle IoT',
      'teacher': 'Dr. Christian Fouda',
      'equipment': ['60 Stations Linux Debian', 'Racks Cisco & MicroTik', 'Sondes IoT LoRaWAN', 'Onduleur Central'],
      'isAvailable': false,
      'nextFree': '15:00',
    },
    {
      'code': 'LAB-C102',
      'name': 'Laboratoire C102 · IA & Calcul Haute Performance',
      'capacity': 50,
      'category': 'Laboratoires Informatiques',
      'status': 'Libre',
      'currentCourse': 'Réservable pour projets de fin d\'études LMD',
      'teacher': 'Dr. Christian Fouda (Superviseur)',
      'equipment': ['50 Postes GPU NVIDIA RTX', 'Serveurs ProLiant UY1', 'PyTorch / CUDA Préinstallés', 'Fibre 1 Gbps'],
      'isAvailable': true,
      'nextFree': 'Disponible toute la journée',
    },
    {
      'code': 'SALLE-C104',
      'name': 'Salle C104 · Algorithmique & Structures de Données',
      'capacity': 85,
      'category': 'Salles de TD',
      'status': 'Occupé',
      'currentCourse': 'TD : Graphes & Arbres Rouges-Noirs',
      'teacher': 'M. Junior Etoa',
      'equipment': ['Vidéoprojecteur Mural', 'Tableau Magnétique', 'Prises Réseau Ethernet'],
      'isAvailable': false,
      'nextFree': '11:45',
    },
    {
      'code': 'SALLE-C201',
      'name': 'Salle C201 · Génie Logiciel & Architecture Agile',
      'capacity': 75,
      'category': 'Salles de TD',
      'status': 'Libre',
      'currentCourse': 'Salle libre pour travail en groupe & révisions',
      'teacher': 'Clé au secrétariat Dept Info',
      'equipment': ['Vidéoprojecteur Wi-Fi', 'Tableau Blanc Effaçable', 'Wi-Fi Haut Débit'],
      'isAvailable': true,
      'nextFree': 'Disponible jusqu\'à 16:30',
    },
    {
      'code': 'AMPHI-POLY',
      'name': 'Amphithéâtre Polyvalent (Grande Salle des Fêtes)',
      'capacity': 800,
      'category': 'Amphithéâtres (>300)',
      'status': 'Maintenance',
      'currentCourse': 'Maintenance semestrielle des projecteurs & climatiseurs',
      'teacher': 'Service Technique UY1',
      'equipment': ['Scène Conférence 4K', 'Système Son Bose Line Array', 'Régie Streaming'],
      'isAvailable': false,
      'nextFree': 'Réouverture Demain 08:00',
    },
  ];

  void _showReservationDialog(Map<String, dynamic> room) {
    final nameController = TextEditingController(text: widget.userName);
    final purposeController = TextEditingController();
    String duration = '2 heures';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.meeting_room_rounded, color: Color(0xFF1E3A8A)),
            const SizedBox(width: 10),
            Expanded(child: Text('Réserver la salle ${room['code']}')),
          ],
        ),
        content: SizedBox(
          width: 480,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(room['name'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
              const SizedBox(height: 6),
              Text('Capacité : ${room['capacity']} places · Équipements complets inclus', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
              const SizedBox(height: 14),
              const Text('Responsable de la réservation :', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
              const SizedBox(height: 6),
              TextField(
                controller: nameController,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                ),
              ),
              const SizedBox(height: 14),
              const Text('Objet / Motif de la réservation :', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
              const SizedBox(height: 6),
              TextField(
                controller: purposeController,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                ),
              ),
              const SizedBox(height: 14),
              const Text('Durée du créneau :', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                initialValue: duration,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                ),
                items: const [
                  DropdownMenuItem(value: '1 heure', child: Text('1 heure')),
                  DropdownMenuItem(value: '2 heures', child: Text('2 heures')),
                  DropdownMenuItem(value: '3 heures', child: Text('3 heures')),
                  DropdownMenuItem(value: 'Demi-journée (4 heures)', child: Text('Demi-journée (4 heures)')),
                ],
                onChanged: (val) {
                  if (val != null) duration = val;
                },
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
                SnackBar(
                  content: Text('Réservation confirmée pour ${room['code']} ($duration). Le bon de réservation a été envoyé à ${widget.userEmail.isNotEmpty ? widget.userEmail : 'votre boîte e-mail institutionnelle'}.'),
                  backgroundColor: const Color(0xFF0D9488),
                  duration: const Duration(seconds: 4),
                ),
              );
            },
            icon: const Icon(Icons.check_rounded, size: 16),
            label: const Text('Confirmer la réservation'),
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
    final filtered = _rooms.where((r) {
      if (_selectedFilter == 'Tous') return true;
      if (_selectedFilter == 'Salles Libres') return r['isAvailable'] == true;
      return r['category'] == _selectedFilter;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // =================================================================
            // HERO BENTO SECTION - SALLES & AMPHIS
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
                                    'assets/icons/nav/rooms.png',
                                    width: 16,
                                    height: 16,
                                    errorBuilder: (_, __, ___) => const Icon(
                                      Icons.meeting_room_rounded,
                                      color: Color(0xFF67E8F9),
                                      size: 14,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  const Text(
                                    'CAMPUS UY1 · GESTION TECHNIQUE DU BÂTIMENT',
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
                                'RADAR D\'OCCUPATION EN TEMPS RÉEL',
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
                          'Salles, Amphithéâtres & Laboratoires',
                          style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Supervision en temps réel des capacités d\'accueil, équipements audiovisuels et disponiblité pour vos cours et révisions.',
                          style: TextStyle(fontSize: 13, color: Color(0xFFCBD5E1), height: 1.4),
                        ),
                        const SizedBox(height: 16),
                        Wrap(
                          spacing: 10,
                          runSpacing: 8,
                          children: [
                            _buildHeroStatPill('Capacité Cumulée', '3 450 places'),
                            _buildHeroStatPill('Espaces Détectés', '${_rooms.length} Bâtiments'),
                            _buildHeroStatPill('Wi-Fi Mesh Campus', '16 Bornes Cisco 6E'),
                            _buildHeroStatPill('Climatisation & Audio', '100% Opérationnels'),
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
                      'assets/icons/nav/rooms.png',
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const Icon(
                        Icons.meeting_room_rounded,
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
            // BARRE DE FILTRES
            // =================================================================
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _filters.map((filtre) {
                  final isSelected = _selectedFilter == filtre;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(filtre),
                      selected: isSelected,
                      onSelected: (val) {
                        if (val) setState(() => _selectedFilter = filtre);
                      },
                      selectedColor: const Color(0xFF1E3A8A),
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.white : const Color(0xFF334155),
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                      backgroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: BorderSide(color: isSelected ? const Color(0xFF1E3A8A) : const Color(0xFFE2E8F0)),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 20),

            // =================================================================
            // GRILLE DES SALLES & AMPHIS
            // =================================================================
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: filtered.length,
              itemBuilder: (context, index) {
                final room = filtered[index];
                final isAvailable = room['isAvailable'] == true;
                final isMaint = room['status'] == 'Maintenance';

                Color statusBg = isAvailable
                    ? const Color(0xFFECFDF5)
                    : isMaint
                        ? const Color(0xFFFFFBEB)
                        : const Color(0xFFEFF6FF);
                Color statusBorder = isAvailable
                    ? const Color(0xFFA7F3D0)
                    : isMaint
                        ? const Color(0xFFFDE68A)
                        : const Color(0xFFBFDBFE);
                Color statusText = isAvailable
                    ? const Color(0xFF065F46)
                    : isMaint
                        ? const Color(0xFFB45309)
                        : const Color(0xFF1E40AF);

                return Container(
                  margin: const EdgeInsets.only(bottom: 14),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.02),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 100,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 14),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Column(
                          children: [
                            const Icon(Icons.apartment_rounded, color: Color(0xFF1E3A8A), size: 28),
                            const SizedBox(height: 6),
                            Text(
                              room['code'] as String,
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 11, color: Color(0xFF0F172A)),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${room['capacity']} places',
                              style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 18),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    room['name'] as String,
                                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: statusBg,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: statusBorder),
                                  ),
                                  child: Text(
                                    room['status'] as String,
                                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: statusText),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Activité en cours : ${room['currentCourse']}',
                              style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Enseignant / Responsable : ${room['teacher']} · Prochaine disponibilité : ${room['nextFree']}',
                              style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                            ),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 6,
                              runSpacing: 4,
                              children: (room['equipment'] as List<String>).map((eq) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF1F5F9),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.check_rounded, color: Color(0xFF0D9488), size: 12),
                                      const SizedBox(width: 4),
                                      Text(eq, style: const TextStyle(fontSize: 10.5, color: Color(0xFF475569))),
                                    ],
                                  ),
                                );
                              }).toList(),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      if (isAvailable)
                        ElevatedButton.icon(
                          onPressed: () => _showReservationDialog(room),
                          icon: const Icon(Icons.bookmark_add_rounded, size: 15),
                          label: const Text('Réserver'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0D9488),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
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
