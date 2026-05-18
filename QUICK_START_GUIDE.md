# PawsitiveSpace - Quick Start Guide

## Prerequisites

Before you begin, ensure you have:

✅ **Flutter SDK** installed (3.0 or higher)  
✅ **Android Studio** or **Xcode** (for iOS)  
✅ **VS Code** with Flutter extension (recommended)  
✅ **Git** installed  
✅ **Supabase account** (free tier)  
✅ **Google Cloud account** (for Maps API - free $200 credit)  
✅ **Firebase account** (for notifications - free tier)  

---

## Step 1: Set Up Development Environment

### Install Flutter

**Windows**:
```powershell
# Download Flutter SDK from https://flutter.dev/docs/get-started/install/windows
# Extract to C:\src\flutter
# Add to PATH: C:\src\flutter\bin

# Verify installation
flutter doctor
```

**macOS**:
```bash
# Install via Homebrew
brew install --cask flutter

# Or download from https://flutter.dev/docs/get-started/install/macos
# Add to PATH in ~/.zshrc or ~/.bash_profile

# Verify installation
flutter doctor
```

**Linux**:
```bash
# Download Flutter SDK
cd ~
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.x.x-stable.tar.xz
tar xf flutter_linux_*.tar.xz

# Add to PATH
echo 'export PATH="$PATH:`pwd`/flutter/bin"' >> ~/.bashrc
source ~/.bashrc

# Verify installation
flutter doctor
```

### Install IDE

**VS Code (Recommended)**:
```bash
# Install VS Code from https://code.visualstudio.com/

# Install Flutter extension
# Open VS Code > Extensions > Search "Flutter" > Install
```

**Android Studio**:
```bash
# Download from https://developer.android.com/studio
# Install Flutter and Dart plugins
# Settings > Plugins > Search "Flutter" and "Dart" > Install
```

---

## Step 2: Create Flutter Project

```bash
# Create new Flutter project
flutter create pawsitive_space

# Navigate to project
cd pawsitive_space

# Test that it works
flutter run
```

You should see a default counter app running.

---

## Step 3: Set Up Supabase

### Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in details:
   - **Name**: pawsitive-space
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
5. Wait for project to initialize (~2 minutes)

### Get API Keys

1. Go to Project Settings > API
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Public Key**: `eyJhbGc...` (long string)

### Create Database Tables

1. Go to SQL Editor in Supabase dashboard
2. Copy SQL from `ARCHITECTURE.md` (users, animals, rescues tables)
3. Run each CREATE TABLE statement
4. Enable Row Level Security:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescues ENABLE ROW LEVEL SECURITY;

-- Add basic policies
CREATE POLICY "Public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE 
  USING (auth.uid() = id);
```

### Configure Storage

1. Go to Storage in Supabase dashboard
2. Create buckets:
   - **photos** (public)
   - **videos** (public)
   - **documents** (private)
3. Set policies for each bucket

---

## Step 4: Set Up Firebase (For Notifications)

### Create Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click "Add Project"
3. Name: pawsitive-space
4. Disable Google Analytics (optional for MVP)
5. Click "Create Project"

### Add Android App

1. Click Android icon
2. Android package name: `com.pawsitivespace.app`
3. Download `google-services.json`
4. Place in `android/app/`
5. Follow setup instructions

### Add iOS App

1. Click iOS icon
2. iOS bundle ID: `com.pawsitivespace.app`
3. Download `GoogleService-Info.plist`
4. Add to `ios/Runner/` in Xcode
5. Follow setup instructions

### Enable Cloud Messaging

1. Go to Project Settings > Cloud Messaging
2. Enable Cloud Messaging API
3. Copy Server Key (save for later)

---

## Step 5: Set Up Google Maps

### Enable Maps APIs

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create new project: "PawsitiveSpace"
3. Enable APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Geocoding API
   - Places API

### Get API Keys

1. Go to Credentials
2. Create API Key
3. Restrict key:
   - **Android**: Add app SHA-1 fingerprint
   - **iOS**: Add bundle identifier

---

## Step 6: Configure Your App

### Create Environment File

Create `.env` file in project root:

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...

# Google Maps
GOOGLE_MAPS_API_KEY_ANDROID=AIzaSy...
GOOGLE_MAPS_API_KEY_IOS=AIzaSy...

# Stripe (optional for donations)
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**⚠️ Important**: Add `.env` to `.gitignore` to keep secrets safe!

### Update Android Manifest

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
  <application>
    <!-- Add Google Maps API Key -->
    <meta-data
      android:name="com.google.android.geo.API_KEY"
      android:value="${GOOGLE_MAPS_API_KEY_ANDROID}"/>
  </application>

  <!-- Add permissions -->
  <uses-permission android:name="android.permission.INTERNET"/>
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
  <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
  <uses-permission android:name="android.permission.CAMERA"/>
</manifest>
```

