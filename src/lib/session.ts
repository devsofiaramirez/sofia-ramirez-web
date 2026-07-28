// Constantes compartidas entre middleware.ts y api/auth/*.ts.
// Deben ser IDÉNTICAS en ambos lados o el JWT creado en login no se puede verificar (ver guía, error #8).
export const SESSION_COOKIE = 'sofia_admin_session';
export const DEV_SECRET_FALLBACK = 'sofia-ramirez-dev-secret-local';

export function getJwtSecret(env: { JWT_SECRET?: string }): string | null {
  if (env?.JWT_SECRET) return env.JWT_SECRET;
  return import.meta.env.PROD ? null : DEV_SECRET_FALLBACK;
}
