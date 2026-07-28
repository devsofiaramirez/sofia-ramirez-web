export const prerender = false;
import type { APIRoute } from 'astro';
import { findUserByEmail } from '@/lib/db';
import { verifyPassword, createToken } from '@/lib/auth';
import { SESSION_COOKIE, getJwtSecret } from '@/lib/session';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const redirect = (path: string) => new Response(null, { status: 302, headers: { Location: path } });

  const form = await request.formData().catch(() => null);
  const email = form?.get('email')?.toString().trim().toLowerCase();
  const password = form?.get('password')?.toString();
  if (!email || !password) return redirect('/admin/login?error=required');

  const db = locals.runtime.env.DB;
  const user = await findUserByEmail(db, email);
  if (!user || !user.is_active) return redirect('/admin/login?error=invalid');

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return redirect('/admin/login?error=invalid');

  const secret = getJwtSecret(locals.runtime.env);
  if (!secret) return redirect('/admin/login?error=server');

  const token = await createToken({ id: user.id, name: user.name, email: user.email, role: user.role }, secret);

  cookies.set(SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 horas
  });

  return redirect('/admin');
};
