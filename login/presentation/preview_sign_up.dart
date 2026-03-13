import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:parchemos_prod/v2/parchemos/login/presentation/screens/sign_up_screen.dart';

/// Preview temporal para ver la pantalla de registro
/// Ejecutar con: flutter run -t lib/v2/parchemos/login/presentation/preview_sign_up.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inicializar Supabase
  await Supabase.initialize(
    url: 'https://ppjgilhbgqgzfbdmxbdw.supabase.co',
    anonKey: 'sb_publishable_9y3sq_1_QGIlhRuHgOfaOw_884Zz_ov',
  );

  runApp(const ProviderScope(child: PreviewSignUpApp()));
}

class PreviewSignUpApp extends StatelessWidget {
  const PreviewSignUpApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Preview SignUp',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.orange,
        fontFamily: 'Inter', // O la fuente que uses en Parchemos
      ),
      home: const SignUpScreen(),
    );
  }
}
