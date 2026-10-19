import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/onboarding_screen.dart';
import 'screens/auth_screen.dart';
import 'screens/desktop_shell.dart';
import 'services/local_visio_server.dart';

enum AppFlowState {
  onboarding,
  auth,
  shell,
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Démarrage initial du service de visioconférence local embarqué
  try {
    await LocalVisioServer.instance.startServer();
  } catch (e) {
    debugPrint('Erreur démarrage serveur visio local: $e');
  }

  runApp(const UniFlowDesktopApp());
}

class UniFlowDesktopApp extends StatefulWidget {
  final AppFlowState initialState;

  const UniFlowDesktopApp({
    super.key,
    this.initialState = AppFlowState.auth,
  });

  @override
  State<UniFlowDesktopApp> createState() => _UniFlowDesktopAppState();
}

class _UniFlowDesktopAppState extends State<UniFlowDesktopApp> {
  late AppFlowState _flowState;

  String _userName = '';
  String _userEmail = '';
  String _userRole = 'Étudiant';

  @override
  void initState() {
    super.initState();
    _flowState = widget.initialState;
  }

  void _onFinishOnboarding() {
    setState(() {
      _flowState = AppFlowState.auth;
    });
  }

  void _onLoginSuccess(String email, String role, String name) {
    setState(() {
      _userEmail = email;
      _userRole = role;
      _userName = name;
      _flowState = AppFlowState.shell;
    });
  }

  void _onLogout() {
    setState(() {
      _flowState = AppFlowState.auth;
    });
  }

  void _onShowOnboarding() {
    setState(() {
      _flowState = AppFlowState.onboarding;
    });
  }

  @override
  Widget build(BuildContext context) {
    Widget activeScreen;
    switch (_flowState) {
      case AppFlowState.onboarding:
        activeScreen = OnboardingScreen(
          onFinish: _onFinishOnboarding,
        );
        break;
      case AppFlowState.auth:
        activeScreen = AuthScreen(
          onLoginSuccess: _onLoginSuccess,
          onBackToOnboarding: _onShowOnboarding,
        );
        break;
      case AppFlowState.shell:
        activeScreen = DesktopShell(
          userName: _userName,
          userEmail: _userEmail,
          userRole: _userRole,
          onLogout: _onLogout,
          onShowOnboarding: _onShowOnboarding,
        );
        break;
    }

    return MaterialApp(
      title: 'UniFlow Desktop · KERNEL FORGE',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1E3A8A),
          primary: const Color(0xFF1E3A8A),
          secondary: const Color(0xFF0D9488),
          surface: Colors.white,
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(
          Theme.of(context).textTheme,
        ),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
      ),
      home: activeScreen,
    );
  }
}
