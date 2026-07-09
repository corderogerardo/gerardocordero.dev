// Prompts de práctica — tareas de codificación NestJS / Node.js y prompts de diseño de sistemas backend.
import type { Level } from "@/lib/levels";

export type PromptKind = "coding" | "design";
export type Prompt = {
  id: string;
  kind: PromptKind;
  title: string;
  level: Level;
  tags: string[];
  promptHtml: string;
  reveal: { label: string; html: string }[];
};

export const PROMPTS: Prompt[] = [
  // ---------------- CODING ----------------
  {
    id: "pr-crud",
    kind: "coding",
    title: "Endpoint REST paginado con validación + auth",
    level: "mid",
    tags: ["NestJS", "validation", "guards"],
    promptHtml:
      "<p>Construye <code>GET /users?page=1&amp;limit=20</code> que esté protegido por JWT, valide los parámetros de query y devuelva un resultado paginado. Muestra el controlador, el query DTO y cómo se conectan el guard/pipe.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<ul><li>Un <code>PaginationDto</code> con <code>@IsInt()/@Min()/@Max()</code> + <code>@Type(() =&gt; Number)</code> para conversión.</li><li>Global <code>ValidationPipe({ transform: true, whitelist: true })</code>.</li><li><code>@UseGuards(JwtAuthGuard)</code> (o un APP_GUARD global).</li><li>El servicio devuelve <code>{ data, total, page, limit }</code>; el repositorio usa <code>skip/take</code>.</li></ul>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">export class PaginationDto {\n  @Type(() =&gt; Number) @IsInt() @Min(1) page = 1;\n  @Type(() =&gt; Number) @IsInt() @Min(1) @Max(100) limit = 20;\n}\n\n@Controller('users')\n@UseGuards(JwtAuthGuard)\nexport class UsersController {\n  constructor(private users: UsersService) {}\n\n  @Get()\n  list(@Query() q: PaginationDto) {\n    return this.users.findPage(q.page, q.limit);\n  }\n}\n\n// servicio\nasync findPage(page: number, limit: number) {\n  const [data, total] = await this.repo.findAndCount({\n    skip: (page - 1) * limit, take: limit, order: { id: 'DESC' },\n  });\n  return { data, total, page, limit, pages: Math.ceil(total / limit) };\n}</div><p>Prefiere la paginación por <b>cursor</b> para feeds grandes/infinitos (estable bajo inserciones).</p>",
      },
    ],
  },
  {
    id: "pr-roles-guard",
    kind: "coding",
    title: "RolesGuard personalizado con Reflector",
    level: "senior",
    tags: ["NestJS", "auth", "RBAC"],
    promptHtml:
      "<p>Implementa un decorador <code>@Roles('admin')</code> y un <code>RolesGuard</code> que lea los roles requeridos de los metadatos de ruta y los compare con <code>request.user.roles</code>. Haz que los roles de nivel de método sobreescriban los de nivel de clase.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<ul><li>Decorador = <code>SetMetadata(ROLES_KEY, roles)</code>.</li><li>Guard inyecta <code>Reflector</code> y usa <code>getAllAndOverride(ROLES_KEY, [handler, class])</code>.</li><li>Sin roles requeridos → permitir; de otro modo verificar membresía.</li><li>Registrar como <code>APP_GUARD</code> para que sea global + con DI.</li></ul>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">export const ROLES_KEY = 'roles';\nexport const Roles = (...roles: string[]) =&gt; SetMetadata(ROLES_KEY, roles);\n\n@Injectable()\nexport class RolesGuard implements CanActivate {\n  constructor(private reflector: Reflector) {}\n  canActivate(ctx: ExecutionContext): boolean {\n    const required = this.reflector.getAllAndOverride&lt;string[]&gt;(\n      ROLES_KEY, [ctx.getHandler(), ctx.getClass()],\n    );\n    if (!required?.length) return true;\n    const { user } = ctx.switchToHttp().getRequest();\n    return required.some((r) =&gt; user?.roles?.includes(r));\n  }\n}</div><p><b>Advertencia:</b> <code>getAllAndOverride</code> (no <code>get</code>) es lo que hace que el método sobreescriba la clase.</p>",
      },
    ],
  },
  {
    id: "pr-retry",
    kind: "coding",
    title: "Reintentos con backoff exponencial + jitter",
    level: "senior",
    tags: ["Node", "resilience"],
    promptHtml:
      "<p>Escribe <code>retry(fn, { retries, baseMs })</code> que reintente una función asíncrona fallida con backoff exponencial y jitter, solo reintentando errores transitorios, y que abandone después de N intentos.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<ul><li>Bucle hasta <code>retries+1</code> veces; <code>await fn()</code> en try/catch.</li><li>Delay = <code>min(cap, base × 2^attempt)</code> + jitter aleatorio.</li><li>Solo reintentar errores reintatables (red, 5xx) — relanzar 4xx inmediatamente.</li><li>Soportar un <code>AbortSignal</code> para cancelar.</li></ul>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">async function retry&lt;T&gt;(fn: () =&gt; Promise&lt;T&gt;, opts = {}): Promise&lt;T&gt; {\n  const { retries = 3, baseMs = 100, capMs = 2000, retryable = () =&gt; true } = opts;\n  let attempt = 0;\n  for (;;) {\n    try { return await fn(); }\n    catch (err) {\n      if (attempt &gt;= retries || !retryable(err)) throw err;\n      const backoff = Math.min(capMs, baseMs * 2 ** attempt);\n      const jitter = Math.random() * backoff;\n      await new Promise((r) =&gt; setTimeout(r, backoff / 2 + jitter / 2));\n      attempt++;\n    }\n  }\n}</div><p>El jitter previene un <b>thundering herd</b> de reintentos sincronizados. Solo reintenta operaciones <b>idempotentes</b>.</p>",
      },
    ],
  },
  {
    id: "pr-lru",
    kind: "coding",
    title: "Caché LRU en memoria (O(1))",
    level: "mid",
    tags: ["Node", "data structures"],
    promptHtml:
      "<p>Implementa una caché LRU con <code>get</code> y <code>set</code> de O(1) y una capacidad máxima que elimine la entrada menos recientemente usada.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p>Un <code>Map</code> de JS preserva el orden de inserción, por lo que puedes implementar LRU sin una linked list hecha a mano: en <code>get</code>, elimina + re-establece para mover la clave al extremo más reciente; en <code>set</code> sobre capacidad, elimina <code>map.keys().next().value</code> (la más antigua).</p>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">class LRU&lt;K, V&gt; {\n  private map = new Map&lt;K, V&gt;();\n  constructor(private cap: number) {}\n  get(key: K): V | undefined {\n    if (!this.map.has(key)) return undefined;\n    const v = this.map.get(key)!;\n    this.map.delete(key); this.map.set(key, v); // marcar como reciente\n    return v;\n  }\n  set(key: K, val: V) {\n    if (this.map.has(key)) this.map.delete(key);\n    else if (this.map.size &gt;= this.cap)\n      this.map.delete(this.map.keys().next().value); // eliminar la más antigua\n    this.map.set(key, val);\n  }\n}</div><p>La versión clásica de entrevista usa un <b>HashMap + doubly linked list</b>; el truco con Map es el atajo idiomático de JS.</p>",
      },
    ],
  },
  {
    id: "pr-plimit",
    kind: "coding",
    title: "Pool asíncrono con límite de concurrencia",
    level: "senior",
    tags: ["Node", "async"],
    promptHtml:
      "<p>Procesa 10,000 elementos ejecutando un <code>worker(item)</code> asíncrono con como máximo <b>N</b> en vuelo a la vez (un <code>Promise.all</code> acotado). ¿Por qué no simplemente <code>Promise.all(items.map(worker))</code>?</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p><code>Promise.all</code> sin límite inicia las 10k a la vez — agotando sockets/manejadores de archivos/memoria. En su lugar mantiene un pool: lanza hasta N, y cuando uno resuelve, extrae el siguiente elemento.</p>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">async function mapLimit&lt;T, R&gt;(items: T[], n: number,\n  worker: (item: T) =&gt; Promise&lt;R&gt;): Promise&lt;R[]&gt; {\n  const results: R[] = new Array(items.length);\n  let i = 0;\n  async function run() {\n    while (i &lt; items.length) {\n      const idx = i++;\n      results[idx] = await worker(items[idx]);\n    }\n  }\n  await Promise.all(Array.from({ length: Math.min(n, items.length) }, run));\n  return results;\n}</div><p>Esto acota la concurrencia a N. Librerías como <code>p-limit</code> hacen lo mismo — saber cómo construirlas desde cero.</p>",
      },
    ],
  },
  {
    id: "pr-interceptor",
    kind: "coding",
    title: "TransformInterceptor con envoltura de respuesta",
    level: "mid",
    tags: ["NestJS", "interceptors", "RxJS"],
    promptHtml:
      "<p>Escribe un interceptor que envuelva cada respuesta exitosa en <code>{ data, timestamp }</code> sin que cada manejador se entere.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p>Implementa <code>NestInterceptor</code>; devuelve <code>next.handle().pipe(map(...))</code> para transformar el stream después de que se ejecuta el manejador. Registra globalmente vía <code>APP_INTERCEPTOR</code>.</p>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">@Injectable()\nexport class TransformInterceptor&lt;T&gt;\n  implements NestInterceptor&lt;T, { data: T; timestamp: string }&gt; {\n  intercept(_ctx: ExecutionContext, next: CallHandler) {\n    return next.handle().pipe(\n      map((data) =&gt; ({ data, timestamp: new Date().toISOString() })),\n    );\n  }\n}\n// providers: [{ provide: APP_INTERCEPTOR, useClass: TransformInterceptor }]</div><p>Para timeouts añade <code>timeout(5000)</code> + <code>catchError</code>; para logging añade un <code>tap</code> antes del map.</p>",
      },
    ],
  },
  {
    id: "pr-stream",
    kind: "coding",
    title: "Stream de un archivo grande con backpressure",
    level: "senior",
    tags: ["Node", "streams"],
    promptHtml:
      "<p>Sirve un archivo de varios GB como descarga gzipped sin cargarlo en memoria, y asegúrate de manejar errores y recursos correctamente.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p>Pipe <code>createReadStream</code> → <code>zlib.createGzip()</code> → la respuesta con <code>stream.pipeline</code> (no <code>.pipe()</code>) para que el backpressure, la propagación de errores y la limpieza de streams sean automáticos.</p>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">import { pipeline } from 'node:stream/promises';\nimport { createReadStream } from 'node:fs';\nimport { createGzip } from 'node:zlib';\n\n@Get('download')\nasync download(@Res() res: Response) {\n  res.set({ 'Content-Type': 'application/gzip',\n    'Content-Disposition': 'attachment; filename=\"big.json.gz\"' });\n  await pipeline(createReadStream('big.json'), createGzip(), res);\n}</div><p>En Nest, prefiere devolver un <code>StreamableFile</code> cuando no necesites <code>@Res()</code> raw — los interceptores post-controlador aún se ejecutan. Nunca almacenes el archivo completo en búfer.</p>",
      },
    ],
  },
  {
    id: "pr-token-bucket",
    kind: "coding",
    title: "Rate limiter de token bucket con Redis",
    level: "senior",
    tags: ["Node", "Redis", "rate limiting"],
    promptHtml:
      "<p>Implementa un limitador distribuido de token bucket (tasa de recarga R, capacidad C) que sea correcto en múltiples instancias de la aplicación. ¿Por qué debe ser atómico?</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p>Almacena <code>{tokens, lastRefill}</code> por clave en Redis. En cada request: recarga por <code>elapsed × R</code> (limitado a C), permite si ≥1 y decrementa. La recarga→verificación→decremento debe ser <b>atómico</b> o dos requests concurrentes compiten y ambas pasan — por eso se ejecuta como un <b>script Lua</b> (Redis lo ejecuta atómicamente).</p>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">-- KEYS[1]=bucket  ARGV: now, rate, capacity, cost\nlocal b = redis.call('HMGET', KEYS[1], 'tokens', 'ts')\nlocal tokens = tonumber(b[1]) or tonumber(ARGV[3])\nlocal ts = tonumber(b[2]) or tonumber(ARGV[1])\nlocal delta = math.max(0, tonumber(ARGV[1]) - ts)\ntokens = math.min(tonumber(ARGV[3]), tokens + delta * tonumber(ARGV[2]))\nlocal allowed = tokens &gt;= tonumber(ARGV[4])\nif allowed then tokens = tokens - tonumber(ARGV[4]) end\nredis.call('HMSET', KEYS[1], 'tokens', tokens, 'ts', ARGV[1])\nredis.call('PEXPIRE', KEYS[1], 60000)\nreturn allowed and 1 or 0</div><p>Usa el tiempo del servidor Redis para evitar desfase de reloj; decide fail-open vs fail-closed si Redis no está alcanzable. En Nest, envuelve esto en un almacenamiento personalizado de <code>ThrottlerGuard</code>.</p>",
      },
    ],
  },
  {
    id: "pr-dataloader",
    kind: "coding",
    title: "Corregir N+1 en GraphQL con DataLoader",
    level: "senior",
    tags: ["NestJS", "GraphQL", "performance"],
    promptHtml:
      "<p>Un resolver de campo <code>Post.author</code> ejecuta una consulta por post en una lista de 50 posts (1+50 consultas). Corrígelo con DataLoader y explica los dos errores clásicos.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p>Crea un DataLoader por request cuya función de batch toma todos los IDs de autor y devuelve autores con una sola consulta <code>WHERE id IN (...)</code>. Resuelve el campo vía <code>loader.load(post.authorId)</code> — las llamadas se coalescen dentro de un tick.</p>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">// en la fábrica de contexto GraphQL (por request):\nconst authorLoader = new DataLoader&lt;string, Author&gt;(async (ids) =&gt; {\n  const rows = await authorRepo.findBy({ id: In([...ids]) });\n  const byId = new Map(rows.map((a) =&gt; [a.id, a]));\n  return ids.map((id) =&gt; byId.get(id) ?? null); // MISMO orden + longitud\n});\n\n@ResolveField('author')\nauthor(@Parent() post: Post, @Context('authorLoader') loader) {\n  return loader.load(post.authorId);\n}</div><div class=\"callout warn\"><span class=\"lbl\">Dos errores a evitar</span> (1) la función de batch debe devolver resultados en el <b>mismo orden y longitud</b> que las claves — construye un Map y re-mapea. (2) El loader debe ser <b>por request</b> — un singleton filtra la caché de un usuario a otro.</div>",
      },
    ],
  },
  {
    id: "pr-shutdown",
    kind: "coding",
    title: "Apagado graceful para un servicio Nest",
    level: "senior",
    tags: ["NestJS", "ops"],
    promptHtml:
      "<p>Implementa un apagado graceful para que un SIGTERM (k8s rollout) drene las requests en curso y cierre recursos antes de salir.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<ul><li><code>app.enableShutdownHooks()</code> en <code>main.ts</code>.</li><li>Implementa <code>OnApplicationShutdown</code>/<code>OnModuleDestroy</code> para cerrar pools de DB, colas, sockets.</li><li>Falla el readiness probe primero para que el LB deje de enrutar; completa los en curso; luego sal.</li></ul>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">// main.ts\nconst app = await NestFactory.create(AppModule);\napp.enableShutdownHooks();\await app.listen(3000);\n\n@Injectable()\nexport class DbService implements OnApplicationShutdown {\n  async onApplicationShutdown(signal?: string) {\n    await this.pool.end();      // cerrar conexiones\n    await this.queue.close();   // detener workers\n  }\n}</div><p><b>Detalle de k8s:</b> la eliminación del endpoint y SIGTERM ocurren concurrentemente, por lo que añade un pequeño sleep de <code>preStop</code> (o sigue sirviendo brevemente) para evitar perder requests, y establece <code>terminationGracePeriodSeconds</code> por encima del peor caso de drenado.</p>",
      },
    ],
  },

  // ---------------- SYSTEM DESIGN ----------------
  {
    id: "pr-multitenant",
    kind: "design",
    title: "Diseñar una API SaaS multi-tenant",
    level: "architect",
    tags: ["architecture", "multi-tenancy"],
    promptHtml:
      "<p>Diseña el backend para un SaaS B2B donde los datos de cada tenant deban estar aislados. Cubre el modelo de aislamiento, la resolución del tenant y cómo se previene la filtración entre tenants.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p>Primero clarifica escala + cumplimiento (impulsa silo vs pool). Decide el modelo de aislamiento, de dónde viene el tenant id, cómo se propaga y la salvaguarda que hace que la filtración sea imposible incluso con un bug.</p>",
      },
      {
        label: "Solución",
        html:
          "<ul><li><b>Aislamiento:</b> Pool (tablas compartidas + <code>tenant_id</code>) para costo; Silo (DB por tenant) para enterprise/cumplimiento; Bridge (esquema por tenant) en el medio. Mezcla por tier.</li><li><b>Resolución:</b> tenant desde subdomain o un claim JWT → establece en el contexto de request vía <code>nestjs-cls</code> (AsyncLocalStorage).</li><li><b>Salvaguarda:</b> <b>Row-Level Security</b> de Postgres con clave en una variable de sesión — un filtro olvidado no puede filtrar filas.</li><li><b>Ruido del vecino:</b> límites de tasa/cuotas por tenant, timeouts de consulta; scope todas las claves de caché por tenant.</li><li><b>Ops:</b> migraciones por tenant (pool=1 ejecución, silo=N), backups y residencia de datos.</li></ul><div class=\"callout warn\"><span class=\"lbl\">Pecado cardinal</span> Filtración entre tenants — RLS + claves de caché con scope de tenant son la defensa.</div>",
      },
    ],
  },
  {
    id: "pr-order-pipeline",
    kind: "design",
    title: "Diseñar un pipeline de órdenes basado en eventos",
    level: "architect",
    tags: ["architecture", "microservices", "messaging"],
    promptHtml:
      "<p>Una orden fluye a través de pago, inventario y envío — servicios separados. Diseñalo para confiabilidad: sin dobles cobros, sin órdenes perdidas, estado consistente.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p>Sin transacción distribuida. Usa un <b>saga</b> con compensaciones, publicación confiable de eventos vía un <b>outbox</b> y consumidores idempotentes. Decide orquestación vs coreografía.</p>",
      },
      {
        label: "Solución",
        html:
          "<ul><li><b>Saga:</b> orden → reservar inventario → cobrar pago → programar envío; en cualquier fallo, ejecuta compensaciones (reembolso, liberar inventario).</li><li><b>Outbox transaccional:</b> cada servicio escribe su cambio de estado + un evento outbox en la misma transacción de DB; un relé publica a Kafka/RabbitMQ (al-menos-una-vez).</li><li><b>Idempotencia:</b> consumidores deduplican por (event_id, type); el pago usa una clave de idempotencia para que los reintentos no cobren doble.</li><li><b>Observabilidad:</b> un correlation id hilvana todo el flujo; una DLQ + alertas atrapan mensajes venenosos.</li><li><b>Orquestación</b> (un servicio coordinador) para flujos complejos; <b>coreografía</b> (los servicios reaccionan a eventos) para desacoplamiento.</li></ul>",
      },
    ],
  },
  {
    id: "pr-gateway-auth",
    kind: "design",
    title: "Diseñar auth a través de un API gateway + microservicios",
    level: "architect",
    tags: ["architecture", "auth", "microservices"],
    promptHtml:
      "<p>Tienes un gateway y varios servicios backend. ¿Dónde autenticas y autorizas, y cómo confían los servicios downstream en el llamador?</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p>Autentica una vez en el borde, propaga la identidad verificada hacia adentro y mantiene los servicios internos. Decide entre tokens opacos (introspección) y JWTs (auto-verificables).</p>",
      },
      {
        label: "Solución",
        html:
          "<ul><li><b>Borde:</b> el gateway valida el JWT/renueva sesiones, aplica rate limiting global y rechaza requests malas temprano.</li><li><b>Propagación:</b> pasa una identidad verificada hacia adentro (el JWT validado o un token interno firmado) para que cada servicio pueda autorizar sin re-autenticar; los servicios verifican la firma (JWKS compartido).</li><li><b>Autorización:</b> verificaciones gruesas en el gateway, detalladas (a nivel de recurso, RBAC/ABAC) dentro de cada servicio donde vive el dominio.</li><li><b>Red:</b> los servicios no están expuestos a internet; mTLS / service mesh entre ellos; tokens de corta duración; rotación centralizada de JWKS.</li></ul><div class=\"callout\"><span class=\"lbl\">Compromiso</span> Los JWTs escalan (sin llamada de introspección) pero no pueden ser revocados antes de expirar — mantenlos cortos y combina con una denylist para logout.</div>",
      },
    ],
  },
  {
    id: "pr-cache-strategy",
    kind: "design",
    title: "Diseñar caché para un endpoint de lectura intensiva",
    level: "senior",
    tags: ["architecture", "caching", "performance"],
    promptHtml:
      "<p>Un endpoint de detalle de producto recibe 50k RPS, 99% de lecturas, los datos cambian unas pocas veces al día. Diseña la caché para que sea rápida, suficientemente fresca y sobreviva una tormenta de cache misses.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p>Capas de caché (CDN/edge → Redis → DB), elige una estrategia de invalidación que coincida con la frecuencia de cambio y protege contra stampede cuando una clave caliente expira.</p>",
      },
      {
        label: "Solución",
        html:
          "<ul><li><b>Capas:</b> caché CDN/edge para lecturas anónimas; caché <b>Redis</b> compartida cache-aside para la app; DB como fuente de verdad.</li><li><b>Invalidación:</b> como los datos cambian raramente, usa un TTL moderado + <b>delete-on-write</b> (o claves versionadas) para que las actualizaciones se muestren pronto.</li><li><b>Protección contra stampede:</b> un lock single-flight (<code>SETNX</code>) o coalescencia de requests para que un miss repoblie mientras otros esperan; TTLs con jitter para que las claves no expiren todas juntas.</li><li><b>Patrón:</b> stale-while-revalidate — sirve stale instantáneamente, refresca en background.</li><li><b>Consistencia:</b> entre réplicas, Redis (no en memoria) para que todas las instancias coincidan.</li></ul>",
      },
    ],
  },
  {
    id: "pr-idempotent-payments",
    kind: "design",
    title: "Diseñar procesamiento de pagos idempotente",
    level: "architect",
    tags: ["architecture", "resilience"],
    promptHtml:
      "<p>Los clientes reintentan en timeout, por lo que una request de \"cobrar tarjeta\" puede llegar dos veces. Diseña el API + almacenamiento para que un cliente nunca sea cobrado doblemente.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p>Haz la operación idempotente con una clave suministrada por el cliente + un almacén de deduplicación, y maneja los casos de en duplicado/duplicada explícitamente.</p>",
      },
      {
        label: "Solución",
        html:
          "<ul><li><b>Clave de idempotencia:</b> el cliente envía un header <code>Idempotency-Key</code> único por cobro lógico.</li><li><b>Almacén de deduplicación:</b> en la primera request, inserta la clave (restricción de unicidad) con estado <code>in_progress</code>; realiza el cobro; almacena el resultado. Una duplicada encuentra la clave y devuelve el <b>resultado original</b> en lugar de cobrar de nuevo.</li><li><b>Carreras:</b> la restricción de unicidad hace que las duplicadas concurrentes fallen rápido; devuelve la respuesta almacenada o 409 mientras está en progreso.</li><li><b>Proveedor:</b> pasa la misma clave de idempotencia al proveedor de pago (Stripe y otros la soportan) para seguridad de extremo a extremo.</li><li><b>Expiración:</b> mantén las claves el tiempo suficiente para cubrir las ventanas de reintento del cliente.</li></ul>",
      },
    ],
  },
  {
    id: "pr-observability",
    kind: "design",
    title: "Diseñar observabilidad para un servicio Nest",
    level: "senior",
    tags: ["architecture", "observability"],
    promptHtml:
      "<p>Estás de guardia para una API Nest y la latencia acaba de dispararse. Diseña la observabilidad que querrías tener para diagnosticarlo en minutos, no horas.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p>Cubre las cuatro señales (salud, métricas, trazas, logs), corrélalas y alerta en salvaguardas — incluyendo métricas específicas de Node como el lag del event loop.</p>",
      },
      {
        label: "Solución",
        html:
          "<ul><li><b>Métricas (RED + Node):</b> tasa de requests/errores/duración, más <b>event-loop lag</b>, heap, GC y saturación del pool — un pico de latencia con alto lag de loop apunta a bloqueo de CPU.</li><li><b>Trazas:</b> instrumentación automática OpenTelemetry; el span lento te dice si es DB vs downstream vs CPU. Propaga <code>traceparent</code> entre servicios.</li><li><b>Logs:</b> JSON estructurado (pino) con un correlation id por request, trace id inyectado para poder pivotear log↔trace.</li><li><b>Salud:</b> probes de liveness/readiness (terminus) para que una instancia mala sea eliminada/reiniciada.</li><li><b>Alertas:</b> en p99 de latencia, tasa de error y loop lag — atados a SLOs, no a CPU raw.</li></ul>",
      },
    ],
  },

  // ---------------- LIVE-CODING: implement-the-primitive ----------------
  {
    id: "pr-impl-promise-all",
    kind: "coding",
    title: "Implementar Promise.all desde cero",
    level: "senior",
    tags: ["Node", "async", "promises"],
    promptHtml:
      "<p>Reimplementa <code>Promise.all(promises)</code>: resuelve a un array de resultados <b>en el orden de entrada</b>, rechaza tan pronto como cualquier entrada rechace (fail-fast), y resuelve a <code>[]</code> para un array vacío. No uses la incorporada.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<ul><li>Devuelve una nueva Promise. Rastrea un contador <code>remaining</code> comenzando en la longitud de entrada.</li><li>Almacena cada resultado en su <b>índice</b> — el orden de resolución es no determinista, así que no puedes <code>push</code>.</li><li>El primer rechazo llama a <code>reject</code> (fail-fast); los asentamientos posteriores se ignoran porque una Promise se asienta una vez.</li><li>Entrada vacía → resuelve <code>[]</code> inmediatamente, o el contador nunca llegará a cero.</li></ul>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">function promiseAll&lt;T&gt;(promises: Promise&lt;T&gt;[]): Promise&lt;T[]&gt; {\n  return new Promise((resolve, reject) =&gt; {\n    const results: T[] = new Array(promises.length);\n    let remaining = promises.length;\n    if (remaining === 0) return resolve(results); // [] fast path\n    promises.forEach((p, i) =&gt; {\n      Promise.resolve(p).then(\n        (value) =&gt; {\n          results[i] = value;          // por índice, no push\n          if (--remaining === 0) resolve(results);\n        },\n        reject,                        // fail-fast en el primer rechazo\n      );\n    });\n  });\n}</div><p><b>Insight clave:</b> los resultados van por índice y el contador impulsa la resolución — nunca dependes del orden en que las promesas se asienten.</p>",
      },
    ],
  },
  {
    id: "pr-impl-event-emitter",
    kind: "coding",
    title: "Implementar un EventEmitter personalizado",
    level: "senior",
    tags: ["Node", "events", "patterns"],
    promptHtml:
      "<p>Construye un <code>EventEmitter</code> con <code>on</code>, <code>off</code>, <code>once</code> y <code>emit</code>. Un listener <code>once</code> se dispara exactamente una vez y luego se elimina. ¿Qué se rompe si un listener llama a <code>off</code> durante <code>emit</code>?</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<ul><li>Respaldado por un <code>Map&lt;event, Set&lt;fn&gt;&gt;</code> — un Set deduplica y da O(1) add/remove.</li><li><code>once</code> envuelve el listener; el wrapper se elimina antes de invocar, para que las emits reentrantes no lo reenciendan.</li><li><b>Itera una copia</b> en <code>emit</code> — un listener que llama a <code>off</code> (u <code>once</code> auto-eliminarse) muta el Set activo a mitad de iteración.</li></ul>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">class EventEmitter {\n  private map = new Map&lt;string, Set&lt;Function&gt;&gt;();\n\n  on(event: string, fn: Function) {\n    (this.map.get(event) ?? this.map.set(event, new Set()).get(event)!).add(fn);\n    return this;\n  }\n  off(event: string, fn: Function) {\n    this.map.get(event)?.delete(fn);\n    return this;\n  }\n  once(event: string, fn: Function) {\n    const wrap = (...args: unknown[]) =&gt; {\n      this.off(event, wrap);   // eliminar antes de llamar\n      fn(...args);\n    };\n    return this.on(event, wrap);\n  }\n  emit(event: string, ...args: unknown[]) {\n    const fns = this.map.get(event);\n    if (!fns) return false;\n    [...fns].forEach((fn) =&gt; fn(...args)); // itera una COPIA\n    return true;\n  }\n}</div><p><b>Insight clave:</b> emite sobre una snapshot (<code>[...fns]</code>) para que un listener eliminándose a sí mismo — u otro — a mitad de despacho no pueda corromper la iteración.</p>",
      },
    ],
  },
  {
    id: "pr-impl-promise-pool",
    kind: "coding",
    title: "Implementar un pool de promesas (límite de concurrencia)",
    level: "senior",
    tags: ["Node", "async", "concurrency"],
    promptHtml:
      "<p>Escribe <code>promisePool(thunks, limit)</code> que ejecute como máximo <b>N</b> tareas asíncronas a la vez y devuelva resultados en el orden de entrada. Las tareas son <b>thunks</b> (<code>() =&gt; Promise</code>), no promesas — ¿por qué importa?</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<ul><li>Los thunks son lazy: una <code>Promise</code> cruda ya ha comenzado, así que no podrías limitar la concurrencia. Una <code>() =&gt; Promise</code> comienza solo cuando la llamas.</li><li>Spawn N <b>workers</b>; cada uno extrae la siguiente tarea de un cursor compartido hasta que la lista se agota.</li><li><b>Captura el índice antes de <code>await</code></b> — <code>i++</code> después del await lee un cursor mutado y desplaza los resultados.</li></ul>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">async function promisePool&lt;T&gt;(\n  thunks: Array&lt;() =&gt; Promise&lt;T&gt;&gt;, limit: number,\n): Promise&lt;T[]&gt; {\n  const results: T[] = new Array(thunks.length);\n  let cursor = 0;\n  async function worker() {\n    while (cursor &lt; thunks.length) {\n      const idx = cursor++;          // captura ANTES de await\n      results[idx] = await thunks[idx]();\n    }\n  }\n  const workers = Array.from(\n    { length: Math.min(limit, thunks.length) }, worker,\n  );\n  await Promise.all(workers);\n  return results;\n}</div><p><b>Insight clave:</b> N workers de larga duración extrayendo de un cursor compartido mantiene exactamente N tareas en vuelo — agarra el índice sincrónica antes de ceder o dos workers pisarán el mismo slot.</p>",
      },
    ],
  },
  {
    id: "pr-impl-lru",
    kind: "coding",
    title: "Implementar una caché LRU con un Map",
    level: "senior",
    tags: ["Node", "data structures", "caching"],
    promptHtml:
      "<p>Implementa un caché LRU de O(1) (<code>get</code>/<code>put</code>, capacidad fija) usando solo un <code>Map</code> de JS — sin linked list hecha a mano. ¿Cómo te da <code>Map</code> el orden de recencia gratis?</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<ul><li><code>Map</code> preserva <b>el orden de inserción</b> y su iterador <code>keys()</code> cede desde el más antiguo — ese es tu list de recencia ya.</li><li><code>get</code> un hit: <code>delete</code> y luego <code>set</code> para mover la clave al extremo más reciente.</li><li><code>put</code> sobre capacidad: elimina <code>keys().next().value</code> (la clave más antigua).</li></ul>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">class LRUCache&lt;K, V&gt; {\n  private map = new Map&lt;K, V&gt;();\n  constructor(private capacity: number) {}\n\n  get(key: K): V | undefined {\n    if (!this.map.has(key)) return undefined;\n    const value = this.map.get(key)!;\n    this.map.delete(key);\n    this.map.set(key, value);        // re-insertar = marcar más reciente\n    return value;\n  }\n  put(key: K, value: V) {\n    if (this.map.has(key)) this.map.delete(key);\n    else if (this.map.size &gt;= this.capacity) {\n      this.map.delete(this.map.keys().next().value); // eliminar el más antiguo\n    }\n    this.map.set(key, value);\n  }\n}</div><p><b>Insight clave:</b> el orden de inserción de un <code>Map</code> <i>es</i> la lista de recencia — delete+set para promover, <code>keys().next().value</code> para eliminar, y saltas toda la contabilidad de linked-list.</p>",
      },
    ],
  },
  {
    id: "pr-impl-token-bucket",
    kind: "coding",
    title: "Implementar un limitador de token bucket en proceso",
    level: "senior",
    tags: ["Node", "rate limiting", "algorithms"],
    promptHtml:
      "<p>Construye un limitador de token bucket: capacidad <b>C</b>, tasa de recarga <b>R</b> tokens/sec, <code>tryRemove()</code> devuelve true (permitir) o false (→ 429). Sin <code>setInterval</code>. ¿Cómo se recarga sin un timer?</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<ul><li><b>Recarga lazy:</b> no ejecutes un timer — en cada llamada, suma <code>elapsed × R</code> tokens desde la última verificación, limitado a C. Costo cero cuando está ocioso.</li><li>Permite si <code>tokens &gt;= 1</code>, luego decrementa; de otro modo rechaza.</li><li>La capacidad C es la asignación de <b>burst</b>; R es la tasa de estado estable.</li></ul>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">class TokenBucket {\n  private tokens: number;\n  private last = Date.now();\n  constructor(private capacity: number, private ratePerSec: number) {\n    this.tokens = capacity;\n  }\n  private refill() {\n    const now = Date.now();\n    const elapsed = (now - this.last) / 1000;\n    this.tokens = Math.min(\n      this.capacity, this.tokens + elapsed * this.ratePerSec,\n    );\n    this.last = now;\n  }\n  tryRemove(cost = 1): boolean {\n    this.refill();\n    if (this.tokens &gt;= cost) { this.tokens -= cost; return true; }\n    return false; // el llamador responde 429\n  }\n}</div><p><b>Insight clave:</b> recarga lazy desde tiempo transcurrido en lugar de un timer — bursts hasta C se permiten, la tasa a largo plazo es R, y los buckets ociosos no cuestan nada. Para múltiples servidores, mueve esto a Redis como un script Lua para que la recarga→verificación→decremento sea atómico.</p>",
      },
    ],
  },
  {
    id: "pr-impl-retry-backoff",
    kind: "coding",
    title: "Implementar reintentos con backoff + jitter",
    level: "senior",
    tags: ["Node", "resilience", "async"],
    promptHtml:
      "<p>Escribe <code>retry(fn, retries, baseMs)</code> que reintente una llamada asíncrona fallida con backoff exponencial más jitter, y relance el último error después de que se agoten los intentos.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<ul><li>Bucle hasta <code>retries</code> veces; en lanzamiento, duerme <code>base × 2^attempt</code> más jitter aleatorio, luego intenta de nuevo.</li><li>Después del último intento, relanza para que el llamador vea la falla real.</li><li>El jitter dispersa a los clientes sincronizados para que los reintentos no se apresuren en lockstep.</li></ul>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">const sleep = (ms: number) =&gt; new Promise((r) =&gt; setTimeout(r, ms));\n\nasync function retry&lt;T&gt;(\n  fn: () =&gt; Promise&lt;T&gt;, retries = 3, baseMs = 100,\n): Promise&lt;T&gt; {\n  let lastErr: unknown;\n  for (let attempt = 0; attempt &lt;= retries; attempt++) {\n    try {\n      return await fn();\n    } catch (err) {\n      lastErr = err;\n      if (attempt === retries) break;      // sin intentos\n      const backoff = baseMs * 2 ** attempt;\n      const jitter = Math.random() * backoff;\n      await sleep(backoff + jitter);\n    }\n  }\n  throw lastErr; // relanzar después del agotamiento\n}</div><p><b>Insight clave:</b> backoff exponencial más jitter convierte un thundering herd en una ráfaga dispersa. Los seguimientos que el entrevistador quiere: solo reintentar errores <b>reintenables</b> (429/5xx, no 4xx), <b>limita</b> el delay máximo para que no crezca sin límites, e hilo un <code>AbortSignal</code> para cancelar reintentos en vuelo.</p>",
      },
    ],
  },
  {
    id: "pr-impl-debounce-throttle",
    kind: "coding",
    title: "Implementar debounce y throttle",
    level: "senior",
    tags: ["Node", "async", "patterns"],
    promptHtml:
      "<p>Implementa <code>debounce(fn, wait)</code> y <code>throttle(fn, wait)</code>. Explica la diferencia y asegúrate de que ambas preserven <code>this</code> y los argumentos.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<ul><li><b>Debounce:</b> dispara una vez después de que la actividad <b>se detiene</b> — cada llamada <code>clearTimeout</code>s la pendiente y reinicia el timer. Bueno para search-as-you-type.</li><li><b>Throttle:</b> dispara como máximo una vez por ventana — ignora llamadas hasta que la ventana transcurra. Bueno para scroll/resize.</li><li>Preserva <code>this</code> y args con <code>fn.apply(this, args)</code>; usa una función normal (no una arrow) para que <code>this</code> se vincule en tiempo de llamada.</li></ul>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">function debounce&lt;A extends unknown[]&gt;(\n  fn: (...args: A) =&gt; void, wait: number,\n) {\n  let timer: ReturnType&lt;typeof setTimeout&gt; | undefined;\n  return function (this: unknown, ...args: A) {\n    clearTimeout(timer);              // reinicia la cuenta regresiva\n    timer = setTimeout(() =&gt; fn.apply(this, args), wait);\n  };\n}\n\nfunction throttle&lt;A extends unknown[]&gt;(\n  fn: (...args: A) =&gt; void, wait: number,\n) {\n  let last = 0;\n  return function (this: unknown, ...args: A) {\n    const now = Date.now();\n    if (now - last &gt;= wait) {          // borde líder\n      last = now;\n      fn.apply(this, args);\n    }\n  };\n}</div><p><b>Insight clave:</b> debounce espera una pausa (clearTimeout la reinicia); throttle impone una cadencia fija (una puerta de timestamp). Esta versión dispara en el <b>borde líder</b> — menciona que una variante de borde final dispara una vez más después del burst, y que <code>apply(this, args)</code> es lo que mantiene la llamada envuelta transparente.</p>",
      },
    ],
  },

  // ---------------- SYSTEM DESIGN: queues, delivery, limits ----------------
  {
    id: "pr-design-job-queue",
    kind: "design",
    title: "Diseñar una cola de trabajos con reintentos + dead-letter",
    level: "senior",
    tags: ["architecture", "messaging", "resilience"],
    promptHtml:
      "<p>Diseña una cola de trabajos de background: productores encolan trabajo, workers lo procesan, fallos transitorios reintentan, y los trabajos que fallan permanentemente van a un lugar seguro en lugar de bloquear la cola.</p>",
    reveal: [
      {
        label: "Clarificar",
        html:
          "<ul><li>Target de throughput y latencia — ¿es esto segundos-fresco o trabajo en background best-effort?</li><li>Garantía de entrega: al-menos-una-vez (deduplica downstream) vs exactamente-una-vez (mucho más difícil)?</li><li>¿Son los trabajos <b>idempotentes</b>? Si no, un reintento puede ejecutar-doble.</li><li>Ordenamiento: orden estricto por clave, o trabajos independientes?</li><li>Max reintentos, forma del backoff y qué significa \"renunciar\" (alertar? reproducción manual?).</li></ul>",
      },
      {
        label: "Diseño de alto nivel",
        html:
          "<ul><li><b>Estados:</b> <code>PENDING → RUNNING → SUCCEEDED</code>, o <code>FAILED → RETRYING</code> (de vuelta a RUNNING) hasta que se agoten los intentos, luego <code>DEAD</code>.</li><li><b>Visibility timeout:</b> un trabajo reclamado se oculta durante un arrendamiento; si el worker muere sin ack, el arrendamiento expira y otro worker lo reclama — entonces un crash no pierde el trabajo.</li><li><b>Reintentos:</b> incrementa un contador de intentos, requeuea con backoff exponencial; después de N, mueve a una <b>dead-letter queue</b> (DLQ) con la razón de fallo.</li><li><b>Workers idempotentes:</b> indexa cada trabajo por un id estable y deduplica en él, porque al-menos-una-vez significa que el mismo trabajo puede ejecutarse dos veces.</li><li><b>DLQ:</b> alerta sobre profundidad, mantén la carga + error para inspección y reproducción manual/automatizada.</li></ul>",
      },
      {
        label: "Trade-offs para decir en voz alta",
        html:
          "<div class=\"callout\"><span class=\"lbl\">Trade-off</span> Al-menos-una-vez + workers idempotentes es el default pragmático; true exactamente-una-vez necesita un outbox transaccional o almacén de dedup y cuesta latencia. Un visibility timeout corto re-ejecuta trabajos lentos (trabajo duplicado); uno largo retrasa la recuperación de un worker muerto. Compra un broker (SQS/RabbitMQ/BullMQ-on-Redis) antes de construir el tuyo — la DLQ, backoff y arrendamientos son el valor.</div>",
      },
    ],
  },
  {
    id: "pr-design-notifications",
    kind: "design",
    title: "Diseñar un sistema de notificaciones multicanal",
    level: "senior",
    tags: ["architecture", "messaging", "scalability"],
    promptHtml:
      "<p>Diseña un sistema que envíe notificaciones a través de email, SMS y push. No debe doble-enviar en reintento, debe sobrevivir a una caída del proveedor y debe abarcar un solo evento a muchos destinatarios.</p>",
    reveal: [
      {
        label: "Clarificar",
        html:
          "<ul><li>Volumen y forma de burst — ¿un abanico a millones, o envíos transaccionales por usuario?</li><li>Latencia: en tiempo real (push) vs digerible (email por lotes)?</li><li>Preferencias de usuario / quiet hours / opt-outs por canal?</li><li>Garantía de entrega y ventana de dedup — ¿cómo definimos \"misma notificación\"?</li><li>¿Necesitamos recibos de entrega/lectura y fallback por canal (push falla → email)?</li></ul>",
      },
      {
        label: "Diseño de alto nivel",
        html:
          "<ul><li><b>Ingest:</b> un evento golpea un servicio de notificación que resuelve destinatarios + preferencias, luego <b>abanica</b> un mensaje por (usuario, canal).</li><li><b>Colas por canal:</b> colas separadas de email/SMS/push para que un proveedor lento o caído back-presure solo su propio canal, y cada uno pueda escalar workers independientemente.</li><li><b>Dedup / claves de idempotencia:</b> cada notificación lleva una clave estable (event id + usuario + canal); workers la verifican antes de enviar para que un reintento no pueda doble-enviar.</li><li><b>Proveedores:</b> workers de canal llaman a SendGrid/Twilio/FCM; en fallo reintenta con backoff, luego <b>DLQ</b> para inspección y reproducción.</li><li><b>Preferencias + templating:</b> centraliza opt-outs, quiet hours y rendering para que cada canal sea consistente.</li></ul>",
      },
      {
        label: "Trade-offs para decir en voz alta",
        html:
          "<div class=\"callout\"><span class=\"lbl\">Trade-off</span> Las colas compran resiliencia pero añaden latencia de consistencia eventual — está bien para notificaciones. Entrega al-menos-una-vez significa que la clave de idempotencia está haciendo el trabajo real; sin ella, los reintentos spamean usuarios. Aislamiento por canal cuesta más partes movibles que una cola pero detiene un proveedor flaky de estancar el resto. El DLQ es innegociable — es la diferencia entre una notificación perdida y una reproducible.</div>",
      },
    ],
  },
  {
    id: "pr-design-rate-limiter",
    kind: "design",
    title: "Diseñar un rate limiter distribuido",
    level: "senior",
    tags: ["architecture", "rate limiting", "Redis"],
    promptHtml:
      "<p>Diseña un rate limiter para un API detrás de N instancias de la app: por ej. 100 requests/min por clave API, aplicado consistentemente sin importar qué instancia golpee una request. Devuelve 429 con un <code>Retry-After</code> cuando se exceda.</p>",
    reveal: [
      {
        label: "Clarificar",
        html:
          "<ul><li>Clave de límite — por clave API, por usuario, por IP, o una combinación?</li><li>Tolerancia de burst: ¿es un pico corto aceptable (token bucket) o debe la ventana ser estricta (sliding window)?</li><li>¿Límite global a través de todas las instancias, o per-instancia está bien?</li><li>Fail-open (permitir en caída del limiter) o fail-closed (rechazar)?</li><li>Precisión vs costo — ¿es un límite aproximado OK en RPS alto?</li></ul>",
      },
      {
        label: "Diseño de alto nivel",
        html:
          "<ul><li><b>Almacén compartido:</b> los contadores por-instancia no pueden aplicar un límite global — mantén estado en <b>Redis</b> para que todas las N instancias coincidan.</li><li><b>Algoritmo:</b> <b>token bucket</b> (permite bursts hasta capacidad, recarga suave) vs <b>sliding-window</b> counter (estricto, sin picos de límite en el borde de ventana). Token bucket es el default común.</li><li><b>Atomicidad:</b> la verificación-y-decremento debe ser atómico o dos requests concurrentes ambas leen \"1 izquierda\" y ambas pasan — ejecútalo como un <b>script Lua</b> en Redis (ejecutado atómicamente), indexado por la clave API, con un PEXPIRE.</li><li><b>Respuesta:</b> en rechazo devuelve <code>429</code> con <code>Retry-After</code> y headers <code>X-RateLimit-Remaining/-Reset</code> para que los clientes hagan backoff.</li><li><b>Colocación:</b> aplica en el gateway/edge para límites globales baratos; límites por-servicio para control fino.</li></ul>",
      },
      {
        label: "Trade-offs para decir en voz alta",
        html:
          "<div class=\"callout\"><span class=\"lbl\">Trade-off</span> Redis lo hace consistente a través de instancias pero añade un hop de red por request y una dependencia única — decide <b>fail-open vs fail-closed</b> si no está alcanzable (usualmente fail-open para que el limiter no pueda derribar el API). Token bucket permite bursts; sliding window es más estricto pero cuesta más memoria/compute. En RPS extremo, una pequeña asignación local por-instancia sincronizada a Redis cambia exactitud por latencia.</div>",
      },
    ],
  },
];
