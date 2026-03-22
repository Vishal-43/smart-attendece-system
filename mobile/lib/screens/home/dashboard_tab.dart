import 'package:flutter/material.dart';
import '../../widgets/modern/stat_card.dart';
import '../../widgets/modern/modern_card.dart';

class DashboardTab extends StatelessWidget {
  final String? role;
  final Map<String, dynamic>? userData;

  const DashboardTab({super.key, this.role, this.userData});

  bool _isStudent() => role?.toUpperCase() == 'STUDENT';
  bool _isAdmin() => role?.toUpperCase() == 'ADMIN';
  bool _isTeacher() => role?.toUpperCase() == 'TEACHER';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final normalizedRole = role?.toUpperCase() ?? '';
    final roleLabel = role == null
        ? 'User'
        : normalizedRole[0] + normalizedRole.substring(1).toLowerCase();
    final userName =
        userData?['first_name'] ?? userData?['username'] ?? roleLabel;
    final now = DateTime.now();
    final greeting = _getGreeting(now.hour);

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 20),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  greeting,
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  userName,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 20),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  theme.colorScheme.primary,
                  theme.colorScheme.primary.withValues(alpha: 0.8),
                ],
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: theme.colorScheme.primary.withValues(alpha: 0.3),
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
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          roleLabel.toUpperCase(),
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Welcome Back!',
                        style: theme.textTheme.titleLarge?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _getWelcomeMessage(),
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: Colors.white.withValues(alpha: 0.9),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(_getRoleIcon(), color: Colors.white, size: 40),
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),
          if (_isStudent()) ...[
            _buildSectionHeader(context, 'Quick Actions', Icons.flash_on),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Expanded(
                    child: ModernActionCard(
                      title: 'Mark Attendance',
                      subtitle: 'Scan or enter OTP',
                      icon: Icons.qr_code_scanner,
                      color: theme.colorScheme.primary,
                      onTap: () => Navigator.pushNamed(context, '/attendance'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ModernActionCard(
                      title: 'View Records',
                      subtitle: 'Check history',
                      icon: Icons.history,
                      color: theme.colorScheme.secondary,
                      onTap: () {},
                    ),
                  ),
                ],
              ),
            ),
          ],
          if (_isAdmin() || _isTeacher()) ...[
            _buildSectionHeader(
              context,
              'Management',
              Icons.admin_panel_settings,
            ),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: _buildActionTile(
                          context,
                          'QR & OTP',
                          'Generate codes',
                          Icons.qr_code,
                          theme.colorScheme.primary,
                          () => Navigator.pushNamed(
                            context,
                            '/session-management',
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildActionTile(
                          context,
                          'Users',
                          'Manage accounts',
                          Icons.people,
                          Colors.green,
                          () => Navigator.pushNamed(context, '/users'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _buildActionTile(
                          context,
                          'Access Points',
                          'WiFi management',
                          Icons.wifi,
                          Colors.purple,
                          () => Navigator.pushNamed(context, '/access-points'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildActionTile(
                          context,
                          'Locations',
                          'Campus venues',
                          Icons.location_on,
                          Colors.orange,
                          () => Navigator.pushNamed(context, '/locations'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
          _buildSectionHeader(
            context,
            'Today\'s Overview',
            Icons.calendar_today,
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: StatCard(
                        title: 'Present',
                        value: '0',
                        icon: Icons.check_circle,
                        color: Colors.green,
                        subtitle: 'On time',
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: StatCard(
                        title: 'Absent',
                        value: '0',
                        icon: Icons.cancel,
                        color: Colors.red,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: StatCard(
                        title: 'Late',
                        value: '0',
                        icon: Icons.access_time,
                        color: Colors.orange,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: StatCard(
                        title: 'Classes',
                        value: '0',
                        icon: Icons.school,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(
    BuildContext context,
    String title,
    IconData icon,
  ) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          Icon(icon, size: 20, color: theme.colorScheme.primary),
          const SizedBox(width: 8),
          Text(
            title,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionTile(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return ModernCard(
      onTap: onTap,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: Theme.of(
              context,
            ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Theme.of(context).colorScheme.outline,
            ),
          ),
        ],
      ),
    );
  }

  String _getGreeting(int hour) {
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  String _getWelcomeMessage() {
    if (_isStudent()) {
      return 'Track your attendance and stay updated';
    } else if (_isTeacher()) {
      return 'Manage your classes and track attendance';
    } else if (_isAdmin()) {
      return 'System overview and management tools';
    }
    return 'Welcome to Smart Attendance';
  }

  IconData _getRoleIcon() {
    if (_isStudent()) return Icons.school;
    if (_isTeacher()) return Icons.person;
    if (_isAdmin()) return Icons.admin_panel_settings;
    return Icons.person;
  }
}

class ModernActionCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const ModernActionCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      height: 140,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [color, color.withValues(alpha: 0.8)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: Colors.white, size: 24),
                ),
                const Spacer(),
                Text(
                  title,
                  style: theme.textTheme.titleSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: Colors.white.withValues(alpha: 0.8),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
