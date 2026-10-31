import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from './lib/auth';
import { SESSION_COOKIE, getJwtSecret } from './lib/session';

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/setup'];

// En Cloudflare Pages el archivo _headers no aplica a las páginas SSR: las cabeceras se ponen aquí.
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Una sola versión del sitio para Google: www redirige al dominio principal.
  if (context.url.hostname === 'www.sofiaramirez.co') {
    return Response.redirect(`https://sofiaramirez.co${pathname}${context.url.search}`, 301);
  }

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

  const response = await next();
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(name, value);
  return response;
});