### Update iOS Info.plist

Edit `ios/Runner/Info.plist`:

```xml
<dict>
  <!-- Add permissions -->
  <key>NSLocationWhenInUseUsageDescription</key>
  <string>We need your location to show nearby rescues</string>
  
  <key>NSCameraUsageDescription</key>
  <string>Take photos of animals in need</string>
  
  <key>NSPhotoLibraryUsageDescription</key>
  <string>Choose photos to upload</string>
</dict>
```

---

## Step 7: Install Dependencies

### Add Dependencies

Copy the `pubspec.yaml` from code samples to your project, then run:

```bash
flutter pub get
```

This will download all required packages.

### Initialize Hive

Create `lib/utils/hive_init.dart`:

```dart
import 'package:hive_flutter/hive_flutter.dart';

Future<void> initHive() async {
  await Hive.initFlutter();
  // Register adapters here when you create models
}
```

---

## Step 8: Project Structure Setup

### Create Folder Structure

```bash
# Create folders
mkdir -p lib/models
mkdir -p lib/screens
mkdir -p lib/widgets
mkdir -p lib/services
mkdir -p lib/providers
mkdir -p lib/utils
mkdir -p lib/constants

# Create files
touch lib/constants/colors.dart
touch lib/constants/text_styles.dart
touch lib/utils/validators.dart
touch lib/services/supabase_service.dart
```

### Create Constants

**lib/constants/colors.dart**:
```dart
import 'package:flutter/material.dart';

class AppColors {
  static const primary = Color(0xFF4CAF50);
  static const secondary = Color(0xFF2196F3);
  static const accent = Color(0xFFFF9800);
  static const error = Color(0xFFF44336);
  static const background = Color(0xFFFAFAFA);
  static const surface = Colors.white;
}
```

---

## Step 9: Initialize Supabase in App

Update `lib/main.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Load environment variables
  await dotenv.load(fileName: ".env");
  
  // Initialize Supabase
  await Supabase.initialize(
    url: dotenv.env['SUPABASE_URL']!,
    anonKey: dotenv.env['SUPABASE_ANON_KEY']!,
  );
  
  runApp(
    const ProviderScope(
      child: PawsitiveSpaceApp(),
    ),
  );
}

class PawsitiveSpaceApp extends StatelessWidget {
  const PawsitiveSpaceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PawsitiveSpace',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4CAF50),
        ),
        useMaterial3: true,
      ),
      home: const Scaffold(
        body: Center(
          child: Text('Welcome to PawsitiveSpace!'),
        ),
      ),
    );
  }
}
```

---

## Step 10: Test Your Setup

### Run on Emulator

```bash
# List available devices
flutter devices

# Run on Android
flutter run

# Run on iOS (macOS only)
flutter run -d ios

# Run with hot reload
flutter run --hot
```

### Test Supabase Connection

Create `lib/screens/test_screen.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class TestScreen extends StatelessWidget {
  const TestScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final supabase = Supabase.instance.client;
    
    return Scaffold(
      appBar: AppBar(title: const Text('Test Connection')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Supabase URL: ${supabase.supabaseUrl}'),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                // Test database query
                try {
                  final response = await supabase
                      .from('users')
                      .select()
                      .limit(1);
                  print('Success: $response');
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Connection successful!')),
                  );
                } catch (e) {
                  print('Error: $e');
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e')),
                  );
                }
              },
              child: const Text('Test Database Connection'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## Step 11: Development Workflow

### Daily Development Cycle

```bash
# 1. Start your day
git pull origin main

