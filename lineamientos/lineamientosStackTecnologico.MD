<aside>
🧭

**Lineamientos de stack técnico — North Pearl**
Documento de referencia para decisiones de arquitectura en proyectos de North Pearl. Complementa los lineamientos de responsivo y SEO.
**Última actualización: julio 2026.**

</aside>

---

## Propósito

Este documento define qué tecnologías usamos por defecto, cuándo nos apartamos de ese default, y los criterios para decidir entre las alternativas cloud native que tenemos disponibles.

El objetivo es que cualquier proyecto nuevo en North Pearl arranque con la misma base técnica, sin que cada equipo tenga que redescubrir estas decisiones desde cero.

## Principios generales

- **SEO y rendimiento son criterio de decisión, no un checklist al final.** Si una elección técnica compromete Core Web Vitals o indexabilidad, se reconsidera.
- **Monolito modular primero.** Extraemos una función a un servicio independiente (Worker o Lambda) solo cuando hay una razón concreta, no por defecto.
- **Cloud native donde realmente aporta** (edge, costos, velocidad de despliegue), sin sacrificar mantenibilidad ni forzar una tecnología nueva sin necesidad clara.
- **Optimización de costos como parte del diseño**, no como ajuste posterior — elegimos el servicio administrado correcto desde el inicio.

---

## 1. Frontend 🖥️

### 1.1 Astro — default para sitios orientados a contenido y SEO

<aside>
✅

**Regla rápida**: Astro rinde mejor cuando la mayor parte de la página es contenido y navegación, no una app con estado complejo.

</aside>

**Usar Astro para:**

- Landing pages y sitios corporativos
- Portales de contenido
- Páginas de producto y catálogos (PLP/PDP) de ecommerce
- Cualquier sitio donde SEO y Core Web Vitals sean la prioridad

Astro no es la herramienta correcta cuando el proyecto es, en esencia, una aplicación con estado complejo: dashboards internos, paneles de administración, configuradores muy dinámicos. Forzar Astro ahí termina apilando islas interactivas sobre islas interactivas y se pierde la ventaja de rendimiento que buscamos.

**Regla práctica:** si más del 60-70% de la página es interactiva y depende de estado compartido entre componentes, no es un proyecto Astro — es una SPA aparte.

### 1.2 Cuándo usar un framework de aplicación aparte

Para las piezas que no encajan en Astro (dashboards, backoffice, configuradores complejos), usar Next.js u otro framework de aplicación, como proyecto separado del sitio Astro — no como parche dentro de él.

### 1.3 Hosting y CI/CD

- **Desplegar en Cloudflare Pages, para todo proyecto nuevo.** Desde marzo de 2026 Workers tiene paridad completa con Pages para sitios estáticos, SSR y dominios personalizados, y es la ruta que Cloudflare recomienda para proyectos nuevos.
- CI/CD automático vía GitHub, con preview deployments por rama/PR.
- Separación de ambientes, variables de entorno y secrets gestionada por proyecto — nunca hardcodear ni versionar secrets en el repo.

---

## 2. Backend 🧩

### 2.1 NestJS como framework de aplicación por defecto

Se mantiene como estándar: estructura ordenada, inyección de dependencias, testing de fábrica, y facilita que varios desarrolladores trabajen en el mismo backend sin que se vuelva espagueti.

### 2.2 Hosting: Fargate o App Runner en lugar de EC2

Migrar el estándar de despliegue de EC2 a **ECS Fargate** o **AWS App Runner**.

| Tema | EC2 | Fargate / App Runner |
| --- | --- | --- |
| Gestión de servidores | Manual (patching, AMIs) | Ninguna |
| Autoscaling | Configuración manual | Nativo |
| Modelo de costo | Instancia encendida 24/7 | Por uso real |
| Mantenimiento | Alto | Bajo |

Mismo contenedor NestJS, sin cambios de código — solo cambia dónde corre.

### 2.3 Monolito modular + funciones puntuales

<aside>
🧠

**Idea guía**: si no hay un beneficio claro (latencia, escala independiente o desacoplamiento), mantenerlo dentro del monolito.

</aside>

Seguimos construyendo apps como **monolito modular** por defecto. Extraemos una función a Cloudflare Workers o AWS Lambda solo cuando se cumple alguno de estos criterios:

