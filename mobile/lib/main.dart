import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'features/attendance/attendance_history_screen.dart';
import 'screens/dashboard/dashboard_screen.dart';
import 'screens/login/login.dart';
import 'screens/qr_otp/qr_otp_screen.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Smart Attendance',
      theme: AppTheme.light(),
      initialRoute: '/',
      routes: {
        '/': (context) {
          final screenHeight = MediaQuery.of(context).size.height;
          return Login(screenHeight: screenHeight);
        },
        '/home': (context) => const DashboardScreen(),
        '/qr-otp': (context) => const QrOtpScreen(),
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

void main() => runApp(const App());
