// Guía de estudio — Secciones NestJS (01–20). Contenido largo en HTML renderizado vía <RichText>.
export type StudySection = { id: string; num: string; title: string; html: string };

export const STUDY_INTRO_HTML =
  "<span class=\"lbl\">Cómo usar esto</span> Cada tema explica el concepto a la profundidad que espera una entrevista senior de NestJS / Node.js, y luego ofrece una línea de <b>\"cómo decirlo\"</b> — la oración precisa para decir en voz alta. Lee para comprender primero; ensaya las frases al final. Todo está actualizado a <b>NestJS 11</b> y <b>Node.js 24 LTS</b>.";

export const STUDY_SECTIONS: StudySection[] = [
  {
    id: "st-1",
    num: "01",
    title: "01 · NestJS, TypeScript y el modelo del framework",
    html:
      "<p><b>Lo que quieren:</b> entiendas <i>por qué</i> existe Nest. Es un framework progresivo y opiniado de Node.js escrito en TypeScript que se ejecuta sobre un adaptador HTTP (Express por defecto o Fastify) y añade un <b>contenedor IoC/DI</b>, un sistema de módulos y decoradores. Resuelve la brecha de arquitectura que Express deja abierta.</p>" +
      "<p>Nest combina OOP, FP y FRP (RxJS en interceptores/microservicios). Se apoya en los <b>metadatos de decoradores</b> emitidos por TypeScript (<code>reflect-metadata</code>) para conocer el tipo de un parámetro del constructor — que es el token de inyección. Por eso <code>tsconfig</code> necesita <code>experimentalDecorators</code> + <code>emitDecoratorMetadata</code>, y por qué DI funciona en clases, no en interfaces.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Nest es estructura e inyección de dependencias sobre la capa HTTP de Node — Express con una arquitectura opiniada, escrito en TypeScript y modelado en el sistema módulo/proveedor de Angular.\"</div>",
  },
  {
    id: "st-2",
    num: "02",
    title: "02 · Módulos y encapsulamiento",
    html:
      "<p><b>Core:</b> un módulo (<code>@Module</code>) agrupa controladores y proveedores relacionados; la aplicación es un árbol de módulos con raíz en <code>AppModule</code>. Los proveedores son <b>privados de su módulo</b> a menos que se <b>exporten</b>; <code>exports</code> es la API pública del módulo y <code>imports</code> trae las exportaciones de otro módulo.</p>" +
      "<ul><li>Cada módulo es un singleton — exporta un proveedor una vez y todos los importadores comparten <b>una instancia</b>.</li><li>Listar la misma clase en los <code>providers</code> de dos módulos crea <b>dos instancias</b> (un bug de estado compartido).</li><li><code>@Global()</code> expone exportaciones en todas partes sin importar — reserve para infraestructura transversal (config, DB, logging); su uso excesivo oculta acoplamiento.</li></ul>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Los módulos te dan encapsulamiento: un proveedor es privado hasta que lo exporto. Mantengo los límites explícitos y evito <code>@Global()</code> excepto para infraestructura verdadera.\"</div>",
  },
  {
    id: "st-3",
    num: "03",
    title: "03 · Controladores y routing",
    html:
      "<p><b>Core:</b> los controladores (<code>@Controller('users')</code>) asignan rutas a manejadores (<code>@Get(':id')</code>, <code>@Post()</code>). Devuelves un valor y Nest lo serializa a JSON (200, o 201 para POST). Lee entradas con <code>@Param</code>, <code>@Query</code>, <code>@Body</code>, <code>@Headers</code>, frecuentemente combinado con un pipe (<code>@Param('id', ParseIntPipe)</code>).</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Advertencia</span> Inyectar <code>@Res()</code> cambia al modo Express: debes enviar la respuesta tú mismo y pierdes interceptores/<code>@HttpCode</code>. Usa <code>@Res({ passthrough: true })</code> si solo necesitas establecer una cookie/header.</div>" +
      "<div class=\"callout warn\"><span class=\"lbl\">NestJS 11</span> Express 5 cambió el routing de wildcards — <code>*</code> desnudo debe ser nombrado: <code>@Get('files/*')</code> → <code>@Get('files/*splat')</code>.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Los controladores son la capa HTTP delgada — parsean y delegan. El trabajo real vive en los servicios inyectados.\"</div>",
  },
  {
    id: "st-4",
    num: "04",
    title: "04 · Proveedores e inyección de dependencias",
    html:
      "<p><b>Core:</b> un proveedor es cualquier cosa inyectable (<code>@Injectable()</code> servicios, repositorios, fábricas, valores). Un consumidor declara una dependencia por tipo en su constructor; ese tipo es el <b>token</b>. El módulo registra un proveedor para el token; durante el arranque el contenedor construye el grafo transitivamente e instancia de abajo hacia arriba, cacheando singletons.</p>" +
      "<p>Los proveedores personalizados te dan control:</p><table><tr><th>Proveedor</th><th>Uso</th></tr>" +
      "<tr><td><code>useClass</code></td><td>Resuelve un token a una clase (intercambia por entorno).</td></tr>" +
      "<tr><td><code>useValue</code></td><td>Inyecta una constante / mock / instancia externa.</td></tr>" +
      "<tr><td><code>useFactory</code></td><td>Construye dinámicamente (async OK), inyecta dependencias vía <code>inject:[]</code>.</td></tr>" +
      "<tr><td><code>useExisting</code></td><td>Alias de un token a uno existente (mismo singleton).</td></tr></table>" +
      "<p>Inyecta dependencias no-clase (interfaces, config) vía un token string/symbol + <code>@Inject(TOKEN)</code> — la mecánica de ports-and-adapters.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"DI significa que las clases declaran lo que necesitan y el contenedor lo provee. Dependo de interfaces vía tokens para que las implementaciones sean intercambiables y mockeables.\"</div>",
  },
  {
    id: "st-5",
    num: "05",
    title: "05 · Alcances de inyección y ciclo de vida",
    html:
      "<p><b>Core:</b> tres alcances — <b>DEFAULT</b> (singleton, recomendado), <b>REQUEST</b> (por request), <b>TRANSIENT</b> (por consumidor). Los singletons son seguros porque Node no asigna un hilo por request; solo almacena estado específico de request en REQUEST scope (o mejor, AsyncLocalStorage).</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">El costo de REQUEST</span> <b>Se propaga hacia arriba</b> — una hoja con REQUEST scope hace que sus consumidores (hasta el controlador) también sean REQUEST-scoped, añadiendo asignación/liberación por request. Un DB/logger compartido con REQUEST scope puede convertir toda la aplicación. Usa <b>proveedores duraderos</b> + una <code>ContextIdStrategy</code> de tenant para recuperar rendimiento.</div>" +
      "<p><b>Hooks del ciclo de vida</b> (orden): <code>onModuleInit</code> → <code>onApplicationBootstrap</code> → [ejecutándose] → <code>onModuleDestroy</code> → <code>beforeApplicationShutdown</code> → <code>onApplicationShutdown</code>. Los hooks de apagado solo se disparan después de <code>app.enableShutdownHooks()</code>; no se ejecutan para proveedores con REQUEST scope.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Por defecto uso singletons y recurre a REQUEST scope solo para estado genuinamente por request — y sé que se propaga, por lo que prefiero AsyncLocalStorage para contexto.\"</div>",
  },
  {
    id: "st-6",
    num: "06",
    title: "06 · Módulos dinámicos y configuración",
    html:
      "<p><b>Core:</b> un módulo dinámico devuelve sus metadatos desde un método estático para que pueda ser configurado. Convención: <code>register()</code> = por importador, <code>forRoot()</code> = una vez globalmente, <code>forFeature()</code> = ajuste por feature de un <code>forRoot</code>. Cada uno tiene una variante asíncrona (<code>forRootAsync</code>) que acepta <code>useFactory</code>+<code>inject</code> para que las opciones vengan de <code>ConfigService</code>.</p>" +
      "<p>La implementación moderna es <b><code>ConfigurableModuleBuilder</code></b>, que genera automáticamente la clase base, el token de opciones y las firmas síncronas/asíncronas — eliminando boilerplate escrito a mano.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">NestJS 11</span> Importar el mismo módulo dinámico dos veces con configuración profundamente igual ahora genera instancias <b>separadas</b> — asigna <code>const m = X.forRoot({...})</code> a una variable y reutilízalo para compartir uno.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"forRoot configura un módulo una vez globalmente; forFeature lo ajusta por feature; las variantes asíncronas inyectan config. Uso ConfigurableModuleBuilder para no escribir forRootAsync a mano.\"</div>",
  },
  {
    id: "st-7",
    num: "07",
    title: "07 · El ciclo de vida de una request",
    html:
      "<p><b>Memoriza esto:</b> Request entrante → <b>Middleware</b> → <b>Guards</b> → <b>Interceptores (pre)</b> → <b>Pipes</b> → <b>Manejador</b> (→ Servicio) → <b>Interceptores (post)</b> → <b>Filtros de excepción</b> → Respuesta. Dentro de cada nivel es global → controlador → ruta; los interceptores se desenrollan al salir, y los filtros son el único mejorador que resuelve ruta → controlador → global.</p>" +
      "<table><tr><th>Bloque</th><th>Función · ¿tiene ExecutionContext?</th></tr>" +
      "<tr><td>Middleware</td><td>Pre-routing req/res raw — sin contexto</td></tr>" +
      "<tr><td>Guard</td><td>Autorización — sí (Reflector)</td></tr>" +
      "<tr><td>Interceptor</td><td>AOP antes/después (RxJS) — sí</td></tr>" +
      "<tr><td>Pipe</td><td>Valida/transforma argumentos — solo metadatos</td></tr>" +
      "<tr><td>Filter</td><td>Da forma a errores — solo ArgumentsHost</td></tr></table>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Middleware, guards, interceptores, pipes, manejador, interceptores de nuevo, luego filtros en caso de error. Solo guards e interceptores obtienen el ExecutionContext.\"</div>",
  },
  {
    id: "st-8",
    num: "08",
    title: "08 · Pipes y validación",
    html:
      "<p><b>Core:</b> los pipes (<code>transform(value, metadata)</code>) validan y transforman argumentos del manejador, ejecutándose justo antes del manejador dentro de la zona de excepciones. El <code>ValidationPipe</code> global + class-validator en DTOs de <b>clase</b> es la columna vertebral:</p>" +
      "<div class=\"code\">app.useGlobalPipes(new ValidationPipe({\n  whitelist: true,            // elimina props sin decorador\n  forbidNonWhitelisted: true, // lanza error en props desconocidas\n  transform: true,            // construye instancia DTO + convierte\n}));</div>" +
      "<p><code>whitelist</code>/<code>forbidNonWhitelisted</code> defienden contra <b>mass-assignment</b>. Los objetos anidados necesitan <code>@ValidateNested()</code> + <code>@Type(() =&gt; Dto)</code>. Pipes parse incorporados: <code>ParseIntPipe</code>, <code>ParseUUIDPipe</code>, <code>ParseArrayPipe</code> y <code>ParseDatePipe</code> de v11.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Trampa</span> Los DTOs deben ser clases; <code>import type</code> los elimina y la validación silenciosamente no hace nada.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Un ValidationPipe global con whitelist + transforma valida DTOs de clase y bloquea mass-assignment — la entrada mala se convierte en un 400 antes de que se ejecute mi manejador.\"</div>",
  },
  {
    id: "st-9",
    num: "09",
    title: "09 · Guards y autorización",
    html:
      "<p><b>Core:</b> un guard (<code>canActivate(ctx)</code> → boolean) decide si una request procede — el hogar de la <b>autorización</b>. Como tiene un <code>ExecutionContext</code>, lee metadatos de ruta vía <code>Reflector</code>:</p>" +
      "<div class=\"code\">const roles = this.reflector.getAllAndOverride(ROLES_KEY,\n  [ctx.getHandler(), ctx.getClass()]);</div>" +
      "<p><b>RBAC</b>: <code>@Roles('admin')</code> + un <code>RolesGuard</code> comparando con <code>req.user.roles</code>. <b>Patrón de auth global</b>: registra el JWT guard como <code>APP_GUARD</code> (todo protegido), añade <code>@Public()</code> y cortocircuita en él. Para reglas por recurso escala a <b>ABAC con CASL</b>.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Los guards hacen autorización. Hago las rutas protegidas por defecto vía APP_GUARD con una salida @Public(), y uso el Reflector para verificación de roles.\"</div>",
  },
  {
    id: "st-10",
    num: "10",
    title: "10 · Interceptores",
    html:
      "<p><b>Core:</b> los interceptores envuelven el manejador en un stream RxJS (<code>intercept(ctx, next)</code> → Observable), dando lógica antes/después alrededor de <code>next.handle()</code>. Omite <code>next.handle()</code> para sobreescribir (caché).</p>" +
      "<ul><li>Transforman respuestas — <code>map(d =&gt; ({ data: d }))</code></li><li>Logging/timing — <code>tap(...)</code></li><li>Timeouts — <code>timeout(5000)</code> + <code>catchError</code></li><li>Serialización — <code>ClassSerializerInterceptor</code> (<code>@Exclude/@Expose</code>)</li></ul>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Los interceptores son AOP: los uso para envolturas de respuesta, timing, timeouts, caché y serialización — cualquier cosa que envuelva el manejador.\"</div>",
  },
  {
    id: "st-11",
    num: "11",
    title: "11 · Filtros de excepción y manejo de errores",
    html:
      "<p><b>Core:</b> lanza subclases de <code>HttpException</code> (<code>NotFoundException</code>, <code>BadRequestException</code>) y el filtro incorporado de Nest da forma a la respuesta; errores desconocidos → 500. Un filtro personalizado (<code>@Catch()</code> + <code>catch(exception, host)</code>) te permite estandarizar el body de error, loguear y mapear errores de dominio a HTTP.</p>" +
      "<p><b>Patrón AllExceptionsFilter</b>: <code>@Catch()</code> (todo) + inyecta <code>HttpAdapterHost</code>; usa <code>ArgumentsHost</code> para que funcione a través de HTTP/WS/RPC. Extiende <code>BaseExceptionFilter</code> y llama a <code>super.catch()</code> para mantener los predeterminados mientras añades logging.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Lanzo HttpExceptions tipados para fallos esperados y uso un AllExceptionsFilter global para estandarizar la envoltura de error y centralizar el logging.\"</div>",
  },
  {
    id: "st-12",
    num: "12",
    title: "12 · Middleware",
    html:
      "<p><b>Core:</b> el middleware se ejecuta primero, con <code>req/res/next</code> raw — logging, CORS, helmet, parsing de body, adjuntar un request id. El middleware de clase (<code>NestMiddleware</code>) tiene DI; el funcional no tiene dependencias. Se aplica vía <code>configure(consumer)</code>: <code>consumer.apply(LoggerMiddleware).forRoutes('users')</code>.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Limitación</span> El middleware <b>no tiene ExecutionContext</b> — no puede conocer el manejador objetivo ni leer sus metadatos. Para cualquier cosa consciente de rutas, usa un guard o interceptor. El middleware global <code>app.use()</code> no puede usar DI.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"El middleware es para configuración transversal de requests que no necesita conocer el manejador — logging, helmet, request ids. La lógica consciente de rutas va en guards/interceptores.\"</div>",
  },
  {
    id: "st-13",
    num: "13",
    title: "13 · Configuración y secretos",
    html:
      "<p><b>Core:</b> <code>@nestjs/config</code> carga <code>.env</code> + fusiona <code>process.env</code> (el entorno real gana). Hazlo global, cachealo y <b>valida al arrancar</b> con Joi/zod para que un despliegue mal configurado crashee inmediatamente en lugar de fallar en el momento de la request. Usa namespaces con <code>registerAs('db', ...)</code> para configuración tipada y modular.</p>" +
      "<p><b>12-factor:</b> la configuración que varía por despliegue vive en el entorno, no en el repo. <code>.env</code> es solo para desarrollo local (gitignored + dockerignored); los secretos de producción vienen de un gestor (k8s Secrets, AWS Secrets Manager, Vault). Node 20+ puede cargar entorno de forma nativa con <code>--env-file</code>.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"La configuración se valida al inicio para fallar rápido, los secretos vienen de un gestor no del repo, y uso namespaces en la configuración para type safety.\"</div>",
  },
  {
    id: "st-14",
    num: "14",
    title: "14 · Bases de datos y el patrón repositorio",
    html:
      "<p><b>Core:</b> Nest integra TypeORM, Prisma y Mongoose. TypeORM: <code>forRoot</code> configura el <b>DataSource</b>, <code>forFeature([Entity])</code> registra por módulo, inyecta <code>@InjectRepository(User)</code>. Prisma: envuelve el cliente generado en un <code>PrismaService</code> (conecta en <code>onModuleInit</code>). Mongoose: <code>@InjectModel</code> sobre clases <code>@Schema</code>.</p>" +
      "<p>El <b>patrón repositorio</code> mantiene la aplicación hablando con repositorios, no con el ORM/SQL raw — para que puedas intercambiar el almacén, añadir caché y mapear filas a modelos de dominio en el límite. No filtres entidades (con secretos/relaciones) directamente a respuestas de API.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">#1 advertencia</span> TypeORM <code>synchronize: true</code> altera automáticamente el esquema y puede eliminar datos — nunca en producción. Usa migraciones.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Paso por repositorios y mapeo a modelos de dominio en el límite, ejecuto migraciones (nunca synchronize en prod), y mantengo las entidades fuera del contrato de API.\"</div>",
  },
  {
    id: "st-15",
    num: "15",
    title: "15 · Transacciones e integridad de datos",
    html:
      "<p><b>Core:</b> envuelve escrituras de múltiples pasos en una transacción para que se confirmen o reviertan atómicamente. TypeORM ofrece tres formas: un <code>QueryRunner</code> (más control, debes hacer <code>release()</code> en <code>finally</code>), el callback <code>dataSource.transaction(async mgr =&gt; ...)</code> (commit/rollback automático), o el decorador comunitario <code>typeorm-transactional</code>. Cada operación debe compartir el <b>mismo EntityManager</b> o se ejecuta fuera de la transacción.</p>" +
      "<p>A través de servicios no puedes usar una transacción de DB — usa el patrón <b>Saga</b> (acciones compensatorias) y el <b>transactional outbox</b> para publicación confiable de eventos, con consumidores idempotentes.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Dentro del servicio, uso una transacción con un EntityManager compartido. Entre servicios no hay 2PC — uso sagas con compensaciones y un outbox para publicación atómica de eventos.\"</div>",
  },
  {
    id: "st-16",
    num: "16",
    title: "16 · Autenticación (JWT / Passport)",
    html:
      "<p><b>Core:</b> emite un <b>token de acceso de corta duración</b> al iniciar sesión (<code>JwtService.signAsync</code>, id en <code>sub</code>) y vérificalo en un guard en rutas protegidas. Con Passport, un <code>JwtStrategy</code> extrae y valida el token (valor de retorno → <code>req.user</code>) y proteges con <code>AuthGuard('jwt')</code>; sin Passport, un guard hecho a mano usa <code>JwtService</code> directamente.</p>" +
      "<p>Combina tokens de acceso con <b>tokens de actualización</b> (rotados, almacenados, revocables) ya que los JWTs no pueden ser revocados antes de expirar. Hashea contraseñas con <b>bcrypt/argon2</b> (nunca almacenes en texto plano o reversible).</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Tokens de acceso JWT de corta duración más tokens de actualización rotativos, verificados en un guard global con una salida @Public(), contraseñas hasheadas con bcrypt/argon2.\"</div>",
  },
  {
    id: "st-17",
    num: "17",
    title: "17 · Caché",
    html:
      "<p><b>Core:</b> <code>@nestjs/cache-manager</code> (v11 está basado en Keyv) ofrece caché manual (<code>@Inject(CACHE_MANAGER)</code> → <code>get/set/del</code>) y caché automática de GET (<code>CacheInterceptor</code>). Patrones: <b>cache-aside</b> (verificar → miss → DB → TTL → invalidar en escritura), read-through, write-through. Nombra <b>stale-while-revalidate</b> para lecturas instantáneas + refresco en background.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">A escala</span> El almacén predeterminado es en memoria (por instancia). Usa un almacén Redis (KeyvRedis) para que todas las réplicas compartan la caché, y scope las claves (por ejemplo, por tenant). Protege contra stampede de caché con un lock o TTL con jitter. Los TTLs están en <b>milisegundos</b>; <code>get()</code> devuelve <code>undefined</code> en miss en v11.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Cache-aside con Redis para que sea compartido entre instancias, TTL + invalidación delete-on-write, y protección contra stampede para claves calientes.\"</div>",
  },
  {
    id: "st-18",
    num: "18",
    title: "18 · Colas y trabajos en background",
    html:
      "<p><b>Core:</b> mueve trabajo pesado/lento fuera de la ruta de request con <b>BullMQ</b> (<code>@nestjs/bullmq</code>, respaldado por Redis). El productor añade trabajos (<code>q.add('name', data, { attempts, backoff, delay, priority })</code>); un <code>@Processor</code> extiende <code>WorkerHost</code> y enruta por <code>job.name</code> en <code>process()</code>. Obtienes reintentos, backoff, delays, prioridades y persistencia duradera.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Idempotencia</b> La entrega es al-menos-una-vez — un trabajo puede ejecutarse dos veces (crash antes del ack). Haz los procesadores idempotentes (clave de deduplicación / upsert), establece timeouts por encima de p99 y enruta reintentos agotados a una DLQ con alertas. En BullMQ, <code>@Process('name')</code> <b>no</b> funciona — usa un switch en <code>job.name</code>.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"El trabajo CPU-intensivo o lento va a una cola BullMQ con reintentos y backoff; los consumidores son idempotentes porque la entrega es al-menos-una-vez, y los trabajos muertos caen en una DLQ.\"</div>",
  },
  {
    id: "st-19",
    num: "19",
    title: "19 · Programación de tareas y eventos",
    html:
      "<p><b>Core:</b> <code>@nestjs/schedule</code> ofrece <code>@Cron()</code>, <code>@Interval()</code>, <code>@Timeout()</code> y un <code>SchedulerRegistry</code> para trabajos dinámicos. <code>@nestjs/event-emitter</code> ofrece pub/sub en proceso (<code>emit</code> / <code>@OnEvent</code>) para desacoplar efectos secundarios del flujo principal.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Trampa multi-réplica</span> Cron se ejecuta por instancia — con N réplicas cada instancia dispara. Usa un lock distribuido o encola un solo trabajo para que se ejecute una vez. El event emitter es síncrono y no duradero — para entrega confiable o entre servicios usa una cola/broker.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Eventos en proceso para desacoplar; un lock distribuido o una cola para trabajo programado para que un cron no se dispare en cada réplica.\"</div>",
  },
  {
    id: "st-20",
    num: "20",
    title: "20 · Estrategia de testing",
    html:
      "<p><b>Core:</b> <code>@nestjs/testing</code> construye un grafo DI que puedes sobreescribir. Unitario: <code>Test.createTestingModule({...}).overrideProvider(X).useValue(mock).compile()</code>, luego <code>module.get()</code> (o <code>resolve()</code> para scoped). E2E: <code>createNestApplication()</code> → <code>init()</code> → impulsa con <b>supertest</b> → <code>app.close()</code>.</p>" +
      "<p>La pirámide: muchas pruebas unitarias rápidas (mock de colaboradores) → menos pruebas de integración (DB/Redis real vía <code>Testcontainers</code>) → algunas e2e. Prueba los cinco resultados de un flujo: respuesta, cambio de DB, llamada saliente, mensaje encolado, observabilidad.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">NestJS 12</b> Vitest está programado para reemplazar a Jest como el runner predeterminado — los patrones (createTestingModule, overrides, supertest) se mantienen iguales.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Mayormente pruebas unitarias rápidas con proveedores sobrescritos, pruebas de integración contra Postgres/Redis real vía Testcontainers, y una capa delgada de e2e con supertest.\"</div>",
  },
];
