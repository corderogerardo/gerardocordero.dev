// Quiz de opción múltiple — Fundamentos de NestJS (core, DI, ciclo de vida, datos, auth, testing).
import type { Level } from "@/lib/levels";

export type QuizQuestion = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  options: string[];
  answer: number; // índice de la opción correcta
  explanationHtml: string;
  level?: Level;
};

export const QUIZ: QuizQuestion[] = [
  {
    id: "qz1",
    category: "core",
    categoryLabel: "Core",
    question: "¿Por qué un DTO de NestJS debe ser una clase en lugar de una interface de TypeScript?",
    options: [
      "Las clases se instancian más rápido",
      "Las interfaces no pueden tener decoradores en absoluto",
      "Las interfaces se eliminan en runtime, por lo que ValidationPipe no tiene metatipo para validar",
      "Nest solo soporta clases por razones históricas",
    ],
    answer: 2,
    explanationHtml:
      "<p>Las interfaces existen solo en tiempo de compilación. <code>ValidationPipe</code> + class-validator necesitan el <b>metatipo</b> de runtime (la clase) para leer decoradores y validar. Un DTO de interface significa que la validación silenciosamente no hace nada.</p>",
  },
  {
    id: "qz2",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "En el ciclo de vida de una request, ¿cuál se ejecuta PRIMERO?",
    options: ["Pipes", "Guards", "Interceptores", "Middleware"],
    answer: 3,
    explanationHtml:
      "<p>Orden: <b>Middleware → Guards → Interceptores (pre) → Pipes → Manejador → Interceptores (post) → Filtros</b>. El middleware se ejecuta antes de que exista siquiera el contexto de ejecución de Nest.</p>",
  },
  {
    id: "qz3",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "¿Cuál es el bloque correcto para la autorización (RBAC)?",
    options: ["Middleware", "Pipe", "Guard", "Interceptor"],
    answer: 2,
    explanationHtml:
      "<p>Los Guards (<code>canActivate</code>) están diseñados para autorización: devuelven un boolean y tienen un <code>ExecutionContext</code>, por lo que pueden leer metadatos de ruta vía <code>Reflector</code> para verificación de roles.</p>",
  },
  {
    id: "qz4",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "¿Cuál es el costo principal de hacer un proveedor REQUEST-scoped?",
    options: [
      "Ya no puede ser exportado",
      "El alcance se propaga por la cadena de inyección, haciendo que los consumidores también sean REQUEST-scoped y añadiendo overhead por request",
      "Se convierte en singleton",
      "Deshabilita la inyección de dependencias para ese proveedor",
    ],
    answer: 1,
    explanationHtml:
      "<p>El REQUEST scope <b>se propaga hacia arriba</b>: una hoja con REQUEST scope fuerza a sus consumidores (hasta el controlador) a ser REQUEST-scoped, añadiendo instanciación/liberación por request. Un logger/DB compartido con REQUEST scope puede convertir toda la aplicación.</p>",
  },
  {
    id: "qz5",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "Necesitas inyectar un valor detrás de una interface. ¿Qué haces?",
    options: [
      "Inyectar la interface directamente por nombre",
      "Usar un token string/symbol con @Inject() y vincular un proveedor a él",
      "Hacer que la interface sea una clase automáticamente",
      "Usar @Optional() en la interface",
    ],
    answer: 1,
    explanationHtml:
      "<p>Las interfaces desaparecen en runtime, por lo que no pueden ser tokens. Define un token string/symbol, vincúlalo con <code>{ provide: TOKEN, useClass/useValue }</code> e inyecta con <code>@Inject(TOKEN)</code>. Esta es la mecánica de ports &amp; adapters.</p>",
  },
  {
    id: "qz6",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "La misma clase de servicio está listada en los `providers` de dos módulos. ¿Qué sucede?",
    options: [
      "Nest lanza un error de proveedor duplicado",
      "Ambos módulos comparten una instancia",
      "Cada módulo obtiene su propia instancia separada",
      "Solo el primer registro gana",
    ],
    answer: 2,
    explanationHtml:
      "<p>Cada módulo que la lista en <code>providers</code> obtiene su <b>propia instancia</b>. Para compartir un singleton, regístrala una vez, <code>exportala</code> e <code>importa</code> ese módulo en todas partes.</p>",
  },
  {
    id: "qz7",
    category: "config",
    categoryLabel: "Config & Validation",
    question: "¿Qué hace `whitelist: true` en ValidationPipe?",
    options: [
      "Permite solo IPs en lista blanca",
      "Elimina propiedades que no tienen decorador de validación",
      "Lanza error en cualquier propiedad extra",
      "Transforma el payload en una instancia de clase",
    ],
    answer: 1,
    explanationHtml:
      "<p><code>whitelist</code> elimina propiedades sin decorador (defiende contra mass-assignment). <code>forbidNonWhitelisted</code> lanza error en su lugar; <code>transform</code> construye la instancia del DTO y convierte primitivos.</p>",
  },
  {
    id: "qz8",
    category: "data",
    categoryLabel: "Data & ORM",
    question: "¿Qué configuración de TypeORM NUNCA debe ser true en producción?",
    options: ["logging", "synchronize", "autoLoadEntities", "migrationsRun"],
    answer: 1,
    explanationHtml:
      "<p><code>synchronize: true</code> altera automáticamente el esquema desde tus entidades y puede eliminar datos silenciosamente. Usa migraciones con <code>synchronize: false</code> en producción.</p>",
  },
  {
    id: "qz9",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "¿Por qué registrar un guard global vía APP_GUARD en lugar de app.useGlobalGuards(new X())?",
    options: [
      "Es más corto de escribir",
      "Solo APP_GUARD soporta múltiples guards",
      "APP_GUARD lo convierte en un proveedor DI, por lo que puede inyectar dependencias",
      "useGlobalGuards está deprecado",
    ],
    answer: 2,
    explanationHtml:
      "<p>Las instancias creadas con <code>new</code> viven fuera del contenedor y no pueden inyectar nada. Registrar vía <code>APP_GUARD</code> convierte al guard en un proveedor que puede inyectar <code>Reflector</code>, servicios, configuración, etc.</p>",
  },
  {
    id: "qz10",
    category: "auth",
    categoryLabel: "Auth",
    question: "¿Cuándo NO se necesita protección CSRF?",
    options: [
      "Cuando se usan cookies de sesión",
      "Para una API stateless autenticada con tokens Bearer",
      "Cuando el sitio tiene formularios",
      "Cuando se usa HTTPS",
    ],
    answer: 1,
    explanationHtml:
      "<p>CSRF explota credenciales que el navegador adjunta automáticamente (cookies). Una API stateless con tokens Bearer no es vulnerable porque el atacante no puede leer ni adjuntar el token. La protección CSRF importa para autenticación con cookies/sesiones.</p>",
  },
  {
    id: "qz11",
    category: "auth",
    categoryLabel: "Auth",
    question: "¿Cuál es la mejor práctica para almacenar contraseñas de usuarios?",
    options: [
      "Cifrado AES-256",
      "Hash SHA-256",
      "bcrypt o argon2 (con sal, lento, unidireccional)",
      "Codificación Base64",
    ],
    answer: 2,
    explanationHtml:
      "<p>Las contraseñas necesitan un hash <b>lento, con sal, unidireccional</b> — bcrypt o argon2. El cifrado es reversible (incorrecto para contraseñas); hashes rápidos como SHA-256 son vulnerables a fuerza bruta; Base64 no es seguridad en absoluto.</p>",
  },
  {
    id: "qz12",
    category: "testing",
    categoryLabel: "Testing",
    question: "En un test unitario de Nest, ¿cómo se reemplaza una dependencia real con un mock?",
    options: [
      "Editar el array de providers del módulo directamente",
      "Usar Test.createTestingModule(...).overrideProvider(X).useValue(mock)",
      "Los mocks no están soportados; usa la dependencia real",
      "Establecer process.env.MOCK=true",
    ],
    answer: 1,
    explanationHtml:
      "<p><code>Test.createTestingModule({...}).overrideProvider(Token).useValue(mock)</code> (encadenado antes de <code>.compile()</code>) intercambia la dependencia. También hay <code>overrideGuard/Interceptor/Pipe/Filter/Module</code>.</p>",
  },
  {
    id: "qz13",
    category: "core",
    categoryLabel: "Core",
    question: "¿Qué sucede cuando inyectas @Res() en un controlador sin passthrough?",
    options: [
      "Nada cambia",
      "Cambia al modo específico de la librería y debes enviar la respuesta tú mismo, perdiendo interceptores",
      "Nest envía la respuesta dos veces",
      "Habilita streaming automáticamente",
    ],
    answer: 1,
    explanationHtml:
      "<p><code>@Res()</code> te da el objeto de respuesta raw — debes llamar a <code>res.send()</code> tú mismo, y el pipeline estándar de respuesta de Nest (interceptores, <code>@HttpCode</code>) ya no aplica. Usa <code>@Res({ passthrough: true })</code> para mantener el manejo de Nest.</p>",
  },
  {
    id: "qz14",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "¿Cuál es el ÚNICO mejorador que resuelve de nivel más bajo primero (ruta → controlador → global)?",
    options: ["Guards", "Pipes", "Interceptores", "Filtros de excepción"],
    answer: 3,
    explanationHtml:
      "<p>Los filtros de excepción resuelven ruta → controlador → global. Los guards e interceptores pre van global → ruta; los interceptores post se desenrollan ruta → global (cebolla).</p>",
  },
  {
    id: "qz15",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "¿Cuál es la primera respuesta recomendada a una dependencia circular?",
    options: [
      "Siempre usar forwardRef()",
      "Refactorizar — a menudo es causado por archivos barrel index.ts; importa el archivo concreto o extrae un proveedor compartido",
      "Hacer ambos proveedores globales",
      "Cambiarlos a REQUEST scope",
    ],
    answer: 1,
    explanationHtml:
      "<p>Un ciclo es generalmente una señal de mal diseño, frecuentemente causado por archivos barrel. Corrige la estructura primero (importa rutas concretas, extrae un módulo compartido). <code>forwardRef()</code> en ambos lados o <code>ModuleRef</code> son alternativas.</p>",
  },
  {
    id: "qz16",
    category: "config",
    categoryLabel: "Config & Validation",
    question: "¿Cuál es la mejor forma de detectar una variable de entorno requerida faltante?",
    options: [
      "Verificarla lazy en la primera request",
      "Validar el entorno al arrancar con un esquema (Joi/zod) en ConfigModule para que el arranque falle rápido",
      "Envolver cada acceso en try/catch",
      "Por defecto todo a strings vacíos",
    ],
    answer: 1,
    explanationHtml:
      "<p>Valida <code>process.env</code> una vez al inicio vía <code>validationSchema</code> (o una <code>validate</code> personalizada). La app crashea inmediatamente por mala configuración en lugar de fallar de forma impredecible en el momento de la request.</p>",
  },
];

export const QUIZ_FILTERS = [
  { value: "core", label: "Core" },
  { value: "di", label: "DI & Modules" },
  { value: "lifecycle", label: "Request Lifecycle" },
  { value: "config", label: "Config & Validation" },
  { value: "data", label: "Data & ORM" },
  { value: "auth", label: "Auth" },
  { value: "testing", label: "Testing" },
];
