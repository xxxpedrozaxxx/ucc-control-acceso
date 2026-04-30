/**
 * Script de utilidad: genera un hash bcrypt para crear el primer admin.
 *
 * Uso:
 *   node database/scripts/generar_hash_admin.js TuContraseña123
 *
 * Copia el hash resultado y ejecuta en Supabase SQL Editor:
 *   INSERT INTO admins (id_institucional, contrasena_hash)
 *   VALUES ('TU_ID_INSTITUCIONAL', 'HASH_AQUI');
 */

const bcrypt = require('bcryptjs');

const contrasena = process.argv[2];

if (!contrasena) {
  console.error('Uso: node generar_hash_admin.js <contraseña>');
  process.exit(1);
}

bcrypt.hash(contrasena, 12, (err, hash) => {
  if (err) { console.error(err); process.exit(1); }
  console.log('\n✅ Hash generado:\n');
  console.log(hash);
  console.log('\nEjecuta en Supabase SQL Editor:');
  console.log(`INSERT INTO admins (id_institucional, contrasena_hash) VALUES ('TU_ID', '${hash}');`);
});
