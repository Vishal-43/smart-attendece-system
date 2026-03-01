// attendance_history_screen.dart
// Paginated attendance history screen — works for any userId.
// Navigates to /attendance-history with argument: {'userId': int}

import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/network/network_result.dart';
import 'attendance_record.dart';
import 'attendance_repository.dart';
import 'attendance_history_card.dart';

class AttendanceHistoryScreen extends StatefulWidget {
  final int userId;

  const AttendanceHistoryScreen({super.key, required this.userId});

  @override
  State<AttendanceHistoryScreen> createState() => _AttendanceHistoryScreenState();
}

class _AttendanceHistoryScreenState extends State<AttendanceHistoryScreen> {
  final _repo = const AttendanceRepository();
  final _scrollController = ScrollController();

  final List<AttendanceRecord> _records = [];
  int _page  = 1;
  int _pages = 1;
  int _total = 0;
  bool _isLoading = false;
  bool _isLoadingMore = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPage(1, refresh: true);
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 120) {
      if (!_isLoadingMore && _page < _pages) {
        _loadPage(_page + 1);
      }
    }
  }

  Future<void> _loadPage(int page, {bool refresh = false}) async {
    if (refresh) {
      setState(() {
        _isLoading = true;
        _error = null;
      });
    } else {
      setState(() => _isLoadingMore = true);
    }

    final result = await _repo.getHistory(
      userId: widget.userId,
      page: page,
      limit: 20,
    );

    if (!mounted) return;

    result.when(
      success: (data) {
        setState(() {
          if (refresh) _records.clear();
          _records.addAll(data.items);
          _page  = data.page;
          _pages = data.pages;
          _total = data.total;
          _isLoading    = false;
          _isLoadingMore = false;
        });
      },
      failure: (error) {
        setState(() {
          _error = error.message;
          _isLoading    = false;
          _isLoadingMore = false;
        });
      },
    );
  }

  // ── Stat counts ──────────────────────────────────────────────────────────────
  int get _presentCount  => _records.where((r) => r.isPresent).length;
  int get _absentCount   => _records.where((r) => r.isAbsent).length;
  int get _lateCount     => _records.where((r) => r.isLate).length;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Attendance History'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh',
            onPressed: _isLoading ? null : () => _loadPage(1, refresh: true),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () => _loadPage(1, refresh: true),
        child: CustomScrollView(
          controller: _scrollController,
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // Summary stats header
            SliverToBoxAdapter(
              child: _SummaryHeader(
                total:   _total,
                present: _presentCount,
                absent:  _absentCount,
                late:    _lateCount,
              ),
            ),

            // Error banner
            if (_error != null)
              SliverToBoxAdapter(
                child: _ErrorBanner(
                  message: _error!,
                  onRetry: () => _loadPage(1, refresh: true),
                ),
              ),

            // Loading state (initial)
            if (_isLoading)
              const SliverFillRemaining(
                child: Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
              )
            // Empty state
            else if (_records.isEmpty && _error == null)
              const SliverFillRemaining(
                child: _EmptyState(),
              )
            // Records list
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.s2,
                ),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      if (index < _records.length) {
                        return AttendanceHistoryCard(record: _records[index]);
                      }
                      // Load-more spinner at the bottom
                      return _isLoadingMore
                          ? const Padding(
                              padding: EdgeInsets.all(AppSpacing.md),
                              child: Center(
                                child: CircularProgressIndicator(
                                  color: AppColors.primary,
                                  strokeWidth: 2,
                                ),
                              ),
                            )
                          : const SizedBox.shrink();
                    },
                    childCount: _records.length + (_isLoadingMore ? 1 : 0),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

// ── Sub-widgets ───────────────────────────────────────────────────────────────

class _SummaryHeader extends StatelessWidget {
  final int total;
  final int present;
  final int absent;
  final int late;

  const _SummaryHeader({
    required this.total,
    required this.present,
    required this.absent,
    required this.late,
  });

  @override
  Widget build(BuildContext context) {
    final double attendanceRate =
        total > 0 ? (present / total * 100) : 0.0;

    return Container(
      margin: const EdgeInsets.all(AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: AppDecorations.elevatedCard(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Overall Attendance', style: AppTextStyles.headline3),
          const SizedBox(height: AppSpacing.s2),
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.full),
            child: LinearProgressIndicator(
              value: attendanceRate / 100,
              minHeight: 8,
              backgroundColor: AppColors.errorBg,
              color: attendanceRate >= 75
                  ? AppColors.success
                  : attendanceRate >= 50
                      ? AppColors.warning
                      : AppColors.error,
            ),
          ),
          const SizedBox(height: AppSpacing.s2),
          Text(
            '${attendanceRate.toStringAsFixed(1)}%  ·  $total sessions',
            style: AppTextStyles.bodySmall,
          ),
          const SizedBox(height: AppSpacing.md),
          // Stat chips row
          Row(
            children: [
              _StatChip(label: 'Present', count: present, color: AppColors.success),
              const SizedBox(width: AppSpacing.s2),
              _StatChip(label: 'Absent',  count: absent,  color: AppColors.error),
              const SizedBox(width: AppSpacing.s2),
              _StatChip(label: 'Late',    count: late,    color: AppColors.warning),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final int count;
  final Color color;

  const _StatChip({
    required this.label,
    required this.count,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.s3,
        vertical: AppSpacing.s1,
      ),
      decoration: AppDecorations.badge(color),
      child: Text(
        '$count $label',
        style: AppTextStyles.caption.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorBanner({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.s2,
      ),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.errorBg,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.errorBorder),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: AppColors.error),
          const SizedBox(width: AppSpacing.s3),
          Expanded(
            child: Text(message, style: AppTextStyles.body.copyWith(color: AppColors.error)),
          ),
          TextButton(
            onPressed: onRetry,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.event_busy_rounded,
              size: AppIconSize.xxl,
              color: AppColors.textMuted,
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              'No attendance records yet',
              style: AppTextStyles.headline3.copyWith(color: AppColors.textMuted),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.s3),
            Text(
              'Your attendance history will appear here once you start attending sessions.',
              style: AppTextStyles.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
