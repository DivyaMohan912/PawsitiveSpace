/// PawsitiveSpace Named Routes
class AppRoutes {
  AppRoutes._();

  // Auth
  static const String splash = '/';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String register = '/register';
  static const String profileSetup = '/profile-setup';

  // Main
  static const String home = '/home';

  // Rescue
  static const String rescueMap = '/rescue-map';
  static const String reportRescue = '/report-rescue';
  static const String rescueDetails = '/rescue-details';

  // Foster & Adoption
  static const String animalList = '/animal-list';
  static const String animalDetails = '/animal-details';
  static const String fosterApplication = '/foster-application';
  static const String adoptionApplication = '/adoption-application';

  // Donations
  static const String campaigns = '/campaigns';
  static const String campaignDetails = '/campaign-details';
  static const String createCampaign = '/create-campaign';
  static const String donate = '/donate';

  // Safety
  static const String reportHarassment = '/report-harassment';
  static const String lawyerDirectory = '/lawyer-directory';

  // Community
  static const String community = '/community';
  static const String createPost = '/create-post';
  static const String events = '/events';
  static const String createEvent = '/create-event';

  // Profile
  static const String profile = '/profile';
  static const String editProfile = '/edit-profile';
  static const String settings = '/settings';

  // Notifications
  static const String notifications = '/notifications';
}
