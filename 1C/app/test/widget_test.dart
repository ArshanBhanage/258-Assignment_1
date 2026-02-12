import 'package:flutter_test/flutter_test.dart';
import 'package:receipt2split/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const Receipt2SplitApp());

    // Verify that the title shows up
    expect(find.text('Receipt2Split'), findsOneWidget);
    
    // Verify "New Split" button exists
    expect(find.text('New Split'), findsOneWidget);
  });
}
