import 'package:flutter_test/flutter_test.dart';
import 'package:fitform_flutter/main.dart';

void main() {
  testWidgets('App starts successfully', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // Verify that the app loads
    expect(find.text('FitForm'), findsWidgets);
  });
}
