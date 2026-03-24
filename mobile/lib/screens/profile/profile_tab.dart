import 'package:flutter/material.dart';
import '../../services/settings_service.dart';

class ProfileTab extends StatefulWidget {
  final String? role;
  final Map<String, dynamic>? userData;
  final VoidCallback onLogout;
  final Function(bool)? onDarkModeToggle;
  final bool darkMode;

  const ProfileTab({
    super.key,
    this.role,
    this.userData,
    required this.onLogout,
    this.onDarkModeToggle,
    this.darkMode = false,
  });

  @override
  State<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<ProfileTab> {
  late bool _darkMode;
  late bool _notifications;
  final _settingsService = SettingsService();

  @override
  void initState() {
    super.initState();
    _darkMode = widget.darkMode;
    _notifications = true;
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final notifications = await _settingsService.getNotifications();
    if (mounted) {
      setState(() {
        _notifications = notifications;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colors = theme.colorScheme;
    final roleLabel = widget.role == null
        ? 'User'
        : widget.role![0].toUpperCase() +
              widget.role!.substring(1).toLowerCase();
    final userName =
        widget.userData?['first_name'] != null &&
            widget.userData?['last_name'] != null
        ? '${widget.userData!['first_name']} ${widget.userData!['last_name']}'
        : widget.userData?['username'] ?? roleLabel;
    final email = widget.userData?['email'] ?? '';

    return CustomScrollView(
      physics: const BouncingScrollPhysics(),
      slivers: [
        SliverToBoxAdapter(
          child: Container(
            margin: const EdgeInsets.all(20),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [colors.primary, colors.secondary],
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: colors.primary.withValues(alpha: 0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              children: [
                Container(
                  width: 90,
                  height: 90,
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
                  child: Center(
                    child: Text(
                      userName.isNotEmpty ? userName[0].toUpperCase() : 'U',
                      style: TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        color: colors.primary,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
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
                      Icon(_getRoleIcon(), color: Colors.white, size: 18),
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
        SliverToBoxAdapter(
          child: _buildSectionHeader(
            context,
            'Account Details',
            Icons.person_outline,
          ),
        ),
        SliverToBoxAdapter(
          child: _buildInfoCard(context, [
            _InfoTile(
              icon: Icons.badge_outlined,
              title: 'Role',
              value: roleLabel,
            ),
            _InfoTile(
              icon: Icons.email_outlined,
              title: 'Email',
              value: email.isNotEmpty ? email : 'Not set',
            ),
            if (widget.userData?['phone'] != null)
              _InfoTile(
                icon: Icons.phone_outlined,
                title: 'Phone',
                value: widget.userData!['phone'] ?? 'Not set',
              ),
            if (widget.userData?['enrollment_no'] != null)
              _InfoTile(
                icon: Icons.numbers,
                title: 'Enrollment No',
                value: widget.userData!['enrollment_no'] ?? 'Not set',
              ),
            if (widget.userData?['division'] != null)
              _InfoTile(
                icon: Icons.class_outlined,
                title: 'Division',
                value: widget.userData!['division'] ?? 'Not set',
              ),
          ]),
        ),
        SliverToBoxAdapter(
          child: _buildSectionHeader(
            context,
            'App Settings',
            Icons.settings_outlined,
          ),
        ),
        SliverToBoxAdapter(child: _buildSettingsCard(context)),
        SliverToBoxAdapter(
          child: _buildSectionHeader(context, 'About', Icons.info_outline),
        ),
        SliverToBoxAdapter(
          child: _buildInfoCard(context, [
            const _InfoTile(
              icon: Icons.apps,
              title: 'App Version',
              value: '1.0.0',
            ),
            const _InfoTile(icon: Icons.code, title: 'Build', value: 'Release'),
          ]),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: _LogoutButton(onTap: widget.onLogout),
          ),
        ),
        const SliverToBoxAdapter(child: SizedBox(height: 100)),
      ],
    );
  }

  Widget _buildSectionHeader(
    BuildContext context,
    String title,
    IconData icon,
  ) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 18, color: theme.colorScheme.primary),
          ),
          const SizedBox(width: 12),
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

  Widget _buildInfoCard(BuildContext context, List<_InfoTile> tiles) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: theme.colorScheme.outline.withValues(alpha: 0.1),
          ),
        ),
        child: Column(
          children: tiles.asMap().entries.map((entry) {
            final index = entry.key;
            final tile = entry.value;
            return Column(
              children: [
                if (index > 0)
                  Divider(
                    height: 1,
                    color: theme.colorScheme.outline.withValues(alpha: 0.1),
                  ),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      tile.icon,
                      size: 20,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  title: Text(
                    tile.title,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.outline,
                    ),
                  ),
                  subtitle: Text(
                    tile.value,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildSettingsCard(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: theme.colorScheme.outline.withValues(alpha: 0.1),
          ),
        ),
        child: Column(
          children: [
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.blue.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.notifications_outlined,
                  size: 20,
                  color: Colors.blue,
                ),
              ),
              title: const Text('Notifications'),
              trailing: Switch(
                value: _notifications,
                onChanged: (value) {
                  setState(() => _notifications = value);
                  _settingsService.setNotifications(value);
                },
              ),
            ),
            Divider(
              height: 1,
              color: theme.colorScheme.outline.withValues(alpha: 0.1),
            ),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.purple.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.dark_mode_outlined,
                  size: 20,
                  color: Colors.purple,
                ),
              ),
              title: const Text('Dark Mode'),
              trailing: Switch(
                value: _darkMode,
                onChanged: (value) {
                  setState(() => _darkMode = value);
                  widget.onDarkModeToggle?.call(value);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getRoleIcon() {
    switch (widget.role?.toUpperCase()) {
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
}

class _InfoTile {
  final IconData icon;
  final String title;
  final String value;

  const _InfoTile({
    required this.icon,
    required this.title,
    required this.value,
  });
}

class _LogoutButton extends StatelessWidget {
  final VoidCallback onTap;

  const _LogoutButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: theme.colorScheme.error.withValues(alpha: 0.2),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Material(
        color: theme.colorScheme.error,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
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
    );
  }
}
