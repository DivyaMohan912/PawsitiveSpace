// User Model
// Represents a user in the PawsitiveSpace app

import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String email;
  final String? phone;
  final String? fullName;
  final String? bio;
  final double? latitude;
  final double? longitude;
  final String? city;
  final String? country;
  final List<String> interests; // rescue, fostering, adoption, etc.
  final int trustScore;
  final DateTime volunteerSince;
  final bool isVerified;
  final bool isLawyer;
  final String? lawyerExpertise;
  final bool anonymousMode;
  final String? profilePictureUrl;
  final DateTime createdAt;
  final DateTime updatedAt;

  const User({
    required this.id,
    required this.email,
    this.phone,
    this.fullName,
    this.bio,
    this.latitude,
    this.longitude,
    this.city,
    this.country,
    this.interests = const [],
    this.trustScore = 0,
    required this.volunteerSince,
    this.isVerified = false,
    this.isLawyer = false,
    this.lawyerExpertise,
    this.anonymousMode = false,
    this.profilePictureUrl,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      fullName: json['full_name'] as String?,
      bio: json['bio'] as String?,
      latitude: json['latitude'] as double?,
      longitude: json['longitude'] as double?,
      city: json['city'] as String?,
      country: json['country'] as String?,
      interests: (json['interests'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      trustScore: json['trust_score'] as int? ?? 0,
      volunteerSince: DateTime.parse(json['volunteer_since'] as String),
      isVerified: json['is_verified'] as bool? ?? false,
      isLawyer: json['is_lawyer'] as bool? ?? false,
      lawyerExpertise: json['lawyer_expertise'] as String?,
      anonymousMode: json['anonymous_mode'] as bool? ?? false,
      profilePictureUrl: json['profile_picture_url'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'phone': phone,
      'full_name': fullName,
      'bio': bio,
      'latitude': latitude,
      'longitude': longitude,
      'city': city,
      'country': country,
      'interests': interests,
      'trust_score': trustScore,
      'volunteer_since': volunteerSince.toIso8601String(),
      'is_verified': isVerified,
      'is_lawyer': isLawyer,
      'lawyer_expertise': lawyerExpertise,
      'anonymous_mode': anonymousMode,
      'profile_picture_url': profilePictureUrl,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  User copyWith({
    String? id,
    String? email,
    String? phone,
    String? fullName,
    String? bio,
    double? latitude,
    double? longitude,
    String? city,
    String? country,
    List<String>? interests,
    int? trustScore,
    DateTime? volunteerSince,
    bool? isVerified,
    bool? isLawyer,
    String? lawyerExpertise,
    bool? anonymousMode,
    String? profilePictureUrl,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      fullName: fullName ?? this.fullName,
      bio: bio ?? this.bio,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      city: city ?? this.city,
      country: country ?? this.country,
      interests: interests ?? this.interests,
      trustScore: trustScore ?? this.trustScore,
      volunteerSince: volunteerSince ?? this.volunteerSince,
      isVerified: isVerified ?? this.isVerified,
      isLawyer: isLawyer ?? this.isLawyer,
      lawyerExpertise: lawyerExpertise ?? this.lawyerExpertise,
      anonymousMode: anonymousMode ?? this.anonymousMode,
      profilePictureUrl: profilePictureUrl ?? this.profilePictureUrl,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        email,
        phone,
        fullName,
        bio,
        latitude,
        longitude,
        city,
        country,
        interests,
        trustScore,
        volunteerSince,
        isVerified,
        isLawyer,
        lawyerExpertise,
        anonymousMode,
        profilePictureUrl,
        createdAt,
        updatedAt,
      ];
}

// Animal Model
class Animal extends Equatable {
  final String id;
  final String? name;
  final String species; // dog, cat, bird, etc.
  final String? breed;
  final int? ageYears;
  final int? ageMonths;
  final String? gender;
  final String? size; // small, medium, large
  final String? description;
  final String? medicalNeeds;
  final String? temperament;
  final AnimalStatus status;
  final double? latitude;
  final double? longitude;
  final String? address;
  final List<String> photos;
  final List<String> videos;
  final String createdBy;
  final String? currentFoster;
  final String? adoptedBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Animal({
    required this.id,
    this.name,
    required this.species,
    this.breed,
    this.ageYears,
    this.ageMonths,
    this.gender,
    this.size,
    this.description,
    this.medicalNeeds,
    this.temperament,
    required this.status,
    this.latitude,
    this.longitude,
    this.address,
    this.photos = const [],
    this.videos = const [],
    required this.createdBy,
    this.currentFoster,
    this.adoptedBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Animal.fromJson(Map<String, dynamic> json) {
    return Animal(
      id: json['id'] as String,
      name: json['name'] as String?,
      species: json['species'] as String,
      breed: json['breed'] as String?,
      ageYears: json['age_years'] as int?,
      ageMonths: json['age_months'] as int?,
      gender: json['gender'] as String?,
      size: json['size'] as String?,
      description: json['description'] as String?,
      medicalNeeds: json['medical_needs'] as String?,
      temperament: json['temperament'] as String?,
      status: AnimalStatus.fromString(json['status'] as String),
      latitude: json['latitude'] as double?,
      longitude: json['longitude'] as double?,
      address: json['address'] as String?,
      photos: (json['photos'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      videos: (json['videos'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      createdBy: json['created_by'] as String,
      currentFoster: json['current_foster'] as String?,
      adoptedBy: json['adopted_by'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'species': species,
      'breed': breed,
      'age_years': ageYears,
      'age_months': ageMonths,
      'gender': gender,
      'size': size,
      'description': description,
      'medical_needs': medicalNeeds,
      'temperament': temperament,
      'status': status.value,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'photos': photos,
      'videos': videos,
      'created_by': createdBy,
      'current_foster': currentFoster,
      'adopted_by': adoptedBy,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [
        id,
        name,
        species,
        breed,
        ageYears,
        ageMonths,
        gender,
        size,
        description,
        medicalNeeds,
        temperament,
        status,
        latitude,
        longitude,
        address,
        photos,
        videos,
        createdBy,
        currentFoster,
        adoptedBy,
        createdAt,
        updatedAt,
      ];
}

enum AnimalStatus {
  rescueNeeded('rescue_needed'),
  fostering('fostering'),
  adoptable('adoptable'),
  adopted('adopted');

  final String value;
  const AnimalStatus(this.value);

  static AnimalStatus fromString(String value) {
    return AnimalStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => AnimalStatus.rescueNeeded,
    );
  }
}

// Rescue Model
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
      latitude: json['latitude'] as double,
      longitude: json['longitude'] as double,
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

  @override
  List<Object?> get props => [
        id,
        animalId,
        reporterId,
        latitude,
        longitude,
        address,
        description,
        urgency,
        status,
        claimedBy,
        photos,
        videos,
        createdAt,
        updatedAt,
        closedAt,
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
}
