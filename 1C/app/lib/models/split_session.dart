import 'package:hive/hive.dart';
import 'receipt.dart';
import 'participant.dart';

part 'split_session.g.dart';

@HiveType(typeId: 3)
class SplitSession {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final Receipt receipt;

  @HiveField(2)
  final List<Participant> participants;

  @HiveField(3)
  final DateTime createdAt;

  SplitSession({
    required this.id,
    required this.receipt,
    required this.participants,
    required this.createdAt,
  });

  SplitSession copyWith({
    Receipt? receipt,
    List<Participant>? participants,
  }) {
    return SplitSession(
      id: id,
      receipt: receipt ?? this.receipt,
      participants: participants ?? this.participants,
      createdAt: createdAt,
    );
  }
}
