import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:pokequest_adminpanel/services/api_service.dart';

class ManageFeylingsScreen extends StatefulWidget {
  final String token;

  const ManageFeylingsScreen({super.key, required this.token});

  @override
  _ManageFeylingsScreenState createState() => _ManageFeylingsScreenState();
}

class _ManageFeylingsScreenState extends State<ManageFeylingsScreen> {
  bool _isLoading = false;
  List<dynamic> _feylings = [];
  List<dynamic> _types = [];
  List<dynamic> _abilities = [];
  final ApiService _apiService = ApiService();
  final _picker = ImagePicker();

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _hpController = TextEditingController();
  final TextEditingController _atkController = TextEditingController();
  final TextEditingController _sellPriceController = TextEditingController();
  dynamic _image;
  String? _selectedTypeId;
  String? _selectedAbilityId;
  String? _selectedStrongAgainstId;
  String? _selectedWeakAgainstId;

  @override
  void initState() {
    super.initState();
    _fetchFeylings();
    _fetchTypes();
    _fetchAbilities();
  }

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
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load feylings')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  Future<void> _fetchTypes() async {
    try {
      final types = await _apiService.getAllTypes(widget.token);
      setState(() {
        _types = types;
      });
    } catch (e) {
      print('Error fetching types: $e');
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load types')));
    }
  }

  Future<void> _fetchAbilities() async {
    try {
      final abilities = await _apiService.getAllAbilities(widget.token);
      setState(() {
        _abilities = abilities;
      });
    } catch (e) {
      print('Error fetching abilities: $e');
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load abilities')));
    }
  }

  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _image = pickedFile;
      });
    }
  }

  // Update an existing feyling
  Future<void> _updateFeyling(int feylingId) async {
    final feyling = _feylings.firstWhere((element) => element['id'] == feylingId);

    _nameController.text = feyling['name'] ?? '';
    _descriptionController.text = feyling['description'] ?? '';
    _hpController.text = feyling['hp']?.toString() ?? '';
    _atkController.text = feyling['atk']?.toString() ?? '';
    _sellPriceController.text = feyling['sellPrice']?.toString() ?? '';
    _selectedTypeId = feyling['typeId']?.toString();
    _selectedAbilityId = feyling['abilityId']?.toString();
    _selectedStrongAgainstId = feyling['strongAgainstId']?.toString();
    _selectedWeakAgainstId = feyling['weakAgainstId']?.toString();

    // Open dialog to update Feyling
    showDialog(
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
                  controller: _hpController,
                  decoration: InputDecoration(labelText: 'Health Points'),
                  keyboardType: TextInputType.number,
                ),
                TextField(
                  controller: _atkController,
                  decoration: InputDecoration(labelText: 'Attack'),
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
                      value: type['id']?.toString(),
                      child: Text(type['name'] ?? ''),
                    );
                  }).toList(),
                ),
                SizedBox(height: 8),
                DropdownButton<String>(
                  value: _selectedAbilityId,
                  hint: Text('Select Feyling Ability'),
                  onChanged: (String? newValue) {
                    setState(() {
                      _selectedAbilityId = newValue;
                    });
                  },
                  items: _abilities.map<DropdownMenuItem<String>>((ability) {
                    return DropdownMenuItem<String>(
                      value: ability['id']?.toString(),
                      child: Text(ability['name'] ?? ''),
                    );
                  }).toList(),
                ),
                SizedBox(height: 8),
                DropdownButton<String>(
                  value: _selectedStrongAgainstId,
                  hint: Text('Select Feyling Strong Against'),
                  onChanged: (String? newValue) {
                    setState(() {
                      _selectedStrongAgainstId = newValue;
                    });
                  },
                  items: _types.map<DropdownMenuItem<String>>((type) {
                    return DropdownMenuItem<String>(
                      value: type['id']?.toString(),
                      child: Text(type['name'] ?? ''),
                    );
                  }).toList(),
                ),
                SizedBox(height: 8),
                DropdownButton<String>(
                  value: _selectedWeakAgainstId,
                  hint: Text('Select Feyling Weak Against'),
                  onChanged: (String? newValue) {
                    setState(() {
                      _selectedWeakAgainstId = newValue;
                    });
                  },
                  items: _types.map<DropdownMenuItem<String>>((type) {
                    return DropdownMenuItem<String>(
                      value: type['id']?.toString(),
                      child: Text(type['name'] ?? ''),
                    );
                  }).toList(),
                ),
                SizedBox(height: 8),
                _image != null
                    ? Image.file(File(_image.path), height: 100, width: 100)
                    : Text("No image selected"),
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
                if (_nameController.text.isEmpty || _descriptionController.text.isEmpty || _hpController.text.isEmpty || _atkController.text.isEmpty || _sellPriceController.text.isEmpty || _selectedTypeId == null || _selectedAbilityId == null || _selectedStrongAgainstId == null || _selectedWeakAgainstId == null) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('All fields are required')));
                  return;
                }

                if (_image == null) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Image is required')));
                  return;
                }

                setState(() {
                  _isLoading = true;
                });

                try {
                  var success = await _apiService.updateFeyling(
                    widget.token,
                    feylingId,
                    {
                      'name': _nameController.text,
                      'description': _descriptionController.text,
                      'hp': _hpController.text,
                      'atk': _atkController.text,
                      'sellPrice': _sellPriceController.text,
                      'typeId': _selectedTypeId,
                      'abilityId': _selectedAbilityId,
                      'strongAgainstId': _selectedStrongAgainstId,
                      'weakAgainstId': _selectedWeakAgainstId,
                    },
                    imgFile: _image,
                  );

                  if (success) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Feyling updated successfully')));
                    _fetchFeylings();
                    Navigator.pop(context);
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to update feyling')));
                  }
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                }

                setState(() {
                  _isLoading = false;
                });
              },
              child: Text('Update Feyling'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancel'),
            ),
          ],
        );
      },
    );
  }

  // Create a new feyling
  void _showCreateFeylingDialog() {
    showDialog(
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
                  controller: _hpController,
                  decoration: InputDecoration(labelText: 'Health Points'),
                  keyboardType: TextInputType.number,
                ),
                TextField(
                  controller: _atkController,
                  decoration: InputDecoration(labelText: 'Attack'),
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
                      value: type['id']?.toString(),
                      child: Text(type['name'] ?? ''),
                    );
                  }).toList(),
                ),
                SizedBox(height: 8),
                DropdownButton<String>(
                  value: _selectedAbilityId,
                  hint: Text('Select Feyling Ability'),
                  onChanged: (String? newValue) {
                    setState(() {
                      _selectedAbilityId = newValue;
                    });
                  },
                  items: _abilities.map<DropdownMenuItem<String>>((ability) {
                    return DropdownMenuItem<String>(
                      value: ability['id']?.toString(),
                      child: Text(ability['name'] ?? ''),
                    );
                  }).toList(),
                ),
                SizedBox(height: 8),
                DropdownButton<String>(
                  value: _selectedStrongAgainstId,
                  hint: Text('Select Feyling Strong Against'),
                  onChanged: (String? newValue) {
                    setState(() {
                      _selectedStrongAgainstId = newValue;
                    });
                  },
                  items: _types.map<DropdownMenuItem<String>>((type) {
                    return DropdownMenuItem<String>(
                      value: type['id']?.toString(),
                      child: Text(type['name'] ?? ''),
                    );
                  }).toList(),
                ),
                SizedBox(height: 8),
                DropdownButton<String>(
                  value: _selectedWeakAgainstId,
                  hint: Text('Select Feyling Weak Against'),
                  onChanged: (String? newValue) {
                    setState(() {
                      _selectedWeakAgainstId = newValue;
                    });
                  },
                  items: _types.map<DropdownMenuItem<String>>((type) {
                    return DropdownMenuItem<String>(
                      value: type['id']?.toString(),
                      child: Text(type['name'] ?? ''),
                    );
                  }).toList(),
                ),
                SizedBox(height: 8),
                _image != null
                    ? Image.file(File(_image.path), height: 100, width: 100)
                    : Text("No image selected"),
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
                if (_nameController.text.isEmpty || _descriptionController.text.isEmpty || _hpController.text.isEmpty || _atkController.text.isEmpty || _sellPriceController.text.isEmpty || _selectedTypeId == null || _selectedAbilityId == null || _selectedStrongAgainstId == null || _selectedWeakAgainstId == null) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('All fields are required')));
                  return;
                }

                if (_image == null) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Image is required')));
                  return;
                }

                setState(() {
                  _isLoading = true;
                });

                try {
                  var success = await _apiService.createFeyling(
                    widget.token,
                    {
                      'name': _nameController.text,
                      'description': _descriptionController.text,
                      'hp': _hpController.text,
                      'atk': _atkController.text,
                      'sellPrice': _sellPriceController.text,
                      'typeId': _selectedTypeId,
                      'abilityId': _selectedAbilityId,
                      'strongAgainstId': _selectedStrongAgainstId,
                      'weakAgainstId': _selectedWeakAgainstId,
                    },
                    imgFile: _image,
                  );

                  if (success) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Feyling created successfully')));
                    _fetchFeylings();
                    Navigator.pop(context);
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to create feyling')));
                  }
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                }

                setState(() {
                  _isLoading = false;
                });
              },
              child: Text('Create Feyling'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancel'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Manage Feylings'),
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: _showCreateFeylingDialog,
          ),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
        itemCount: _feylings.length,
        itemBuilder: (context, index) {
          final feyling = _feylings[index];
          return Card(
            margin: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
            child: ListTile(
              title: Text(feyling['name']),
              subtitle: Text(feyling['description']),
              leading: feyling['image'] != null
                  ? Image.network(
                feyling['image'],
                height: 50,
                width: 50,
                fit: BoxFit.cover,
              )
                  : Icon(Icons.image, size: 50),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: Icon(Icons.edit),
                    onPressed: () {
                      _updateFeyling(feyling['id']);
                    },
                  ),
                  IconButton(
                    icon: Icon(Icons.delete),
                    onPressed: () async {
                      // Implement deletion
                    },
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
