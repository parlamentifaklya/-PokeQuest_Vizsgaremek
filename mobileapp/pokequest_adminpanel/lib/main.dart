import 'package:flutter/material.dart';
import 'login_screen.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Admin Panel',
      initialRoute: '/',
      routes: {
        '/': (context) => LoginScreen(), // Keep only the login screen in routes
      },
    );
  }
}
