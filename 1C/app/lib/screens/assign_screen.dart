import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/split_provider.dart';
import '../widgets/assignment_tile.dart';

class AssignScreen extends StatelessWidget {
  const AssignScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<SplitProvider>(context);
    final session = provider.currentSession;
    
    if (session == null) return const SizedBox.shrink();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Assign Items'),
        actions: [
          IconButton(
            icon: const Icon(Icons.check),
            onPressed: () => Navigator.pushNamed(context, '/summary'),
          )
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            color: Colors.teal.shade50,
            child: const Row(
              children: [
                Icon(Icons.info_outline, color: Colors.teal),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Tap names to assign items. Multiple people can share an item.',
                    style: TextStyle(color: Colors.teal),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: session.receipt.items.length,
              itemBuilder: (context, index) {
                final item = session.receipt.items[index];
                return AssignmentTile(
                  item: item,
                  index: index,
                  participants: session.participants,
                  onToggle: (participantId) {
                    provider.toggleAssignment(index, participantId);
                  },
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pushNamed(context, '/summary'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.teal,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.all(16),
                ),
                child: const Text('Calculate Split'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
