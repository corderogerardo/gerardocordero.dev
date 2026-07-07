// Guía de arquitectura — diseño de sistemas backend mapeado sobre NestJS / Node.js.
export type ArchSection = { id: string; num: string; title: string; html: string };
export type DeepDive = { id: string; pill: string; title: string; html: string };

export const ARCH_INTRO =
  "Un recorrido senior de diseño de sistemas backend, mapeado sobre NestJS y Node.js. Este es el material de \"cómo piensas sobre construir un backend a escala\" — decisiones antes del código, para la peor consulta, la peor red y el peor pico de tráfico.";

export const ARCH_SECTIONS: ArchSection[] = [
  {
    id: "arch-1",
    num: "01",
    title: "01 · Pensar en sistemas — el marco CRDDS",
    html:
      "<p>El diseño de sistemas es <b>toma de decisiones antes del código</b>. Un flujo estructurado te mantiene calmado bajo presión:</p>" +
      "<table><tr><th>Paso</th><th>Qué haces</th><th>Tiempo</th></tr>" +
      "<tr><td><b>C</b> — Clarificar</td><td>Requisitos funcionales y no funcionales, escala (RPS, DAU), ratio lectura/escritura, necesidades de consistencia. La mayoría de candidatos se apresuran aquí y diseñan el sistema equivocado.</td><td>~15%</td></tr>" +
      "<tr><td><b>R</b> — HLD aproximado</td><td>Dibuja el diagrama de alto nivel: clientes, gateway, servicios, almacenes de datos, colas. Un mapa de ciudad, no de calles.</td><td>~20%</td></tr>" +
      "<tr><td><b>D</b> — Inmersión profunda</td><td>Zoom en un componente (el modelo de datos, el rate limiter, la cola) — interfaces, casos borde.</td><td>~35%</td></tr>" +
      "<tr><td><b>D</b> — Discutir compromisos</td><td>Nombra alternativas y por qué elegiste una. La señal senior.</td><td>~20%</td></tr>" +
      "<tr><td><b>S</b> — Resumir</td><td>Resumen, señala riesgos, maneja seguimientos.</td><td>~10%</td></tr></table>" +
      "<div class=\"callout\"><span class=\"lbl\">Señal senior</span> Di el compromiso en voz alta: &quot;Usaré cache-aside con un TTL corto — estoy intercambiando un poco de obsolescencia por una gran ganancia de latencia.&quot;</div>",
  },
  {
    id: "arch-2",
    num: "02",
    title: "02 · Arquitectura en capas en NestJS",
    html:
      "<p>Casi todos los servicios Nest comparten el mismo esqueleto — memorízalo como tu plantilla HLD:</p>" +
      "<table><tr><th>Capa</th><th>Responsabilidad</th><th>Equivalente en Nest</th></tr>" +
      "<tr><td><b>Presentación</b></td><td>Borde HTTP/GraphQL/WS: parse, valida, serializa.</td><td>Controladores, resolvers, gateways, DTOs, pipes</td></tr>" +
      "<tr><td><b>Aplicación / Dominio</b></td><td>Casos de uso y reglas de negocio — la capa más probable.</td><td>Servicios, clases de caso de uso, modelos de dominio</td></tr>" +
      "<tr><td><b>Datos / Repositorio</b></td><td>Combina remoto + local, caché, mapea filas → dominio.</td><td>Proveedores de repositorio sobre TypeORM/Prisma/Mongoose</td></tr>" +
      "<tr><td><b>Integración</b></td><td>APIs externas, brokers de mensajes, caché.</td><td>Clientes HTTP, ClientProxy, cache-manager</td></tr></table>" +
      "<p>Para dominios complejos y de larga duración, escala a <b>arquitectura hexagonal</b>: el dominio depende de <b>ports</b> (interfaces + tokens DI) y los adaptadores vinculan implementaciones concretas — para que la infraestructura sea intercambiable y el dominio sea puro. No pagues ese costo de indirección en CRUD delgado.</p>",
  },
  {
    id: "arch-3",
    num: "03",
    title: "03 · La capa de integración — llamando a otros servicios",
    html:
      "<p>Un cliente de producción hacia otro servicio necesita más que <code>fetch</code>: <b>timeouts</b> (nunca esperar para siempre), <b>reintentos</b> con backoff exponencial + jitter (solo para fallos idempotentes/transitorios — red, 5xx, no 4xx), un <b>circuit breaker</b> (deja de golpear una dependencia caída) y un <b>bulkhead</b> (límite de llamadas concurrentes para que una dependencia lenta no agote tu pool).</p>" +
      "<p>Envuelve las llamadas en un resultado/Observable con <code>timeout()</code>, propaga un <b>correlation id</b> (<code>traceparent</code>) para tracing y mapea DTOs externos a tu dominio en el límite (una capa de anticorrupción) para que los cambios de esquema no se propaguen a tu código.</p>" +
      "<div class=\"callout\"><span class=\"lbl\">Nombra el patrón</span> Timeout + retry-with-backoff + circuit breaker + bulkhead = el cuarteto de resiliencia.</div>",
  },
  {
    id: "arch-4",
    num: "04",
    title: "04 · Almacenamiento y caché",
    html:
      "<p>Elige el almacén para el patrón de acceso: relacional (Postgres) para integridad transaccional + joins; documento (Mongo) para esquemas flexibles; clave-valor (Redis) para datos calientes/efímeros; columna amplia (Cassandra/Dynamo) para series de tiempo pesadas de escritura. La <b>replicación</b> escala lecturas + alta disponibilidad (cuidado con el lag de réplica); la <b>fragmentación</b> escala escrituras (elige una buena clave de fragmentación; los joins cross-shard duelen).</p>" +
      "<p>Capas de <b>caché</b>: en memoria (rápido, por instancia, perdido al reiniciar) y Redis compartido (sobrevive reinicios, consistente entre réplicas). Estrategias: cache-aside (predeterminado), read/write-through, write-behind. Invalida vía TTL, delete-on-write o claves versionadas; protege contra <b>stampede</b> con un lock/single-flight. Nombra <b>stale-while-revalidate</b>.</p>",
  },
  {
    id: "arch-5",
    num: "05",
    title: "05 · Escalando Node.js",
    html:
      "<p>Node escala al mantenerse <b>no bloqueante</b> y <b>sin estado</b>. Mantén el trabajo de CPU fuera del event loop (worker threads / colas). Escala <b>horizontalmente</b>: ejecuta un proceso por núcleo (cluster) o, más comúnmente, N réplicas de contenedor detrás de un load balancer. Externaliza todo el estado (sesiones, caché, subidas) a Redis/DB/object storage para que cualquier réplica pueda servir cualquier request.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Trampa de estado distribuido</span> El rate limiting, caché, programación y salas de websocket predeterminan memoria por instancia. A escala deben usar Redis (almacenamiento de throttler, KeyvRedis, locks distribuidos, adaptador socket.io Redis) o son incorrectos entre réplicas.</div>" +
      "<div class=\"callout\"><span class=\"lbl\">Vertical vs horizontal</span> Vertical (caja más grande) compra tiempo; horizontal (más cajas) es la respuesta real — y solo funciona si eres sin estado.</div>",
  },
  {
    id: "arch-6",
    num: "06",
    title: "06 · Asíncrono y mensajería",
    html:
      "<p>Desacopla trabajo con asincronía. Las <b>colas</b> (BullMQ/SQS/RabbitMQ) distribuyen trabajo a consumidores en competencia (consumir-una-vez); los <b>streams/logs</b> (Kafka) son duraderos, reproducibles, ordenados-por-partición, multi-consumidor. Usa colas para trabajos (email, procesamiento de imágenes); usa streams para event sourcing y fan-out a muchos consumidores.</p>" +
      "<p>La entrega es <b>al-menos-una-vez</b> (timeout de visibilidad → re-entrega en crash), por lo que los consumidores deben ser <b>idempotentes</b>. Los reintentos usan backoff + jitter → una <b>DLQ</b> con alertas. Back-pressure: auto-escala workers por profundidad de cola.</p>" +
      "<div class=\"callout\"><span class=\"lbl\">Guía de decisiones</b> Baja latencia bidireccional → gRPC/WebSocket. Distribución de trabajo → cola. Historial de eventos reproducible / muchos consumidores → Kafka. Push unidireccional al navegador → SSE.</div>",
  },
  {
    id: "arch-7",
    num: "07",
    title: "07 · Límites de servicios — de monolito a microservicios",
    html:
      "<p>Empieza con un <b>monolito modular</b>: un módulo por contexto acotado, cada uno con sus tablas, llamadas cross-módulo a través de una pequeña API pública + adaptador. Un despliegue, refactors atómicos, llamadas transaccionales en proceso — impón límites en CI con <code>dependency-cruiser</code>.</p>" +
      "<p><b>Extrae un microservicio</b> solo por una necesidad concreta: escalado independiente, despliegue, aislamiento de fallos o propiedad de equipo. Si los límites eran limpios, intercambias el servicio público en proceso por un cliente de transporte que implementa la misma interfaz. La consistencia entre servicios usa <b>sagas</b> (acciones compensatorias) + el <b>transactional outbox</b>, no 2PC.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Anti-patrón</span> Los microservicios prematuros compran dolor de sistemas distribuidos (fallos de red, consistencia eventual, overhead de ops) sin beneficio. Gánatelos.</div>",
  },
  {
    id: "arch-8",
    num: "08",
    title: "08 · Resiliencia y diseño de fallos",
    html:
      "<p>Diseña para el fallo como predeterminado. El toolkit: <b>timeouts</b> en todas partes, <b>reintentos</b> (solo idempotentes, backoff + jitter), <b>circuit breakers</b>, <b>bulkheads</b>, <b>degradación graceful</b> (sirve caché obsoleto / una respuesta reducida en lugar de un error) y <b>claves de idempotencia</b> para que los efectos secundarios reintentados se ejecuten a-más-una-vez.</p>" +
      "<p>Falla rápido y de forma visible: valida en el borde, límite el tamaño de request y la concurrencia, y propaga la cancelación (<code>AbortSignal</code>). Decide fail-open vs fail-closed por feature (un rate-limiter Redis caído: fail-open para disponibilidad, fail-closed para endpoints sensibles a abuso).</p>",
  },
  {
    id: "arch-9",
    num: "09",
    title: "09 · Multi-tenancy",
    html:
      "<p>Elige un modelo de aislamiento temprano (difícil de revertir): <b>Silo</b> (DB por tenant — aislamiento/cumplimiento más fuerte, más caro), <b>Pool</b> (tablas compartidas + <code>tenant_id</code> — más barato, riesgo de vecino ruidoso), <b>Bridge</b> (esquema por tenant). Los tiers frecuentemente mezclan (enterprise = silo, SMB = pool).</p>" +
      "<p>Resuelve el tenant desde subdomain/claim JWT, establecelo en el contexto de request (CLS) y impleméntalo en todas partes — el <b>RLS</b> de Postgres hace que un filtro olvidado no pueda filtrar filas. Scope las claves de caché por tenant; añade cuotas/límites de tasa por tenant para vecinos ruidosos.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Pecado cardinal</span> Filtración de datos entre tenants — un filtro faltante, un tenant mal resuelto o una clave de caché sin el tenant. RLS + claves con scope de tenant son las salvaguardas.</div>",
  },
  {
    id: "arch-10",
    num: "10",
    title: "10 · Observabilidad y SLOs",
    html:
      "<p>No puedes operar lo que no ves. Instrumenta cuatro señales: <b>salud</b> (probes de liveness/readiness), <b>métricas</b> (RED — tasa/errores/duración — más internos de Node: event-loop lag, heap, GC), <b>trazas</b> (OpenTelemetry, propagadas vía <code>traceparent</code>) y <b>logs estructurados</b> con correlation ids.</p>" +
      "<p>Define <b>SLOs</b> (por ejemplo, latencia p99 < 300ms, 99.9% de disponibilidad), rastrea un presupuesto de errores y alerta en salvaguardas — no en CPU raw. Trata un despliegue como &quot;listo&quot; solo cuando las tasas de crash/error se mantienen durante el rollout.</p>",
  },
];

