import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from './lib/auth';
import { SESSION_COOKIE, getJwtSecret } from './lib/session';

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/setup'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const secret = getJwtSecret(context.locals.runtime?.env ?? {});
  if (!secret) return new Response('JWT_SECRET no configurado', { status: 500 });

  const token = context.cookies.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      context.locals.user = await verifyToken(token, secret);
    } catch {
      if (pathname.startsWith('/admin') && !PUBLIC_ADMIN_PATHS.includes(pathname)) {
        context.cookies.delete(SESSION_COOKIE, { path: '/' });
        return context.redirect('/admin/login');
      }
    }
  } else if (pathname.startsWith('/admin') && !PUBLIC_ADMIN_PATHS.includes(pathname)) {
    return context.redirect('/admin/login');
  }

  return next();
});
