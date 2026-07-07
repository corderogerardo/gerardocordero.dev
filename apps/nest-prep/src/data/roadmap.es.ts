import type { Level } from "@/lib/levels";

export type RoadmapStage = {
  level: Level;
  summary: string;
  /** Lo que ya puedes hacer en este nivel. */
  can: string[];
  /** Qué aprender para alcanzar el siguiente nivel. */
  next: string[];
  /** Dónde practicar en esta app (renderizado como HTML enriquecido con enlaces). */
  drillHtml: string;
};

export const ROADMAP: RoadmapStage[] = [
  {
    level: "junior",
    summary:
      "Construyes endpoints y entregas features con orientación. El objetivo es fluidez en los fundamentos — módulos, controladores, proveedores, DTOs y acceso básico a datos — para que puedas entregar un módulo CRUD funcional de extremo a extremo.",
    can: [
      "Generar un módulo con el CLI y conectar un controlador + servicio.",
      "Definir rutas y leer parámetros/query/body con DTOs.",
      "Inyectar un servicio vía el constructor y entender que es un singleton.",
      "Validar entrada con class-validator + un ValidationPipe global.",
      "Leer y escribir datos a través de un repositorio (TypeORM/Prisma/Mongoose).",
    ],
    next: [
      "Inyección de dependencias en profundidad: tokens, proveedores personalizados, exports/imports.",
      "El ciclo de vida de requests — guards, interceptores, pipes, filtros y su orden.",
      "El event loop de Node y las trampas de async/await.",
      "Escribir tus primeras pruebas unitarias + e2e con @nestjs/testing y supertest.",
    ],
    drillHtml:
      'Practica las <a href="/flashcards">flashcards</a> filtradas a <b>Junior</b>, más las categorías <b>Core</b> y <b>Data &amp; ORM</b>. Lee los temas de estudio <a href="/study#st-1">01</a>–<a href="/study#st-4">04</a>, <a href="/study#st-8">08</a> y <a href="/study#st-14">14</a>.',
  },
  {
    level: "mid",
    summary:
      "Eres dueño de módulos de extremo a extremo — datos, validación, tests — con poca orientación. El objetivo es profundidad en el toolkit diario de NestJS y el inicio de la conciencia de rendimiento.",
    can: [
      "Usar el pipeline de requests completo: guards, interceptores, pipes, filtros de excepción.",
      "Modelar configuración con @nestjs/config y validar entorno al arrancar.",
      "Ejecutar transacciones y evitar la trampa de synchronize en producción.",
      "Escribir pruebas unitarias con proveedores sobrescritos y e2e con supertest.",
      "Razonar sobre el event loop y evitar bloquearlo.",
    ],
    next: [
      "Alcances de inyección y el costo de REQUEST scope; módulos dinámicos (forRoot/forFeature).",
      "Autenticación (JWT/Passport), RBAC y rate limiting.",
      "Caché, colas (BullMQ), programación y eventos — y sus trampas multi-réplica.",
      "Streams y backpressure; worker_threads vs cluster.",
    ],
    drillHtml:
      'Filtra flashcards a <b>Mid</b> y las categorías <b>DI &amp; Modules</b>, <b>Request Lifecycle</b>, <b>Config</b> y <b>Testing</b>. Trabaja los temas de estudio <a href="/study#st-5">05</a>–<a href="/study#st-13">13</a> y <a href="/study#st-20">20</a>–<a href="/study#st-25">25</a>.',
  },
  {
    level: "senior",
    summary:
      "Traes profundidad en DI, rendimiento y madurez en seguridad, y elevas al equipo a tu alrededor. El objetivo es ser la persona que perfila en lugar de adivinar y razona sobre el sistema, no solo la sintaxis.",
    can: [
      "Explicar los alcances de DI, módulos dinámicos y el ciclo de vida de requests de memoria.",
      "Diseñar auth (JWT + refresh, RBAC/ABAC) y endurecer la API.",
      "Perfilar y corregir bloqueo del event loop, consultas N+1 y fugas de memoria.",
      "Hacer que caché/rate-limiting/colas sean correctos entre réplicas con Redis.",
      "Ser dueño de observabilidad: logs estructurados, traces, health checks, apagado graceful.",
    ],
    next: [
      "Diseño de sistemas a escala: layering/hexagonal, CQRS, patrones de resiliencia.",
      "Microservicios: transportes, message vs event, sagas + outbox.",
      "GraphQL a escala (DataLoader, federation) y tiempo real (WebSockets + Redis).",
      "Despliegue: Docker multi-stage, CI/CD, SLOs.",
    ],
    drillHtml:
      'Filtra flashcards a <b>Senior</b> y las categorías <b>Node.js Core</b>, <b>Performance</b>, <b>Security</b>, <b>Auth</b> y <b>Deploy &amp; Ops</b>. Lee los temas de estudio <a href="/study#st-26">26</a>–<a href="/study#st-34">34</a> y la <a href="/architecture">guía completa de Arquitectura</a>.',
  },
  {
    level: "architect",
    summary:
      "Diseñas sistemas backend de extremo a extremo y tomas decisiones de plataforma que mueven a un equipo completo. El objetivo es la toma de decisiones antes del código — para la peor consulta, la peor red y el peor pico de tráfico.",
    can: [
      "Diseñar un servicio de extremo a extremo y justificar la arquitectura, datos y estrategia de consistencia.",
      "Elegir entre monolito modular y microservicios y trazar límites limpios.",
      "Aplicar sagas, el outbox, idempotencia y patrones de resiliencia.",
      "Diseñar multi-tenancy y prevenir filtración entre tenants.",
      "Implementar CI/CD, observabilidad y SLOs entre servicios.",
    ],
    next: [
      "Estrategia de plataforma a nivel de organización: librerías compartidas, convenciones, caminos dorados.",
      "Presupuestos de costo/rendimiento a escala y evaluación de tecnologías emergentes.",
    ],
    drillHtml:
      'Filtra flashcards a <b>Architect</b> y las categorías <b>Architecture</b> y <b>Microservices</b>. Trabaja la <a href="/architecture">guía de Arquitectura + Inmersiones</a>, los <a href="/practice">prompts de diseño de sistemas</a> y los temas de estudio <a href="/study#st-28">28</a>, <a href="/study#st-36">36</a>.',
  },
  {
    level: "beyond",
    summary:
      "La frontera — donde empujas lo que un backend Node/NestJS puede hacer. El objetivo es traer capacidad genuinamente nueva y开创 patrones que el resto del equipo adoptará.",
    can: [
      "Ejecutar NestJS en serverless/edge con arranque cacheado y connection pooling.",
      "Construir sistemas basados en event sourcing y CQRS donde genuinamente encajen.",
      "Stremear respuestas LLM/AI (SSE/WebSocket) con backpressure y cancelación.",
      "Usar AsyncLocalStorage para contexto con rendimiento de singleton scope.",
    ],
    next: [
      "Adoptar NestJS 12 (ESM, Standard Schema/Zod, Vitest) y contribuir patrones de vuelta al equipo.",
    ],
    drillHtml:
      'Filtra flashcards a <b>Beyond</b> y lee los temas de estudio <a href="/study#st-29">29</a>, <a href="/study#st-30">30</a>. Prueba los <a href="/practice">prompts de diseño basados en eventos e idempotencia</a>.',
  },
];
