import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/split_provider.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Receipt2Split'),
        centerTitle: true,
      ),
      body: Consumer<SplitProvider>(
        builder: (context, provider, child) {
          if (provider.history.isEmpty) {
             return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.receipt_long, size: 80, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text(
                    'No splits yet',
                    style: TextStyle(color: Colors.grey[600], fontSize: 18),
                  ),
                  const SizedBox(height: 8),
                  const Text('Tap + to start splitting a bill'),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: provider.history.length,
            itemBuilder: (context, index) {
              final session = provider.history[index];
              final dateStr = DateFormat('MMM d, yyyy - h:mm a').format(session.createdAt);
              
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Colors.teal,
                    child: Icon(Icons.receipt, color: Colors.white),
                  ),
                  title: Text(session.receipt.merchant.isNotEmpty 
                      ? session.receipt.merchant 
                      : 'Unknown Merchant'),
                  subtitle: Text(dateStr),
                  trailing: Text(
                    '${session.receipt.currency} ${session.receipt.total.toStringAsFixed(2)}',
                     style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  onTap: () {
                    provider.loadSession(session);
                    Navigator.pushNamed(context, '/summary');
                  },
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.pushNamed(context, '/new_split');
        },
        label: const Text('New Split'),
        icon: const Icon(Icons.add),
      ),
    );
  }
}
