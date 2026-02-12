import 'package:hive_flutter/hive_flutter.dart';
import '../models/receipt.dart';
import '../models/participant.dart';
import '../models/split_session.dart';

class StorageService {
  static const String _boxName = 'split_sessions';
  late Box<SplitSession> _box;

  Future<void> init() async {
    await Hive.initFlutter();
    
    Hive.registerAdapter(ReceiptItemAdapter());
    Hive.registerAdapter(ReceiptAdapter());
    Hive.registerAdapter(ParticipantAdapter());
    Hive.registerAdapter(SplitSessionAdapter());

    _box = await Hive.openBox<SplitSession>(_boxName);
  }

  List<SplitSession> getAllSessions() {
    return _box.values.toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  Future<void> saveSession(SplitSession session) async {
    await _box.put(session.id, session);
  }

  Future<void> deleteSession(String id) async {
    await _box.delete(id);
  }

  Future<void> clearAll() async {
    await _box.clear();
  }
}
