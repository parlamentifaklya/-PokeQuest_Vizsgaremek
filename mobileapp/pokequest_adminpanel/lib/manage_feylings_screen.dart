import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http_parser/http_parser.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:pokequest_adminpanel/services/api_service.dart';
import 'package:mime/mime.dart';

class ManageFeylingsScreen extends StatefulWidget {
  final String token; // Token received from AdminPanelScreen

  const ManageFeylingsScreen({super.key, required this.token});

  @override
  _ManageFeylingsScreenState createState() => _ManageFeylingsScreenState();
}

class _ManageFeylingsScreenState extends State<ManageFeylingsScreen> {
  bool _isLoading = false;
  List<dynamic> _feylings = [];
  List<dynamic> _types = []; // List to hold the types fetched from the API
  List<dynamic> _abilities = []; // List to hold abilities
  final ApiService _apiService = ApiService();
  final _picker = ImagePicker();

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _healthPointController = TextEditingController();
  final TextEditingController _damageController = TextEditingController();
  final TextEditingController _sellPriceController = TextEditingController();
  dynamic _image; // Allow both File types
  String? _selectedTypeId; // Store the selected type ID
  String? _selectedAbilityId; // Store the selected ability ID
  String? _selectedStrongAgainstId; // Store the selected strongAgainstId
  String? _selectedWeakAgainstId; // Store the selected weakAgainstId

  @override
  void initState() {
    super.initState();
    _fetchFeylings();
    _fetchTypes(); // Fetch types on init
    _fetchAbilities(); // Fetch abilities on init
  }

