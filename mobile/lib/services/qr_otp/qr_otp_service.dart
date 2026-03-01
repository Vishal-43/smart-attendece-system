import 'package:dio/dio.dart';
import '../dio_client.dart';

class QrOtpService {
  Future<Response> generateQrCode(String userId) async {
    final dio = await DioClient.getInstance();
    return await dio.post('/qr_code/generate', data: {'user_id': userId});
  }

  Future<Response> verifyQrCode(String code) async {
    final dio = await DioClient.getInstance();
    return await dio.post('/qr_code/verify', data: {'code': code});
  }

  Future<Response> generateOtp(String userId) async {
    final dio = await DioClient.getInstance();
    return await dio.post('/otp/generate', data: {'user_id': userId});
  }

  Future<Response> verifyOtp(String code) async {
    final dio = await DioClient.getInstance();
    return await dio.post('/otp/verify', data: {'code': code});
  }
}
