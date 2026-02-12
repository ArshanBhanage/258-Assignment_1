import 'package:hive/hive.dart';

part 'receipt.g.dart';

@HiveType(typeId: 0)
class ReceiptItem {
  @HiveField(0)
  final String name;

  @HiveField(1)
  final double quantity;

  @HiveField(2)
  final double unitPrice;

  @HiveField(3)
  final double totalPrice;

  ReceiptItem({
    required this.name,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  factory ReceiptItem.fromJson(Map<String, dynamic> json) {
    return ReceiptItem(
      name: json['name'] as String,
      quantity: (json['qty'] as num).toDouble(),
      unitPrice: (json['unit_price'] as num).toDouble(),
      totalPrice: (json['total_price'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'qty': quantity,
        'unit_price': unitPrice,
        'total_price': totalPrice,
      };
}

@HiveType(typeId: 1)
class Receipt {
  @HiveField(0)
  final String merchant;

  @HiveField(1)
  final String? date;

  @HiveField(2)
  final String currency;

  @HiveField(3)
  final List<ReceiptItem> items;

  @HiveField(4)
  final double subtotal;

  @HiveField(5)
  final double? tax;

  @HiveField(6)
  final double? tip;

  @HiveField(7)
  final double total;

  Receipt({
    required this.merchant,
    this.date,
    required this.currency,
    required this.items,
    required this.subtotal,
    this.tax,
    this.tip,
    required this.total,
  });

  factory Receipt.fromJson(Map<String, dynamic> json) {
    var list = json['items'] as List;
    List<ReceiptItem> itemsList =
        list.map((i) => ReceiptItem.fromJson(i)).toList();

    return Receipt(
      merchant: json['merchant'] as String,
      date: json['date'] as String?,
      currency: json['currency'] as String,
      items: itemsList,
      subtotal: (json['subtotal'] as num).toDouble(),
      tax: (json['tax'] as num?)?.toDouble(),
      tip: (json['tip'] as num?)?.toDouble(),
      total: (json['total'] as num).toDouble(),
    );
  }
}
