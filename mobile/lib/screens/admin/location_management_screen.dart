import 'package:flutter/material.dart';
import '../../services/location_crud_service.dart';
import '../../services/location_service.dart' as gps;
import '../../utils/error_handler.dart';

class LocationManagementScreen extends StatefulWidget {
  const LocationManagementScreen({super.key});

  @override
  State<LocationManagementScreen> createState() =>
      _LocationManagementScreenState();
}

class _LocationManagementScreenState extends State<LocationManagementScreen> {
  final _service = LocationService();
  final _formKey = GlobalKey<FormState>();

  List<Map<String, dynamic>> _locations = [];
  bool _loading = true;
  String? _errorMessage;
  bool _isModalOpen = false;
  int? _editingId;
  bool _gettingGps = false;

  final _nameController = TextEditingController();
  final _latController = TextEditingController();
  final _lngController = TextEditingController();
  final _radiusController = TextEditingController(text: '100');
  final _roomNoController = TextEditingController();
  final _floorController = TextEditingController();
  final _capacityController = TextEditingController();
  final _addressController = TextEditingController();
  String _selectedRoomType = 'classroom';

  final List<Map<String, String>> _roomTypes = [
    {'label': 'Classroom', 'value': 'classroom'},
    {'label': 'Lab', 'value': 'lab'},
    {'label': 'Auditorium', 'value': 'auditorium'},
    {'label': 'Seminar Hall', 'value': 'seminar_hall'},
    {'label': 'Workshop', 'value': 'workshop'},
    {'label': 'Library', 'value': 'library'},
    {'label': 'Other', 'value': 'other'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchLocations();
  }

  Future<void> _fetchLocations() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });
    try {
      final response = await _service.getLocations(limit: 500);
      setState(() {
        _locations = List<Map<String, dynamic>>.from(response.data ?? []);
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = ErrorHandler.formatError(e);
        _loading = false;
      });
    }
  }

  void _openCreateModal() {
    setState(() {
      _editingId = null;
      _nameController.clear();
      _latController.clear();
      _lngController.clear();
      _radiusController.text = '100';
      _roomNoController.clear();
      _floorController.clear();
      _capacityController.clear();
      _addressController.clear();
      _selectedRoomType = 'classroom';
      _isModalOpen = true;
    });
  }

  void _openEditModal(Map<String, dynamic> loc) {
    setState(() {
      _editingId = loc['id'];
      _nameController.text = loc['name'] ?? '';
      _latController.text = loc['latitude']?.toString() ?? '';
      _lngController.text = loc['longitude']?.toString() ?? '';
      _radiusController.text = (loc['radius'] ?? 100).toString();
      _roomNoController.text = loc['room_no'] ?? '';
      _floorController.text = loc['floor'] ?? '';
      _capacityController.text = loc['capacity']?.toString() ?? '';
      _addressController.text = loc['address'] ?? '';
      _selectedRoomType = loc['room_type'] ?? 'classroom';
      _isModalOpen = true;
    });
  }

  void _closeModal() {
    setState(() {
      _isModalOpen = false;
      _editingId = null;
      _gettingGps = false;
    });
  }

  Future<void> _getCurrentLocation() async {
    setState(() => _gettingGps = true);

    try {
      final locationService = gps.LocationService();
      final position = await locationService.getCurrentLocation();

      if (!mounted) return;

      if (position != null) {
        setState(() {
          _latController.text = position.latitude.toStringAsFixed(6);
          _lngController.text = position.longitude.toStringAsFixed(6);
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Location fetched from GPS')),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                'Could not get location. Please enable GPS and location permissions.',
              ),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      setState(() => _gettingGps = false);
    }
  }

  Future<void> _saveLocation() async {
    if (!_formKey.currentState!.validate()) return;

    final lat = double.tryParse(_latController.text);
    final lng = double.tryParse(_lngController.text);
    final radius = int.tryParse(_radiusController.text) ?? 100;
    final capacity = int.tryParse(_capacityController.text);

    if (lat == null || lng == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Invalid coordinates')));
      return;
    }

    try {
      if (_editingId != null) {
        await _service.updateLocation(
          _editingId!,
          name: _nameController.text.trim(),
          latitude: lat,
          longitude: lng,
          radius: radius,
          roomNo: _roomNoController.text.trim(),
          floor: _floorController.text.trim(),
          roomType: _selectedRoomType,
          capacity: capacity,
          address: _addressController.text.trim(),
        );
      } else {
        await _service.createLocation(
          name: _nameController.text.trim(),
          latitude: lat,
          longitude: lng,
          radius: radius,
          roomNo: _roomNoController.text.trim(),
          floor: _floorController.text.trim(),
          roomType: _selectedRoomType,
          capacity: capacity,
          address: _addressController.text.trim(),
        );
      }
      _closeModal();
      _fetchLocations();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              _editingId != null
                  ? 'Location updated successfully'
                  : 'Location created successfully',
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${ErrorHandler.formatError(e)}')),
        );
      }
    }
  }

  Future<void> _deleteLocation(int id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Location'),
        content: const Text(
          'Are you sure you want to delete this location? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      await _service.deleteLocation(id);
      _fetchLocations();
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Location deleted')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${ErrorHandler.formatError(e)}')),
        );
      }
    }
  }

  IconData _getRoomTypeIcon(String? roomType) {
    switch (roomType) {
      case 'classroom':
        return Icons.school;
      case 'lab':
        return Icons.computer;
      case 'auditorium':
        return Icons.meeting_room;
      case 'seminar_hall':
        return Icons.groups;
      case 'workshop':
        return Icons.construction;
      case 'library':
        return Icons.local_library;
      default:
        return Icons.room;
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Locations'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchLocations,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(_errorMessage!, style: TextStyle(color: colors.error)),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _fetchLocations,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            )
          : _locations.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.location_off, size: 64, color: colors.outline),
                  const SizedBox(height: 16),
                  const Text('No locations found'),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: _openCreateModal,
                    icon: const Icon(Icons.add),
                    label: const Text('Add Location'),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _fetchLocations,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _locations.length,
                itemBuilder: (context, index) {
                  final loc = _locations[index];
                  return Card(
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: colors.primaryContainer,
                        child: Icon(
                          _getRoomTypeIcon(loc['room_type']),
                          color: colors.primary,
                        ),
                      ),
                      title: Text(
                        loc['name'] ?? 'Unknown',
                        overflow: TextOverflow.ellipsis,
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (loc['room_no'] != null)
                            Text(
                              'Room: ${loc['room_no']}',
                              style: const TextStyle(fontSize: 12),
                              overflow: TextOverflow.ellipsis,
                            ),
                          if (loc['floor'] != null)
                            Text(
                              'Floor: ${loc['floor']}',
                              style: const TextStyle(fontSize: 12),
                            ),
                          Row(
                            children: [
                              Icon(
                                Icons.my_location,
                                size: 12,
                                color: colors.outline,
                              ),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  '${loc['latitude']?.toStringAsFixed(4)}, ${loc['longitude']?.toStringAsFixed(4)}',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: colors.outline,
                                    fontFamily: 'monospace',
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      trailing: PopupMenuButton<String>(
                        onSelected: (value) {
                          if (value == 'edit') {
                            _openEditModal(loc);
                          } else if (value == 'delete') {
                            _deleteLocation(loc['id']);
                          }
                        },
                        itemBuilder: (context) => [
                          const PopupMenuItem(
                            value: 'edit',
                            child: Row(
                              children: [
                                Icon(Icons.edit, size: 20),
                                SizedBox(width: 8),
                                Text('Edit'),
                              ],
                            ),
                          ),
                          PopupMenuItem(
                            value: 'delete',
                            child: Row(
                              children: [
                                Icon(
                                  Icons.delete,
                                  size: 20,
                                  color: colors.error,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Delete',
                                  style: TextStyle(color: colors.error),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      isThreeLine: true,
                    ),
                  );
                },
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _openCreateModal,
        tooltip: 'Add Location',
        child: const Icon(Icons.add_location),
      ),
      bottomSheet: _isModalOpen ? _buildModal(colors) : null,
    );
  }

  Widget _buildModal(ColorScheme colors) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.9,
      ),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Flexible(
                  child: Text(
                    _editingId != null ? 'Edit Location' : 'Add Location',
                    style: Theme.of(context).textTheme.titleLarge,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                IconButton(
                  onPressed: _closeModal,
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
          ),
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Location Name *',
                        border: OutlineInputBorder(),
                        hintText: 'e.g. Computer Lab A',
                        prefixIcon: Icon(Icons.label_outline),
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Name is required';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _latController,
                            decoration: const InputDecoration(
                              labelText: 'Latitude *',
                              border: OutlineInputBorder(),
                              hintText: 'e.g. 18.9320',
                              prefixIcon: Icon(Icons.north),
                            ),
                            keyboardType: const TextInputType.numberWithOptions(
                              decimal: true,
                              signed: true,
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Required';
                              }
                              final lat = double.tryParse(value);
                              if (lat == null || lat < -90 || lat > 90) {
                                return 'Invalid';
                              }
                              return null;
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextFormField(
                            controller: _lngController,
                            decoration: const InputDecoration(
                              labelText: 'Longitude *',
                              border: OutlineInputBorder(),
                              hintText: 'e.g. 72.8330',
                              prefixIcon: Icon(Icons.east),
                            ),
                            keyboardType: const TextInputType.numberWithOptions(
                              decimal: true,
                              signed: true,
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Required';
                              }
                              final lng = double.tryParse(value);
                              if (lng == null || lng < -180 || lng > 180) {
                                return 'Invalid';
                              }
                              return null;
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    OutlinedButton.icon(
                      onPressed: _gettingGps ? null : _getCurrentLocation,
                      icon: _gettingGps
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.my_location, size: 20),
                      label: Text(
                        _gettingGps
                            ? 'Getting Location...'
                            : 'Get Current Location from GPS',
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _radiusController,
                            decoration: const InputDecoration(
                              labelText: 'Radius (meters) *',
                              border: OutlineInputBorder(),
                              hintText: '100',
                              prefixIcon: Icon(Icons.radar),
                            ),
                            keyboardType: TextInputType.number,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Required';
                              }
                              final radius = int.tryParse(value);
                              if (radius == null || radius <= 0) {
                                return 'Must be > 0';
                              }
                              return null;
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextFormField(
                            controller: _roomNoController,
                            decoration: const InputDecoration(
                              labelText: 'Room No.',
                              border: OutlineInputBorder(),
                              hintText: '301',
                              prefixIcon: Icon(Icons.door_front_door),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _floorController,
                            decoration: const InputDecoration(
                              labelText: 'Floor',
                              border: OutlineInputBorder(),
                              hintText: '3',
                              prefixIcon: Icon(Icons.layers),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextFormField(
                            controller: _capacityController,
                            decoration: const InputDecoration(
                              labelText: 'Capacity',
                              border: OutlineInputBorder(),
                              hintText: '60',
                              prefixIcon: Icon(Icons.people),
                            ),
                            keyboardType: TextInputType.number,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: _selectedRoomType,
                      decoration: const InputDecoration(
                        labelText: 'Room Type *',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.category),
                      ),
                      items: _roomTypes.map((type) {
                        return DropdownMenuItem<String>(
                          value: type['value'],
                          child: Text(type['label'] ?? ''),
                        );
                      }).toList(),
                      onChanged: (value) {
                        if (value != null) {
                          setState(() => _selectedRoomType = value);
                        }
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _addressController,
                      decoration: const InputDecoration(
                        labelText: 'Address',
                        border: OutlineInputBorder(),
                        hintText: 'Building name, area, city...',
                        prefixIcon: Icon(Icons.location_on),
                      ),
                      maxLines: 2,
                    ),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _closeModal,
                            child: const Text('Cancel'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          flex: 2,
                          child: FilledButton.icon(
                            onPressed: _saveLocation,
                            icon: Icon(
                              _editingId != null ? Icons.save : Icons.add,
                            ),
                            label: Text(
                              _editingId != null ? 'Update' : 'Create',
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _latController.dispose();
    _lngController.dispose();
    _radiusController.dispose();
    _roomNoController.dispose();
    _floorController.dispose();
    _capacityController.dispose();
    _addressController.dispose();
    super.dispose();
  }
}
