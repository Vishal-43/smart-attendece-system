import 'package:flutter/material.dart';
import '../../services/access_point_service.dart';
import '../../services/wifi_service.dart';
import '../../utils/error_handler.dart';

class AccessPointManagementScreen extends StatefulWidget {
  const AccessPointManagementScreen({super.key});

  @override
  State<AccessPointManagementScreen> createState() =>
      _AccessPointManagementScreenState();
}

class _AccessPointManagementScreenState
    extends State<AccessPointManagementScreen> {
  final _service = AccessPointService();
  final _wifiService = WifiService();
  final _formKey = GlobalKey<FormState>();

  List<Map<String, dynamic>> _accessPoints = [];
  List<Map<String, dynamic>> _locations = [];
  bool _loading = true;
  String? _errorMessage;
  bool _isModalOpen = false;
  int? _editingId;
  bool _fetchingNetwork = false;

  final _nameController = TextEditingController();
  final _macController = TextEditingController();
  final _ipController = TextEditingController();
  int? _selectedLocationId;
  bool _isActive = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });
    try {
      final results = await Future.wait([
        _service.getAccessPoints(limit: 500),
        _service.getLocations(limit: 500),
      ]);
      setState(() {
        _accessPoints = List<Map<String, dynamic>>.from(results[0].data ?? []);
        _locations = List<Map<String, dynamic>>.from(results[1].data ?? []);
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
      _macController.clear();
      _ipController.clear();
      _selectedLocationId = null;
      _isActive = true;
      _isModalOpen = true;
    });
  }

  void _openEditModal(Map<String, dynamic> ap) {
    setState(() {
      _editingId = ap['id'];
      _nameController.text = ap['name'] ?? '';
      _macController.text = ap['mac_address'] ?? '';
      _ipController.text = ap['ip_address'] ?? '';
      _selectedLocationId = ap['location_id'];
      _isActive = ap['is_active'] != false;
      _isModalOpen = true;
    });
  }

  void _closeModal() {
    setState(() {
      _isModalOpen = false;
      _editingId = null;
      _fetchingNetwork = false;
    });
  }

  Future<void> _fetchNetworkDetails() async {
    setState(() => _fetchingNetwork = true);

    try {
      final wifiInfo = await _wifiService.getCompleteWifiInfo();

      if (!mounted) return;

      if (wifiInfo['bssid'] != null && wifiInfo['bssid']!.isNotEmpty) {
        final formattedMac = _wifiService.formatMacAddress(wifiInfo['bssid']);
        setState(() {
          _macController.text = formattedMac;
          if (wifiInfo['ip'] != null && wifiInfo['ip']!.isNotEmpty) {
            _ipController.text = wifiInfo['ip']!;
          }
        });

        String message = 'MAC: $formattedMac';
        if (wifiInfo['ip'] != null) {
          message += ', IP: ${wifiInfo['ip']}';
        }
        if (wifiInfo['ssid'] != null) {
          message += ' (${wifiInfo['ssid']})';
        }

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Network details fetched: $message'),
              duration: const Duration(seconds: 3),
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                'Could not fetch network details. Make sure WiFi is enabled and location permission is granted.',
              ),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error fetching network: $e')));
      }
    } finally {
      setState(() => _fetchingNetwork = false);
    }
  }

  String? _validateMacAddress(String? value) {
    if (value == null || value.isEmpty) {
      return 'MAC address is required';
    }
    final macRegex = RegExp(r'^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$');
    if (!macRegex.hasMatch(value)) {
      return 'Invalid MAC address (e.g. AA:BB:CC:DD:EE:FF)';
    }
    return null;
  }

  String? _validateIpAddress(String? value) {
    if (value == null || value.isEmpty) return null;
    final ipRegex = RegExp(
      r'^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$',
    );
    if (!ipRegex.hasMatch(value)) {
      return 'Invalid IP address';
    }
    return null;
  }

  Future<void> _saveAccessPoint() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedLocationId == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please select a location')));
      return;
    }

    try {
      if (_editingId != null) {
        await _service.updateAccessPoint(
          _editingId!,
          name: _nameController.text.trim(),
          macAddress: _macController.text.trim().toUpperCase(),
          ipAddress: _ipController.text.trim(),
          locationId: _selectedLocationId!,
          isActive: _isActive,
        );
      } else {
        await _service.createAccessPoint(
          name: _nameController.text.trim(),
          macAddress: _macController.text.trim().toUpperCase(),
          ipAddress: _ipController.text.trim(),
          locationId: _selectedLocationId!,
          isActive: _isActive,
        );
      }
      _closeModal();
      _fetchData();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              _editingId != null
                  ? 'Access point updated'
                  : 'Access point created',
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

  Future<void> _deleteAccessPoint(int id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Access Point'),
        content: const Text(
          'Are you sure you want to delete this access point?',
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
      await _service.deleteAccessPoint(id);
      _fetchData();
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Access point deleted')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${ErrorHandler.formatError(e)}')),
        );
      }
    }
  }

  String _getLocationName(int? locationId) {
    if (locationId == null) return '—';
    final location = _locations.where((l) => l['id'] == locationId).firstOrNull;
    return location?['name'] ?? '—';
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Access Points')),
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
                    onPressed: _fetchData,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            )
          : _accessPoints.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.wifi, size: 64, color: colors.outline),
                  const SizedBox(height: 16),
                  const Text('No access points found'),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: _openCreateModal,
                    icon: const Icon(Icons.add),
                    label: const Text('Add Access Point'),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _fetchData,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _accessPoints.length,
                itemBuilder: (context, index) {
                  final ap = _accessPoints[index];
                  final isActive = ap['is_active'] != false;
                  return Card(
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: isActive
                            ? colors.primaryContainer
                            : colors.surfaceContainerHighest,
                        child: Icon(
                          Icons.wifi,
                          color: isActive ? colors.primary : colors.outline,
                        ),
                      ),
                      title: Text(
                        ap['name'] ?? 'Unknown',
                        overflow: TextOverflow.ellipsis,
                      ),
                      subtitle: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 200),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'MAC: ${ap['mac_address'] ?? '—'}',
                              style: const TextStyle(
                                fontFamily: 'monospace',
                                fontSize: 11,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (ap['ip_address'] != null)
                              Text(
                                'IP: ${ap['ip_address']}',
                                style: const TextStyle(
                                  fontFamily: 'monospace',
                                  fontSize: 11,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            Text(
                              'Location: ${_getLocationName(ap['location_id'])}',
                              style: TextStyle(
                                fontSize: 11,
                                color: colors.outline,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: isActive
                                  ? Colors.green.withValues(alpha: 0.1)
                                  : Colors.grey.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              isActive ? 'Active' : 'Inactive',
                              style: TextStyle(
                                fontSize: 10,
                                color: isActive ? Colors.green : Colors.grey,
                              ),
                            ),
                          ),
                          PopupMenuButton<String>(
                            onSelected: (value) {
                              if (value == 'edit') {
                                _openEditModal(ap);
                              } else if (value == 'delete') {
                                _deleteAccessPoint(ap['id']);
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
        tooltip: 'Add Access Point',
        child: const Icon(Icons.add),
      ),
      bottomSheet: _isModalOpen
          ? Container(
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.85,
              ),
              child: _buildModal(colors),
            )
          : null,
    );
  }

  Widget _buildModal(ColorScheme colors) {
    return Container(
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
                    _editingId != null
                        ? 'Edit Access Point'
                        : 'Add Access Point',
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
                        labelText: 'Access Point Name *',
                        border: OutlineInputBorder(),
                        hintText: 'e.g. Router Room 301',
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
                            controller: _macController,
                            decoration: const InputDecoration(
                              labelText: 'MAC Address *',
                              border: OutlineInputBorder(),
                              hintText: 'AA:BB:CC:DD:EE:FF',
                              prefixIcon: Icon(Icons.memory),
                            ),
                            textCapitalization: TextCapitalization.characters,
                            validator: _validateMacAddress,
                          ),
                        ),
                        const SizedBox(width: 8),
                        SizedBox(
                          height: 56,
                          child: ElevatedButton.icon(
                            onPressed: _fetchingNetwork
                                ? null
                                : _fetchNetworkDetails,
                            icon: _fetchingNetwork
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  )
                                : const Icon(Icons.wifi_find, size: 20),
                            label: const Text('Fetch'),
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Tap "Fetch" to get MAC & IP from current WiFi',
                      style: TextStyle(fontSize: 11, color: colors.outline),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _ipController,
                      decoration: const InputDecoration(
                        labelText: 'IP Address',
                        border: OutlineInputBorder(),
                        hintText: 'e.g. 192.168.1.10',
                        prefixIcon: Icon(Icons.language),
                      ),
                      validator: _validateIpAddress,
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<int>(
                      value: _selectedLocationId,
                      decoration: const InputDecoration(
                        labelText: 'Linked Location *',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.location_on_outlined),
                      ),
                      items: _locations.map((loc) {
                        final roomNo = loc['room_no'] ?? '';
                        final displayName = roomNo.isNotEmpty
                            ? '${loc['name']} ($roomNo)'
                            : loc['name'] ?? 'Unknown';
                        return DropdownMenuItem<int>(
                          value: loc['id'],
                          child: Text(
                            displayName,
                            overflow: TextOverflow.ellipsis,
                          ),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() => _selectedLocationId = value);
                      },
                      hint: const Text('Select a location'),
                      isExpanded: true,
                    ),
                    const SizedBox(height: 16),
                    Card(
                      child: SwitchListTile(
                        title: const Text('Active'),
                        subtitle: Text(
                          _isActive
                              ? 'Access point is active'
                              : 'Access point is inactive',
                          style: TextStyle(fontSize: 12, color: colors.outline),
                        ),
                        value: _isActive,
                        onChanged: (value) {
                          setState(() => _isActive = value);
                        },
                        secondary: Icon(
                          _isActive ? Icons.check_circle : Icons.cancel,
                          color: _isActive ? Colors.green : Colors.grey,
                        ),
                      ),
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
                            onPressed: _saveAccessPoint,
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
    _macController.dispose();
    _ipController.dispose();
    super.dispose();
  }
}
