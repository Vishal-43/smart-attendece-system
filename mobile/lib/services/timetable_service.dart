import 'package:dio/dio.dart';
import 'dio_client.dart';

class TimetableService {
  Future<Response> getTodayTimetable() async {
    final dio = await DioClient.getInstance();
    return await dio.get('/timetables/today');
  }

  Future<Response> getMySchedule() async {
    final dio = await DioClient.getInstance();
    return await dio.get('/timetables/my-schedule');
  }

  Future<Response> getTimetable(int timetableId) async {
    final dio = await DioClient.getInstance();
    return await dio.get('/timetables/$timetableId');
  }
}
