import 'package:flutter/material.dart';
import '../../services/dashboard_service.dart';
import '../../widgets/modern/stat_card.dart';

class DashboardTab extends StatefulWidget {
  final String? role;
  final Map<String, dynamic>? userData;
  final Function(int)? onNavigate;

  const DashboardTab({super.key, this.role, this.userData, this.onNavigate});

  @override
  State<DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<DashboardTab> {
  final _dashboardService = DashboardService();

  int _present = 0;
  int _absent = 0;
  int _late = 0;
  int _totalClasses = 0;
  double _attendanceRate = 0.0;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchStats();
  }

  Future<void> _fetchStats() async {
    try {
      final data = await _dashboardService.getStats();
      if (mounted) {
        setState(() {
          _present = data['present'] ?? 0;
          _absent = data['absent'] ?? 0;
          _late = data['late'] ?? 0;
          _totalClasses = data['total'] ?? 0;
          _attendanceRate = (data['attendance_rate'] ?? 0).toDouble();
          _loading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching stats: $e');
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  bool _isStudent() => widget.role?.toUpperCase() == 'STUDENT';
  bool _isAdmin() => widget.role?.toUpperCase() == 'ADMIN';
  bool _isTeacher() => widget.role?.toUpperCase() == 'TEACHER';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final normalizedRole = widget.role?.toUpperCase() ?? '';
    final roleLabel = widget.role == null
        ? 'User'
        : normalizedRole[0] + normalizedRole.substring(1).toLowerCase();
    final userName =
        widget.userData?['first_name'] ??
        widget.userData?['username'] ??
        roleLabel;
    final now = DateTime.now();
    final greeting = _getGreeting(now.hour);

    return RefreshIndicator(
      onRefresh: _fetchStats,
      child: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
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
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: _WelcomeCard(
                roleLabel: roleLabel,
                attendanceRate: _attendanceRate,
                loading: _loading,
              ),
            ),
          ),
          if (_isStudent()) ...[
            SliverToBoxAdapter(
              child: _buildSectionHeader(
                context,
                'Quick Actions',
                Icons.flash_on,
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Expanded(
                      child: _QuickActionCard(
                        title: 'Mark Attendance',
                        subtitle: 'Scan QR or enter OTP',
                        icon: Icons.qr_code_scanner,
                        gradient: [
                          theme.colorScheme.primary,
                          theme.colorScheme.secondary,
                        ],
                        onTap: () =>
                            Navigator.pushNamed(context, '/attendance'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _QuickActionCard(
                        title: 'My Records',
                        subtitle: 'View attendance history',
                        icon: Icons.history,
                        gradient: const [Colors.teal, Color(0xFF26A69A)],
                        onTap: () => widget.onNavigate?.call(
                          3,
                        ), // Navigate to Records tab
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
          if (_isAdmin()) ...[
            SliverToBoxAdapter(
              child: _buildSectionHeader(
                context,
                'Admin Management',
                Icons.admin_panel_settings,
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Expanded(
                      child: _ManagementTile(
                        title: 'Users',
                        subtitle: 'Manage accounts',
                        icon: Icons.people,
                        color: Colors.green,
                        onTap: () => Navigator.pushNamed(context, '/users'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _ManagementTile(
                        title: 'Access Points',
                        subtitle: 'WiFi locations',
                        icon: Icons.wifi,
                        color: Colors.blue,
                        onTap: () =>
                            Navigator.pushNamed(context, '/access-points'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                child: Row(
                  children: [
                    Expanded(
                      child: _ManagementTile(
                        title: 'Locations',
                        subtitle: 'Geofence areas',
                        icon: Icons.location_on,
                        color: Colors.orange,
                        onTap: () => Navigator.pushNamed(context, '/locations'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _ManagementTile(
                        title: 'QR & OTP',
                        subtitle: 'Generate codes',
                        icon: Icons.qr_code,
                        color: theme.colorScheme.primary,
                        onTap: () =>
                            Navigator.pushNamed(context, '/session-management'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
          if (_isTeacher()) ...[
            SliverToBoxAdapter(
              child: _buildSectionHeader(context, 'Management', Icons.school),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Expanded(
                      child: _ManagementTile(
                        title: 'QR & OTP',
                        subtitle: 'Generate codes',
                        icon: Icons.qr_code,
                        color: theme.colorScheme.primary,
                        onTap: () =>
                            Navigator.pushNamed(context, '/session-management'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _ManagementTile(
                        title: 'My Timetable',
                        subtitle: 'View schedule',
                        icon: Icons.calendar_month,
                        color: Colors.teal,
                        onTap: () => widget.onNavigate?.call(2),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
          SliverToBoxAdapter(
            child: _buildSectionHeader(
              context,
              "Today's Overview",
              Icons.calendar_today,
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: _loading
                  ? const Center(
                      child: Padding(
                        padding: EdgeInsets.all(32),
                        child: CircularProgressIndicator(),
                      ),
                    )
                  : Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: StatCard(
                                title: 'Present',
                                value: _present.toString(),
                                icon: Icons.check_circle,
                                color: Colors.green,
                                subtitle: 'On time',
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: StatCard(
                                title: 'Absent',
                                value: _absent.toString(),
                                icon: Icons.cancel,
                                color: Colors.red,
                                subtitle: 'Missed',
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
                                value: _late.toString(),
                                icon: Icons.access_time,
                                color: Colors.orange,
                                subtitle: 'After start',
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: StatCard(
                                title: 'Classes',
                                value: _totalClasses.toString(),
                                icon: Icons.school,
                                color: theme.colorScheme.primary,
                                subtitle: 'Today',
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
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

  String _getGreeting(int hour) {
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
}

class _WelcomeCard extends StatelessWidget {
  final String roleLabel;
  final double attendanceRate;
  final bool loading;

  const _WelcomeCard({
    required this.roleLabel,
    required this.attendanceRate,
    required this.loading,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [theme.colorScheme.primary, theme.colorScheme.secondary],
        ),
        borderRadius: BorderRadius.circular(20),
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
                const SizedBox(height: 12),
                Text(
                  'Welcome Back!',
                  style: theme.textTheme.titleLarge?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Have a great day ahead',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.white.withValues(alpha: 0.9),
                  ),
                ),
                const SizedBox(height: 12),
                if (loading)
                  const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                else
                  Row(
                    children: [
                      const Icon(
                        Icons.trending_up,
                        color: Colors.white,
                        size: 18,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '${attendanceRate.toStringAsFixed(1)}% attendance rate',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.waving_hand, color: Colors.white, size: 32),
          ),
        ],
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final List<Color> gradient;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.gradient,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      height: 130,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: gradient,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: gradient.first.withValues(alpha: 0.3),
            blurRadius: 15,
            offset: const Offset(0, 6),
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

class _ManagementTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ManagementTile({
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
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: theme.colorScheme.outline.withValues(alpha: 0.1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
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
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.outline,
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
