import type { Level } from "@/lib/levels";

export type RoadmapStage = {
  level: Level;
  summary: string;
  can: string[];
  next: string[];
  drillHtml: string;
};

export const ROADMAP: RoadmapStage[] = [
  {
    level: "junior",
    summary:
      "Entregas páginas y componentes con guía. El objetivo es fluidez en los fundamentos del App Router — enrutamiento por sistema de archivos, la división Server/Client Component, y obtención básica de datos — para que puedas construir una página funcional de punta a punta.",
    can: [
      "Crear rutas con la convención de sistema de archivos: page.tsx, layout.tsx, loading.tsx, not-found.tsx.",
      "Explicar, a nivel superficial, que los componentes son Server Components por defecto y \"use client\" opta por el cliente.",
      "Obtener datos en un Server Component con async/await y renderizarlos directamente.",
      "Usar next/image y next/font para que las imágenes y tipografía no arruinen Lighthouse por defecto.",
      "Leer parámetros de ruta y searchParams en un componente de página.",
    ],
    next: [
      "Profundidad en enrutamiento dinámico: segmentos catch-all, grupos de rutas, y generateStaticParams.",
      "El modelo de caché — qué se cachea por defecto y por qué una página de repente se vuelve obsoleta o estática.",
      "Mutando datos con Server Actions en lugar de rutas API creadas manualmente.",
      "Escribir tus primeras pruebas de componentes y rutas con Jest/RTL.",
    ],
    drillHtml:
      'Practica las <a href="/flashcards">tarjetas</a> filtradas por <b>Junior</b>, más las categorías <b>Core</b> y <b>Enrutamiento</b>. Lee los temas de estudio <a href="/study#st-1">01</a>, <a href="/study#st-2">02</a>, <a href="/study#st-11">11</a>, y <a href="/study#st-16">16</a>.',
  },
  {
    level: "mid",
    summary:
      "Dueño una ruta de punta a punta — datos, layout, pruebas — con poca supervisión. El objetivo es profundidad en el kit de herramientas cotidiano del App Router: enrutamiento en capas, el modelo de caché anterior, y Server Actions para formularios reales.",
    can: [
      "Recurrir a grupos de rutas, rutas paralelas, y rutas interceptadas cuando la estructura de URL los requiera.",
      "Ajustar el caché de fetch con { cache, next: { revalidate, tags } } e invalidarlo con revalidatePath/revalidateTag.",
      "Construir un formulario con Server Action con estados pendiente/error, no un fetch del lado del cliente a una ruta API creada manualmente.",
      "Proteger una ruta con auth con una verificación en un layout o middleware y redirigir apropiadamente.",
      "Escribir pruebas unitarias para componentes y rutas con Jest y React Testing Library.",
    ],
    next: [
      "Profundidad en Cache Components: \"use cache\", cacheLife, cacheTag, y cómo reemplazan el viejo modelo mental de fetch-cache.",
      "Perfilado de rendimiento: leyendo el payload RSC, reduciendo bundles del cliente, persiguiendo Core Web Vitals con herramientas reales.",
      "Endurecimiento de seguridad: la capa de acceso a datos, evitando filtración de secretos a bundles del cliente, CSRF en Server Actions.",
      "Pensamiento de diseño de sistemas frontend: dónde viven realmente las decisiones de estrategia de renderizado y caché.",
    ],
    drillHtml:
      'Filtra las tarjetas por <b>Mid</b> y las categorías <b>Datos</b>, <b>Enrutamiento</b>, <b>Testing</b>, y <b>Core</b>. Trabaja los temas de estudio <a href="/study#st-3">03</a>, <a href="/study#st-6">06</a>, <a href="/study#st-9">09</a>, <a href="/study#st-10">10</a>, y <a href="/study#st-20">20</a>.',
  },
  {
    level: "senior",
    summary:
      "Traes profundidad en renderizado, caché, y rendimiento, y elevas el estándar del equipo en velocidad y seguridad. El objetivo ser la persona que perfila en lugar de adivinar y puede defender una decisión de caché bajo interrogación.",
    can: [
      "Explicar Cache Components (\"use cache\", cacheLife, cacheTag) y el payload RSC de memoria, incluyendo lo que realmente cruza la red.",
      "Diseñar auth para que no pueda ser evadida: verificaciones en proxy.ts para enrutamiento más verificaciones reales dentro de cada Server Action y llamada de acceso a datos.",
      "Perfilar Core Web Vitals con Lighthouse, Chrome DevTools, y Vercel Analytics, luego arreglar el cuello de botella real.",
      "Endurecer una aplicación contra XSS, CSRF, y filtración accidental de secretos del servidor a bundles del cliente.",
      "Decidir, con razones, cuándo una ruta debería ser estática, dinámica, o transmitida — y defender el compromiso.",
    ],
    next: [
      "Diseño de sistemas a escala: estrategia de renderizado/caché para un producto completo, no una ruta.",
      "Decisiones de monorepo y biblioteca de componentes compartida que otros equipos construyen encima.",
      "Entrega en edge: qué pertenece al edge, qué no, y por qué.",
      "Impulsar una migración segura y escalonada (por ejemplo, adoptando Cache Components) a través de una base de código grande.",
    ],
    drillHtml:
      'Filtra las tarjetas por <b>Senior</b> y las categorías <b>Rendering</b>, <b>Perf</b>, <b>Auth</b>, y <b>Seguridad</b>. Lee los temas de estudio <a href="/study#st-5">05</a>, <a href="/study#st-13">13</a>, <a href="/study#st-17">17</a>, <a href="/study#st-18">18</a>, <a href="/study#st-19">19</a>, y la <a href="/architecture">Guía de Arquitectura</a> completa.',
  },
  {
    level: "architect",
    summary:
      "Diseñas la estrategia de renderizado y caché para un producto completo y tomas las decisiones de plataforma que mueven a un equipo entero. El objetivo es la toma de decisiones antes del código — para la red más lenta, el bundle más grande, y la migración más riesgosa.",
    can: [
      "Diseñar una estrategia de renderizado/caché para un producto completo y justificarla ruta por ruta.",
      "Dueño de estructura de monorepo y una biblioteca de componentes compartida que múltiples aplicaciones construyen encima.",
      "Tomar la decisión de edge/CDN/modelo de despliegue y explicar qué compra y qué cuesta.",
      "Impulsar una migración grande y segura — por ejemplo, una implementación escalonada de Cache Components — sin una reescritura de golpe.",
      "Establecer convenciones a nivel de organización para obtención de datos, límites de errores, y testing para que los equipos dejen de reinventarlos.",
    ],
    next: [
      "Estrategia de plataforma a nivel de organización: caminos dorados, herramientas compartidas, y cómo se inicializan nuevas aplicaciones.",
      "Presupuestos de costo y rendimiento a escala — qué cuesta realmente una regresión y cómo la detectas antes de que se envíe.",
    ],
    drillHtml:
      'Filtra las tarjetas por <b>Architect</b> y las categorías <b>Rendering</b> y <b>Core</b>. Trabaja la <a href="/architecture">Guía de Arquitectura</a> completa y los <a href="/practice">prompts de diseño de sistemas</a>.',
  },
  {
    level: "beyond",
    summary:
      "La frontera — donde empujas lo que un frontend de Next.js puede hacer. El objetivo traer capacidad genuinamente nueva y ser pionero en los patrones que el resto del equipo eventualmente adoptará.",
    can: [
      "Ser pionero en patrones de adopción de Cache Components antes de que sean conocimiento común en el equipo.",
      "Construir UIs de IA con streaming — SSE o el hook use() con Suspense — para respuestas de LLM que se renderizan a medida que llegan.",
      "Usar View Transitions y <Activity> para hacer que la navegación se sienta como una aplicación en lugar de como una recarga de página.",
      "Contribuir patrones de renderizado y caché upstream, de vuelta al ecosistema del framework o herramientas internas.",
    ],
    next: [
      "Seguir rastreando el borde del framework — las nuevas primitivas llegan rápido, y ser temprano es todo el punto de este nivel.",
    ],
    drillHtml:
      'Filtra las tarjetas por <b>Beyond</b>, y lee los temas de estudio <a href="/study#st-5">05</a>, <a href="/study#st-9">09</a>. Prueba los <a href="/practice">prompts de diseño de UI con streaming y migración</a>.',
  },
];
