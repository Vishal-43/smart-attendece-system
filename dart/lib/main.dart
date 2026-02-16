import 'package:flutter/material.dart';


import 'screens/login/login.dart';
import 'screens/dashboard/dashboard_screen.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Smart Attendance',
      initialRoute: '/',
      routes: {
        '/': (context) {
          final screenHeight = MediaQuery.of(context).size.height;
          return Login(screenHeight: screenHeight,);
        },
        '/home': (context) => const DashboardScreen(),
        // '/attendance': (context) => const AttendanceScreen(),
        // '/records': (context) => const AttendanceRecordsScreen(),
        // '/qr_otp': (context) => const QrOtpScreen(),
      },
    );
  }
}

void main() => runApp(App());