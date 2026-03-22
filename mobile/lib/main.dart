import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'features/attendance/attendance_history_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/login/login.dart';
import 'screens/qr_otp/qr_otp_screen.dart';
import 'screens/qr_otp/teacher_qr_otp_management_screen.dart';
import 'screens/admin/user_management_screen.dart';
import 'screens/admin/access_point_management_screen.dart';
import 'screens/admin/location_management_screen.dart';
import 'services/auth_service.dart';

class App extends StatefulWidget {
  const App({super.key});

  @override
  State<App> createState() => _AppState();
}

class _AppState extends State<App> {
  bool _isLoading = true;
  bool _isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _checkSession();
  }

  Future<void> _checkSession() async {
    final authService = AuthService();
    final isLoggedIn = await authService.isLoggedIn();

    if (mounted) {
      setState(() {
        _isLoggedIn = isLoggedIn;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Smart Attendance',
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: ThemeMode.system,
      initialRoute: _isLoading ? '/splash' : (_isLoggedIn ? '/home' : '/'),
      routes: {
        '/splash': (context) => const _SplashScreen(),
        '/': (context) {
          final screenHeight = MediaQuery.of(context).size.height;
          return Login(screenHeight: screenHeight);
        },
        '/home': (context) => const HomeScreen(),
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
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.school,
              size: 80,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 24),
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}

void main() => runApp(const App());
