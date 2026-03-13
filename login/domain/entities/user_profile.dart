import 'package:parchemos_prod/v2/parchemos/login/domain/entities/auth_user.dart';

class UserProfile {
  final String id;
  final String name;
  final String lastName;
  final String phone;
  final String portraitFilePath;
  final String role;

  final AuthUser authUser;

  UserProfile({
    required this.id,
    required this.name,
    required this.lastName,
    required this.phone,
    required this.portraitFilePath,
    required this.role,
    required this.authUser,
  });

  static UserProfile fromJson(obj, AuthUser authUser) {
    return UserProfile(
      id: obj['id'] as String,
      name: obj['name'] as String,
      lastName: obj['last_name'] as String,
      phone: obj['phone'] as String,
      portraitFilePath: obj['portrait_file_path'] as String,
      role: obj['role'] as String,
      authUser: authUser,
    );
  }
}
