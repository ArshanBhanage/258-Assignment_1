import 'package:flutter/material.dart';
import '../models/receipt.dart';
import '../models/participant.dart';

class AssignmentTile extends StatelessWidget {
  final ReceiptItem item;
  final int index;
  final List<Participant> participants;
  final Function(String) onToggle;

  const AssignmentTile({
    super.key,
    required this.item,
    required this.index,
    required this.participants,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    item.name,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                  ),
                ),
                Text(
                  item.totalPrice.toStringAsFixed(2),
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ],
            ),
            if (item.quantity > 1)
              Text(
                '${item.quantity} x ${item.unitPrice}',
                style: TextStyle(color: Colors.grey[600], fontSize: 13),
              ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: participants.map((p) {
                final isSelected = p.assignedItemIndices.contains(index);
                return FilterChip(
                  label: Text(p.name),
                  selected: isSelected,
                  onSelected: (_) => onToggle(p.id),
                  selectedColor: Theme.of(context).primaryColor.withValues(alpha: 0.2),
                  checkmarkColor: Theme.of(context).primaryColor,
                  labelStyle: TextStyle(
                    color: isSelected ? Theme.of(context).primaryColor : Colors.black87,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}