export const DEEPDIVES_INTRO =
  "Seis prompts clásicos de diseño de sistemas backend, cada uno como Concepto → Ejemplo → Advertencia → Respuesta senior. Estos son los que los entrevistadores buscan — ensaya los compromisos en voz alta.";

export const DEEP_DIVES: DeepDive[] = [
  {
    id: "dd-rate-limiter",
    pill: "Diseño de sistemas",
    title: "Diseñar un rate limiter distribuido",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concepto</span> Limita requests por cliente por ventana. Algoritmos: token bucket (permite ráfagas, suaviza a un promedio — el predeterminado de API), leaky bucket (drenaje constante), fixed window (barato, duplica en el límite), sliding window log (exacto, pesado en memoria), sliding window counter (mejor precisión/memoria).</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Ejemplo</span> Token bucket en Redis: almacena <code>{tokens, lastRefill}</code> por clave; en cada request recarga por elapsed×rate (limitado), permite si ≥1 y decrementa. Devuelve 429 + <code>Retry-After</code> + <code>X-RateLimit-*</code>.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Advertencia</span> El read-modify-write entre réplicas es una carrera — dos requests leen 1 token restante y ambas pasan. La memoria por instancia ingenua (el throttler predeterminado de Nest) es incorrecta entre réplicas.</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Respuesta senior</span> Haz la recarga→verificación→decremento <b>atómica</b> con un <b>script Lua</b> de Redis (o INCR+EXPIRE). Ejecútalo en el borde/gateway para límites globales baratos. Decide fail-open vs fail-closed si Redis está caído; usa el tiempo del servidor Redis para evitar desfase de reloj.</div>" +
      "</div>",
  },
  {
    id: "dd-url-shortener",
    pill: "Diseño de sistemas",
    title: "Diseñar un acortador de URLs",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concepto</span> Mapea un código corto → URL larga con ~100:1 lectura:escritura. 7 caracteres base62 ≈ 3.5T códigos. Almacén KV, lecturas con caché pesada, analytics asíncronos.</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Ejemplo</span> Generación de código: counter+base62 (sin colisiones, pero secuencial/adivinable + cuello de botella del counter), hash+primeros-7 (necesita reintento por colisión) o un <b>Key Generation Service</b> que pre-genera claves aleatorias no usadas offline.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Advertencia</span> 301 (permanente) se cachea en el navegador y <b>pierde analytics de clics</b>; los códigos secuenciales son enumerables; el redirect no debe bloquear en analytics.</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Respuesta senior</span> KGS para códigos no adivinables; caché Redis cache-aside (~95% de hit) + CDN para redirects calientes; <b>302</b> cuando necesitas analytics; emite eventos de clic asíncronos a Kafka→warehouse para que el redirect se mantenga rápido. DynamoDB/Cassandra a escala.</div>" +
      "</div>",
  },
  {
    id: "dd-notifications",
    pill: "Diseño de sistemas",
    title: "Diseñar un servicio de notificaciones",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concepto</span> Ingesta de eventos → plantilla → enrutamiento por preferencia de usuario → colas por canal → workers de canal (email/SMS/push) → webhooks de estado → métricas. Fan-out multi-canal.</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Ejemplo</span> Un evento se distribuye a muchos destinatarios/dispositivos vía una cola, particionada por usuario para orden + paralelismo; plantillas versionadas + i18n; centro de preferencias con horas silenciosas y resúmenes.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Advertencia</span> La entrega al-menos-una-vez significa duplicados; ENVIADO ≠ ENTREGADO ≠ LEÍDO; una caída del proveedor no debe tirar todo; legal (unsubscribe/TCPA/GDPR).</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Respuesta senior</span> Consumidores idempotentes con clave en (event_id, recipient, channel); reintentos con backoff → DLQ; circuit breaker + fallback de canal (push→SMS para críticos); carriles de prioridad para que los OTPs salten delante del marketing. Exactly-one-vez es impracticable — diseña para al-menos-una-vez + dedup.</div>" +
      "</div>",
  },
  {
    id: "dd-chat",
    pill: "Diseño de sistemas",
    title: "Diseñar un backend de chat",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concepto</span> Los gateways WebSocket mantienen conexiones vivas (nodos sin estado + un registro Redis que mapea usuario→nodo). Mensajes almacenados en un almacén de columna amplia con clave por conversation_id + seq.</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Ejemplo</span> Un secuenciador del lado del servidor particionado por conversation_id asigna un seq monótono (no confíes en los relojes del cliente); los clientes reordenan/dedup por (conversation_id, seq). Presencia en Redis con heartbeats TTL.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Advertencia</span> Orden en una partición, exactly-one-vez sobre móvil inestable, fan-out a grupos enormes (amplificación de escritura), reconexión/resumen, sincronización multi-dispositivo.</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Respuesta senior</span> Al-menos-una-vez + dedup por message_id estable; <b>fan-out en escritura</b> para grupos pequeños, <b>en lectura / Kafka</b> para grandes (híbrido por tamaño — el problema del celebridad); resume desde el último seq al reconectar; socket.io Redis adapter para fan-out entre nodos.</div>" +
      "</div>",
  },
  {
    id: "dd-job-queue",
    pill: "Diseño de sistemas",
    title: "Diseñar una cola de trabajos/tareas",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concepto</span> Productor → broker → consumidores en competencia extraen. Un <b>timeout de visibilidad</b> oculta un trabajo mientras un worker lo mantiene; el éxito lo elimina, un crash lo hace reaparecer (re-entrega) — el motor de al-menos-una-vez.</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Ejemplo</span> BullMQ (Redis) para trabajos con delay/repetibles/prioridad; SQS (gestionado, FIFO para orden+dedup); Kafka para un log reproducible. Prioridades vía colas separadas; trabajos con delay vía sorted set.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Advertencia</span> Timeout de visibilidad más corto que la duración p99 → re-entrega prematura + doble procesamiento; las colas estándar no garantizan orden; una DLQ sin alertas pierde trabajo silenciosamente.</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Respuesta senior</span> Consumidores idempotentes (clave de idempotencia + dedup), timeout de visibilidad > p99 (o heartbeat-extend), reintentos con backoff → DLQ <b>con alertas</b>, auto-escala workers por profundidad de cola, FIFO/particionamiento cuando el orden importa.</div>" +
      "</div>",
  },
  {
    id: "dd-file-upload",
    pill: "Diseño de sistemas",
    title: "Diseñar subida de archivos grandes y streaming",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concepto</span> No enrutes archivos grandes a través de la memoria de la app. Streméalos, y prefiere subida directa a object storage con la app emitiendo credenciales.</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Ejemplo</span> Emite un <b>pre-signed S3 URL</b> para que el cliente suba directo a object storage; para descargas/transformaciones, <code>pipeline(readStream → transform → res)</code>; subida multipart para archivos muy grandes.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Advertencia</span> Almacenar un archivo completo en búfer explota memoria y bloquea el loop; sin backpressure se filtra memoria; tipo/tamaño no validados son un agujero de DoS + seguridad.</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Respuesta senior</span> Pre-signed URLs para descargar ancho de banda; stream con <code>pipeline</code> (backpressure automático + limpieza); valida tamaño + tipo con números mágicos con <code>ParseFilePipe</code>; procesa derivados (thumbnails, escaneo de virus) asíncronamente vía una cola.</div>" +
      "</div>",
  },
];
