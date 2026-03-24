import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'features/attendance/attendance_history_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/login/login_screen.dart';
import 'screens/qr_otp/qr_otp_screen.dart';
import 'screens/qr_otp/teacher_qr_otp_management_screen.dart';
import 'screens/admin/user_management_screen.dart';
import 'screens/admin/access_point_management_screen.dart';
import 'screens/admin/location_management_screen.dart';
import 'services/auth_service.dart';
import 'services/settings_service.dart';

class App extends StatefulWidget {
  const App({super.key});

  @override
  State<App> createState() => _AppState();
}

class _AppState extends State<App> {
  bool _isLoggedIn = false;
  bool _isInitialized = false;
  bool _darkMode = false;
  final _settingsService = SettingsService();

  @override
  void initState() {
    super.initState();
    _initializeApp();
    _loadSettings();
  }

  Future<void> _initializeApp() async {
    try {
      final authService = AuthService();
      final isLoggedIn = await authService.isLoggedIn();
      if (mounted) {
        setState(() {
          _isLoggedIn = isLoggedIn;
          _isInitialized = true;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoggedIn = false;
          _isInitialized = true;
        });
      }
    }
  }

  Future<void> _loadSettings() async {
    final darkMode = await _settingsService.getDarkMode();
    if (mounted) {
      setState(() {
        _darkMode = darkMode;
      });
    }
  }

  void _toggleDarkMode(bool value) {
    setState(() {
      _darkMode = value;
    });
    _settingsService.setDarkMode(value);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Smart Attendance',
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: _darkMode ? ThemeMode.dark : ThemeMode.light,
      home: _buildHome(),
      routes: {
        '/login': (context) => const LoginScreen(),
        '/home': (context) =>
            HomeScreen(onDarkModeToggle: _toggleDarkMode, darkMode: _darkMode),
        '/qr-otp': (context) => const QrOtpScreen(),
        '/session-management': (context) =>
            const TeacherQrOtpManagementScreen(),
        '/users': (context) => const UserManagementScreen(),
        '/access-points': (context) => const AccessPointManagementScreen(),
        '/locations': (context) => const LocationManagementScreen(),
        '/attendance-history': (context) {
          final args = ModalRoute.of(context)?.settings.arguments;
          final userId = (args is Map<String, dynamic>)
              ? args['userId'] as int? ?? 0
              : 0;
          return AttendanceHistoryScreen(userId: userId);
        },
      },
    );
  }

  Widget _buildHome() {
    if (!_isInitialized) {
      return const SplashScreen();
    }

    if (_isLoggedIn) {
      return HomeScreen(onDarkModeToggle: _toggleDarkMode, darkMode: _darkMode);
    }

    return const LoginScreen();
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));

    _scaleAnimation = Tween<double>(
      begin: 0.8,
      end: 1.0,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutBack));

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [theme.colorScheme.primary, theme.colorScheme.secondary],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                return Opacity(
                  opacity: _fadeAnimation.value,
                  child: Transform.scale(
                    scale: _scaleAnimation.value,
                    child: child,
                  ),
                );
              },
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.2),
                          blurRadius: 30,
                          offset: const Offset(0, 15),
                        ),
                      ],
                    ),
                    child: Icon(
                      Icons.school_rounded,
                      size: 50,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Smart Attendance',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Attendance made simple',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white.withValues(alpha: 0.8),
                      letterSpacing: 0.3,
                    ),
                  ),
                  const SizedBox(height: 48),
                  SizedBox(
                    width: 40,
                    height: 40,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Colors.white.withValues(alpha: 0.9),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

void main() => runApp(const App());
