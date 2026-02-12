import 'package:hive/hive.dart';

part 'participant.g.dart';

@HiveType(typeId: 2)
class Participant {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String name;

  // Indices of items assigned to this participant
  @HiveField(2)
  final List<int> assignedItemIndices;

  Participant({
    required this.id,
    required this.name,
    this.assignedItemIndices = const [],
  });

  Participant copyWith({
    String? name,
    List<int>? assignedItemIndices,
  }) {
    return Participant(
      id: id,
      name: name ?? this.name,
      assignedItemIndices: assignedItemIndices ?? this.assignedItemIndices,
    );
  }
}
