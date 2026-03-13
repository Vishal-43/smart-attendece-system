import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../services/user_service.dart';

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
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final ColorScheme colors = Theme.of(context).colorScheme;
    final TextTheme textTheme = Theme.of(context).textTheme;
    final roleLabel = _role == null
        ? 'User'
        : _role![0].toUpperCase() + _role!.substring(1);

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
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Card(
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: colors.primary,
                child: Icon(Icons.person, color: colors.onPrimary),
              ),
              title: Text('Welcome, $roleLabel', style: textTheme.titleLarge),
              subtitle: Text(
                'Use the bottom navigation to access core features.',
              ),
            ),
          ),
          const SizedBox(height: 14),
          Card(
            child: ListTile(
              leading: const Icon(Icons.schedule),
              title: const Text('Today\'s schedule'),
              subtitle: const Text(
                'Check your classes and sessions for today.',
              ),
              onTap: () => Navigator.pushNamed(context, '/schedule'),
            ),
          ),
          const SizedBox(height: 10),
          Card(
            child: ListTile(
              leading: const Icon(Icons.notifications_none),
              title: const Text('Notifications'),
              subtitle: const Text('Review unread activity updates.'),
              onTap: () => Navigator.pushNamed(context, '/notifications'),
            ),
          ),
        ],
      ),
    );
  }
}
