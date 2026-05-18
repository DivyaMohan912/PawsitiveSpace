import 'package:equatable/equatable.dart';

/// Represents a user in the PawsitiveSpace platform
class AppUser extends Equatable {
  final String id;
  final String email;
  final String? phone;
  final String? fullName;
  final String? bio;
  final double? latitude;
  final double? longitude;
  final String? city;
  final String? country;
  final List<String> interests;
  final int trustScore;
  final DateTime volunteerSince;
  final bool isVerified;
  final bool isLawyer;
  final String? lawyerExpertise;
  final bool anonymousMode;
  final String? profilePictureUrl;
  final DateTime createdAt;
  final DateTime updatedAt;

  const AppUser({
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

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      fullName: json['full_name'] as String?,
      bio: json['bio'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
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

  AppUser copyWith({
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
    return AppUser(
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
        id, email, phone, fullName, bio, latitude, longitude,
        city, country, interests, trustScore, volunteerSince,
        isVerified, isLawyer, lawyerExpertise, anonymousMode,
        profilePictureUrl, createdAt, updatedAt,
      ];
}
