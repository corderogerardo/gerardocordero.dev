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
];
