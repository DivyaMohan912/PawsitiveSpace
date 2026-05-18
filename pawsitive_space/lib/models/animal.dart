import 'package:equatable/equatable.dart';

/// Represents an animal in the system
class Animal extends Equatable {
  final String id;
  final String? name;
  final String species;
  final String? breed;
  final int? ageYears;
  final int? ageMonths;
  final String? gender;
  final String? size;
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
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
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

  String get displayAge {
    if (ageYears != null && ageMonths != null) {
      if (ageYears! > 0) return '$ageYears yr${ageYears! > 1 ? 's' : ''}';
      return '$ageMonths mo';
    }
    return 'Unknown';
  }

  @override
  List<Object?> get props => [
        id, name, species, breed, ageYears, ageMonths, gender,
        size, description, medicalNeeds, temperament, status,
        latitude, longitude, address, photos, videos,
        createdBy, currentFoster, adoptedBy, createdAt, updatedAt,
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

  String get displayName {
    switch (this) {
      case AnimalStatus.rescueNeeded:
        return 'Rescue Needed';
      case AnimalStatus.fostering:
        return 'In Foster Care';
      case AnimalStatus.adoptable:
        return 'Available for Adoption';
      case AnimalStatus.adopted:
        return 'Adopted';
    }
  }
}