  // Fetch all Feylings from API
  Future<void> _fetchFeylings() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final feylings = await _apiService.getAllFeylings(widget.token);
      setState(() {
        _feylings = feylings;
      });
    } catch (e) {
      print('Error fetching feylings: $e');
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load feylings')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  // Fetch all types from API
  Future<void> _fetchTypes() async {
    try {
      final types = await _apiService.getAllTypes(widget.token);
      setState(() {
        _types = types;
      });
    } catch (e) {
      print('Error fetching types: $e');
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load types')));
    }
  }

  // Fetch all abilities from API
  Future<void> _fetchAbilities() async {
    try {
      final abilities = await _apiService.getAllAbilities(widget.token); // Assuming this method exists
      setState(() {
        _abilities = abilities;
      });
    } catch (e) {
      print('Error fetching abilities: $e');
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load abilities')));
    }
  }

  // Pick an image for the Feyling (Mobile support)
  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _image = pickedFile;
      });
    }
  }

  // Create a new Feyling
  Future<void> _createFeyling() async {
    if (_nameController.text.isEmpty ||
        _descriptionController.text.isEmpty ||
        _healthPointController.text.isEmpty ||
        _damageController.text.isEmpty ||
        _selectedTypeId == null ||
        _selectedAbilityId == null ||
        _selectedStrongAgainstId == null ||
        _selectedWeakAgainstId == null ||
        _sellPriceController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('All fields are required')));
      return;
    }

    if (_image == null) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Image is required')));
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      var uri = Uri.parse("http://10.0.2.2:5130/api/Feyling/CreateFeyling"); // Emulator special URL
      var request = http.MultipartRequest('POST', uri);
      request.headers['Authorization'] = 'Bearer ${widget.token}';

      // Add the Feyling parameters
      request.fields['name'] = _nameController.text;
      request.fields['description'] = _descriptionController.text;
      request.fields['hp'] = _healthPointController.text;
      request.fields['atk'] = _damageController.text;
      request.fields['typeId'] = _selectedTypeId!;
      request.fields['abilityId'] = _selectedAbilityId!;
      request.fields['strongAgainstId'] = _selectedStrongAgainstId!;
      request.fields['weakAgainstId'] = _selectedWeakAgainstId!;
      request.fields['sellPrice'] = _sellPriceController.text;

      // Mobile platform: use File from image_picker
      var imageFile = File(_image!.path);
      var mimeType = lookupMimeType(_image!.path)!;
      var multipartFile = await http.MultipartFile.fromPath(
        'img',
        _image!.path,
        contentType: MediaType.parse(mimeType),
      );
      request.files.add(multipartFile);

      var response = await request.send();
      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Feyling created successfully')));
        _fetchFeylings(); // Refresh the list
        _nameController.clear();
        _descriptionController.clear();
        _healthPointController.clear();
        _damageController.clear();
        _sellPriceController.clear();
        setState(() {
          _image = null;
          _selectedTypeId = null;
          _selectedAbilityId = null;
          _selectedStrongAgainstId = null;
          _selectedWeakAgainstId = null;
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to create Feyling')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  // Update an existing Feyling via dialog
  Future<void> _updateFeyling(int feylingId) async {
    var feyling = _feylings.firstWhere((feyling) => feyling['id'] == feylingId);

    _nameController.text = feyling['name'];
    _descriptionController.text = feyling['description'];
    _healthPointController.text = feyling['hp'].toString();
    _damageController.text = feyling['atk'].toString();
    _sellPriceController.text = feyling['sellPrice'].toString();
    _selectedTypeId = feyling['typeId'].toString(); // Prefill the typeId
    _selectedAbilityId = feyling['abilityId'].toString(); // Prefill abilityId
    _selectedStrongAgainstId = feyling['strongAgainstId'].toString(); // Prefill strongAgainstId
    _selectedWeakAgainstId = feyling['weakAgainstId'].toString(); // Prefill weakAgainstId

    // Show dialog with current feyling data prefilled
    await showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Update Feyling'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: _nameController,
                  decoration: InputDecoration(labelText: 'Feyling Name'),
                ),
                TextField(
                  controller: _descriptionController,
                  decoration: InputDecoration(labelText: 'Description'),
                ),
                TextField(
                  controller: _healthPointController,
                  decoration: InputDecoration(labelText: 'Health Point'),
                  keyboardType: TextInputType.number,
                ),
                TextField(
                  controller: _damageController,
                  decoration: InputDecoration(labelText: 'Damage'),
                  keyboardType: TextInputType.number,
                ),
                TextField(
                  controller: _sellPriceController,
                  decoration: InputDecoration(labelText: 'Sell Price'),
                  keyboardType: TextInputType.number,
                ),
                SizedBox(height: 8),
                DropdownButton<String>(
                  value: _selectedTypeId,
                  hint: Text('Select Feyling Type'),
                  onChanged: (String? newValue) {
                    setState(() {
                      _selectedTypeId = newValue;
                    });
                  },
                  items: _types.map<DropdownMenuItem<String>>((type) {
                    return DropdownMenuItem<String>(
                      value: type['id'].toString(),
                      child: Text(type['name']),
                    );
                  }).toList(),
                ),
                SizedBox(height: 8),
                DropdownButton<String>(
                  value: _selectedAbilityId,
                  hint: Text('Select Ability'),
                  onChanged: (String? newValue) {
                    setState(() {
                      _selectedAbilityId = newValue;
                    });
                  },
                  items: _abilities.map<DropdownMenuItem<String>>((ability) {
                    return DropdownMenuItem<String>(
                      value: ability['id'].toString(),
                      child: Text(ability['name']),
                    );
                  }).toList(),
                ),
                SizedBox(height: 8),
                DropdownButton<String>(
                  value: _selectedStrongAgainstId,
                  hint: Text('Select Strong Against Type'),
                  onChanged: (String? newValue) {
                    setState(() {
                      _selectedStrongAgainstId = newValue;
                    });
                  },
                  items: _types.map<DropdownMenuItem<String>>((type) {
                    return DropdownMenuItem<String>(
                      value: type['id'].toString(),
                      child: Text(type['name']),
                    );
                  }).toList(),
                ),
                SizedBox(height: 8),
                DropdownButton<String>(
                  value: _selectedWeakAgainstId,
                  hint: Text('Select Weak Against Type'),
                  onChanged: (String? newValue) {
                    setState(() {
                      _selectedWeakAgainstId = newValue;
                    });
                  },
                  items: _types.map<DropdownMenuItem<String>>((type) {
                    return DropdownMenuItem<String>(
                      value: type['id'].toString(),
                      child: Text(type['name']),
                    );
                  }).toList(),
                ),
                SizedBox(height: 8),
                ElevatedButton.icon(
                  onPressed: _pickImage,
                  icon: Icon(Icons.image),
                  label: Text('Pick Image'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () async {
                // Handle update
                var uri = Uri.parse(
                    "http://10.0.2.2:5130/api/Feyling/UpdateFeyling/$feylingId");
                var request = http.MultipartRequest('PUT', uri);
                request.headers['Authorization'] = 'Bearer ${widget.token}';
                request.fields['name'] = _nameController.text;
                request.fields['description'] = _descriptionController.text;
                request.fields['hp'] = _healthPointController.text;
                request.fields['atk'] = _damageController.text;
                request.fields['sellPrice'] = _sellPriceController.text;
                request.fields['typeId'] = _selectedTypeId!;
                request.fields['abilityId'] = _selectedAbilityId!;
                request.fields['strongAgainstId'] = _selectedStrongAgainstId!;
                request.fields['weakAgainstId'] = _selectedWeakAgainstId!;

                if (_image != null) {
                  var imageFile = File(_image!.path);
                  var mimeType = lookupMimeType(_image!.path)!;
                  var multipartFile = await http.MultipartFile.fromPath(
                    'img',
                    _image!.path,
                    contentType: MediaType.parse(mimeType),
                  );
                  request.files.add(multipartFile);
                }

                var response = await request.send();
                if (response.statusCode == 200) {
                  ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Feyling updated successfully')));
                  _fetchFeylings(); // Refresh the list
                  Navigator.pop(context); // Close dialog
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed to update Feyling')));
                }
              },
              child: Text('Update'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context), // Close dialog
              child: Text('Cancel'),
            ),
          ],
        );
      },
    );
  }

  // Delete a Feyling
  Future<void> _deleteFeyling(int feylingId) async {
    setState(() {
      _isLoading = true;
    });

    bool success = await _apiService.deleteFeyling(widget.token, feylingId);
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Feyling deleted successfully')));
      _fetchFeylings(); // Refresh the list
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to delete Feyling')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  // Build Image Widget (Handles Mobile)
  Widget _buildImageDisplay(String? imageUrl) {
    if (_image != null) {
      return Image.file(File(_image!.path)); // Display image picked from mobile
    } else if (imageUrl != null && imageUrl.isNotEmpty) {
      String baseUrl = 'http://10.0.2.2:5130/api'; // Base URL without /Uploads
      String fullUrl = '$baseUrl/$imageUrl'; // Concatenate the imageUrl directly to the base URL
      return Image.network(fullUrl); // Display image from backend
    } else {
      return Placeholder(fallbackHeight: 150, fallbackWidth: 150); // Show placeholder when no image
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Manage Feylings')),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Manage Feylings',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            SizedBox(height: 16),
            // Display Feylings in a vertical list (Scrollable)
            Column(
              children: _feylings.map((feyling) {
                return Container(
                  width: double.infinity,
                  margin: EdgeInsets.symmetric(vertical: 8),
                  child: Card(
                    elevation: 4,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          _buildImageDisplay(feyling['img']),
                          SizedBox(height: 8),
                          Text(
                            feyling['name'] ?? 'Unknown Feyling',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Text('Damage: ${feyling['atk']}'),
                          Text('Health Point: ${feyling['hp']}'),
                          Text('Description: ${feyling['description']}'),
                          Text('Sell Price: ${feyling['sellPrice']}'),
                          SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              IconButton(
                                onPressed: () =>
                                    _updateFeyling(feyling['id']),
                                icon: Icon(Icons.edit),
                              ),
                              IconButton(
                                onPressed: () =>
                                    _deleteFeyling(feyling['id']),
                                icon: Icon(Icons.delete),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          // Open dialog to create a new Feyling
          await showDialog(
            context: context,
            builder: (context) {
              return AlertDialog(
                title: Text('Create New Feyling'),
                content: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextField(
                        controller: _nameController,
                        decoration: InputDecoration(labelText: 'Feyling Name'),
                      ),
                      TextField(
                        controller: _descriptionController,
                        decoration: InputDecoration(labelText: 'Description'),
                      ),
                      TextField(
                        controller: _healthPointController,
                        decoration: InputDecoration(labelText: 'Health Point'),
                        keyboardType: TextInputType.number,
                      ),
                      TextField(
                        controller: _damageController,
                        decoration: InputDecoration(labelText: 'Damage'),
                        keyboardType: TextInputType.number,
                      ),
                      TextField(
                        controller: _sellPriceController,
                        decoration: InputDecoration(labelText: 'Sell Price'),
                        keyboardType: TextInputType.number,
                      ),
                      SizedBox(height: 8),
                      DropdownButton<String>(
                        value: _selectedTypeId,
                        hint: Text('Select Feyling Type'),
                        onChanged: (String? newValue) {
                          setState(() {
                            _selectedTypeId = newValue;
                          });
                        },
                        items: _types.map<DropdownMenuItem<String>>((type) {
                          return DropdownMenuItem<String>(
                            value: type['id'].toString(),
                            child: Text(type['name']),
                          );
                        }).toList(),
                      ),
                      SizedBox(height: 8),
                      DropdownButton<String>(
                        value: _selectedAbilityId,
                        hint: Text('Select Ability'),
                        onChanged: (String? newValue) {
                          setState(() {
                            _selectedAbilityId = newValue;
                          });
                        },
                        items: _abilities.map<DropdownMenuItem<String>>((ability) {
                          return DropdownMenuItem<String>(
                            value: ability['id'].toString(),
                            child: Text(ability['name']),
                          );
                        }).toList(),
                      ),
                      SizedBox(height: 8),
                      DropdownButton<String>(
                        value: _selectedStrongAgainstId,
                        hint: Text('Select Strong Against Type'),
                        onChanged: (String? newValue) {
                          setState(() {
                            _selectedStrongAgainstId = newValue;
                          });
                        },
                        items: _types.map<DropdownMenuItem<String>>((type) {
                          return DropdownMenuItem<String>(
                            value: type['id'].toString(),
                            child: Text(type['name']),
                          );
                        }).toList(),
                      ),
                      SizedBox(height: 8),
                      DropdownButton<String>(
                        value: _selectedWeakAgainstId,
                        hint: Text('Select Weak Against Type'),
                        onChanged: (String? newValue) {
                          setState(() {
                            _selectedWeakAgainstId = newValue;
                          });
                        },
                        items: _types.map<DropdownMenuItem<String>>((type) {
                          return DropdownMenuItem<String>(
                            value: type['id'].toString(),
                            child: Text(type['name']),
                          );
                        }).toList(),
                      ),
                      SizedBox(height: 8),
                      ElevatedButton.icon(
                        onPressed: _pickImage,
                        icon: Icon(Icons.image),
                        label: Text('Pick Image'),
                      ),
                    ],
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: _createFeyling,
                    child: Text('Create'),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context), // Close dialog
                    child: Text('Cancel'),
                  ),
                ],
              );
            },
          );
        },
        child: Icon(Icons.add),
      ),
    );
  }
}
