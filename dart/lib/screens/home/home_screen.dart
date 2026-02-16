import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Smart Attendance Home'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: () {
                // TODO: Navigate to Attendance Marking
              },
              child: const Text('Mark Attendance'),
            ),
            ElevatedButton(
              onPressed: () {
                // TODO: Navigate to Attendance Records
              },
              child: const Text('View Attendance Records'),
            ),
            ElevatedButton(
              onPressed: () {
                // TODO: Navigate to QR/OTP
              },
              child: const Text('QR/OTP'),
            ),
          ],
        ),
      ),
    );
  }
}
