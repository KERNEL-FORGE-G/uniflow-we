import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

class AttendanceScreen extends StatefulWidget {
  final String userName;
  final String userEmail;

  const AttendanceScreen({
    super.key,
    this.userName = '',
    this.userEmail = '',
  });

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  int _qrTimestamp = DateTime.now().millisecondsSinceEpoch;

  final List<Map<String, dynamic>> _attendanceHistory = [
    {
      'date': 'Aujourd’hui, 18 Octobre',
      'time': '08:00 - 10:00',
      'courseCode': 'INF4018',
      'courseName': 'Compilation & Théorie des Langages',
      'room': 'Amphi 501',
      'teacher': 'Pr. Alain Mbarga',
      'status': 'Présent',
      'signedAt': '08:04:12',
    },
    {
      'date': 'Vendredi, 16 Octobre',
      'time': '10:15 - 12:15',
      'courseCode': 'ICT401',
      'courseName': 'Intelligence Artificielle & Deep Learning',
      'room': 'Labo C204',
      'teacher': 'Dr. Christian Fouda',
      'status': 'Présent',
      'signedAt': '10:18:45',
    },
    {
      'date': 'Jeudi, 15 Octobre',
      'time': '14:00 - 16:00',
      'courseCode': 'SIGL403',
      'courseName': 'Sécurité Logicielle & Cryptographie',
      'room': 'Salle R102',
      'teacher': 'Pr. Emmanuel Ndoundam',
      'status': 'Présent',
      'signedAt': '14:02:30',
    },
    {
      'date': 'Mardi, 13 Octobre',
      'time': '08:00 - 10:00',
      'courseCode': 'INF4022',
      'courseName': 'Systèmes de Données Massives & NoSQL',
      'room': 'Amphi 250',
      'teacher': 'Dr. Jean-Pierre Kouam',
      'status': 'Justifié',
      'signedAt': 'Régularisé par certificat',
    },
  ];

  void _refreshQr() {
    setState(() {
      _qrTimestamp = DateTime.now().millisecondsSinceEpoch;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Nouveau jeton cryptographique généré pour l’émargement en cours.'),
        backgroundColor: Color(0xFF0D9488),
      ),
    );
  }

