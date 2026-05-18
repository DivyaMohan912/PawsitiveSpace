import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';
import '../models/user.dart';

/// Result wrapper for auth operations
class AuthResult {
  final bool success;
  final String? errorMessage;
  final AppUser? user;

  const AuthResult({
    required this.success,
    this.errorMessage,
    this.user,
  });

  factory AuthResult.error(String message) =>
      AuthResult(success: false, errorMessage: message);

  factory AuthResult.ok([AppUser? user]) =>
      AuthResult(success: true, user: user);
}

/// Handles all authentication operations
class AuthService {
  final _client = SupabaseService.client;

  /// Sign up with email and password
  Future<AuthResult> signUpWithEmail({
    required String email,
    required String password,
    required String fullName,
  }) async {
    try {
      final response = await _client.auth.signUp(
        email: email,
        password: password,
        data: {'full_name': fullName},
      );

      if (response.user == null) {
        return AuthResult.error('Sign up failed. Please try again.');
      }

      // Create user profile in the database
      final now = DateTime.now().toIso8601String();
      await SupabaseService.users.insert({
        'id': response.user!.id,
        'email': email,
        'full_name': fullName,
        'trust_score': 0,
        'volunteer_since': now,
        'is_verified': false,
        'anonymous_mode': false,
        'created_at': now,
        'updated_at': now,
      });

      return AuthResult.ok();
    } on AuthException catch (e) {
      return AuthResult.error(e.message);
    } catch (e) {
      return AuthResult.error('An unexpected error occurred: $e');
    }
  }

  /// Sign in with email and password
  Future<AuthResult> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _client.auth.signInWithPassword(
        email: email,
        password: password,
      );

      if (response.user == null) {
        return AuthResult.error('Login failed. Check your credentials.');
      }

      return AuthResult.ok();
    } on AuthException catch (e) {
      return AuthResult.error(e.message);
    } catch (e) {
      return AuthResult.error('An unexpected error occurred: $e');
    }
  }

  /// Sign in with Google OAuth
  Future<AuthResult> signInWithGoogle() async {
    try {
      await _client.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: 'io.supabase.pawsitivespace://login-callback/',
      );
      return AuthResult.ok();
    } on AuthException catch (e) {
      return AuthResult.error(e.message);
    } catch (e) {
      return AuthResult.error('Google sign-in failed: $e');
    }
  }

  /// Send password reset email
  Future<AuthResult> resetPassword(String email) async {
    try {
      await _client.auth.resetPasswordForEmail(email);
      return AuthResult.ok();
    } on AuthException catch (e) {
      return AuthResult.error(e.message);
    } catch (e) {
      return AuthResult.error('Failed to send reset email: $e');
    }
  }

  /// Sign out
  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  /// Get the current user's profile from the database
  Future<AppUser?> getCurrentUserProfile() async {
    final userId = SupabaseService.currentUserId;
    if (userId == null) return null;

    try {
      final data =
          await SupabaseService.users.select().eq('id', userId).single();
      return AppUser.fromJson(data);
    } catch (e) {
      return null;
    }
  }

  /// Check if user is authenticated
  bool get isAuthenticated => SupabaseService.isAuthenticated;

  /// Listen for auth state changes
  Stream<AuthState> get onAuthStateChange =>
      _client.auth.onAuthStateChange;
}
