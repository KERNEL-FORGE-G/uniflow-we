import 'package:flutter/material.dart';

class SentinelleScreen extends StatefulWidget {
  const SentinelleScreen({super.key});

  @override
  State<SentinelleScreen> createState() => _SentinelleScreenState();
}

class _SentinelleScreenState extends State<SentinelleScreen> {
  int _selectedCameraIndex = -1; // -1 = 4-Split Grid, 0..3 = Caméra plein écran
  String _activeTab = 'cameras'; // 'cameras', 'kiosks', 'schematic', 'logs'

  final List<Map<String, dynamic>> _cameras = [
    {
      'id': 'CAM-01',
      'name': 'Bibliothèque Centrale UY1 · Salle de Lecture',
      'location': 'Bâtiment B · Niveau 1',
      'image': 'assets/illustrations/sentinelle_cam_library.jpg',
      'status': 'En direct',
      'occupancy': '84 étudiants',
      'fps': '25 fps',
      'resolution': '1080p FHD',
      'edgeAI': 'Détection présence normale',
    },
    {
      'id': 'CAM-02',
      'name': 'Laboratoire Informatique C205 & Racks Serveurs',
      'location': 'Bloc Pédagogique ICT4D',
      'image': 'assets/illustrations/sentinelle_cam_lab.jpg',
      'status': 'En direct',
      'occupancy': '32 étudiants',
      'fps': '30 fps',
      'resolution': '1080p FHD',
      'edgeAI': 'Session TP en cours (Dr. Tapamo)',
    },
    {
      'id': 'CAM-03',
      'name': 'Résidence Universitaire · Couloir Bloc A',
      'location': 'Campus Résidentiel',
      'image': 'assets/illustrations/sentinelle_cam_residence.jpg',
      'status': 'En direct',
      'occupancy': 'Flux calme',
      'fps': '25 fps',
      'resolution': '1080p FHD',
      'edgeAI': 'Contrôle d\'accès actif',
    },
    {
      'id': 'CAM-04',
      'name': 'Portique d\'Accès Principal & Parking Est',
      'location': 'Entrée Principale Campus UY1',
      'image': 'assets/illustrations/sentinelle_cam_parking.jpg',
      'status': 'En direct',
      'occupancy': 'Circulation fluide',
      'fps': '30 fps',
      'resolution': '4K UHD',
      'edgeAI': 'Lecteur plaques & QR badges',
    },
  ];

  final List<Map<String, dynamic>> _kiosks = [
    {
      'name': 'Borne Sentinelle #01 · Amphi 501',
      'ip': '192.168.1.101',
      'status': 'En ligne',
      'battery': '100% (Secteur + Onduleur)',
      'biometrics': 'Lecteur Optique OK',
      'qrScanner': 'Actif (0.12s scan)',
      'lastSync': 'Il y a 3s',
      'passesToday': 1240,
    },
    {
      'name': 'Borne Sentinelle #02 · Bibliothèque Centrale',
      'ip': '192.168.1.102',
      'status': 'En ligne',
      'battery': '100% (Secteur)',
      'biometrics': 'Lecteur Empreinte OK',
      'qrScanner': 'Actif (0.15s scan)',
      'lastSync': 'Il y a 2s',
      'passesToday': 890,
    },
    {
      'name': 'Borne Sentinelle #03 · Laboratoire C205',
      'ip': '192.168.1.103',
      'status': 'En ligne',
      'battery': '100% (Secteur)',
      'biometrics': 'NFC & QR OK',
      'qrScanner': 'Actif (0.10s scan)',
      'lastSync': 'Il y a 1s',
      'passesToday': 430,
    },
    {
      'name': 'Borne Sentinelle #04 · Portique Campus Nord',
      'ip': '192.168.1.104',
      'status': 'Mode Batterie (92%)',
      'battery': 'Batterie Secours Active',
      'biometrics': 'Lecteur Carte Étudiante OK',
      'qrScanner': 'Actif',
      'lastSync': 'Il y a 10s',
      'passesToday': 3120,
    },
  ];

