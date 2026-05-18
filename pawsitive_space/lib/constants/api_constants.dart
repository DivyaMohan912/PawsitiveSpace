/// API and service configuration constants
/// Replace placeholder values with your actual keys
class ApiConstants {
  ApiConstants._();

  // Supabase
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'YOUR_SUPABASE_URL',
  );
  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'YOUR_SUPABASE_ANON_KEY',
  );

  // Google Maps (add when integrating maps)
  static const String googleMapsApiKey = String.fromEnvironment(
    'GOOGLE_MAPS_API_KEY',
    defaultValue: 'YOUR_GOOGLE_MAPS_KEY',
  );

  // Storage Buckets
  static const String rescuePhotosBucket = 'rescue-photos';
  static const String animalPhotosBucket = 'animal-photos';
  static const String profilePhotosBucket = 'profile-photos';
  static const String campaignPhotosBucket = 'campaign-photos';

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 50;

  // Timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Image Limits
  static const int maxImageSizeBytes = 5 * 1024 * 1024; // 5MB
  static const int maxImagesPerRescue = 5;
  static const int imageQuality = 80;
  static const double imageMaxWidth = 1920;
  static const double imageMaxHeight = 1080;
}
