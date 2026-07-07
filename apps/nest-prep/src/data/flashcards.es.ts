// Fundamentos de NestJS en flashcards: core, DI y módulos, ciclo de vida de requests, configuración.
// Las formas coinciden con el tipo Flashcard de @gerardocordero/prep-kit (typing estructural).
import type { Level } from "@/lib/levels";

export type Flashcard = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  answerHtml: string;
  level?: Level;
};

export const FLASHCARDS: Flashcard[] = [
  // ---------------- CORE ----------------
  {
    id: "c1",
    category: "core",
    categoryLabel: "Core",
    level: "junior",
    question: "¿Qué es NestJS y qué problema resuelve?",
    answerHtml:
      "<p>NestJS es un <b>framework progresivo y opiniado de Node.js</b> para construir aplicaciones del lado del servidor, escrito en TypeScript. Se ejecuta sobre un adaptador HTTP (<b>Express por defecto</b> o Fastify) y añade un <b>contenedor IoC/inyección de dependencias</b> de primera clase, un sistema de módulos y decoradores.</p><p>Resuelve el problema de <i>arquitectura</i> que Express deja abierto: Express te da routing y middleware pero no tiene opinión sobre la estructura, por lo que las aplicaciones grandes se desordenan. Nest toma prestado el modelo módulo/proveedor/decorador de Angular para darte código <b>probable, desacoplado y consistentemente organizado</b>.</p><div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Nest es estructura e inyección de dependencias sobre la capa HTTP de Node — es Express con una arquitectura, no un reemplazo.\"</div>",
  },
  {
    id: "c2",
    category: "core",
    categoryLabel: "Core",
    level: "junior",
    question: "¿Cuáles son los tres bloques fundamentales: módulo, controlador y proveedor?",
    answerHtml:
      "<ul><li><b>Módulo</b> (<code>@Module</code>) — una unidad organizativa que agrupa controladores y proveedores relacionados; la aplicación es un árbol de módulos.</li><li><b>Controlador</b> (<code>@Controller</code>) — maneja las requests entrantes y devuelve respuestas; declara rutas con <code>@Get/@Post/...</code>.</li><li><b>Proveedor</b> (<code>@Injectable</code>) — cualquier cosa inyectable: servicios, repositorios, fábricas. Contiene la lógica de negocio y se inyecta en controladores u otros proveedores.</li></ul><div class=\"callout tip\"><span class=\"lbl\">Modelo mental</span> Controlador = capa HTTP delgada; Proveedor/Servicio = lógica; Módulo = el contenedor que los conecta y decide qué se comparte.</div>",
  },
  {
    id: "c3",
    category: "core",
    categoryLabel: "Core",
    level: "junior",
    question: "¿Qué hace un controlador y cómo serializa Nest el valor de retorno?",
    answerHtml:
      "<p>Un controlador asigna rutas a métodos manejadores. Devuelves un valor plano (objeto, array, string) y Nest <b>lo serializa automáticamente a JSON</b> con estado <b>200</b> (o <b>201</b> para <code>@Post</code>). Se sobreescribe con <code>@HttpCode()</code>.</p><div class=\"callout warn\"><span class=\"lbl\">Advertencia</span> Inyectar <code>@Res()</code> cambia al <b>modo específico de la librería (Express)</b>: debes enviar la respuesta tú mismo y <i>pierdes</i> los interceptores y <code>@HttpCode</code>. Usa <code>@Res({ passthrough: true })</code> si solo necesitas establecer un header/cookie pero quieres que Nest maneje el body.</div>",
  },
  {
    id: "c4",
    category: "core",
    categoryLabel: "Core",
    question: "¿Por qué los DTOs deben ser clases, no interfaces?",
    answerHtml:
      "<p>Las <b>interfaces de TypeScript se eliminan en tiempo de compilación</b> — no existen en runtime. El <code>ValidationPipe</code> de Nest y class-validator necesitan el <b>metatipo</b> (la clase real) en runtime para leer decoradores y validar. Una clase sobrevive la compilación, por lo que el pipe puede instanciarla y verificarla.</p><div class=\"callout warn\"><span class=\"lbl\">Trampa</span> Usar una interface (o <code>import type</code> en un DTO) significa que la validación no hace nada silenciosamente — sin error, solo sin protección.</div>",
  },
  {
    id: "c5",
    category: "core",
    categoryLabel: "Core",
    question: "¿Qué es el encapsulamiento de módulos? ¿Cómo se comparte un proveedor?",
    answerHtml:
      "<p>Un proveedor es <b>privado de su módulo</b> por defecto. Para usarlo en otro lugar, el módulo propietario debe <b>exportarlo</b> y el módulo consumidor debe <b>importar</b> ese módulo. <code>exports</code> es la API pública de un módulo.</p><ul><li>Cada módulo es un <b>singleton</b>: exporta un proveedor una vez y todos los importadores comparten la misma instancia.</li><li>Re-registrar la misma clase en los <code>providers</code> de dos módulos crea <b>dos instancias separadas</b> — un error clásico de estado compartido.</li><li>Un módulo puede <b>re-exportar</b> módulos que importa.</li></ul>",
  },
  {
    id: "c6",
    category: "core",
    categoryLabel: "Core",
    question: "¿Cuándo se debe usar un módulo @Global() y por qué se desaconseja como predeterminado?",
    answerHtml:
      "<p><code>@Global()</code> hace que los proveedores exportados de un módulo estén disponibles en todas partes sin importarlo — regístralos una vez (por ejemplo, un módulo de configuración o de base de datos).</p><div class=\"callout warn\"><span class=\"lbl\">Advertencia senior</span> <b>Oculta el acoplamiento</b>: cada módulo depende de él silenciosamente, lo que perjudica la testabilidad y hace que el grafo de dependencias sea implícito. Prefiere <code>imports</code> explícitos; reserva <code>@Global()</code> para infraestructura verdaderamente transversal (configuración, logging, base de datos).</div>",
  },
  {
    id: "c7",
    category: "core",
    categoryLabel: "Core",
    question: "Adaptador Express vs Fastify en NestJS — ¿cuándo gana Fastify y qué se rompe?",
    answerHtml:
      "<p>Nest es agnóstico de plataforma a través de un <b>adaptador HTTP</b>. Express es el predeterminado (enorme ecosistema). <b>Fastify</b> (<code>@nestjs/platform-fastify</code>) alcanza aproximadamente <b>2× peticiones/segundo</b> mediante serialización basada en esquema (<code>fast-json-stringify</code>) y routing con radix-tree.</p><p><b>Elige Fastify</b> para APIs de alto rendimiento, intensivas en JSON y sensibles a la latencia. <b>Lo que se rompe:</b> el middleware de Express recibe <code>req/res</code> raw (sin wrappers de Express), la subida de archivos Multer es incompatible (usa <code>@fastify/multipart</code>), no hay routing por subdominio, usa <code>@fastify/helmet</code>/<code>@fastify/compress</code>, y vincula <code>0.0.0.0</code> en contenedores.</p>",
  },
  {
    id: "c8",
    category: "core",
    categoryLabel: "Core",
    question: "¿Qué ofrece el CLI de Nest y cuál es la estructura estándar de un proyecto?",
    answerHtml:
      "<p>El CLI (<code>@nestjs/cli</code>) genera y compila: <code>nest new</code>, <code>nest generate module|controller|service|resource</code> (el schematic <code>resource</code> genera un módulo CRUD completo). Envuelve la compilación (tsc o <b>SWC</b> para compilaciones rápidas) y <code>nest start --watch</code>.</p><p>Estructura convencional: una carpeta por módulo funcional (<code>users/</code> con <code>users.module.ts</code>, <code>users.controller.ts</code>, <code>users.service.ts</code>, <code>dto/</code>, <code>entities/</code>), un <code>AppModule</code> raíz y <code>main.ts</code> como punto de entrada de arranque.</p>",
  },
  {
    id: "c9",
    category: "core",
    categoryLabel: "Core",
    question: "¿Qué sucede en main.ts (el archivo de arranque)?",
    answerHtml:
      "<p><code>main.ts</code> crea e inicia la aplicación:</p><div class=\"code\">const app = await NestFactory.create(AppModule);\napp.useGlobalPipes(new ValidationPipe({ whitelist: true }));\napp.enableShutdownHooks();\nawait app.listen(3000);</div><p>Es donde registras pipes/filtros/interceptores <b>globales</b> (la forma sin DI), habilitas CORS/versionado/hooks de apagado, estableces un prefijo global y comienzas a escuchar. Para globales con DI, usa los tokens de proveedor <code>APP_*</code> en su lugar.</p>",
  },
  {
    id: "c10",
    category: "core",
    categoryLabel: "Core",
    question: "¿Qué es el AppModule y el grafo de la aplicación?",
    answerHtml:
      "<p><code>AppModule</code> es el módulo raíz que se pasa a <code>NestFactory.create()</code>. A partir de sus metadatos Nest construye el <b>grafo de la aplicación</b> — el árbol completo de módulos y el grafo de dependencias de los proveedores dentro de ellos. Durante el arranque Nest recorre este grafo e instancia proveedores <b>de abajo hacia arriba</b> (dependencias primero), cacheando singletons.</p>",
  },
  {
    id: "c11",
    category: "core",
    categoryLabel: "Core",
    question: "¿Cómo se leen los parámetros de ruta, query, body y headers?",
    answerHtml:
      "<p>Decoradores de parámetros en la firma del manejador:</p><ul><li><code>@Param('id')</code> — parámetro de ruta (<code>/users/:id</code>)</li><li><code>@Query('q')</code> — query string</li><li><code>@Body()</code> — body de la request (tipado a un DTO)</li><li><code>@Headers('authorization')</code>, <code>@Req()</code>, <code>@Ip()</code>, <code>@Session()</code></li></ul><p>Se combinan con pipes: <code>@Param('id', ParseIntPipe) id: number</code> valida y convierte.</p>",
  },
  {
    id: "c12",
    category: "core",
    categoryLabel: "Core",
    question: "¿Por qué los metadatos de decoradores de TypeScript (reflect-metadata) son centrales en Nest?",
    answerHtml:
      "<p>Nest lee los <b>metadatos de tipo en tiempo de diseño</b> emitidos por TypeScript (<code>emitDecoratorMetadata</code> + <code>reflect-metadata</code>) para conocer el tipo de un parámetro del constructor — ese es el <b>token de inyección</b>. Decoradores como <code>@Injectable()</code>, <code>@Controller()</code> y <code>@Get()</code> adjuntan metadatos que Nest luego refleja para construir rutas y resolver dependencias.</p><div class=\"callout\"><span class=\"lbl\">Por qué importa</span> Por eso se necesita un tipo de clase (no una interface) para DI, y por qué <code>tsconfig</code> debe tener <code>experimentalDecorators</code> + <code>emitDecoratorMetadata</code>.</div>",
  },
  {
    id: "c13",
    category: "core",
    categoryLabel: "Core",
    question: "¿Cómo se relaciona NestJS con Angular y por qué eso importa?",
    answerHtml:
      "<p>Nest refleja deliberadamente la ergonomía de <b>Angular</b> en el servidor: módulos, decoradores, proveedores y un contenedor DI. La recompensa es un <b>modelo mental consistente</b> para equipos full-stack de TS y un patrón maduro para organizar aplicaciones grandes. No es Angular por debajo — es un framework independiente que tomó prestadas las buenas ideas.</p>",
  },
  {
    id: "c14",
    category: "core",
    categoryLabel: "Core",
    question: "¿Qué hay de nuevo/importante en NestJS 11 (versión actual)?",
    answerHtml:
      "<ul><li><b>Express v5 y Fastify v5</b> son los predeterminados. Express 5 cambia el matching de rutas: los comodines <code>*</code> desnudos deben ser <b>nombrados</b> — <code>@Get('users/*')</code> → <code>@Get('users/*splat')</code>.</li><li><b>Renovación del Logger</b>: <code>ConsoleLogger</code> obtiene logging JSON integrado (<code>new ConsoleLogger({ json: true })</code>).</li><li><b>Arranque más rápido</b> mediante claves de módulo basadas en referencias (advertencia: importar el mismo módulo dinámico dos veces con configuración igual ahora genera instancias separadas — asigna a una variable y reutiliza).</li><li><b>cache-manager v6+</b> basado en <b>Keyv</b>; los transportadores de microservicios obtienen <code>status</code>, <code>unwrap()</code> y <code>on(event)</code>.</li><li>Requiere <b>Node ≥ 20</b>.</li></ul>",
  },

  // ---------------- DI & MODULES ----------------
  {
    id: "di1",
    category: "di",
    categoryLabel: "DI & Modules",
    level: "mid",
    question: "¿Qué es la inyección de dependencias y cómo la resuelve el contenedor IoC de Nest?",
    answerHtml:
      "<p>DI = una clase declara lo que <i>necesita</i> (a través de los parámetros del constructor) y el framework <b>lo provee</b>, en lugar de que la clase haga <code>new</code> de sus propias dependencias (Inversión de Control). Beneficios: desacoplamiento, mocking fácil, instancias compartidas.</p><p>Resolución: <code>@Injectable()</code> marca una clase como gestionada → un consumidor declara la dependencia <b>por tipo (el token)</b> → el módulo registra un proveedor para ese token → durante el arranque Nest construye el grafo transitivamente e instancia de abajo hacia arriba, cacheando singletons. <code>NEST_DEBUG=1</code> registra la resolución.</p>",
  },
  {
    id: "di2",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "Explica los tres alcances de inyección y el costo del REQUEST scope.",
    answerHtml:
      "<table><tr><th>Alcance</th><th>Tiempo de vida</th></tr><tr><td><b>DEFAULT</b> (singleton)</td><td>Una instancia para toda la aplicación, creada en el arranque. El predeterminado recomendado.</td></tr><tr><td><b>REQUEST</b></td><td>Una nueva instancia por request entrante, liberada después. Para estado por request.</td></tr><tr><td><b>TRANSIENT</b></td><td>Una instancia dedicada por consumidor (no compartida).</td></tr></table><div class=\"callout warn\"><span class=\"lbl\">El costo</span> El REQUEST scope <b>se propaga hacia arriba</b>: si un proveedor profundo tiene REQUEST scope, cada consumidor hasta el controlador también se vuelve REQUEST scope, añadiendo asignación/liberación por request y deshabilitando algunas optimizaciones de arranque. Un DB/logger compartido con REQUEST scope puede convertir toda la aplicación. Mitiga con <b>proveedores duraderos</b> + una <code>ContextIdStrategy</code> de tenant, o usa AsyncLocalStorage/CLS para contexto de request.</div>",
  },
  {
    id: "di3",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "¿Es seguro el estado de singleton entre requests en Node/Nest?",
    answerHtml:
      "<p><b>Sí</b> — Node es de un solo hilo y <i>no</i> asigna un hilo por request, por lo que un servicio singleton (pool de DB, caché, configuración) es seguro y eficiente; las requests concurrentes se intercalan en un solo hilo, no ejecutan un manejador en paralelo en dos núcleos.</p><div class=\"callout warn\"><span class=\"lbl\">Cuándo no lo es</span> Almacenar <b>estado mutable específico de usuario o request en un campo de singleton</b> es un bug de fuga de datos entre requests (request B lee los datos de request A). Usa REQUEST scope o AsyncLocalStorage para estado genuinamente por request.</div>",
  },
  {
    id: "di4",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "¿Cuáles son los cuatro tipos de proveedores personalizados?",
    answerHtml:
      "<ul><li><b><code>useClass</code></b> — resuelve un token a una clase, opcionalmente dependiente del entorno: <code>{ provide: ConfigService, useClass: isProd ? ProdConfig : DevConfig }</code>.</li><li><b><code>useValue</code></b> — inyecta una constante, mock o instancia de librería externa. Ideal para tests.</li><li><b><code>useFactory</code></b> — construye dinámicamente; puede inyectar dependencias vía <code>inject: [...]</code> y puede ser <b>asíncrono</b> (conexiones, valores derivados de configuración).</li><li><b><code>useExisting</code></b> — alias de un token a otro (ambos resuelven al <i>mismo</i> singleton).</li></ul>",
  },
  {
    id: "di5",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "¿Cómo se inyecta una dependencia que no es clase (interface, string, constante)?",
    answerHtml:
      "<p>Las interfaces desaparecen en runtime, por lo que no se pueden usar como tokens. Usa un <b>token string o symbol</b> con <code>@Inject()</code>:</p><div class=\"code\">// proveedor\n{ provide: 'PAYMENTS', useClass: StripePayments }\no un token Symbol en un archivo de constantes compartido\nexport const PAYMENTS = Symbol('PAYMENTS');\n\n// consumidor\nconstructor(@Inject(PAYMENTS) private pay: PaymentGateway) {}</div><p>Esta es la mecánica detrás de <b>ports &amp; adapters</b>: depende de una interface a través de un token, vincula la implementación concreta en el módulo.</p>",
  },
  {
    id: "di6",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "¿Qué es un módulo dinámico y cuál es la convención forRoot / forFeature / register?",
    answerHtml:
      "<p>Un <b>módulo dinámico</b> es un módulo configurable — un método estático devuelve un <code>DynamicModule</code> (metadatos del módulo calculados en runtime). El patrón de plugin.</p><ul><li><b><code>register()</code></b> — configura para <i>solo este importador</i> (por ejemplo, un cliente HTTP con opciones específicas).</li><li><b><code>forRoot()</code></b> — configura <i>una vez, para toda la app</i> (DB, ConfigModule).</li><li><b><code>forFeature()</code></b> — un ajuste por feature de una configuración <code>forRoot</code> (registra entidades/repositorios).</li></ul><p>Cada uno tiene un homólogo <b>asíncrono</b> (<code>registerAsync</code>/<code>forRootAsync</code>) que acepta <code>useFactory</code>+<code>inject</code>, <code>useClass</code> o <code>useExisting</code> para opciones inyectadas.</p>",
  },
  {
    id: "di7",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "¿Qué es ConfigurableModuleBuilder y por qué se prefiere?",
    answerHtml:
      "<p>Genera automáticamente el boilerplate del módulo dinámico — la clase base, el token de opciones y las firmas síncronas + asíncronas (<code>register</code>/<code>registerAsync</code>):</p><div class=\"code\">export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =\n  new ConfigurableModuleBuilder&lt;MyOptions&gt;()\n    .setClassMethodName('forRoot')\n    .build();\n\n@Module({})\nexport class MyModule extends ConfigurableModuleClass {}</div><p>Inyectas <code>MODULE_OPTIONS_TOKEN</code> para leer la configuración pasada. Elimina el boilerplate propenso a errores de <code>forRootAsync</code> escrito a mano.</p>",
  },
  {
    id: "di8",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "¿Cómo se manejan las dependencias circulares?",
    answerHtml:
      "<p>Primero, trátalo como una <i>señal de mal diseño</i> — a menudo es causado por <b>archivos barrel <code>index.ts</code></b>; importar el archivo concreto directamente frecuentemente lo corrige, o extraes un proveedor/módulo compartido.</p><p>Cuando es genuinamente necesario:</p><ul><li><b><code>forwardRef(() => Other)</code></b> en <b>ambos</b> lados — <code>@Inject(forwardRef(...))</code> para proveedores e <code>imports: [forwardRef(...)]</code> para módulos.</li><li>O resuelve de forma lazy con <b><code>ModuleRef</code></b> (<code>get()</code> para singletons, <code>resolve()</code> para scoped), frecuentemente en <code>onModuleInit</code>.</li></ul><div class=\"callout warn\"><span class=\"lbl\">Advertencia</span> Con forwardRef, el orden de instanciación es indeterminado — no dependas de él, y ten cuidado con dependencias indefinidas cuando se combina con REQUEST scope.</div>",
  },
  {
    id: "di9",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "¿Qué es ModuleRef y cuándo se recurre a él?",
    answerHtml:
      "<p><code>ModuleRef</code> te permite resolver proveedores <b>imperativamente</b> desde el contenedor en lugar de a través de la inyección de constructor:</p><ul><li><code>moduleRef.get(Token)</code> — obtiene un singleton (toda la app o el módulo actual con <code>{ strict: false }</code>).</li><li><code>moduleRef.resolve(Token)</code> — resuelve una instancia <b>scoped</b> (request/transiente); devuelve un Promise y da una instancia única por llamada (pasa un <code>contextId</code> para compartir una).</li><li><code>moduleRef.create(Class)</code> — instancia una clase que no es un proveedor registrado.</li></ul><p>Úsalo para resolución dinámica (sistemas de plugins, resolución por clave en runtime) y para romper dependencias circulares.</p>",
  },
  {
    id: "di10",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "¿Cuándo la re-registro de un proveedor crea un error sutil?",
    answerHtml:
      "<p>Si <code>StateService</code> está listado en los <code>providers</code> de <b>dos</b> módulos, cada módulo obtiene su <b>propia instancia</b>. El código que asume una instancia compartida (una caché, un contador, una conexión) verá estado divergente.</p><div class=\"callout tip\"><span class=\"lbl\">Solución</span> Regístralo en <b>un</b> módulo, <code>exportalo</code> e <code>importa</code> ese módulo donde se necesite — eso garantiza un singleton compartido.</div>",
  },
  {
    id: "di11",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "¿Se puede inyectar la clase de un Módulo? ¿Puede inyectar cosas?",
    answerHtml:
      "<p>La clase de un módulo <b>puede inyectar</b> proveedores en su constructor (útil para ejecutar configuración con dependencias), pero <b>no puede ser inyectada</b> en otras clases — los módulos son unidades organizativas, no proveedores.</p>",
  },
  {
    id: "di12",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "¿Qué es la inyección @Optional() y la inyección basada en propiedades?",
    answerHtml:
      "<p><code>@Optional()</code> marca una dependencia como no requerida — si no se encuentra ningún proveedor, Nest inyecta <code>undefined</code> en lugar de lanzar un error. Útil para plugins/configuración opcionales.</p><p>La <b>inyección basada en propiedades</b> (<code>@Inject(TOKEN) private dep: T</code> como campo de clase) es una alternativa a la inyección de constructor, usada principalmente cuando una clase base no puede reenviar argumentos del constructor fácilmente. La inyección de constructor se prefiere por claridad y testabilidad.</p>",
  },

  // ---------------- REQUEST LIFECYCLE ----------------
  {
    id: "lc1",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "Describe el orden exacto del ciclo de vida de una request en NestJS.",
    answerHtml:
      "<p>Request entrante →</p><ol><li><b>Middleware</b> (global, luego los del módulo)</li><li><b>Guards</b> (global → controlador → ruta)</li><li><b>Interceptores</b> — pre-controlador (global → controlador → ruta)</li><li><b>Pipes</b> (global → controlador → ruta → parámetro)</li><li><b>Manejador del controlador</b> → <b>Servicio</b></li><li><b>Interceptores</b> — post (ruta → controlador → global, en orden inverso)</li><li><b>Filtros de excepción</b> (ruta → controlador → global) — solo en error</li></ol><p>→ Respuesta.</p><div class=\"callout\"><span class=\"lbl\">Detalle senior</span> Los filtros son el <b>único</b> mejorador que resuelve de nivel más bajo primero; los interceptores forman una cebolla (primero en entrar / último en salir al regresar).</div>",
  },
  {
    id: "lc2",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "¿Middleware vs Guard vs Interceptor vs Pipe vs Filter — cuándo se usa cada uno?",
    answerHtml:
      "<table><tr><th>Bloque</th><th>Función</th></tr><tr><td><b>Middleware</b></td><td>Pre-routing, <code>req/res/next</code> raw (logging, CORS, helmet, parsing de body). Sin <code>ExecutionContext</code>.</td></tr><tr><td><b>Guard</b></td><td><b>Autorización</b> — devuelve boolean; tiene <code>ExecutionContext</code> + <code>Reflector</code> (lee metadatos).</td></tr><tr><td><b>Interceptor</b></td><td>AOP antes/después con RxJS — transforma la respuesta, caché, timeout, logging.</td></tr><tr><td><b>Pipe</b></td><td>Valida y transforma argumentos del manejador.</td></tr><tr><td><b>Filter</b></td><td>Atrapa excepciones y da forma a la respuesta de error.</td></tr></table><div class=\"callout\"><span class=\"lbl\">Distinción clave</span> Solo los guards e interceptores obtienen <code>ExecutionContext</code>; el middleware no obtiene ni información del manejador ni de la clase.</div>",
  },
  {
    id: "lc3",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "¿Para qué sirve un Guard y cómo lee los metadatos de ruta?",
    answerHtml:
      "<p>Un guard implementa <code>CanActivate.canActivate(ctx)</code> devolviendo un boolean (o Promise/Observable de uno). Su función es <b>autorización/autenticación</b>: devolver <code>false</code> → 403 automático.</p><p>Como tiene un <code>ExecutionContext</code>, puede usar el <b><code>Reflector</code></b> para leer metadatos establecidos por decoradores:</p><div class=\"code\">const roles = this.reflector.getAllAndOverride&lt;string[]&gt;(ROLES_KEY, [\n  ctx.getHandler(), ctx.getClass(),\n]);</div><p><code>getAllAndOverride</code> permite que un decorador de nivel de método sobreescriba uno de nivel de clase — la base de RBAC.</p>",
  },
  {
    id: "lc4",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "¿Qué pueden hacer los interceptores que los guards y pipes no pueden?",
    answerHtml:
      "<p>Los interceptores envuelven el manejador en un <b>stream RxJS</b> (<code>intercept(ctx, next)</code> devuelve un Observable), dando lógica antes <i>y</i> después alrededor de <code>next.handle()</code>:</p><ul><li>Transformar la respuesta — <code>map(data =&gt; ({ data }))</code></li><li>Logging/timing — <code>tap(...)</code></li><li>Timeouts — <code>timeout(5000)</code> + <code>catchError</code></li><li><b>Sobreescribir</b> el manejador completamente (caché: devuelve un valor cacheado en lugar de llamar a <code>next.handle()</code>)</li><li>Serialización — <code>ClassSerializerInterceptor</code> aplica <code>@Exclude/@Expose</code></li></ul>",
  },
  {
    id: "lc5",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "¿Qué hacen whitelist, forbidNonWhitelisted y transform en ValidationPipe?",
    answerHtml:
      "<ul><li><b><code>whitelist: true</code></b> — elimina propiedades que no tienen decorador de validación (descarta campos inesperados).</li><li><b><code>forbidNonWhitelisted: true</code></b> — en lugar de eliminar, <b>lanza 400</b> en campos desconocidos.</li><li><b><code>transform: true</code></b> — usa class-transformer para convertir el payload plano en una <b>instancia de DTO</b> y convertir primitivos (por ejemplo, parámetro string → número).</li></ul><div class=\"callout tip\"><span class=\"lbl\">Por qué importa</span> <code>whitelist</code>/<code>forbidNonWhitelisted</code> defienden contra <b>mass-assignment</b> — un usuario no puede colar <code>isAdmin: true</code> en un body. Registra el pipe globalmente para seguridad en toda la app.</div>",
  },
  {
    id: "lc6",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "¿Qué son los filtros de excepción y cuál es el patrón AllExceptionsFilter?",
    answerHtml:
      "<p>Un filtro (<code>@Catch(SomeException)</code> + <code>catch(exception, host)</code>) intercepta excepciones lanzadas y da forma a la respuesta. El filtro incorporado de Nest maneja <code>HttpException</code> y subclases; errores desconocidos → 500.</p><p><b>AllExceptionsFilter</b>: <code>@Catch()</code> sin argumentos (atrapa todo) + inyecta <code>HttpAdapterHost</code> para que funcione independientemente de la plataforma. Usa <code>ArgumentsHost</code> para soportar HTTP/WS/RPC. Extiende <code>BaseExceptionFilter</code> y llama a <code>super.catch()</code> para reutilizar los predeterminados mientras añades logging.</p>",
  },
  {
    id: "lc7",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "¿Qué es un Pipe y qué pipes incorporados deberías conocer?",
    answerHtml:
      "<p>Un pipe implementa <code>transform(value, metadata)</code> y se ejecuta <b>justo antes del manejador</b>, dentro de la zona de excepciones (una excepción salta el manejador). Dos funciones: <b>validación</b> y <b>transformación</b>.</p><p>Incorporados: <code>ValidationPipe</code>, <code>ParseIntPipe</code>, <code>ParseUUIDPipe</code>, <code>ParseBoolPipe</code>, <code>ParseArrayPipe</code>, <code>ParseEnumPipe</code>, <code>ParseFloatPipe</code>, <code>DefaultValuePipe</code>, <code>ParseFilePipe</code> y <b><code>ParseDatePipe</code></b> (añadido en v11).</p><div class=\"callout warn\"><span class=\"lbl\">Orden</span> <code>DefaultValuePipe</code> debe ir <i>antes</i> de un pipe <code>Parse*</code>, o el parse lanza error en null.</div>",
  },
  {
    id: "lc8",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "¿ArgumentsHost vs ExecutionContext — cuál es la diferencia?",
    answerHtml:
      "<p><code>ExecutionContext extends ArgumentsHost</code>.</p><ul><li><b><code>ArgumentsHost</code></b> — abstrae los argumentos del transportador; <code>switchToHttp()/switchToRpc()/switchToWs()</code>. Los filtros obtienen esto (sin información del manejador).</li><li><b><code>ExecutionContext</code></b> — añade <code>getHandler()</code> y <code>getClass()</code> para reflexión. Los guards e interceptores obtienen esto.</li></ul><p>Esta abstracción es por qué el mismo guard/interceptor/filtro funciona a través de HTTP, microservicios y WebSockets.</p>",
  },
  {
    id: "lc9",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "¿Por qué usar APP_GUARD / APP_INTERCEPTOR / APP_PIPE / APP_FILTER en lugar de app.useGlobalX()?",
    answerHtml:
      "<p><code>app.useGlobalGuards(new X())</code> crea la instancia <b>fuera</b> del contenedor DI, por lo que <b>no puede inyectar</b> nada. Registrar a través de los tokens <code>APP_*</code> convierte al mejorador global en un proveedor real:</p><div class=\"code\">{ provide: APP_GUARD, useClass: AuthGuard }</div><p>Ahora puede inyectar <code>Reflector</code>, servicios, configuración, etc. Se permiten múltiples registros de <code>APP_FILTER</code>/<code>APP_INTERCEPTOR</code>.</p>",
  },
  {
    id: "lc10",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "¿Cuáles son las dos formas de escribir middleware y cuál es la gran limitación?",
    answerHtml:
      "<p><b>Middleware de clase</b> (<code>implements NestMiddleware</code>) tiene DI; <b>middleware funcional</b> (<code>(req, res, next) =&gt; ...</code>) no tiene dependencias. Aplica middleware de clase en un módulo vía <code>configure(consumer)</code>: <code>consumer.apply(LoggerMiddleware).forRoutes('users')</code> con <code>.exclude(...)</code>.</p><div class=\"callout warn\"><span class=\"lbl\">Limitación</span> El middleware se ejecuta <b>antes</b> de que exista el contexto de Nest — <b>no tiene <code>ExecutionContext</code></b> y no puede leer metadatos del manejador. Para cualquier cosa consciente de rutas, usa un guard o interceptor. El middleware global <code>app.use()</code> tampoco puede usar DI.</div>",
  },
  {
    id: "lc11",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "¿Cómo se construye un decorador de parámetro personalizado y se componen decoradores?",
    answerHtml:
      "<p><code>createParamDecorator</code> construye un decorador de argumento de manejador:</p><div class=\"code\">export const User = createParamDecorator(\n  (data: string, ctx: ExecutionContext) =&gt; {\n    const req = ctx.switchToHttp().getRequest();\n    return data ? req.user?.[data] : req.user;\n  },\n);\n// uso: @User('email') email: string</div><p>Agrupa varios decoradores con <b><code>applyDecorators</code></b> — por ejemplo, un <code>@Auth(...roles)</code> que combina <code>SetMetadata</code> + <code>UseGuards</code> + decoradores de Swagger en uno solo.</p>",
  },
  {
    id: "lc12",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "¿Cuáles son los hooks del ciclo de vida y su orden?",
    answerHtml:
      "<p>Inicio: <b><code>onModuleInit</code></b> (las dependencias del módulo resueltas) → <b><code>onApplicationBootstrap</code></b> (todos los módulos listos, antes de escuchar). Apagado (solo si se llamó <code>app.enableShutdownHooks()</code>): <b><code>onModuleDestroy</code></b> → <b><code>beforeApplicationShutdown</code></b> → <b><code>onApplicationShutdown(signal)</code></b>.</p><p>Todos pueden ser asíncronos (Nest espera). Usa los hooks de apagado para drenar: detén nuevo trabajo, completa los en curso, cierra pools de DB/colas, vacía logs.</p><div class=\"callout warn\"><span class=\"lbl\">Advertencias</span> Los hooks no se disparan para proveedores con REQUEST scope; SIGTERM nunca se dispara en Windows; <code>app.close()</code> no mata el proceso; v11 invirtió el orden de terminación.</div>",
  },
  {
    id: "lc13",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "¿Cómo interactúan los niveles de vinculación (global/controlador/ruta) y el orden de ejecución?",
    answerHtml:
      "<p>Puedes vincular guards/interceptores/pipes/filtros en tres niveles: <b>global</b>, <b>controlador</b> (<code>@UseGuards()</code> en la clase) y <b>ruta</b> (<code>@UseGuards()</code> en el método). De ida <i>entrando</i>, se ejecutan global → controlador → ruta. Los interceptores luego se desenrollan ruta → controlador → global de salida <i>salida</i>; los filtros resuelven ruta → controlador → global. Conocer esto te permite, por ejemplo, poner un guard de auth amplio globalmente y uno más estricto en una ruta.</p>",
  },
  {
    id: "lc14",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "¿Cómo interactúa un ValidationPipe global con la transformación y la conversión implícita?",
    answerHtml:
      "<p>Con <code>transform: true</code>, el pipe instancia el DTO y ejecuta class-transformer. Añadir <code>transformOptions: { enableImplicitConversion: true }</code> le permite convertir basándose en el tipo TS sin decoradores <code>@Type()</code> explícitos (por ejemplo, un query <code>?page=2</code> string se convierte en <code>number</code>).</p><div class=\"callout warn\"><span class=\"lbl\">Advertencia</span> La conversión implícita es conveniente pero puede sorprenderte (por ejemplo, la conversión de <code>'true'</code>/<code>'false'</code>); para objetos/arreglos anidados aún necesitas <code>@Type(() =&gt; Dto)</code> + <code>@ValidateNested()</code>.</div>",
  },

  // ---------------- CONFIG & VALIDATION ----------------
  {
    id: "cfg1",
    category: "config",
    categoryLabel: "Config & Validation",
    level: "mid",
    question: "¿Cómo funciona @nestjs/config y cómo se validan las variables de entorno al arrancar?",
    answerHtml:
      "<p><code>ConfigModule.forRoot({ isGlobal: true })</code> carga <code>.env</code> + fusiona <code>process.env</code> (el entorno real gana en conflictos) y envuelve dotenv. Lee con <code>configService.get&lt;T&gt;('KEY', default)</code>.</p><p><b>Valida al arrancar (falla rápido):</b> pasa un <code>validationSchema</code> (Joi) o una función <code>validate</code> personalizada (zod/class-validator) para que una variable faltante/inválida crashee el arranque en lugar de fallar en el momento de la request:</p><div class=\"code\">validationSchema: Joi.object({\n  NODE_ENV: Joi.string().valid('development','production').default('development'),\n  PORT: Joi.number().default(3000),\n  DATABASE_URL: Joi.string().required(),\n})</div>",
  },
  {
    id: "cfg2",
    category: "config",
    categoryLabel: "Config & Validation",
    question: "¿Qué es la configuración con namespaces (registerAs) y por qué se usa?",
    answerHtml:
      "<p><code>registerAs('db', () =&gt; ({ host: process.env.DB_HOST, ... }))</code> agrupa la configuración relacionada y da un accessor tipado:</p><div class=\"code\">@Inject(dbConfig.KEY) cfg: ConfigType&lt;typeof dbConfig&gt;</div><p>Mantiene la configuración modular y type-safe, y <code>dbConfig.asProvider()</code> se conecta directamente a <code>TypeOrmModule.forRootAsync</code>. Más limpio que esparcir llamadas <code>configService.get('DB_HOST')</code> por todas partes.</p>",
  },
  {
    id: "cfg3",
    category: "config",
    categoryLabel: "Config & Validation",
    question: "¿Cómo se validan los DTOs de request con class-validator?",
    answerHtml:
      "<p>Decora los DTOs de clase y deja que el <code>ValidationPipe</code> global los aplique:</p><div class=\"code\">export class CreateUserDto {\n  @IsEmail() email: string;\n  @IsString() @MinLength(8) password: string;\n  @IsOptional() @IsInt() @Min(18) age?: number;\n}</div><p>Los objetos anidados necesitan <code>@ValidateNested()</code> + <code>@Type(() =&gt; ChildDto)</code>; los arreglos de DTOs necesitan <code>@ValidateNested({ each: true })</code>. En caso de error el pipe lanza un 400 con los mensajes de validación.</p>",
  },
  {
    id: "cfg4",
    category: "config",
    categoryLabel: "Config & Validation",
    question: "¿Qué son los mapped types (PartialType, PickType, OmitType, IntersectionType)?",
    answerHtml:
      "<p>Ayudantes que derivan un DTO de otro para no repetir decoradores:</p><ul><li><b><code>PartialType(CreateDto)</code></b> — todos los campos opcionales (perfecto para un <code>UpdateDto</code>).</li><li><b><code>PickType(Dto, ['email'])</code></b> / <b><code>OmitType(Dto, ['id'])</code></b> — subconjunto.</li><li><b><code>IntersectionType(A, B)</code></b> — fusión.</li></ul><div class=\"callout warn\"><span class=\"lbl\">Advertencia</span> Impórtalos del paquete correcto: <code>@nestjs/mapped-types</code> (simple), <code>@nestjs/swagger</code> o <code>@nestjs/graphql</code> — cada uno preserva los metadatos de su capa.</div>",
  },
  {
    id: "cfg5",
    category: "config",
    categoryLabel: "Config & Validation",
    question: "¿Cuál es la diferencia entre validación de configuración y validación de DTOs en runtime?",
    answerHtml:
      "<p>Ambas usan esquemas, pero en diferentes límites: la <b>validación de configuración</b> se ejecuta <b>una vez al inicio</b> sobre <code>process.env</code> (falla rápido si el despliegue está mal configurado). La <b>validación de DTOs</b> se ejecuta en <b>cada request</b> sobre entrada no confiable (rechaza payloads inválidos con 400). No las confundas — un entorno válido no hace que un body de request sea seguro.</p>",
  },
  {
    id: "cfg6",
    category: "config",
    categoryLabel: "Config & Validation",
    question: "Configuración 12-factor: ¿por qué variables de entorno y no archivos de configuración en el repo?",
    answerHtml:
      "<p>Factor III: la configuración que varía por despliegue (URLs de DB, secretos, feature flags) pertenece al <b>entorno</b>, no al código. Prueba de fuego: <i>¿podrías hacer open-source del repo ahora sin filtrar secretos?</i> Mantén <code>.env</code> solo para desarrollo local (gitignored + dockerignored); en producción inyecta a través del secret store del orquestador (k8s Secrets, AWS Secrets Manager, Vault). Node 20+ puede cargar entorno de forma nativa con <code>--env-file</code>.</p>",
  },
];

/** Filtros de categoría contribuidos por este archivo (el agregador añade "Todos"). */
export const FLASHCARD_FILTERS = [
  { value: "core", label: "Core" },
  { value: "di", label: "DI & Modules" },
  { value: "lifecycle", label: "Request Lifecycle" },
  { value: "config", label: "Config & Validation" },
];
