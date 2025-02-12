import 'package:flutter/material.dart';
import 'package:pokequest_adminpanel/manage_items_screen.dart';
import 'login_screen.dart';
import 'admin_panel_screen.dart';
import 'manage_types_screen.dart';
import 'manage_abilities_screen.dart'; // Make sure this is imported if you're using it

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pokequest Admin Panel',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => LoginScreen(),
      },
      onGenerateRoute: (settings) {
        // Handling dynamic route generation
        if (settings.name == '/adminPanel') {
          final token =
              settings.arguments as String?; // Retrieve token from arguments
          if (token == null) {
            return MaterialPageRoute(
              builder: (context) =>
                  const LoginScreen(), // Redirect to login if no token
            );
          }
          return MaterialPageRoute(
            builder: (context) => AdminPanelScreen(token: token),
          );
        } else if (settings.name == '/manageItems') {
          final token =
              settings.arguments as String?; // Retrieve token from arguments
          if (token == null) {
            return MaterialPageRoute(
              builder: (context) =>
                  const LoginScreen(), // Redirect to login if no token
            );
          }
          return MaterialPageRoute(
            builder: (context) => ManageItemsScreen(token: token),
          );
        } else if (settings.name == '/manageTypes') {
          final token =
              settings.arguments as String?; // Retrieve token from arguments
          if (token == null) {
            return MaterialPageRoute(
              builder: (context) =>
                  const LoginScreen(), // Redirect to login if no token
            );
          }
          return MaterialPageRoute(
            builder: (context) => ManageTypesScreen(token: token),
          );
        } else if (settings.name == '/manageAbilities') {
          final token =
              settings.arguments as String?; // Retrieve token from arguments
          if (token == null) {
            return MaterialPageRoute(
              builder: (context) =>
                  const LoginScreen(), // Redirect to login if no token
            );
          }
          return MaterialPageRoute(
            builder: (context) => ManageAbilitiesScreen(token: token),
          );
        }
        return null; // Return null for unknown routes
      },
    );
  }
}
