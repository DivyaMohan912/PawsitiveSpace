import 'package:supabase_flutter/supabase_flutter.dart';
import '../constants/api_constants.dart';

/// Centralized Supabase client access
class SupabaseService {
  static SupabaseClient get client => Supabase.instance.client;

  static Future<void> initialize() async {
    await Supabase.initialize(
      url: ApiConstants.supabaseUrl,
      anonKey: ApiConstants.supabaseAnonKey,
    );
  }

  // Auth shortcuts
  static GoTrueClient get auth => client.auth;
  static String? get currentUserId => client.auth.currentUser?.id;
  static bool get isAuthenticated => client.auth.currentUser != null;

  // Table references
  static SupabaseQueryBuilder get users => client.from('users');
  static SupabaseQueryBuilder get animals => client.from('animals');
  static SupabaseQueryBuilder get rescues => client.from('rescues');
  static SupabaseQueryBuilder get rescueUpdates => client.from('rescue_updates');
  static SupabaseQueryBuilder get fosterApplications => client.from('foster_applications');
  static SupabaseQueryBuilder get adoptions => client.from('adoptions');
  static SupabaseQueryBuilder get donations => client.from('donations');
  static SupabaseQueryBuilder get donationCampaigns => client.from('donation_campaigns');
  static SupabaseQueryBuilder get harassmentReports => client.from('harassment_reports');
  static SupabaseQueryBuilder get communityPosts => client.from('community_posts');
  static SupabaseQueryBuilder get events => client.from('events');
  static SupabaseQueryBuilder get notifications => client.from('notifications');

  // Storage
  static SupabaseStorageClient get storage => client.storage;
}