  void _uploadJustificatif() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.description_rounded, color: Color(0xFF1E3A8A)),
            SizedBox(width: 10),
            Text('Déposer un justificatif d’absence'),
          ],
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Sélectionnez la séance concernée et joignez le certificat médical ou la convocation officielle (PDF).', style: TextStyle(fontSize: 13)),
            SizedBox(height: 16),
            TextField(
              decoration: InputDecoration(
                labelText: 'Motif de l’absence',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Justificatif transmis à l’administration de la Faculté des Sciences.'),
                  backgroundColor: Color(0xFF0D9488),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1E3A8A),
              foregroundColor: Colors.white,
            ),
            child: const Text('Envoyer le justificatif'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final qrData = 'UNIFLOW_UY1_PRESENCE:ETUDIANT_21T2401:TS_$_qrTimestamp:SIG_ED25519_OK';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Padding(
        padding: const EdgeInsets.all(28.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // =================================================================
            // HERO BENTO SECTION - ÉMARGEMENT & PRÉSENCES
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
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.qr_code_2_rounded, size: 14, color: Color(0xFF67E8F9)),
                              SizedBox(width: 6),
                              Text(
                                'BADGE NUMÉRIQUE CERTIFIÉ · ÉMARGEMENT SÉCURISÉ',
                                style: TextStyle(
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
                        const Text(
                          'Émargement & Assiduité de Cours',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Présentez votre QR code cryptographique à l’entrée de l’amphi ou scannez la borne Sentinelle IoT pour valider votre présence.',
                          style: TextStyle(
                            color: Color(0xFFE2E8F0),
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 20),
                  Image.asset(
                    'assets/icons/nav/attendance.png',
                    width: 76,
                    height: 76,
                    errorBuilder: (_, __, ___) => const Icon(Icons.qr_code_scanner_rounded, size: 70, color: Colors.white70),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Contenu Split-Screen : QR Code à gauche + Historique à droite
            Expanded(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // COLONNE GAUCHE : CARTE BENTO DU BADGE QR CODE
                  Container(
                    width: 320,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 14,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.check_circle_rounded, size: 14, color: Color(0xFF047857)),
                              SizedBox(width: 6),
                              Flexible(
                                child: Text(
                                  'Assiduité globale : 96.4%',
                                  style: TextStyle(color: Color(0xFF047857), fontWeight: FontWeight.bold, fontSize: 11.5),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 18),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: QrImageView(
                            data: qrData,
                            version: QrVersions.auto,
                            size: 190,
                            backgroundColor: Colors.transparent,
                            eyeStyle: const QrEyeStyle(
                              eyeShape: QrEyeShape.square,
                              color: Color(0xFF1E3A8A),
                            ),
                            dataModuleStyle: const QrDataModuleStyle(
                              dataModuleShape: QrDataModuleShape.circle,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          widget.userName.isNotEmpty
                              ? '${widget.userName} · Session Certifiée'
                              : 'Étudiant UniFlow · Session Sécurisée',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)),
                        ),
                        Text(
                          widget.userEmail.isNotEmpty
                              ? widget.userEmail
                              : 'Master 1 ICT4D · Univ. Yaoundé I',
                          style: const TextStyle(color: Color(0xFF64748B), fontSize: 11.5),
                        ),
                        const SizedBox(height: 18),
                        OutlinedButton.icon(
                          onPressed: _refreshQr,
                          icon: const Icon(Icons.refresh_rounded, size: 16),
                          label: const Text('Régénérer le jeton QR', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF1E3A8A),
                            side: const BorderSide(color: Color(0xFFCBD5E1)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            minimumSize: const Size(double.infinity, 42),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(width: 24),

                  // COLONNE DROITE : HISTORIQUE DES ÉMARGEMENTS
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
                                    'Historique Récent des Présences',
                                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                                  ),
                                  Text(
                                    'Séances émargées avec certificat horodaté',
                                    style: TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                                  ),
                                ],
                              ),
                              ElevatedButton.icon(
                                onPressed: _uploadJustificatif,
                                icon: const Icon(Icons.note_add_rounded, size: 16),
                                label: const Text('Déposer un justificatif', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF1E3A8A),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 18),
                          Expanded(
                            child: ListView.separated(
                              itemCount: _attendanceHistory.length,
                              separatorBuilder: (_, __) => const Divider(color: Color(0xFFF1F5F9), height: 16),
                              itemBuilder: (context, idx) {
                                final item = _attendanceHistory[idx];
                                final isPresent = item['status'] == 'Présent';

                                return Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: (isPresent ? const Color(0xFF10B981) : const Color(0xFFF59E0B)).withValues(alpha: 0.12),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Icon(
                                        isPresent ? Icons.check_circle_rounded : Icons.info_outline_rounded,
                                        color: isPresent ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                                        size: 20,
                                      ),
                                    ),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            '${item['courseCode']} · ${item['courseName']}',
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, color: Color(0xFF0F172A)),
                                          ),
                                          const SizedBox(height: 3),
                                          Text(
                                            '${item['date']} (${item['time']}) · Salle : ${item['room']} · Enseignant : ${item['teacher']}',
                                            style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: (isPresent ? const Color(0xFFECFDF5) : const Color(0xFFFEF3C7)),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: Text(
                                            item['status'],
                                            style: TextStyle(
                                              color: isPresent ? const Color(0xFF047857) : const Color(0xFFB45309),
                                              fontWeight: FontWeight.bold,
                                              fontSize: 11,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(height: 3),
                                        Text(
                                          item['signedAt'],
                                          style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                                        ),
                                      ],
                                    ),
                                  ],
                                );
                              },
                            ),
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
}
