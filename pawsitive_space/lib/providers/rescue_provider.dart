import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/rescue_service.dart';
import '../models/rescue.dart';

/// RescueService singleton provider
final rescueServiceProvider = Provider<RescueService>((ref) => RescueService());

/// Active rescues list provider
final activeRescuesProvider = FutureProvider<List<Rescue>>((ref) async {
  return ref.read(rescueServiceProvider).getActiveRescues();
});

/// Current user's rescue reports
final myRescuesProvider = FutureProvider<List<Rescue>>((ref) async {
  return ref.read(rescueServiceProvider).getMyRescues();
});

/// Single rescue by ID
final rescueByIdProvider =
    FutureProvider.family<Rescue?, String>((ref, id) async {
  return ref.read(rescueServiceProvider).getRescueById(id);
});
