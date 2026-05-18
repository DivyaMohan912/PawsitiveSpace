import 'package:intl/intl.dart';
import 'package:timeago/timeago.dart' as timeago;

/// Date and time formatting utilities
class DateFormatter {
  DateFormatter._();

  /// "Jan 15, 2026"
  static String formatDate(DateTime date) {
    return DateFormat.yMMMd().format(date);
  }

  /// "3:45 PM"
  static String formatTime(DateTime date) {
    return DateFormat.jm().format(date);
  }

  /// "Jan 15, 2026 at 3:45 PM"
  static String formatDateTime(DateTime date) {
    return '${formatDate(date)} at ${formatTime(date)}';
  }

  /// "2 hours ago", "3 days ago"
  static String timeAgo(DateTime date) {
    return timeago.format(date);
  }

  /// "Jan 15"
  static String shortDate(DateTime date) {
    return DateFormat.MMMd().format(date);
  }
}
