import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../services/user_service.dart';
import '../admin/user_management_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  String? _role;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchRole();
  }

  Future<void> _fetchRole() async {
    final userService = UserService();
    final role = await userService.fetchUserRole();
    setState(() {
      _role = role;
      _loading = false;
    });
  }

  Future<void> _logout(BuildContext context) async {
    final navigator = Navigator.of(context);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    navigator.pushReplacementNamed('/');
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    Widget dashboardContent;
    if (_role == 'admin') {
      dashboardContent = Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('Welcome, Admin!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            icon: const Icon(Icons.qr_code),
            label: const Text('Manage QR Codes'),
            onPressed: () {
              // Navigation to QR code management pending implementation
            },
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            icon: const Icon(Icons.password),
            label: const Text('Manage OTPs'),
            onPressed: () {
              // Navigation to OTP management pending implementation
            },
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            icon: const Icon(Icons.people),
            label: const Text('User Management'),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => const UserManagementScreen(),
                ),
              );
            },
          ),
        ],
      );
    } else if (_role == 'teacher') {
      dashboardContent = Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('Welcome, Teacher!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            icon: const Icon(Icons.qr_code_scanner),
            label: const Text('Mark Attendance (QR/OTP)'),
            onPressed: () {
              // Navigation to attendance screen pending implementation
            },
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            icon: const Icon(Icons.history),
            label: const Text('View Attendance Records'),
            onPressed: () {
              // Navigation to attendance records screen pending implementation
            },
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            icon: const Icon(Icons.qr_code),
            label: const Text('Generate/Verify QR Code'),
            onPressed: () {
              // Navigation to QR code screen pending implementation
            },
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            icon: const Icon(Icons.password),
            label: const Text('Generate/Verify OTP'),
            onPressed: () {
              // Navigation to OTP screen pending implementation
            },
          ),
        ],
      );
    } else if (_role == 'student') {
      dashboardContent = Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('Welcome, Student!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            icon: const Icon(Icons.qr_code_scanner),
            label: const Text('Mark Attendance (QR/OTP)'),
            onPressed: () {
              // Navigation to attendance screen pending implementation
            },
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            icon: const Icon(Icons.history),
            label: const Text('View Attendance Records'),
            onPressed: () {
              // Navigation to attendance records screen pending implementation
            },
          ),
        ],
      );
    } else {
      dashboardContent = const Center(child: Text('Unknown role'));
    }
    return Scaffold(
      appBar: AppBar(
        title: const Text('Smart Attendance Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => _logout(context),
            tooltip: 'Logout',
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: dashboardContent,
      ),
    );
  }
}
