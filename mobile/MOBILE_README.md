# Smart Attendance System - Mobile App

Flutter mobile application for the Smart Attendance System with QR code scanning, OTP entry, geolocation, and WiFi detection.

## Features

### For Students
- **Mark Attendance**: Scan QR code or enter OTP to mark attendance
- **Automatic Location Tracking**: GPS coordinates captured automatically
- **WiFi Detection**: SSID and BSSID captured for verification
- **View Attendance History**: Check your past attendance records

### For Teachers
- **Generate QR Codes**: Create time-limited QR codes for class sessions
- **Generate OTPs**: Create 6-digit OTPs as alternative to QR codes
- **Real-time Countdown**: See expiration timers for generated codes
- **Auto-refresh**: Codes automatically refresh when expired
- **View Records**: Access attendance reports for your classes

### For Admins
- **Full Management**: Generate QR/OTP for any class
- **User Management**: Manage student and teacher accounts
- **System Administration**: Complete control over the system

## Prerequisites

- Flutter SDK 3.10.8 or higher
- Dart SDK 3.10.8 or higher
- Android Studio / Xcode (for running on physical devices/emulators)
- Backend API running (see `/backend-python` directory)

## Installation

### 1. Install Dependencies

```bash
cd mobile
flutter pub get
```

### 2. Configure Backend URL

Edit `lib/services/dio_client.dart` and update the `baseUrl`:

```dart
baseUrl: 'http://YOUR_BACKEND_IP:8000/api/v1',
```

For Android emulator, use `10.0.2.2` instead of `localhost`:
```dart
baseUrl: 'http://10.0.2.2:8000/api/v1',
```

### 3. Run the App

```bash
# List available devices
flutter devices

# Run on connected device/emulator
flutter run

# Run on specific device
flutter run -d <device-id>

# Run in release mode (faster performance)
flutter run --release
```

## Permissions

### Android
The following permissions are automatically requested:
- **Camera**: For QR code scanning
- **Location**: For GPS coordinate verification
- **WiFi State**: For network SSID/BSSID detection

### iOS  
Permissions are declared in `ios/Runner/Info.plist`:
- NSCameraUsageDescription
- NSLocationWhenInUseUsageDescription
- NSLocationAlwaysUsageDescription

## Project Structure

```
lib/
├── core/               # Core functionality
│   ├── network/       # API client and network result types
│   └── theme/         # App theming
├── features/          # Feature modules
│   └── attendance/    # Attendance repository and models
├── screens/           # UI screens
│   ├── dashboard/     # Dashboard screen (role-based)
│   ├── login/         # Authentication screens
│   ├── attendance/    # Attendance marking screens
│   │   ├── student_select_session_screen.dart
│   │   └── student_mark_attendance_screen.dart
│   ├── qr_otp/        # QR/OTP management
│   │   └── teacher_qr_otp_management_screen.dart
│   └── admin/         # Admin screens
├── services/          # Backend services
│   ├── dio_client.dart        # HTTP client
│   ├── location_service.dart  # GPS service
│   ├── wifi_service.dart      # WiFi detection
│   └── qr_otp/               # QR/OTP API calls
└── main.dart          # App entry point

test/
├── services/          # Service unit tests
├── screens/           # Widget tests
└── widget_test.dart   # Main app tests
```

## Key Dependencies

- **dio**: ^5.9.1 - HTTP client
- **shared_preferences**: ^2.2.2 - Local storage
- **geolocator**: ^14.0.2 - GPS location
- **network_info_plus**: ^7.0.0 - WiFi info
- **mobile_scanner**: ^6.0.2 - QR code scanning
- **qr_flutter**: ^4.1.0 - QR code generation/display
- **permission_handler**: ^12.0.1 - Runtime permissions

## Running Tests

```bash
# Run all tests
flutter test

# Run specific test file
flutter test test/services/location_service_test.dart

# Run with coverage
flutter test --coverage

# View coverage report
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

## Building for Production

### Android APK
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### Android App Bundle (for Play Store)
```bash
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

### iOS
```bash
flutter build ios --release
# Then use Xcode to archive and upload to App Store
```

## Troubleshooting

### Camera Permission Denied
- Go to device Settings → Apps → Smart Attendance → Permissions
- Enable Camera permission

### Location Not Working
- Ensure GPS is enabled on device
- Grant location permission when prompted
- For Android, location must be enabled in system settings

### WiFi Info Not Available
- WiFi info requires location permission on Android 10+
- Ensure device is connected to WiFi
- Some devices may restrict WiFi info access

### Cannot Connect to Backend
- Verify backend is running: `curl http://localhost:8000/api/v1/health`
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For physical device, use your computer's IP address
- Ensure firewall allows connections on port 8000

### QR Scanner Not Working
- Ensure camera permission is granted
- Ensure adequate lighting
- Hold steady and point directly at QR code
- Try switching to OTP tab if issues persist

## Development Tips

1. **Hot Reload**: Press `r` in terminal while app is running
2. **Hot Restart**: Press `R` for full restart
3. **Debug Mode**: Use `flutter run` for detailed error messages
4. **Device Logs**: `flutter logs` to see real-time logs

## API Endpoints Used

- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user info
- `GET /timetables/` - List available class sessions
- `POST /qr/generate/{timetableId}` - Generate QR code
- `GET /qr/current/{timetableId}` - Get active QR code
- `POST /qr/refresh/{timetableId}` - Refresh QR code
- `POST /otp/generate/{timetableId}` - Generate OTP
- `GET /otp/current/{timetableId}` - Get active OTP
- `POST /otp/refresh/{timetableId}` - Refresh OTP
- `POST /attendance/mark` - Mark attendance
- `GET /attendance/history/{userId}` - Get attendance history

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## License

Copyright © 2026 Smart Attendance System