- La función necesita correr en el edge por latencia (ej: validaciones de auth, redirects, personalización geográfica)
- Es un proceso puntual y desacoplado (webhooks, procesamiento de imágenes, jobs programados)
- Necesita escalar de forma independiente al resto de la aplicación
- No justifica el overhead de un microservicio completo (service mesh, discovery, contratos versionados entre servicios)

Si ninguno de estos aplica, la función se queda dentro del monolito.

---

## 3. Bases de datos — matriz de decisión 🗄️

| Motor | Usar cuando | Límites a tener en cuenta |
| --- | --- | --- |
| **PostgreSQL / Aurora** | Es el core transaccional del negocio: usuarios, pedidos, facturación. Necesitas transacciones ACID complejas, joins profundos, reportería SQL avanzada, o alta concurrencia de escritura. | Costo base fijo si no se usa Aurora Serverless v2. |
| **Cloudflare D1** | Bounded contexts pequeños de lectura intensiva junto a un Worker: configuración/feature flags, catálogos de baja escritura, patrón de una base por tenant en productos multi-tenant pequeños. | Máximo 10 GB por base de datos. Procesa consultas de una en una (single-threaded) — no apto para alta concurrencia de escritura. Escalar más allá de 10 GB implica shardear manualmente. |
| **DynamoDB** | Patrones de acceso predecibles tipo key-value, escala horizontal masiva, latencia baja y consistente sin importar el volumen: sesiones, carritos efímeros, colas, rate limiting, logs de eventos de alto volumen. | No sirve para queries ad-hoc ni joins complejos. |

**Regla práctica:** Aurora es el default seguro para el core del negocio. D1 y DynamoDB se eligen por un patrón de acceso específico, no como reemplazo general de Postgres.

---

## 4. Seguridad 🔐

- WAF de Cloudflare al frente de todo tráfico público.
- Secrets en AWS Secrets Manager o Cloudflare Secrets Store — nunca en variables de entorno planas ni en el repositorio.
- Rotación automática de credenciales y llaves.

## 5. Observabilidad 🔎

- OpenTelemetry como estándar, con un backend único (ej: Grafana Cloud, Axiom, Baselime) que cubra Workers, NestJS y Lambdas en un mismo lugar. Evitar logs en silos separados por proveedor.

## 6. Infraestructura como código 🧱

- Terraform o Pulumi para todo el stack, incluyendo los recursos de Cloudflare y AWS en el mismo flujo. Es lo que da reproducibilidad y trazabilidad cuando algo falla en producción.

## 7. Contratos tipados de punta a punta 🧾

- NestJS genera OpenAPI desde decoradores — conectar eso a un cliente tipado en el frontend.
- En proyectos que migren a monorepo TypeScript en ambos lados, evaluar tRPC para eliminar la sincronización manual de tipos.

## 8. Multi-tenancy 🧑‍🤝‍🧑

- Definir la estrategia de multi-tenancy **antes** de escalar la cantidad de clientes en un proyecto. Esta decisión determina si el patrón "una base D1 por tenant" es viable o si conviene un esquema multi-tenant sobre Aurora.

## 9. FinOps 💸

- Dashboard de costo por servicio, con revisión trimestral.
- Usar Aurora Serverless v2 en ambientes de tráfico variable (staging, clientes de bajo volumen) en lugar de instancias provisionadas fijas.

---

## 10. Checklist para un proyecto nuevo ✅

- [ ]  ¿El sitio es contenido/SEO-first? → Astro en Cloudflare Workers (static assets)
- [ ]  ¿Necesita partes muy interactivas con estado complejo? → Framework de aplicación aparte, no forzado dentro de Astro
- [ ]  ¿El backend es NestJS? → Desplegar en Fargate o App Runner, no en EC2
- [ ]  ¿Hay una función puntual candidata a extraerse? → Revisar los 4 criterios de la sección 2.3 antes de crear un servicio nuevo
- [ ]  ¿Qué motor de base de datos corresponde? → Revisar la matriz de decisión de la sección 3
- [ ]  ¿Están los secrets fuera del repo y en un vault administrado?
- [ ]  ¿Hay observabilidad unificada configurada desde el día uno?
- [ ]  ¿La infraestructura está definida en código (Terraform/Pulumi)?