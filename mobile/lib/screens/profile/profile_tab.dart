import 'package:flutter/material.dart';
import '../../widgets/logo.dart';
import '../../widgets/modern/modern_card.dart';

class ProfileTab extends StatelessWidget {
  final String? role;
  final Map<String, dynamic>? userData;
  final VoidCallback onLogout;

  const ProfileTab({
    super.key,
    this.role,
    this.userData,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colors = theme.colorScheme;
    final roleLabel = role == null
        ? 'User'
        : role![0].toUpperCase() + role!.substring(1);
    final userName =
        userData?['first_name'] != null && userData?['last_name'] != null
        ? '${userData!['first_name']} ${userData!['last_name']}'
        : userData?['username'] ?? roleLabel;
    final email = userData?['email'] ?? '';

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          margin: const EdgeInsets.only(top: 20),
          child: ModernCard(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [colors.primary, colors.primary.withValues(alpha: 0.8)],
            ),
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: colors.shadow.withValues(alpha: 0.2),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(12),
                  child: const Logo(size: 76),
                ),
                const SizedBox(height: 20),
                Text(
                  userName,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                if (email.isNotEmpty)
                  Text(
                    email,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: Colors.white.withValues(alpha: 0.9),
                    ),
                    textAlign: TextAlign.center,
                  ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(_getRoleIcon(role), color: Colors.white, size: 18),
                      const SizedBox(width: 8),
                      Text(
                        roleLabel.toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 32),
        _buildSectionHeader(context, 'Account Details', Icons.person),
        const SizedBox(height: 12),
        ModernCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              _buildInfoTile(
                context,
                icon: Icons.badge_outlined,
                title: 'Role',
                value: roleLabel,
                colors: colors,
              ),
              Divider(height: 1, color: colors.outline.withValues(alpha: 0.1)),
              _buildInfoTile(
                context,
                icon: Icons.email_outlined,
                title: 'Email',
                value: email.isNotEmpty ? email : 'Not set',
                colors: colors,
              ),
              if (userData?['phone'] != null) ...[
                Divider(
                  height: 1,
                  color: colors.outline.withValues(alpha: 0.1),
                ),
                _buildInfoTile(
                  context,
                  icon: Icons.phone_outlined,
                  title: 'Phone',
                  value: userData!['phone'] ?? 'Not set',
                  colors: colors,
                ),
              ],
              if (userData?['enrollment_no'] != null) ...[
                Divider(
                  height: 1,
                  color: colors.outline.withValues(alpha: 0.1),
                ),
                _buildInfoTile(
                  context,
                  icon: Icons.numbers,
                  title: 'Enrollment No',
                  value: userData!['enrollment_no'] ?? 'Not set',
                  colors: colors,
                ),
              ],
              if (userData?['division'] != null) ...[
                Divider(
                  height: 1,
                  color: colors.outline.withValues(alpha: 0.1),
                ),
                _buildInfoTile(
                  context,
                  icon: Icons.class_outlined,
                  title: 'Division',
                  value: userData!['division'] ?? 'Not set',
                  colors: colors,
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 32),
        _buildSectionHeader(context, 'About', Icons.info_outline),
        const SizedBox(height: 12),
        ModernCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              _buildInfoTile(
                context,
                icon: Icons.apps,
                title: 'App Version',
                value: '1.0.0',
                colors: colors,
              ),
              Divider(height: 1, color: colors.outline.withValues(alpha: 0.1)),
              _buildInfoTile(
                context,
                icon: Icons.code,
                title: 'Build',
                value: 'Release',
                colors: colors,
              ),
            ],
          ),
        ),
        const SizedBox(height: 40),
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: colors.error.withValues(alpha: 0.3),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Material(
            color: colors.error,
            borderRadius: BorderRadius.circular(16),
            child: InkWell(
              onTap: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    title: Row(
                      children: [
                        Icon(Icons.logout, color: colors.error),
                        const SizedBox(width: 12),
                        const Text('Logout'),
                      ],
                    ),
                    content: const Text(
                      'Are you sure you want to logout? You will need to sign in again to access your account.',
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cancel'),
                      ),
                      FilledButton(
                        onPressed: () {
                          Navigator.pop(context);
                          onLogout();
                        },
                        style: FilledButton.styleFrom(
                          backgroundColor: colors.error,
                        ),
                        child: const Text('Logout'),
                      ),
                    ],
                  ),
                );
              },
              borderRadius: BorderRadius.circular(16),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.logout, color: Colors.white),
                    const SizedBox(width: 12),
                    const Text(
                      'Logout',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 40),
      ],
    );
  }

  IconData _getRoleIcon(String? role) {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return Icons.admin_panel_settings;
      case 'TEACHER':
        return Icons.school;
      case 'STUDENT':
        return Icons.person;
      default:
        return Icons.person;
    }
  }

  Widget _buildSectionHeader(
    BuildContext context,
    String title,
    IconData icon,
  ) {
    final theme = Theme.of(context);
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [theme.colorScheme.primary, theme.colorScheme.secondary],
            ),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: Colors.white, size: 18),
        ),
        const SizedBox(width: 12),
        Text(
          title,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.primary,
          ),
        ),
      ],
    );
  }

  Widget _buildInfoTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String value,
    required ColorScheme colors,
  }) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: theme.colorScheme.primaryContainer.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: theme.colorScheme.primary, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(color: colors.outline, fontSize: 12),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
