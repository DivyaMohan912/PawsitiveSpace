import 'package:flutter/material.dart';
import '../../constants/colors.dart';
import '../../constants/routes.dart';
import '../../models/rescue.dart';
import '../../widgets/common/custom_button.dart';
import '../../widgets/common/custom_text_field.dart';

/// Multi-step form for reporting an animal rescue
class ReportRescueScreen extends StatefulWidget {
  const ReportRescueScreen({super.key});

  @override
  State<ReportRescueScreen> createState() => _ReportRescueScreenState();
}

class _ReportRescueScreenState extends State<ReportRescueScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  final _addressController = TextEditingController();
  UrgencyLevel _selectedUrgency = UrgencyLevel.medium;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _descriptionController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _submitReport() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    // TODO: Integrate with RescueService to submit to Supabase
    await Future.delayed(const Duration(seconds: 2)); // Simulated

    setState(() => _isSubmitting = false);

    if (!mounted) return;

    // Show success
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.check_circle, color: AppColors.success, size: 48),
        title: const Text('Rescue Reported!'),
        content: const Text(
          'Your rescue report has been submitted. Nearby volunteers will be notified.',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pop();
            },
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Report Rescue'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Text(
                  'Report an Animal in Need',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Provide as much detail as possible to help volunteers respond quickly.',
                  style: TextStyle(color: AppColors.textSecondary),
                ),
                const SizedBox(height: 24),

                // Description
                CustomTextField(
                  controller: _descriptionController,
                  labelText: 'Description',
                  hintText: 'Describe the animal and situation...',
                  maxLines: 4,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please describe the situation';
                    }
                    if (value.length < 20) {
                      return 'Please provide more detail (at least 20 characters)';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Location
                CustomTextField(
                  controller: _addressController,
                  labelText: 'Location / Address',
                  hintText: 'Where is the animal?',
                  prefixIcon: Icons.location_on_outlined,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter the location';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: TextButton.icon(
                    onPressed: () {
                      // TODO: Get current GPS location
                      _addressController.text = 'Using current location...';
                    },
                    icon: const Icon(Icons.my_location, size: 18),
                    label: const Text('Use My Location'),
                  ),
                ),
                const SizedBox(height: 20),

                // Urgency
                Text(
                  'Urgency Level',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  children: UrgencyLevel.values.map((level) {
                    final isSelected = _selectedUrgency == level;
                    final color = _urgencyColor(level);
                    return ChoiceChip(
                      label: Text(level.displayName),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected) {
                          setState(() => _selectedUrgency = level);
                        }
                      },
                      selectedColor: color.withOpacity(0.2),
                      labelStyle: TextStyle(
                        color: isSelected ? color : AppColors.textSecondary,
                        fontWeight:
                            isSelected ? FontWeight.w600 : FontWeight.normal,
                      ),
                      avatar: isSelected
                          ? Icon(Icons.circle, color: color, size: 12)
                          : null,
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),

                // Photos
                Text(
                  'Photos (optional)',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 12),
                GestureDetector(
                  onTap: () {
                    // TODO: Open image picker
                  },
                  child: Container(
                    height: 120,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: AppColors.divider,
                        style: BorderStyle.solid,
                      ),
                      borderRadius: BorderRadius.circular(12),
                      color: Colors.grey[50],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.add_a_photo_outlined,
                            size: 36, color: AppColors.textHint),
                        const SizedBox(height: 8),
                        Text(
                          'Tap to add photos',
                          style: TextStyle(color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // Submit
                CustomButton(
                  text: 'Submit Rescue Report',
                  onPressed: _submitReport,
                  isLoading: _isSubmitting,
                  icon: Icons.send,
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _urgencyColor(UrgencyLevel level) {
    switch (level) {
      case UrgencyLevel.low:
        return AppColors.urgencyLow;
      case UrgencyLevel.medium:
        return AppColors.urgencyMedium;
      case UrgencyLevel.high:
        return AppColors.urgencyHigh;
      case UrgencyLevel.critical:
        return AppColors.urgencyCritical;
    }
  }
}

