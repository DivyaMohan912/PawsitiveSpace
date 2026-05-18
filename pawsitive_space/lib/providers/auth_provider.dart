import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/auth_service.dart';
import '../models/user.dart';

/// AuthService singleton provider
final authServiceProvider = Provider<AuthService>((ref) => AuthService());

/// Stream provider for auth state changes
final authStateProvider = StreamProvider<AuthState>((ref) {
  return ref.read(authServiceProvider).onAuthStateChange;
});

/// Current user profile provider
final currentUserProvider = FutureProvider<AppUser?>((ref) async {
  final authService = ref.read(authServiceProvider);
  return authService.getCurrentUserProfile();
});

/// Whether the user is authenticated
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.read(authServiceProvider).isAuthenticated;
});

