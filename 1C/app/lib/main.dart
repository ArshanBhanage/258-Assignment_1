import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';

import 'providers/split_provider.dart';
import 'screens/home_screen.dart';
import 'screens/new_split_screen.dart';
import 'screens/review_screen.dart';
import 'screens/participants_screen.dart';
import 'screens/assign_screen.dart';
import 'screens/summary_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    debugPrint("Warning: .env file not found or empty");
  }

  // Hive init is handled in SplitProvider or SplitService, 
  // but we can ensure Hive is ready here if needed.
  // We'll let the provider initialize storage lazily or on construction.
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => SplitProvider()),
      ],
      child: const Receipt2SplitApp(),
    ),
  );
}

class Receipt2SplitApp extends StatelessWidget {
  const Receipt2SplitApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Receipt2Split',
      theme: _buildTheme(),
      initialRoute: '/',
      routes: {
        '/': (context) => const HomeScreen(),
        '/new_split': (context) => const NewSplitScreen(),
        '/review': (context) => const ReviewScreen(),
        '/participants': (context) => const ParticipantsScreen(),
        '/assign': (context) => const AssignScreen(),
        '/summary': (context) => const SummaryScreen(),
      },
      debugShowCheckedModeBanner: false,
    );
  }

  ThemeData _buildTheme() {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: Colors.teal,
        brightness: Brightness.light,
      ),
      scaffoldBackgroundColor: const Color(0xFFF8F9FA),
      /* cardTheme: CardTheme(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        color: Colors.white,
      ), */
      appBarTheme: const AppBarTheme(
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.black87,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          elevation: 0,
        ),
      ),
    );
  }
}
