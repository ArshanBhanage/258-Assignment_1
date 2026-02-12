import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/split_provider.dart';

class ParticipantsScreen extends StatefulWidget {
  const ParticipantsScreen({super.key});

  @override
  State<ParticipantsScreen> createState() => _ParticipantsScreenState();
}

class _ParticipantsScreenState extends State<ParticipantsScreen> {
  final TextEditingController _nameController = TextEditingController();

  void _addParticipant() {
    final name = _nameController.text.trim();
    if (name.isNotEmpty) {
      Provider.of<SplitProvider>(context, listen: false).addParticipant(name);
      _nameController.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<SplitProvider>(context);
    final participants = provider.currentSession?.participants ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Add People'),
        actions: [
          IconButton(
            icon: const Icon(Icons.check),
            onPressed: participants.isNotEmpty 
                ? () => Navigator.pushNamed(context, '/assign')
                : null,
          )
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _nameController,
                    decoration: const InputDecoration(
                      hintText: 'Enter name (e.g. Alice)',
                      border: OutlineInputBorder(),
                    ),
                    onSubmitted: (_) => _addParticipant(),
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _addParticipant,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.teal,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.all(16),
                  ),
                  child: const Icon(Icons.add),
                ),
              ],
            ),
          ),
          const Divider(),
          Expanded(
            child: participants.isEmpty
                ? Center(
                    child: Text(
                      'Add at least one person',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  )
                : ListView.builder(
                    itemCount: participants.length,
                    itemBuilder: (context, index) {
                      final p = participants[index];
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.teal.shade100,
                          child: Text(p.name[0].toUpperCase()),
                        ),
                        title: Text(p.name),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete, color: Colors.grey),
                          onPressed: () {
                            provider.removeParticipant(p.id);
                          },
                        ),
                      );
                    },
                  ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: participants.isNotEmpty 
                    ? () => Navigator.pushNamed(context, '/assign')
                    : null,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(16),
                ),
                child: const Text('Next: Assign Items'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
