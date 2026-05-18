import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';
import '../models/rescue.dart';
import '../constants/api_constants.dart';

/// Handles rescue CRUD operations and photo uploads
class RescueService {
  /// Create a new rescue report
  Future<Rescue?> createRescue({
    required String description,
    required double latitude,
    required double longitude,
    String? address,
    required UrgencyLevel urgency,
    List<String> photoFilePaths = const [],
  }) async {
    final userId = SupabaseService.currentUserId;
    if (userId == null) throw Exception('User not authenticated');

    try {
      // Upload photos first
      final photoUrls = <String>[];
      for (final path in photoFilePaths) {
        final fileName =
            '${userId}_${DateTime.now().millisecondsSinceEpoch}_${photoUrls.length}.jpg';
        await SupabaseService.storage
            .from(ApiConstants.rescuePhotosBucket)
            .upload(fileName, path as dynamic);

        final url = SupabaseService.storage
            .from(ApiConstants.rescuePhotosBucket)
            .getPublicUrl(fileName);
        photoUrls.add(url);
      }

      final now = DateTime.now().toIso8601String();
      final data = await SupabaseService.rescues.insert({
        'reporter_id': userId,
        'latitude': latitude,
        'longitude': longitude,
        'address': address,
        'description': description,
        'urgency_level': urgency.value,
        'status': RescueStatus.open.value,
        'photos': photoUrls,
        'created_at': now,
        'updated_at': now,
      }).select().single();

      return Rescue.fromJson(data);
    } catch (e) {
      throw Exception('Failed to create rescue: $e');
    }
  }

  /// Get all active rescues
  Future<List<Rescue>> getActiveRescues() async {
    try {
      final data = await SupabaseService.rescues
          .select()
          .inFilter('status', ['open', 'claimed', 'en_route'])
          .order('created_at', ascending: false);

      return (data as List).map((json) => Rescue.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to fetch rescues: $e');
    }
  }

  /// Get a single rescue by ID
  Future<Rescue?> getRescueById(String id) async {
    try {
      final data =
          await SupabaseService.rescues.select().eq('id', id).single();
      return Rescue.fromJson(data);
    } catch (e) {
      return null;
    }
  }

  /// Claim a rescue
  Future<bool> claimRescue(String rescueId) async {
    final userId = SupabaseService.currentUserId;
    if (userId == null) return false;

    try {
      await SupabaseService.rescues.update({
        'claimed_by': userId,
        'status': RescueStatus.claimed.value,
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', rescueId);
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Update rescue status
  Future<bool> updateRescueStatus(
    String rescueId,
    RescueStatus newStatus,
  ) async {
    try {
      final updates = <String, dynamic>{
        'status': newStatus.value,
        'updated_at': DateTime.now().toIso8601String(),
      };
      if (newStatus == RescueStatus.closed ||
          newStatus == RescueStatus.rescued) {
        updates['closed_at'] = DateTime.now().toIso8601String();
      }

      await SupabaseService.rescues.update(updates).eq('id', rescueId);
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Get rescues reported by current user
  Future<List<Rescue>> getMyRescues() async {
    final userId = SupabaseService.currentUserId;
    if (userId == null) return [];

    try {
      final data = await SupabaseService.rescues
          .select()
          .eq('reporter_id', userId)
          .order('created_at', ascending: false);

      return (data as List).map((json) => Rescue.fromJson(json)).toList();
    } catch (e) {
      return [];
    }
  }

  /// Subscribe to real-time rescue updates
  Stream<List<Map<String, dynamic>>> subscribeToRescues() {
    return SupabaseService.client
        .from('rescues')
        .stream(primaryKey: ['id'])
        .inFilter('status', ['open', 'claimed', 'en_route'])
        .order('created_at');
  }
}

