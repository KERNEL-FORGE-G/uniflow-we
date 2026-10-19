import 'package:flutter/material.dart';

class AuthScreen extends StatefulWidget {
  final Function(String email, String role, String name) onLoginSuccess;
  final VoidCallback onBackToOnboarding;

  const AuthScreen({
    super.key,
    required this.onLoginSuccess,
    required this.onBackToOnboarding,
  });

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool _isLoginMode = true; // true = Login, false = Register / Sign-up
  bool _obscurePassword = true;
  bool _rememberMe = true;
  bool _isLoading = false;

  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();

  String _selectedRole = 'Étudiant';
  final List<String> _roles = [
    'Étudiant',
    'Délégué de Promotion',
    'Enseignant / Chercheur',
    'Membre Fondateur KERNEL FORGE',
  ];

  @override
  void initState() {
    super.initState();
    // Start with clean, empty input fields for security and privacy
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _submit() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final name = _nameController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez remplir l’e-mail et le mot de passe.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    if (!_isLoginMode && name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez renseigner votre nom complet.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 600));

    if (mounted) {
      setState(() => _isLoading = false);
      final derivedName = name.isNotEmpty
          ? name
          : (email.split('@').first.replaceAll(RegExp(r'[._-]'), ' ').split(' ').map((w) => w.isNotEmpty ? '${w[0].toUpperCase()}${w.substring(1)}' : '').join(' ').trim());
      widget.onLoginSuccess(
        email,
        _selectedRole,
        derivedName.isNotEmpty ? derivedName : 'Utilisateur',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Row(
        children: [
          // ===================================================================
          // COLONNE GAUCHE : VITRINE BENTO DESKTOP & BRANDING KERNEL FORGE
          // ===================================================================
          Expanded(
            flex: 6,
            child: Container(
              padding: const EdgeInsets.all(48.0),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Color(0xFF0B132B),
                    Color(0xFF1E3A8A),
                    Color(0xFF0D9488),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Logo & Header
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.2),
                              blurRadius: 12,
                            ),
                          ],
                        ),
                        child: Image.asset(
                          'assets/brand/uniflow_logo_final.png',
                          width: 38,
                          height: 38,
                          fit: BoxFit.contain,
                        ),
                      ),
                      const SizedBox(width: 14),
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'UniFlow Desktop',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                              fontSize: 22,
                              letterSpacing: -0.5,
                            ),
                          ),
                          Text(
                            'Suite Académique & Réseau Universitaire',
                            style: TextStyle(
                              color: Color(0xFF67E8F9),
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  // Showcase Mascotte & Piliers Bento
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Badge Pill
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.workspace_premium_rounded, size: 16, color: Color(0xFFFACC15)),
                            SizedBox(width: 6),
                            Text(
                              'ENVIRONNEMENT D’ÉTUDES OFFICIEL UY1',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 10.5,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 20),

                      const Text(
                        'Votre espace de travail\nacadémique sans limites.',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 38,
                          fontWeight: FontWeight.w900,
                          height: 1.15,
                          letterSpacing: -0.5,
                        ),
                      ),

                      const SizedBox(height: 14),

                      const Text(
                        'Rejoignez la communauté étudiante et professorale d’UniFlow. Emplois du temps synchronisés, bibliothèque Z-Library VPS illimitée et visioconférence locale P2P.',
                        style: TextStyle(
                          color: Color(0xFFE2E8F0),
                          fontSize: 14.5,
                          height: 1.55,
                        ),
                      ),

                      const SizedBox(height: 32),

                      // Cartes Bento des 4 piliers technologiques
                      Row(
                        children: [
                          Expanded(
                            child: _buildBentoFeatureCard(
                              icon: Icons.menu_book_rounded,
                              iconColor: const Color(0xFF38BDF8),
                              title: 'Z-Library VPS',
                              subtitle: 'Streaming direct sans quota',
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildBentoFeatureCard(
                              icon: Icons.video_camera_front_rounded,
                              iconColor: const Color(0xFF34D399),
                              title: 'Visio P2P Local',
                              subtitle: 'Serveur intégré Port 7880',
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _buildBentoFeatureCard(
                              icon: Icons.qr_code_scanner_rounded,
                              iconColor: const Color(0xFFA78BFA),
                              title: 'Présence QR',
                              subtitle: 'Émargement certifié',
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildBentoFeatureCard(
                              icon: Icons.mail_rounded,
                              iconColor: const Color(0xFFFBBF24),
                              title: 'UniMail (@uniflow.cm)',
                              subtitle: 'Messagerie académique',
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  // Footer KERNEL FORGE & Lien Revoir Onboarding
                  Wrap(
                    spacing: 12,
                    runSpacing: 6,
                    alignment: WrapAlignment.spaceBetween,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      const Text(
                        '© 2026 KERNEL FORGE · Université de Yaoundé I',
                        style: TextStyle(
                          color: Colors.white60,
                          fontSize: 11.5,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      TextButton.icon(
                        onPressed: widget.onBackToOnboarding,
                        icon: const Icon(Icons.info_outline_rounded, size: 16, color: Colors.white70),
                        label: const Text(
                          'Revoir l’onboarding',
                          style: TextStyle(color: Colors.white70, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // ===================================================================
          // COLONNE DROITE : FORMULAIRE INTERACTIF (LOGIN / REGISTER)
          // ===================================================================
          Expanded(
            flex: 5,
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 56.0, vertical: 48.0),
              child: Center(
                child: SingleChildScrollView(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 440),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Onglets de sélection Mode : Connexion / Inscription
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: InkWell(
                                  onTap: () => setState(() => _isLoginMode = true),
                                  borderRadius: BorderRadius.circular(12),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 11),
                                    decoration: BoxDecoration(
                                      color: _isLoginMode ? Colors.white : Colors.transparent,
                                      borderRadius: BorderRadius.circular(12),
                                      boxShadow: _isLoginMode
                                          ? [
                                              BoxShadow(
                                                color: Colors.black.withValues(alpha: 0.05),
                                                blurRadius: 8,
                                                offset: const Offset(0, 2),
                                              ),
                                            ]
                                          : null,
                                    ),
                                    child: Center(
                                      child: Text(
                                        'Se connecter',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13.5,
                                          color: _isLoginMode
                                              ? const Color(0xFF1E3A8A)
                                              : const Color(0xFF64748B),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              Expanded(
                                child: InkWell(
                                  onTap: () => setState(() => _isLoginMode = false),
                                  borderRadius: BorderRadius.circular(12),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 11),
                                    decoration: BoxDecoration(
                                      color: !_isLoginMode ? Colors.white : Colors.transparent,
                                      borderRadius: BorderRadius.circular(12),
                                      boxShadow: !_isLoginMode
                                          ? [
                                              BoxShadow(
                                                color: Colors.black.withValues(alpha: 0.05),
                                                blurRadius: 8,
                                                offset: const Offset(0, 2),
                                              ),
                                            ]
                                          : null,
                                    ),
                                    child: Center(
                                      child: Text(
                                        'Créer un compte',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13.5,
                                          color: !_isLoginMode
                                              ? const Color(0xFF1E3A8A)
                                              : const Color(0xFF64748B),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 32),

                        // Titre & Sous-titre du Formulaire
                        Text(
                          _isLoginMode
                              ? 'Bon retour parmi nous !'
                              : 'Rejoindre UniFlow Desktop',
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF0F172A),
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _isLoginMode
                              ? 'Connectez-vous pour accéder à vos cours, emplois du temps et bibliothèque.'
                              : 'Créez votre identifiant académique certifié pour démarrer vos études.',
                          style: const TextStyle(
                            fontSize: 13,
                            color: Color(0xFF64748B),
                            height: 1.45,
                          ),
                        ),

                        const SizedBox(height: 28),

                        // Champ Nom (si inscription)
                        if (!_isLoginMode) ...[
                          const Text(
                            'Nom complet',
                            style: TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF334155),
                            ),
                          ),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _nameController,
                            decoration: _inputDecoration(
                              hint: 'Ex: Votre Nom Complet',
                              icon: Icons.person_outline_rounded,
                            ),
                          ),
                          const SizedBox(height: 18),
                        ],

                        // Champ Profil / Rôle
                        const Text(
                          'Profil académique',
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF334155),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: _selectedRole,
                              isExpanded: true,
                              icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Color(0xFF64748B)),
                              items: _roles.map((r) {
                                return DropdownMenuItem<String>(
                                  value: r,
                                  child: Text(
                                    r,
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: r.contains('KERNEL FORGE') ? FontWeight.bold : FontWeight.w500,
                                      color: r.contains('KERNEL FORGE') ? const Color(0xFF0D9488) : const Color(0xFF1E293B),
                                    ),
                                  ),
                                );
                              }).toList(),
                              onChanged: (val) {
                                if (val != null) setState(() => _selectedRole = val);
                              },
                            ),
                          ),
                        ),

                        const SizedBox(height: 18),

                        // Champ Email académique
                        const Text(
                          'Adresse e-mail académique',
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF334155),
                          ),
                        ),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          decoration: _inputDecoration(
                            hint: 'votre.email@uniflow.cm ou université',
                            icon: Icons.alternate_email_rounded,
                          ),
                        ),

                        const SizedBox(height: 18),

                        // Champ Mot de passe
                        const Text(
                          'Mot de passe',
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF334155),
                          ),
                        ),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          decoration: _inputDecoration(
                            hint: '••••••••',
                            icon: Icons.lock_outline_rounded,
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                                color: const Color(0xFF94A3B8),
                                size: 20,
                              ),
                              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                            ),
                          ),
                        ),

                        // Champ Confirmation Mot de passe (si inscription)
                        if (!_isLoginMode) ...[
                          const SizedBox(height: 18),
                          const Text(
                            'Confirmer le mot de passe',
                            style: TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF334155),
                            ),
                          ),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _confirmPasswordController,
                            obscureText: _obscurePassword,
                            decoration: _inputDecoration(
                              hint: '••••••••',
                              icon: Icons.lock_reset_rounded,
                            ),
                          ),
                        ],

                        const SizedBox(height: 14),

                        // Se souvenir de moi & Mot de passe oublié
                        Wrap(
                          spacing: 12,
                          runSpacing: 4,
                          alignment: WrapAlignment.spaceBetween,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: Checkbox(
                                    value: _rememberMe,
                                    onChanged: (v) => setState(() => _rememberMe = v ?? true),
                                    activeColor: const Color(0xFF1E3A8A),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                const Text(
                                  'Mémoriser la session',
                                  style: TextStyle(fontSize: 12.5, color: Color(0xFF475569)),
                                ),
                              ],
                            ),
                            if (_isLoginMode)
                              TextButton(
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Réinitialisation envoyée à votre adresse de secours.'),
                                      backgroundColor: Color(0xFF1E3A8A),
                                    ),
                                  );
                                },
                                style: TextButton.styleFrom(padding: EdgeInsets.zero),
                                child: const Text(
                                  'Mot de passe oublié ?',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFF2563EB),
                                  ),
                                ),
                              ),
                          ],
                        ),

                        const SizedBox(height: 26),

                        // Bouton Principal de Soumission
                        SizedBox(
                          width: double.infinity,
                          height: 48,
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _submit,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF1E3A8A),
                              foregroundColor: Colors.white,
                              elevation: 4,
                              shadowColor: const Color(0xFF1E3A8A).withValues(alpha: 0.35),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                            child: _isLoading
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                  )
                                : Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        _isLoginMode ? 'Connexion sécurisée' : 'Créer mon compte',
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                      ),
                                      const SizedBox(width: 8),
                                      const Icon(Icons.arrow_forward_rounded, size: 18),
                                    ],
                                  ),
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Note de Sécurité et Confidentialité
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.shield_outlined, size: 20, color: Color(0xFF0D9488)),
                              SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  'Connexion chiffrée de bout en bout · Données académiques et présences certifiées par l’Université.',
                                  style: TextStyle(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFF64748B),
                                    height: 1.35,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  InputDecoration _inputDecoration({
    required String hint,
    required IconData icon,
    Widget? suffixIcon,
  }) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
      prefixIcon: Icon(icon, color: const Color(0xFF64748B), size: 19),
      suffixIcon: suffixIcon,
      filled: true,
      fillColor: const Color(0xFFF8FAFC),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFF1E3A8A), width: 1.5),
      ),
    );
  }

  Widget _buildBentoFeatureCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 20, color: iconColor),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  subtitle,
                  style: const TextStyle(color: Color(0xFFBAE6FD), fontSize: 10),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