  final List<Map<String, dynamic>> _securityLogs = [
    {
      'time': '14:38:12',
      'type': 'Passage Valide',
      'device': 'Borne Amphi 501',
      'user': 'Marcel Tessoh (L3 ICT4D - Matricule 21T2044)',
      'status': 'Autorisé',
      'color': const Color(0xFF10B981),
    },
    {
      'time': '14:35:40',
      'type': 'Scan QR Présence',
      'device': 'Borne Lab C205',
      'user': 'Ravel Nghomsi (L3 ICT4D - Matricule 21T2045)',
      'status': 'Validé Cryptographiquement',
      'color': const Color(0xFF10B981),
    },
    {
      'time': '14:28:05',
      'type': 'Détection Affluence',
      'device': 'CAM-01 Bibliothèque',
      'user': 'Algorithme Edge AI Vision',
      'status': 'Seuil 80% atteint (Salle d\'étude calme)',
      'color': const Color(0xFFF59E0B),
    },
    {
      'time': '14:15:22',
      'type': 'Contrôle d\'Accès',
      'device': 'Borne Portique Nord',
      'user': 'Prof. Melatagia Yonta (Enseignant)',
      'status': 'Badge RFID Enseignant Certifié',
      'color': const Color(0xFF38BDF8),
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF0B132B),
      child: ListView(
        padding: const EdgeInsets.all(28),
        children: [
          // =================================================================
          // HERO BENTO SECTION : SENTINELLE IOT & VIDÉOSURVEILLANCE CAMPUS
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
                      // Badge
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
                            Icon(Icons.shield_rounded, color: Color(0xFF67E8F9), size: 16),
                            SizedBox(width: 8),
                            Text(
                              'Sentinelle IoT · Système de Sécurité & Bornes Intelligentes UY1',
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
                        'Supervision Campus, Caméras CCTV & Bornes Edge AI',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Surveillance en temps réel des accès de l\'Université de Yaoundé 1, flux caméras haute résolution, télémétrie des bornes biométriques autonomes et traçabilité cryptographique des passages.',
                        style: TextStyle(
                          color: Color(0xFFCBD5E1),
                          fontSize: 13.5,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Boutons d'onglets de vue
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: [
                          _buildTabButton(
                            'cameras',
                            'Flux Vidéosurveillance CCTV (4)',
                            Icons.videocam_rounded,
                          ),
                          _buildTabButton(
                            'kiosks',
                            'Bornes Sentinelle IoT (4)',
                            Icons.devices_other_rounded,
                          ),
                          _buildTabButton(
                            'schematic',
                            'Architecture & Rendu 3D Hardware',
                            Icons.memory_rounded,
                          ),
                          _buildTabButton(
                            'logs',
                            'Journal de Sécurité en Direct',
                            Icons.receipt_long_rounded,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 24),

                // Illustration 3D Sentinelle
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
                      'assets/icons/nav/sentinelle.png',
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const Icon(Icons.security, size: 60, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // =================================================================
          // CONTENU DE L'ONGLET SÉLECTIONNÉ
          // =================================================================
          if (_activeTab == 'cameras') ...[
            // VUE CAMÉRAS CCTV
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: const BoxDecoration(
                        color: Color(0xFFEF4444),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'FLUX CCTV EN DIRECT (CAM 01 à 04)',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
                if (_selectedCameraIndex != -1)
                  ElevatedButton.icon(
                    onPressed: () => setState(() => _selectedCameraIndex = -1),
                    icon: const Icon(Icons.grid_view_rounded, size: 16),
                    label: const Text('Revenir à la vue 4 caméras'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E293B),
                      foregroundColor: Colors.white,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),

            if (_selectedCameraIndex == -1)
              // Grille 4 Caméras
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _cameras.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 18,
                  mainAxisSpacing: 18,
                  childAspectRatio: 16 / 10.5,
                ),
                itemBuilder: (context, i) {
                  final cam = _cameras[i];
                  return InkWell(
                    onTap: () => setState(() => _selectedCameraIndex = i),
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF1E293B)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.3),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(19),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            Image.asset(
                              cam['image'] as String,
                              fit: BoxFit.cover,
                            ),
                            // Gradient Overlay pour lisibilité
                            Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    Colors.black.withValues(alpha: 0.7),
                                    Colors.transparent,
                                    Colors.black.withValues(alpha: 0.8),
                                  ],
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  stops: const [0.0, 0.5, 1.0],
                                ),
                              ),
                            ),
                            // HUD Supérieur
                            Positioned(
                              top: 12,
                              left: 14,
                              right: 14,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.black.withValues(alpha: 0.75),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: const Color(0xFFEF4444)),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Container(
                                          width: 7,
                                          height: 7,
                                          decoration: const BoxDecoration(
                                            color: Color(0xFFEF4444),
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          '[${cam['id']}] REC ●',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 11,
                                            fontFamily: 'monospace',
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.black.withValues(alpha: 0.75),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      '${cam['fps']} · ${cam['resolution']}',
                                      style: const TextStyle(
                                        color: Color(0xFF67E8F9),
                                        fontSize: 10,
                                        fontFamily: 'monospace',
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            // HUD Inférieur
                            Positioned(
                              bottom: 12,
                              left: 14,
                              right: 14,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    cam['name'] as String,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          'Emplacement : ${cam['location']}',
                                          style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF0D9488).withValues(alpha: 0.8),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          cam['edgeAI'] as String,
                                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
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
                    ),
                  );
                },
              )
            else
              // Caméra unique en grand écran
              Container(
                height: 520,
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFF1E293B)),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      Image.asset(
                        _cameras[_selectedCameraIndex]['image'] as String,
                        fit: BoxFit.cover,
                      ),
                      Positioned(
                        top: 20,
                        left: 20,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.85),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFEF4444)),
                          ),
                          child: Text(
                            '[${_cameras[_selectedCameraIndex]['id']}] VUE PRINCIPALE EN DIRECT · ${_cameras[_selectedCameraIndex]['name']}',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13, fontFamily: 'monospace'),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ] else if (_activeTab == 'kiosks') ...[
            // VUE BORNES SENTINELLE IOT
            const Text(
              'ÉTAT EN DIRECT DU PARC DE BORNES SENTINELLE IOT',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
            ),
            const SizedBox(height: 16),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _kiosks.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 18,
                mainAxisSpacing: 18,
                mainAxisExtent: 180,
              ),
              itemBuilder: (context, i) {
                final k = _kiosks[i];
                return Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(20),
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
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Icon(Icons.terminal_rounded, color: Color(0xFF34D399), size: 18),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    k['name'] as String,
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              k['status'] as String,
                              style: const TextStyle(color: Color(0xFF34D399), fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('IP : ${k['ip']}', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                                const SizedBox(height: 4),
                                Text('Biométrie : ${k['biometrics']}', style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11)),
                              ],
                            ),
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Batterie : ${k['battery']}', style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11)),
                                const SizedBox(height: 4),
                                Text('Scan : ${k['qrScanner']}', style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const Spacer(),
                      const Divider(color: Color(0xFF1E293B), height: 1),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Passages enregistrés aujourd\'hui : ${k['passesToday']}', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 11.5, fontWeight: FontWeight.bold)),
                          Text('Synchro : ${k['lastSync']}', style: const TextStyle(color: Color(0xFF64748B), fontSize: 10.5)),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ] else if (_activeTab == 'schematic') ...[
            // RENDU 3D & ARCHITECTURE SCHÉMATIQUE
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'SCHÉMA D\'INGÉNIERIE & ARCHITECTURE PHYSIQUE DE LA BORNE SENTINELLE',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Conception matérielle par l\'équipe KERNEL FORGE · Châssis métallique antivandalisme, module de calcul Edge AI, écran tactile capacitif et capteurs biométriques haute précision.',
                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12.5),
                  ),
                  const SizedBox(height: 18),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(18),
                    child: Image.asset(
                      'assets/illustrations/sentinelle_hardware_schematic.png',
                      width: double.infinity,
                      height: 400,
                      fit: BoxFit.contain,
                    ),
                  ),
                ],
              ),
            ),
          ] else ...[
            // JOURNAL DE SÉCURITÉ EN DIRECT
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
                  const Text(
                    'JOURNAL DES ÉVÉNEMENTS & CONTRÔLE D\'ACCÈS CAMPUS',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  const SizedBox(height: 16),
                  ...List.generate(_securityLogs.length, (index) {
                    final log = _securityLogs[index];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: Row(
                        children: [
                          Text(
                            log['time'] as String,
                            style: const TextStyle(color: Color(0xFF67E8F9), fontWeight: FontWeight.bold, fontSize: 12, fontFamily: 'monospace'),
                          ),
                          const SizedBox(width: 14),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: (log['color'] as Color).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              log['type'] as String,
                              style: TextStyle(color: log['color'] as Color, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  log['user'] as String,
                                  style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600),
                                ),
                                Text(
                                  'Équipement : ${log['device']}',
                                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            log['status'] as String,
                            style: TextStyle(color: log['color'] as Color, fontSize: 11.5, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTabButton(String tabKey, String label, IconData icon) {
    final isSelected = _activeTab == tabKey;
    return InkWell(
      onTap: () => setState(() => _activeTab = tabKey),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0D9488) : Colors.white.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? const Color(0xFF2DD4BF) : Colors.white.withValues(alpha: 0.15),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: Colors.white, size: 16),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
