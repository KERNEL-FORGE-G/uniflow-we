import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:uniflow_desktop/main.dart';

void main() {
  testWidgets('UniFlow Desktop smoke test with Actualites Campus and UniMail',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(const UniFlowDesktopApp());
    expect(find.text('UniFlow'), findsWidgets);
    expect(find.text('Actualités Campus'), findsWidgets);
    expect(find.text('UniMail (@uniflow.cm)'), findsWidgets);

    // Navigate to Actualités Campus
    await tester.tap(find.text('Actualités Campus').first);
    await tester.pumpAndSettle();
    expect(find.textContaining('phase de test bêta'), findsWidgets);

    // Navigate to UniMail (@uniflow.cm)
    await tester.tap(find.text('UniMail (@uniflow.cm)').first);
    await tester.pumpAndSettle();
    expect(find.textContaining('etudiant.uy1@uniflow.cm'), findsWidgets);
  });
}
