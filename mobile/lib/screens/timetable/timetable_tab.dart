import 'package:flutter/material.dart';
import '../../services/timetable_service.dart';
import '../../widgets/modern/modern_card.dart';

class TimetableTab extends StatefulWidget {
  final String? role;

  const TimetableTab({super.key, this.role});

  @override
  State<TimetableTab> createState() => _TimetableTabState();
}

class _TimetableTabState extends State<TimetableTab>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _loadingToday = true;
  bool _loadingAll = true;
  List<dynamic> _todayTimetable = [];
  List<dynamic> _allSchedule = [];
  String? _todayError;
  String? _allError;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _fetchData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchData() async {
    await Future.wait([_fetchTodayTimetable(), _fetchAllSchedule()]);
  }

  Future<void> _fetchTodayTimetable() async {
    setState(() {
      _loadingToday = true;
      _todayError = null;
    });
    try {
      final service = TimetableService();
      final response = await service.getTodayTimetable();
      final data = response.data;
      setState(() {
        _todayTimetable = data is List ? data.cast<dynamic>() : [];
        _loadingToday = false;
      });
    } catch (e) {
      setState(() {
        _todayError = 'Failed to fetch today\'s timetable: $e';
        _loadingToday = false;
      });
    }
  }

  Future<void> _fetchAllSchedule() async {
    setState(() {
      _loadingAll = true;
      _allError = null;
    });
    try {
      final service = TimetableService();
      final response = await service.getMySchedule();
      final data = response.data;
      setState(() {
        _allSchedule = data is List ? data.cast<dynamic>() : [];
        _loadingAll = false;
      });
    } catch (e) {
      setState(() {
        _allError = 'Failed to fetch schedule: $e';
        _loadingAll = false;
      });
    }
  }

  String _getDayName(dynamic dayValue) {
    const dayMap = {
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday',
      7: 'Sunday',
    };
    const stringDayMap = {
      'MON': 1,
      'TUE': 2,
      'WED': 3,
      'THU': 4,
      'FRI': 5,
      'SAT': 6,
      'SUN': 7,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
      'sunday': 7,
    };

    if (dayValue is int) {
      return dayMap[dayValue] ?? 'Unknown';
    }
    if (dayValue is String) {
      final normalized = dayValue.toUpperCase().trim();
      return dayMap[stringDayMap[normalized]] ?? 'Unknown';
    }
    return 'Unknown';
  }

  int _getDayNumber(dynamic dayValue) {
    const stringDayMap = {
      'MON': 1,
      'TUE': 2,
      'WED': 3,
      'THU': 4,
      'FRI': 5,
      'SAT': 6,
      'SUN': 7,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
      'sunday': 7,
    };

    if (dayValue is int) {
      return dayValue.clamp(1, 7);
    }
    if (dayValue is String) {
      final normalized = dayValue.toUpperCase().trim();
      return stringDayMap[normalized] ?? 0;
    }
    return 0;
  }

  String _formatTime(String? isoString) {
    if (isoString == null) return '--:--';
    try {
      final time = isoString.split('T').last.split('.').first;
      final parts = time.split(':');
      return '${parts[0]}:${parts[1]}';
    } catch (_) {
      return isoString;
    }
  }

  Color _getLectureTypeColor(String? type) {
    switch (type?.toLowerCase()) {
      case 'lecture':
        return Colors.blue;
      case 'practical':
        return Colors.green;
      case 'tutorial':
        return Colors.orange;
      default:
        return Theme.of(context).colorScheme.primary;
    }
  }

  Widget _buildTimetableCard(Map<String, dynamic> item) {
    final theme = Theme.of(context);
    final subjectName =
        item['subject_name'] ?? item['subject']?['name'] ?? 'Unknown Subject';
    final lectureType = item['lecture_type'] ?? '';
    final startTime = item['start_time'];
    final endTime = item['end_time'];
    final typeColor = _getLectureTypeColor(lectureType);

    return TweenAnimationBuilder<double>(
      duration: const Duration(milliseconds: 400),
      tween: Tween(begin: 0.0, end: 1.0),
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(20 * (1 - value), 0),
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
                    color: typeColor,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(16),
                      bottomLeft: Radius.circular(16),
                    ),
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: typeColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            _getLectureIcon(lectureType),
                            color: typeColor,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                subjectName,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  Icon(
                                    Icons.access_time_rounded,
                                    size: 14,
                                    color: theme.colorScheme.outline,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${_formatTime(startTime)} - ${_formatTime(endTime)}',
                                    style: TextStyle(
                                      color: theme.colorScheme.outline,
                                      fontSize: 13,
                                    ),
                                  ),
                                  if (lectureType.isNotEmpty) ...[
                                    const SizedBox(width: 12),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 3,
                                      ),
                                      decoration: BoxDecoration(
                                        color: typeColor.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        lectureType.toUpperCase(),
                                        style: TextStyle(
                                          color: typeColor,
                                          fontSize: 10,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ],
                          ),
                        ),
                        if (widget.role?.toUpperCase() == 'TEACHER' ||
                            widget.role?.toUpperCase() == 'ADMIN')
                          Container(
                            decoration: BoxDecoration(
                              color: theme.colorScheme.primaryContainer,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: IconButton(
                              icon: Icon(
                                Icons.qr_code,
                                color: theme.colorScheme.primary,
                              ),
                              onPressed: () {
                                Navigator.pushNamed(
                                  context,
                                  '/session-management',
                                  arguments: {'timetableId': item['id']},
                                );
                              },
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

  IconData _getLectureIcon(String? type) {
    switch (type?.toLowerCase()) {
      case 'practical':
        return Icons.science;
      case 'tutorial':
        return Icons.groups;
      default:
        return Icons.school;
    }
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

  Widget _buildTimetableList(
    List<dynamic> items,
    bool isLoading,
    String? error,
    bool showDayHeader,
  ) {
    if (isLoading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(
              strokeWidth: 3,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 16),
            Text(
              'Loading timetable...',
              style: TextStyle(color: Theme.of(context).colorScheme.outline),
            ),
          ],
        ),
      );
    }

    if (error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.errorContainer,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.error_outline,
                  size: 48,
                  color: Theme.of(context).colorScheme.error,
                ),
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
                error,
                textAlign: TextAlign.center,
                style: TextStyle(color: Theme.of(context).colorScheme.outline),
              ),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: _fetchData,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (items.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.event_busy,
                  size: 48,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
              const SizedBox(height: 20),
              Text(
                showDayHeader ? 'No classes today' : 'No classes found',
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Text(
                showDayHeader ? 'Enjoy your free time!' : 'Check back later',
                style: TextStyle(color: Theme.of(context).colorScheme.outline),
              ),
            ],
          ),
        ),
      );
    }

    if (showDayHeader) {
      final groupedByDay = <int, List<Map<String, dynamic>>>{};
      for (final item in items) {
        final dayOfWeek = _getDayNumber(item['day_of_week']);
        if (dayOfWeek > 0) {
          groupedByDay.putIfAbsent(dayOfWeek, () => []);
          groupedByDay[dayOfWeek]!.add(item as Map<String, dynamic>);
        }
      }

      final sortedDays = groupedByDay.keys.toList()..sort();

      return RefreshIndicator(
        onRefresh: _fetchAllSchedule,
        child: ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: sortedDays.length,
          itemBuilder: (context, index) {
            final day = sortedDays[index];
            final dayItems = groupedByDay[day]!;
            dayItems.sort((a, b) {
              final aTime = a['start_time'] ?? '';
              final bTime = b['start_time'] ?? '';
              return aTime.compareTo(bTime);
            });

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(top: 16, bottom: 8),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Theme.of(context).colorScheme.primary,
                              Theme.of(context).colorScheme.secondary,
                            ],
                          ),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _getDayName(day).toUpperCase(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${dayItems.length} class${dayItems.length > 1 ? 'es' : ''}',
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.outline,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                ...dayItems.map((item) => _buildTimetableCard(item)),
              ],
            );
          },
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _fetchTodayTimetable,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: items.length,
        itemBuilder: (context, index) {
          return _buildTimetableCard(items[index] as Map<String, dynamic>);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Column(
      children: [
        Container(
          margin: const EdgeInsets.fromLTRB(16, 60, 16, 0),
          decoration: BoxDecoration(
            color: colors.surfaceContainerHighest.withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(16),
          ),
          child: TabBar(
            controller: _tabController,
            indicator: BoxDecoration(
              color: colors.primary,
              borderRadius: BorderRadius.circular(12),
            ),
            indicatorSize: TabBarIndicatorSize.tab,
            dividerColor: Colors.transparent,
            labelColor: Colors.white,
            unselectedLabelColor: colors.onSurfaceVariant,
            labelStyle: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
            padding: const EdgeInsets.all(4),
            tabs: const [
              Tab(text: "Today's Classes"),
              Tab(text: 'Full Schedule'),
            ],
          ),
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              Column(
                children: [
                  _buildHeader(
                    "Today's Classes",
                    Icons.today,
                    subtitle: _loadingToday
                        ? 'Loading...'
                        : '${_todayTimetable.length} class${_todayTimetable.length != 1 ? 'es' : ''} scheduled',
                  ),
                  Expanded(
                    child: _buildTimetableList(
                      _todayTimetable,
                      _loadingToday,
                      _todayError,
                      false,
                    ),
                  ),
                ],
              ),
              Column(
                children: [
                  _buildHeader(
                    'Full Schedule',
                    Icons.calendar_month,
                    subtitle: _loadingAll
                        ? 'Loading...'
                        : '${_allSchedule.length} classes total',
                  ),
                  Expanded(
                    child: _buildTimetableList(
                      _allSchedule,
                      _loadingAll,
                      _allError,
                      true,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
