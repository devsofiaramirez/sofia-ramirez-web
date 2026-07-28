// Genera un hash PBKDF2 compatible con src/lib/auth.ts para crear un segundo admin a mano
// (la página /admin/setup solo funciona una vez). Uso:
//   node scripts/hash-password.js "la-contraseña"
const crypto = globalThis.crypto ?? require('node:crypto').webcrypto;

const password = process.argv[2];
if (!password) {
  console.error('Uso: node scripts/hash-password.js "la-contraseña"');
  process.exit(1);
}

(async () => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100_000 }, keyMaterial, 256);
  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
  console.log(`${saltHex}:${hashHex}`);
  console.log('\nInsertar con:');
  console.log(`wrangler d1 execute sofia-ramirez-db --remote --command "INSERT INTO users (name, email, password_hash, role) VALUES ('Nombre', 'email@ejemplo.com', '${saltHex}:${hashHex}', 'admin');"`);
})();
