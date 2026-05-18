// Report Rescue Screen
// Complete implementation with photo upload, location, and form validation

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// Rescue service provider
final rescueServiceProvider = Provider<RescueService>((ref) {
  return RescueService(Supabase.instance.client);
});

class RescueService {
  final SupabaseClient _supabase;

  RescueService(this._supabase);

  Future<String?> createRescue({
    required double latitude,
    required double longitude,
    required String description,
    required String urgencyLevel,
    required String animalType,
    List<File> photos = const [],
    String? address,
  }) async {
    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) throw Exception('User not authenticated');

      // Upload photos
      final photoUrls = <String>[];
      for (final photo in photos) {
        final fileName = '${DateTime.now().millisecondsSinceEpoch}_${photo.path.split('/').last}';
        final path = 'rescues/$userId/$fileName';
        
        await _supabase.storage.from('photos').upload(
          path,
          photo,
          fileOptions: const FileOptions(
            contentType: 'image/jpeg',
          ),
        );

        final url = _supabase.storage.from('photos').getPublicUrl(path);
        photoUrls.add(url);
      }

      // Create rescue record
      final response = await _supabase.from('rescues').insert({
        'reporter_id': userId,
        'latitude': latitude,
        'longitude': longitude,
        'address': address,
        'description': description,
        'urgency_level': urgencyLevel,
        'status': 'open',
        'photos': photoUrls,
      }).select().single();

      // Notify nearby volunteers
      await _notifyNearbyVolunteers(latitude, longitude, response['id']);

      return response['id'] as String;
    } catch (e) {
      print('Error creating rescue: $e');
      return null;
    }
  }

  Future<void> _notifyNearbyVolunteers(
    double lat,
    double lng,
    String rescueId,
  ) async {
    // Call edge function to find and notify nearby volunteers
    await _supabase.functions.invoke(
      'notify-nearby-volunteers',
      body: {
        'rescue_id': rescueId,
        'latitude': lat,
        'longitude': lng,
        'radius_km': 10,
      },
    );
  }
}

class ReportRescueScreen extends ConsumerStatefulWidget {
  const ReportRescueScreen({super.key});

  @override
  ConsumerState<ReportRescueScreen> createState() => _ReportRescueScreenState();
}

