// Señales de progreso — español
export type ChecklistItem = { id: string; label: string };
export type ChecklistGroup = { title: string; items: ChecklistItem[] };

export const PROGRESS_INTRO =
  "Una lista de verificación que cubre cada parte de esta guía: discursos, temas de estudio, categorías de flashcards y señales de madurez senior. Marca los ítems cuando los domines; tu progreso se guarda en el navegador.";

export const CHECKLIST_GROUPS: ChecklistGroup[] = [
  {
    title: "🎥 Pitches grabados y revisados",
    items: [
      { id: "pg-p1", label: "01 · Intro de 30 segundos" },
      { id: "pg-p2", label: "02 · Intro de 60 segundos" },
      { id: "pg-p3", label: "03 · Historia de carrera de 2 minutos" },
      { id: "pg-p4", label: "04 · Por qué Next.js" },
      { id: "pg-p5", label: "05 · Por qué esta empresa / rol" },
      { id: "pg-p6", label: "06 · Profundización: RSC + modelo mental del App Router" },
      { id: "pg-p7", label: "07 · STAR: problema de rendimiento" },
      { id: "pg-p8", label: "08 · STAR: compromiso técnico" },
      { id: "pg-p9", label: "09 · Explícalo simple: Server vs Client Components" },
      { id: "pg-p10", label: "10 · Preguntas para hacerles" },
    ],
  },
  {
    title: "📚 Estudio — Núcleo del App Router (puedo explicar en voz alta)",
    items: [
      { id: "pg-s1", label: "Modelo mental del App Router y payload RSC" },
      { id: "pg-s2", label: "Enrutamiento por sistema de archivos y estructura del proyecto" },
      { id: "pg-s3", label: "Server vs Client Components + intercalación" },
      { id: "pg-s4", label: "Estrategias de renderizado (estático / dinámico / transmitido)" },
      { id: "pg-s5", label: "Cache Components: \"use cache\", cacheLife, cacheTag" },
      { id: "pg-s6", label: "El modelo anterior de caché (opciones de fetch, configuración de ruta)" },
      { id: "pg-s7", label: "Streaming y Suspense como el agujero dinámico" },
      { id: "pg-s8", label: "Patrones de obtención de datos (paralelo, preload, use())" },
      { id: "pg-s9", label: "Server Functions y Server Actions" },
      { id: "pg-s10", label: "Mutaciones y revalidación (revalidateTag/updateTag/refresh)" },
      { id: "pg-s11", label: "Rutas dinámicas, paralelas e interceptadas" },
      { id: "pg-s13", label: "proxy.ts (antes middleware.ts)" },
    ],
  },
  {
    title: "📚 Estudio — Renderizado, rendimiento y plataforma",
    items: [
      { id: "pg-s14", label: "Route Handlers vs Server Actions vs Server Components" },
      { id: "pg-s15", label: "Metadata, SEO y next/font" },
      { id: "pg-s16", label: "Optimización de imágenes y fuentes" },
      { id: "pg-s17", label: "APIs de solicitud asíncronas (cookies/headers/params como Promises)" },
      { id: "pg-s18", label: "Patrones de autenticación y autorización" },
      { id: "pg-s19", label: "Rendimiento y Turbopack" },
      { id: "pg-s20", label: "Testing y despliegue" },
    ],
  },
  {
    title: "🧠 Categorías de flashcards dominadas (Known)",
    items: [
      { id: "pg-c-core", label: "Core (App Router)" },
      { id: "pg-c-rendering", label: "Renderizado y Caché" },
      { id: "pg-c-data", label: "Datos y Server Actions" },
      { id: "pg-c-routing", label: "Enrutamiento" },
      { id: "pg-c-perf", label: "Rendimiento" },
      { id: "pg-c-auth", label: "Auth" },
      { id: "pg-c-testing", label: "Testing" },
      { id: "pg-c-security", label: "Seguridad" },
    ],
  },
  {
    title: "🛠 Práctica resuelta",
    items: [
      { id: "pg-pr-cache-components", label: "Coding: cachear un Server Component con Cache Components" },
      { id: "pg-pr-server-action-form", label: "Coding: formulario con Server Action y useActionState" },
      { id: "pg-pr-optimistic-like", label: "Coding: botón de like optimista con useOptimistic" },
      { id: "pg-pr-boundary-bug", label: "Coding: encontrar el bug de límite Server/Client" },
      { id: "pg-pr-debounced-search", label: "Coding: búsqueda con debounce que impulsa un Server Component" },
      { id: "pg-pr-proxy-auth", label: "Coding: protección de rutas con proxy.ts" },
      { id: "pg-pr-streaming-list", label: "Coding: lista paginada transmitida con Suspense" },
      { id: "pg-pr-catalog-rendering", label: "Design: estrategia de renderizado para catálogo e-commerce" },
      { id: "pg-pr-multitenant-dashboard", label: "Design: datos y caché para dashboard SaaS multi-tenant" },
      { id: "pg-pr-cache-migration-rollout", label: "Design: plan de migración segura de Cache Components" },
      { id: "pg-pr-observability-nextjs", label: "Design: observabilidad para una app Next.js en producción" },
    ],
  },
  {
    title: "✅ Señales de madurez senior",
    items: [
      { id: "pg-r1", label: "Explicar Server vs Client Components y el payload RSC desde cero" },
      { id: "pg-r2", label: "Explicar Cache Components (\"use cache\", cacheLife, cacheTag) de principio a fin" },
      { id: "pg-r3", label: "Articular el compromiso de la capa de caché en voz alta en rondas de diseño" },
      { id: "pg-r4", label: "Diseñar una estrategia de renderizado para un inventario real de páginas" },
      { id: "pg-r5", label: "Asegurar un Server Action (checks de auth, no solo un botón oculto)" },
      { id: "pg-r6", label: "Razonar sobre revalidateTag vs updateTag vs refresh" },
      { id: "pg-r7", label: "Perfilar y arreglar una regresión de Core Web Vitals" },
      { id: "pg-r8", label: "Explicar el compromiso del runtime Node.js-only de proxy.ts vs middleware edge" },
      { id: "pg-r9", label: "Diseñar un plan de despliegue seguro para una migración de caché/renderizado" },
      { id: "pg-r10", label: "Tener 4 preguntas afiladas listas para el entrevistador" },
    ],
  },
];