# 2. Create feature branch
git checkout -b feature/rescue-reporting

# 3. Make changes and test frequently
flutter run  # Keep hot reload running

# 4. Run tests
flutter test

# 5. Check for issues
flutter analyze

# 6. Format code
flutter format .

# 7. Commit and push
git add .
git commit -m "feat: add rescue reporting screen"
git push origin feature/rescue-reporting
```

### Useful Commands

```bash
# Clean build artifacts
flutter clean

# Get dependencies
flutter pub get

# Upgrade dependencies
flutter pub upgrade

# Generate code (for Riverpod, Hive)
flutter pub run build_runner build --delete-conflicting-outputs

# Run tests
flutter test

# Build APK
flutter build apk --release

# Build iOS
flutter build ios --release
```

---

## Step 12: Next Steps

Now that your environment is set up, follow the Implementation Plan:

1. **Week 1**: Complete foundation (you're here!)
2. **Week 2**: Build authentication flow
3. **Week 3-4**: Implement user profiles
4. **Week 5-7**: Create rescue module
5. Continue following `IMPLEMENTATION_PLAN.md`

### Recommended Learning Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Supabase Flutter Quickstart](https://supabase.com/docs/guides/getting-started/tutorials/with-flutter)
- [Riverpod Documentation](https://riverpod.dev/)
- [Material Design 3](https://m3.material.io/)

---

## Troubleshooting

### Common Issues

**1. Flutter doctor shows issues**
```bash
flutter doctor -v  # See detailed issues
flutter doctor --android-licenses  # Accept Android licenses
```

**2. Supabase connection fails**
- Check `.env` file exists and has correct values
- Verify internet connection
- Check Supabase project is active

**3. Google Maps not showing**
- Verify API key is correct
- Check billing is enabled (won't be charged on free tier)
- Confirm APIs are enabled

**4. Build errors**
```bash
flutter clean
flutter pub get
flutter run
```

**5. Hot reload not working**
- Press 'R' in terminal for hot reload
- Press 'r' for hot restart
- If still not working, stop and `flutter run` again

---

## Getting Help

### Resources

- **Documentation**: See all `.md` files in this project
- **Code Samples**: Check `code_samples/` folder
- **Flutter Community**: [Flutter Discord](https://discord.gg/flutter)
- **Supabase Community**: [Supabase Discord](https://discord.supabase.com)
- **Stack Overflow**: Tag with `flutter`, `supabase`

### Before Asking for Help

1. Read the error message carefully
2. Search the error on Google/Stack Overflow
3. Check official documentation
4. Review relevant code samples in this project
5. Try `flutter clean` and rebuild

---

## Project Checklist

Use this to track your setup progress:

- [ ] Flutter installed and `flutter doctor` passes
- [ ] IDE (VS Code/Android Studio) set up with plugins
- [ ] Git initialized and `.gitignore` configured
- [ ] Supabase project created and configured
- [ ] Firebase project created (for notifications)
- [ ] Google Maps API keys obtained
- [ ] `.env` file created with all keys
- [ ] Dependencies installed (`flutter pub get`)
- [ ] Project structure created (folders)
- [ ] App runs on emulator/device
- [ ] Supabase connection tested successfully
- [ ] Ready to start development! 🎉

---

## Security Reminders

⚠️ **NEVER commit these to Git**:
- `.env` file
- API keys
- Database passwords
- Firebase config files (if they contain secrets)

✅ **Always**:
- Add secrets to `.gitignore`
- Use environment variables
- Enable Row Level Security in Supabase
- Test security policies

---

## You're Ready! 🚀

Your development environment is set up. Time to build something amazing and help animals in need!

Start with Week 2 of the Implementation Plan: **Authentication Flow**

**Remember**: 
- Build incrementally
- Test frequently
- Commit often
- Ask for help when stuck
- Celebrate small wins

**Most importantly**: Have fun and know you're building something that matters! 🐾

---

*For detailed implementation guidance, see `IMPLEMENTATION_PLAN.md`*  
*For code examples, check `code_samples/` folder*  
*For architecture details, read `ARCHITECTURE.md`*
