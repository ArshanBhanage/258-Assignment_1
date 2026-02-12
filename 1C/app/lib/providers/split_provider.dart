import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';
import 'package:uuid/uuid.dart';

import '../models/participant.dart';
import '../models/split_session.dart';
import '../services/gemini_service.dart';
import '../services/image_service.dart';
import '../services/storage_service.dart';

class SplitProvider extends ChangeNotifier {
  final GeminiService _geminiService = GeminiService();
  final ImageService _imageService = ImageService();
  final StorageService _storageService = StorageService();

  List<SplitSession> _history = [];
  List<SplitSession> get history => _history;

  // Current session state
  SplitSession? _currentSession;
  SplitSession? get currentSession => _currentSession;
  
  bool _isLoading = false;
  bool get isLoading => _isLoading;
  
  String? _error;
  String? get error => _error;

  SplitProvider() {
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    await _storageService.init();
    _history = _storageService.getAllSessions();
    notifyListeners();
  }

  // 1. Start New Split (Image -> Receipt)
  Future<bool> extractReceipt(ImageSource source) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final imageBytes = await _imageService.pickImage(source);
      if (imageBytes == null) {
        _isLoading = false;
        notifyListeners();
        return false;
      }

      final receipt = await _geminiService.extractReceipt(imageBytes);
      final sessionId = const Uuid().v4();
      
      _currentSession = SplitSession(
        id: sessionId,
        receipt: receipt,
        participants: [],
        createdAt: DateTime.now(),
      );
      
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // 1b. Use Demo Receipt
  Future<void> loadDemoReceipt(Uint8List bytes) async {
     try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final receipt = await _geminiService.extractReceipt(bytes);
      final sessionId = const Uuid().v4();
      
      _currentSession = SplitSession(
        id: sessionId,
        receipt: receipt,
        participants: [],
        createdAt: DateTime.now(),
      );
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // 2. Manage Participants
  void addParticipant(String name) {
    if (_currentSession == null) return;
    
    final newParticipant = Participant(
      id: const Uuid().v4(),
      name: name,
    );
    
    final updatedParticipants = [..._currentSession!.participants, newParticipant];
    _currentSession = _currentSession!.copyWith(participants: updatedParticipants);
    notifyListeners();
  }

  void removeParticipant(String id) {
    if (_currentSession == null) return;
    
    final updatedParticipants = _currentSession!.participants
        .where((p) => p.id != id)
        .toList();
    
    // Also remove assignments for this participant
    // (This primitive logic just removes them, items might become unassigned)
    
    _currentSession = _currentSession!.copyWith(participants: updatedParticipants);
    notifyListeners();
  }

  // 3. Assign Items
  void toggleAssignment(int itemIndex, String participantId) {
    if (_currentSession == null) return;

    final participants = _currentSession!.participants.map((p) {
      if (p.id == participantId) {
        final indices = List<int>.from(p.assignedItemIndices);
        if (indices.contains(itemIndex)) {
          indices.remove(itemIndex);
        } else {
          indices.add(itemIndex);
        }
        return p.copyWith(assignedItemIndices: indices);
      }
      return p;
    }).toList();

    _currentSession = _currentSession!.copyWith(participants: participants);
    notifyListeners();
  }


  // 4. Calculate Totals
  Map<String, double> calculateTotals() {
    if (_currentSession == null) return {};
    
    final receipt = _currentSession!.receipt;
    final participants = _currentSession!.participants;
    
    // Track how many people engage each item to split cost
    final itemSplitCounts = List<int>.filled(receipt.items.length, 0);
    
    for (var p in participants) {
      for (var idx in p.assignedItemIndices) {
        if (idx < receipt.items.length) {
          itemSplitCounts[idx]++;
        }
      }
    }

    final totals = <String, double>{};

    for (var p in participants) {
      double mySubtotal = 0;
      
      for (var idx in p.assignedItemIndices) {
        if (idx < receipt.items.length && itemSplitCounts[idx] > 0) {
          mySubtotal += receipt.items[idx].totalPrice / itemSplitCounts[idx];
        }
      }
      
      // Allocating tax and tip proportionally
      // Ratio = mySubtotal / receipt.subtotal
      // Note: If subtotal is 0, ratio is 0.
      
      double ratio = (receipt.subtotal > 0) ? (mySubtotal / receipt.subtotal) : 0;
      double myTax = (receipt.tax ?? 0) * ratio;
      double myTip = (receipt.tip ?? 0) * ratio;
      
      totals[p.id] = mySubtotal + myTax + myTip;
    }
    
    return totals;
  }

  // 5. Save Session
  Future<void> saveCurrentSession() async {
    if (_currentSession != null) {
      await _storageService.saveSession(_currentSession!);
      _loadHistory(); // Reload
    }
  }
  
  void loadSession(SplitSession session) {
    _currentSession = session;
    notifyListeners();
  }
}
