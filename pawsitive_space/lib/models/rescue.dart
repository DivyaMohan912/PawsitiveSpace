import 'package:equatable/equatable.dart';

/// Represents a rescue report in the system
class Rescue extends Equatable {
  final String id;
  final String? animalId;
  final String reporterId;
  final double latitude;
  final double longitude;
  final String? address;
  final String description;
  final UrgencyLevel urgency;
  final RescueStatus status;
  final String? claimedBy;
  final List<String> photos;
  final List<String> videos;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? closedAt;

  const Rescue({
    required this.id,
    this.animalId,
    required this.reporterId,
    required this.latitude,
    required this.longitude,
    this.address,
    required this.description,
    required this.urgency,
    required this.status,
    this.claimedBy,
    this.photos = const [],
    this.videos = const [],
    required this.createdAt,
    required this.updatedAt,
    this.closedAt,
  });

  factory Rescue.fromJson(Map<String, dynamic> json) {
    return Rescue(
      id: json['id'] as String,
      animalId: json['animal_id'] as String?,
      reporterId: json['reporter_id'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      address: json['address'] as String?,
      description: json['description'] as String,
      urgency: UrgencyLevel.fromString(json['urgency_level'] as String),
      status: RescueStatus.fromString(json['status'] as String),
      claimedBy: json['claimed_by'] as String?,
      photos: (json['photos'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      videos: (json['videos'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      closedAt: json['closed_at'] != null
          ? DateTime.parse(json['closed_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'animal_id': animalId,
      'reporter_id': reporterId,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'description': description,
      'urgency_level': urgency.value,
      'status': status.value,
      'claimed_by': claimedBy,
      'photos': photos,
      'videos': videos,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'closed_at': closedAt?.toIso8601String(),
    };
  }

  bool get isActive =>
      status != RescueStatus.closed && status != RescueStatus.rescued;

  @override
  List<Object?> get props => [
        id, animalId, reporterId, latitude, longitude, address,
        description, urgency, status, claimedBy, photos, videos,
        createdAt, updatedAt, closedAt,
      ];
}

enum UrgencyLevel {
  low('low'),
  medium('medium'),
  high('high'),
  critical('critical');

  final String value;
  const UrgencyLevel(this.value);

  static UrgencyLevel fromString(String value) {
    return UrgencyLevel.values.firstWhere(
      (level) => level.value == value,
      orElse: () => UrgencyLevel.medium,
    );
  }

  String get displayName {
    switch (this) {
      case UrgencyLevel.low:
        return 'Low';
      case UrgencyLevel.medium:
        return 'Medium';
      case UrgencyLevel.high:
        return 'High';
      case UrgencyLevel.critical:
        return 'Critical';
    }
  }
}

enum RescueStatus {
  open('open'),
  claimed('claimed'),
  enRoute('en_route'),
  rescued('rescued'),
  closed('closed');

  final String value;
  const RescueStatus(this.value);

  static RescueStatus fromString(String value) {
    return RescueStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => RescueStatus.open,
    );
  }

  String get displayName {
    switch (this) {
      case RescueStatus.open:
        return 'Open';
      case RescueStatus.claimed:
        return 'Claimed';
      case RescueStatus.enRoute:
        return 'En Route';
      case RescueStatus.rescued:
        return 'Rescued';
      case RescueStatus.closed:
        return 'Closed';
    }
  }
}
