/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  JWT_SECRET: string;
  R2_PUBLIC_URL: string;
}

declare namespace App {
  interface Locals extends Runtime {
    user?: {
      id: number;
      name: string;
      email: string;
      role: 'super_admin' | 'admin';
    };
  }
}