class _ReportRescueScreenState extends ConsumerState<ReportRescueScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  final List<File> _selectedImages = [];
  final ImagePicker _picker = ImagePicker();
  
  Position? _currentPosition;
  String? _address;
  String _urgencyLevel = 'medium';
  String _animalType = 'dog';
  bool _isLoadingLocation = false;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    setState(() => _isLoadingLocation = true);

    try {
      // Check location permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Location permissions denied');
        }
      }

      // Get current position
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // Get address from coordinates
      final placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );

      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        setState(() {
          _currentPosition = position;
          _address = '${place.street}, ${place.locality}, ${place.country}';
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to get location: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() => _isLoadingLocation = false);
    }
  }

  Future<void> _pickImages() async {
    try {
      final List<XFile> images = await _picker.pickMultiImage(
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (images.length + _selectedImages.length > 5) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Maximum 5 photos allowed'),
            backgroundColor: Colors.orange,
          ),
        );
        return;
      }

      setState(() {
        _selectedImages.addAll(images.map((img) => File(img.path)));
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to pick images: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _submitReport() async {
    if (!_formKey.currentState!.validate()) return;
    if (_currentPosition == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please wait for location to be detected'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final rescueService = ref.read(rescueServiceProvider);
    final rescueId = await rescueService.createRescue(
      latitude: _currentPosition!.latitude,
      longitude: _currentPosition!.longitude,
      description: _descriptionController.text.trim(),
      urgencyLevel: _urgencyLevel,
      animalType: _animalType,
      photos: _selectedImages,
      address: _address,
    );

    setState(() => _isSubmitting = false);

    if (!mounted) return;

    if (rescueId != null) {
      // Show success screen
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (context) => RescueSubmittedScreen(rescueId: rescueId),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to submit rescue report'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Report Rescue'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Progress indicator
            Row(
              children: [
                const Icon(Icons.warning_amber_rounded, color: Colors.orange),
                const SizedBox(width: 8),
                const Text(
                  'Step 1 of 2',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Photo upload section
            const Text(
              'Photos (optional)',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 100,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  // Add photo button
                  InkWell(
                    onTap: _pickImages,
                    child: Container(
                      width: 100,
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.add_a_photo, size: 32),
                          SizedBox(height: 4),
                          Text('Add Photo'),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Selected photos
                  ..._selectedImages.map((image) => Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.file(
                                image,
                                width: 100,
                                height: 100,
                                fit: BoxFit.cover,
                              ),
                            ),
                            Positioned(
                              top: 4,
                              right: 4,
                              child: CircleAvatar(
                                radius: 12,
                                backgroundColor: Colors.red,
                                child: IconButton(
                                  padding: EdgeInsets.zero,
                                  icon: const Icon(
                                    Icons.close,
                                    size: 16,
                                    color: Colors.white,
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _selectedImages.remove(image);
                                    });
                                  },
                                ),
                              ),
                            ),
                          ],
                        ),
                      )),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Location section
            const Text(
              'Location',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: _isLoadingLocation
                  ? const Row(
                      children: [
                        SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                        SizedBox(width: 12),
                        Text('Getting location...'),
                      ],
                    )
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.location_on, color: Colors.red),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _address ?? 'Location not available',
                                style: const TextStyle(fontSize: 14),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        TextButton.icon(
                          onPressed: _getCurrentLocation,
                          icon: const Icon(Icons.refresh),
                          label: const Text('Refresh Location'),
                        ),
                      ],
                    ),
            ),
            const SizedBox(height: 24),

            // Description
            TextFormField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Description *',
                hintText: 'Describe the situation...',
                helperText: 'Be as detailed as possible',
              ),
              maxLines: 4,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please provide a description';
                }
                if (value.trim().length < 10) {
                  return 'Description must be at least 10 characters';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),

            // Urgency level
            const Text(
              'Urgency Level *',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [
                _buildUrgencyChip('low', 'Low', Colors.green),
                _buildUrgencyChip('medium', 'Medium', Colors.orange),
                _buildUrgencyChip('high', 'High', Colors.red),
                _buildUrgencyChip('critical', 'Critical', Colors.purple),
              ],
            ),
            const SizedBox(height: 24),

            // Animal type
            const Text(
              'Animal Type',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _animalType,
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.pets),
              ),
              items: const [
                DropdownMenuItem(value: 'dog', child: Text('Dog')),
                DropdownMenuItem(value: 'cat', child: Text('Cat')),
                DropdownMenuItem(value: 'bird', child: Text('Bird')),
                DropdownMenuItem(value: 'other', child: Text('Other')),
              ],
              onChanged: (value) {
                if (value != null) {
                  setState(() => _animalType = value);
                }
              },
            ),
            const SizedBox(height: 32),

            // Submit button
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submitReport,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: const Color(0xFF4CAF50),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : const Text(
                      'Submit Report',
                      style: TextStyle(fontSize: 16),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUrgencyChip(String value, String label, Color color) {
    final isSelected = _urgencyLevel == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() => _urgencyLevel = value);
      },
      selectedColor: color.withOpacity(0.3),
      backgroundColor: Colors.grey[200],
      labelStyle: TextStyle(
        color: isSelected ? color : Colors.black,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
      avatar: isSelected
          ? Icon(Icons.check_circle, color: color, size: 18)
          : null,
    );
  }
}

// Success screen after submission
class RescueSubmittedScreen extends StatelessWidget {
  final String rescueId;

  const RescueSubmittedScreen({super.key, required this.rescueId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.check_circle,
                size: 100,
                color: Colors.green,
              ),
              const SizedBox(height: 24),
              const Text(
                'Report Submitted!',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              const Text(
                "We've notified nearby rescuers. You'll receive updates as volunteers respond.",
                style: TextStyle(fontSize: 16, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pushNamedAndRemoveUntil(
                    '/home',
                    (route) => false,
                  );
                },
                child: const Text('Back to Home'),
              ),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: () {
                  // Navigate to rescue details
                  Navigator.of(context).pushNamed(
                    '/rescue-details',
                    arguments: rescueId,
                  );
                },
                child: const Text('Track This Rescue'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
