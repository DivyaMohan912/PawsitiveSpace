import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'constants/app_theme.dart';
import 'constants/routes.dart';
import 'services/supabase_service.dart';

// Screens
import 'screens/auth/splash_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/rescue/report_rescue_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase
  await SupabaseService.initialize();

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
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.light,
      initialRoute: AppRoutes.splash,
      routes: {
        AppRoutes.splash: (context) => const SplashScreen(),
        AppRoutes.login: (context) => const LoginScreen(),
        AppRoutes.register: (context) => const RegisterScreen(),
        AppRoutes.home: (context) => const HomeScreen(),
        AppRoutes.reportRescue: (context) => const ReportRescueScreen(),
        // Additional routes will be added as screens are implemented:
        // AppRoutes.rescueMap: (context) => const RescueMapScreen(),
        // AppRoutes.animalList: (context) => const AnimalListScreen(),
        // AppRoutes.campaigns: (context) => const CampaignListScreen(),
        // AppRoutes.community: (context) => const CommunityHomeScreen(),
        // AppRoutes.profile: (context) => const ProfileScreen(),
      },
    );
  }
}
