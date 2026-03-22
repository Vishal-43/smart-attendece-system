import 'package:flutter/material.dart';
import '../../services/attendance/attendance_service.dart';
import '../../services/auth_service.dart';
import '../../widgets/modern/modern_card.dart';

class RecordsTab extends StatefulWidget {
  final String? role;

  const RecordsTab({super.key, this.role});

  @override
  State<RecordsTab> createState() => _RecordsTabState();
}

class _RecordsTabState extends State<RecordsTab> {
  bool _loading = true;
  List<dynamic> _records = [];
  String? _error;
  int _currentPage = 1;
  int _totalPages = 0;
  int _total = 0;

  @override
  void initState() {
    super.initState();
    _fetchRecords();
  }

  Future<void> _fetchRecords({int page = 1}) async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final authService = AuthService();
    final userId = await authService.getUserId();
    if (userId == null) {
      setState(() {
        _error = 'User not logged in.';
        _loading = false;
      });
      return;
    }
    try {
      final service = AttendanceService();
      final response = await service.getAttendanceRecords(userId, page: page);
      final data = response.data['data'] ?? {};
      setState(() {
        _records = data['items'] ?? [];
        _currentPage = data['page'] ?? 1;
        _totalPages = data['pages'] ?? 0;
        _total = data['total'] ?? 0;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to fetch records: $e';
        _loading = false;
      });
    }
  }

  String _formatDateTime(String? isoString) {
    if (isoString == null) return 'Unknown';
    try {
      final dt = DateTime.parse(isoString);
      final date =
          '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
      final time =
          '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
      return '$date $time';
    } catch (_) {
      return isoString;
    }
  }

  String _getDayName(int? dayValue) {
    const days = ['', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    if (dayValue == null || dayValue < 1 || dayValue > 7) return '';
    return days[dayValue];
  }

  String _formatTime(String? isoString) {
    if (isoString == null) return '';
    try {
      final time = isoString.split('T').last.split('.').first;
      final parts = time.split(':');
      return '${parts[0]}:${parts[1]}';
    } catch (_) {
      return isoString;
    }
  }

  Widget _buildRecordCard(Map<String, dynamic> rec) {
    final theme = Theme.of(context);
    final status = rec['status']?.toString().toLowerCase() ?? 'unknown';
    final isPresent = status == 'present';
    final timetable = rec['timetable'];
    final subjectName = timetable?['subject_name'] ?? 'Unknown Subject';
    final dayOfWeek = timetable?['day_of_week'];
    final dayName = _getDayName(dayOfWeek);
    final startTime = timetable?['start_time'];
    final endTime = timetable?['end_time'];
    final lectureType = timetable?['lecture_type'] ?? '';
    final markedAt = rec['marked_at'];

    final statusColor = isPresent ? Colors.green : Colors.red;
    final bgColor = isPresent ? Colors.green : Colors.red;

    return TweenAnimationBuilder<double>(
      duration: const Duration(milliseconds: 400),
      tween: Tween(begin: 0.0, end: 1.0),
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 20 * (1 - value)),
          child: Opacity(opacity: value, child: child),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        child: ModernCard(
          padding: EdgeInsets.zero,
          child: IntrinsicHeight(
            child: Row(
              children: [
                Container(
                  width: 5,
                  decoration: BoxDecoration(
                    color: statusColor,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(16),
                      bottomLeft: Radius.circular(16),
                    ),
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: bgColor.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                isPresent ? Icons.check_circle : Icons.cancel,
                                color: statusColor,
                                size: 24,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    subjectName,
                                    style: theme.textTheme.titleMedium
                                        ?.copyWith(fontWeight: FontWeight.w600),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      if (dayName.isNotEmpty) ...[
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 2,
                                          ),
                                          decoration: BoxDecoration(
                                            color: theme
                                                .colorScheme
                                                .primaryContainer,
                                            borderRadius: BorderRadius.circular(
                                              6,
                                            ),
                                          ),
                                          child: Text(
                                            dayName,
                                            style: TextStyle(
                                              color: theme.colorScheme.primary,
                                              fontSize: 11,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                      ],
                                      Icon(
                                        Icons.access_time_rounded,
                                        size: 14,
                                        color: theme.colorScheme.outline,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        '${startTime != null ? _formatTime(startTime) : ''} - ${endTime != null ? _formatTime(endTime) : ''}',
                                        style: TextStyle(
                                          color: theme.colorScheme.outline,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: bgColor.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                status.toUpperCase(),
                                style: TextStyle(
                                  color: statusColor,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.surfaceContainerHighest
                                .withValues(alpha: 0.5),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.schedule,
                                size: 16,
                                color: theme.colorScheme.outline,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Marked: ${_formatDateTime(markedAt)}',
                                style: TextStyle(
                                  color: theme.colorScheme.outline,
                                  fontSize: 12,
                                ),
                              ),
                              if (lectureType.isNotEmpty) ...[
                                const Spacer(),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 3,
                                  ),
                                  decoration: BoxDecoration(
                                    color: theme.colorScheme.secondaryContainer,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    lectureType.toUpperCase(),
                                    style: TextStyle(
                                      color: theme.colorScheme.secondary,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(String title, IconData icon, {String? subtitle}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Theme.of(context).colorScheme.primary,
                  Theme.of(context).colorScheme.secondary,
                ],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              if (subtitle != null)
                Text(
                  subtitle,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.outline,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPagination() {
    final theme = Theme.of(context);

    if (_totalPages <= 1) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          IconButton(
            onPressed: _currentPage > 1
                ? () => _fetchRecords(page: _currentPage - 1)
                : null,
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: _currentPage > 1
                    ? theme.colorScheme.primaryContainer
                    : theme.colorScheme.surfaceContainerHighest,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.chevron_left,
                color: _currentPage > 1
                    ? theme.colorScheme.primary
                    : theme.colorScheme.outline,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: theme.colorScheme.primaryContainer,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              'Page $_currentPage of $_totalPages',
              style: TextStyle(
                color: theme.colorScheme.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(width: 12),
          IconButton(
            onPressed: _currentPage < _totalPages
                ? () => _fetchRecords(page: _currentPage + 1)
                : null,
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: _currentPage < _totalPages
                    ? theme.colorScheme.primaryContainer
                    : theme.colorScheme.surfaceContainerHighest,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.chevron_right,
                color: _currentPage < _totalPages
                    ? theme.colorScheme.primary
                    : theme.colorScheme.outline,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    if (_loading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(strokeWidth: 3, color: colors.primary),
            const SizedBox(height: 16),
            Text('Loading records...', style: TextStyle(color: colors.outline)),
          ],
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: colors.errorContainer,
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.error_outline, size: 48, color: colors.error),
              ),
              const SizedBox(height: 20),
              Text(
                'Oops! Something went wrong',
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: TextStyle(color: colors.outline),
              ),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: _fetchRecords,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_records.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: colors.primaryContainer,
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.history, size: 48, color: colors.primary),
              ),
              const SizedBox(height: 20),
              Text(
                'No attendance records',
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Text(
                'Mark attendance to see your history',
                style: TextStyle(color: colors.outline),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        _buildHeader(
          'Attendance History',
          Icons.history,
          subtitle: '$_total records found',
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => _fetchRecords(page: 1),
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _records.length,
              itemBuilder: (context, index) {
                return _buildRecordCard(
                  _records[index] as Map<String, dynamic>,
                );
              },
            ),
          ),
        ),
        _buildPagination(),
      ],
    );
  }
}
