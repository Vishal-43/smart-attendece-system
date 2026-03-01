// attendance_record.dart
// Data model for attendance history entries returned by GET /api/v1/attendance/history/{userId}

class AttendanceRecord {
  final int id;
  final int timetableId;
  final int studentId;
  final int? enrollmentId;
  final int? teacherId;
  final int? divisionId;
  final int? batchId;
  final int? locationId;
  final DateTime? markedAt;
  final String status; // "present" | "absent" | "late"
  final String? deviceInfo;
  final DateTime? createdAt;

  const AttendanceRecord({
    required this.id,
    required this.timetableId,
    required this.studentId,
    this.enrollmentId,
    this.teacherId,
    this.divisionId,
    this.batchId,
    this.locationId,
    this.markedAt,
    required this.status,
    this.deviceInfo,
    this.createdAt,
  });

  factory AttendanceRecord.fromJson(Map<String, dynamic> json) {
    return AttendanceRecord(
      id:           json['id'] as int,
      timetableId:  json['timetable_id'] as int,
      studentId:    json['student_id'] as int,
      enrollmentId: json['enrollment_id'] as int?,
      teacherId:    json['teacher_id']   as int?,
      divisionId:   json['division_id']  as int?,
      batchId:      json['batch_id']     as int?,
      locationId:   json['location_id']  as int?,
      markedAt:     json['marked_at']  != null ? DateTime.tryParse(json['marked_at'] as String) : null,
      status:       json['status'] as String? ?? 'present',
      deviceInfo:   json['device_info'] as String?,
      createdAt:    json['created_at'] != null ? DateTime.tryParse(json['created_at'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'timetable_id': timetableId,
    'student_id': studentId,
    'enrollment_id': enrollmentId,
    'teacher_id': teacherId,
    'division_id': divisionId,
    'batch_id': batchId,
    'location_id': locationId,
    'marked_at': markedAt?.toIso8601String(),
    'status': status,
    'device_info': deviceInfo,
    'created_at': createdAt?.toIso8601String(),
  };

  bool get isPresent => status == 'present';
  bool get isAbsent  => status == 'absent';
  bool get isLate    => status == 'late';
}

/// Paginated response wrapper from the history endpoint.
class AttendanceHistoryPage {
  final List<AttendanceRecord> items;
  final int total;
  final int page;
  final int limit;
  final int pages;

  const AttendanceHistoryPage({
    required this.items,
    required this.total,
    required this.page,
    required this.limit,
    required this.pages,
  });

  factory AttendanceHistoryPage.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'] as List<dynamic>? ?? [];
    return AttendanceHistoryPage(
      items: rawItems
          .map((e) => AttendanceRecord.fromJson(e as Map<String, dynamic>))
          .toList(),
      total: json['total'] as int? ?? 0,
      page:  json['page']  as int? ?? 1,
      limit: json['limit'] as int? ?? 20,
      pages: json['pages'] as int? ?? 0,
    );
  }
}
