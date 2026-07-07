import type { Level } from "@/lib/levels";

export type PromptKind = "coding" | "design";

export type Prompt = {
  id: string;
  kind: PromptKind;
  title: string;
  level: Level;
  tags: string[];
  /** La pregunta / escenario (HTML rico). */
  promptHtml: string;
  /** Secciones reveladas progresivamente (ej. Enfoque -> Solución). */
  reveal: { label: string; html: string }[];
};

// Prompts de práctica de codificación + diseño de sistema para Android.
export const PROMPTS: Prompt[] = [
  {
    "id": "code-1",
    "kind": "coding",
    "title": "Debounce de un Flow (entrada de búsqueda)",
    "level": "mid",
    "tags": ["flow", "coroutines", "operators"],
    "promptHtml": "<p>Dado un <code>Flow&lt;String&gt;</code> de texto de caja de búsqueda, produce un stream que solo emite después de que el usuario pausa la escritura por 300ms y omite consultas consecutivas duplicadas. Luego explica por qué <code>flatMapLatest</code> es la forma correcta de ejecutar la búsqueda real.</p>",
    "reveal": [
      {
        "label": "Enfoque",
        "html": "<ul><li><code>debounce(300)</code> espera un período de silencio antes de emitir el último valor.</li><li><code>distinctUntilChanged()</code> descarta consultas repetidas (ej. toggles de espacio en blanco al final).</li><li><code>flatMapLatest</code> cancela la búsqueda en vuelo cuando llega una nueva consulta, así que los resultados obsoletos nunca se renderizan.</li></ul>"
      },
      {
        "label": "Solución",
        "html": "<div class=\"code\">val results: Flow&lt;List&lt;Item&gt;&gt; = queryFlow\n  .debounce(300)\n  .distinctUntilChanged()\n  .flatMapLatest { q -&gt;\n    if (q.isBlank()) flowOf(emptyList())\n    else repository.search(q)   // se cancela si q cambia de nuevo\n  }\n  .flowOn(Dispatchers.Default)</div><p>Cada nueva tecla reinicia la ventana de debounce; <code>flatMapLatest</code> garantiza que solo sobrevivan los resultados de la consulta más reciente. <code>flowOn</code> mantiene el upstream fuera del hilo principal.</p>"
      }
    ]
  },
  {
    "id": "code-2",
    "kind": "coding",
    "title": "Retry de coroutine con backoff exponencial",
    "level": "senior",
    "tags": ["coroutines", "resilience"],
    "promptHtml": "<p>Escribe un <code>suspend fun &lt;T&gt; retry(times, initialDelay, maxDelay, factor, block)</code> genérico que reintente un <code>block</code> suspend en fallo con backoff exponencial, se rinda después de <code>times</code> intentos, y nunca trague cancelación.</p>",
    "reveal": [
      {
        "label": "Enfoque",
        "html": "<ul><li>Bucle de <code>times - 1</code> intentos, retornando en éxito.</li><li>En fallo, <code>delay</code> y luego crece el delay por <code>factor</code>, limitado a <code>maxDelay</code>.</li><li>Permite que <code>CancellationException</code> se propague (no lo atrapes).</li><li>El último intento va fuera del catch para que la última excepción salga.</li></ul>"
      },
      {
        "label": "Solución",
        "html": "<div class=\"code\">suspend fun &lt;T&gt; retry(\n  times: Int = 3,\n  initialDelay: Long = 200,\n  maxDelay: Long = 5_000,\n  factor: Double = 2.0,\n  block: suspend () -&gt; T,\n): T {\n  var delayMs = initialDelay\n  repeat(times - 1) {\n    try {\n      return block()\n    } catch (e: CancellationException) {\n      throw e\n    } catch (e: Exception) {\n      delay(delayMs)\n      delayMs = (delayMs * factor).toLong().coerceAtMost(maxDelay)\n    }\n  }\n  return block() // último intento; lanza si falla\n}</div><p>Solo reintenta operaciones idempotentes. Porque <code>delay</code> es cancelable y relanzamos la cancelación, el bucle de retry respeta la concurrencia estructurada.</p>"
      }
    ]
  },
  {
    "id": "code-3",
    "kind": "coding",
    "title": "LRU cache thread-safe en Kotlin",
    "level": "senior",
    "tags": ["kotlin", "data-structures", "concurrency"],
    "promptHtml": "<p>Implementa un LRU cache de capacidad fija con get/put O(1). Hazlo seguro para acceso concurrente de coroutines. ¿Qué evita, y cómo mantienes O(1)?</p>",
    "reveal": [
      {
        "label": "Enfoque",
        "html": "<ul><li>Un <code>LinkedHashMap</code> con <code>accessOrder = true</code> da ordenamiento LRU y ops O(1); sobreescribe <code>removeEldestEntry</code> para limitar tamaño.</li><li>Guarda mutaciones con un <code>Mutex</code> (suspending) en lugar de locks bloqueantes dentro de coroutines.</li><li>La eliminación quita la entrada menos recientemente accedida cuando se excede la capacidad.</li></ul>"
      },
      {
        "label": "Solución",
        "html": "<div class=\"code\">class LruCache&lt;K, V&gt;(private val capacity: Int) {\n  private val mutex = Mutex()\n  private val map = object : LinkedHashMap&lt;K, V&gt;(\n    capacity, 0.75f, /* accessOrder = */ true,\n  ) {\n    override fun removeEldestEntry(e: Map.Entry&lt;K, V&gt;) = size &gt; capacity\n  }\n\n  suspend fun get(key: K): V? = mutex.withLock { map[key] }\n  suspend fun put(key: K, value: V) = mutex.withLock { map[key] = value }\n}</div><p>El <code>LinkedHashMap</code> ordenado por acceso mueve las entradas tocadas a la cola; <code>removeEldestEntry</code> elimina la cabeza cuando está lleno. El <code>Mutex</code> serializa el acceso sin bloquear un hilo del dispatcher.</p>"
      }
    ]
  },
  {
    "id": "code-4",
    "kind": "coding",
    "title": "Reducer MVI con un Intent sealed",
    "level": "senior",
    "tags": ["mvi", "state", "kotlin"],
    "promptHtml": "<p>Modela una pantalla de contador con MVI: un <code>UiState</code> inmutable, un <code>Intent</code> <code>sealed</code>, y un <code>reduce(state, intent): state</code> puro. Muestra por qué la pureza e inmutabilidad ayudan al testing.</p>",
    "reveal": [
      {
        "label": "Enfoque",
        "html": "<ul><li>Un único <code>data class</code> inmutable para estado, actualizado con <code>copy()</code>.</li><li>Una <code>sealed interface</code> para intents para que <code>when</code> sea exhaustivo.</li><li><code>reduce</code> es una función pura — mismas entradas, mismo resultado, trivialmente testeable.</li></ul>"
      },
      {
        "label": "Solución",
        "html": "<div class=\"code\">data class UiState(val count: Int = 0, val loading: Boolean = false)\n\nsealed interface Intent {\n  data object Increment : Intent\n  data object Decrement : Intent\n  data class Set(val value: Int) : Intent\n}\n\nfun reduce(state: UiState, intent: Intent): UiState = when (intent) {\n  Intent.Increment -&gt; state.copy(count = state.count + 1)\n  Intent.Decrement -&gt; state.copy(count = state.count - 1)\n  is Intent.Set    -&gt; state.copy(count = intent.value)\n}</div><p>El ViewModel simplemente pliega intents en estado (<code>state = reduce(state, intent)</code>) y emite vía <code>StateFlow</code>. Añadir un nuevo intent es un error de compilación hasta que lo manejes.</p>"
      }
    ]
  },
  {
    "id": "code-5",
    "kind": "coding",
    "title": "ViewModel con StateFlow que sobrevive muerte del proceso",
    "level": "mid",
    "tags": ["viewmodel", "savedstatehandle", "state"],
    "promptHtml": "<p>Escribe un ViewModel que exponga un contador como <code>StateFlow&lt;Int&gt;</code> que sobreviva tanto rotación como muerte del proceso, con increment/decrement. ¿Qué APIs garantizan cada uno?</p>",
    "reveal": [
      {
        "label": "Enfoque",
        "html": "<ul><li>El ViewModel sobrevive rotación por sí solo.</li><li>Para muerte del proceso, respalda el valor con <code>SavedStateHandle.getStateFlow</code>.</li><li>Muta a través del handle para que el nuevo valor se persista.</li></ul>"
      },
      {
        "label": "Solución",
        "html": "<div class=\"code\">@HiltViewModel\nclass CounterViewModel @Inject constructor(\n  private val state: SavedStateHandle,\n) : ViewModel() {\n  val count: StateFlow&lt;Int&gt; = state.getStateFlow(&quot;count&quot;, 0)\n\n  fun increment() { state[&quot;count&quot;] = count.value + 1 }\n  fun decrement() { state[&quot;count&quot;] = count.value - 1 }\n}</div><p><code>getStateFlow</code> lee/escribe el bundle de estado guardado, así que el contador se restaura después de que el OS mate el proceso — y la rotación está cubierta porque el ViewModel se retiene.</p>"
      }
    ]
  },
  {
    "id": "code-6",
    "kind": "coding",
    "title": "Repository offline-first (Room + red)",
    "level": "senior",
    "tags": ["architecture", "room", "flow"],
    "promptHtml": "<p>Implementa un repository donde la UI observa Room (fuente de verdad) y un <code>refresh()</code> lo actualiza desde la red. ¿Por qué esto da stale-while-revalidate gratis?</p>",
    "reveal": [
      {
        "label": "Enfoque",
        "html": "<ul><li>Expón <code>observeX(): Flow</code> respaldado por un Flow DAO — emite instantáneamente desde caché y re-emite al cambiar.</li><li><code>refresh()</code> obtiene y escribe directo a Room; el Flow observado se actualiza automáticamente.</li><li>Mapea entidades a modelos de dominio para que DTOs/entidades no se filtren a la UI.</li></ul>"
      },
      {
        "label": "Solución",
        "html": "<div class=\"code\">class ItemRepository @Inject constructor(\n  private val dao: ItemDao,\n  private val api: ItemApi,\n  private val io: CoroutineDispatcher,\n) {\n  fun observeItems(): Flow&lt;List&lt;Item&gt;&gt; =\n    dao.observeAll().map { rows -&gt; rows.map { it.toDomain() } }\n\n  suspend fun refresh() = withContext(io) {\n    val fresh = api.getItems()                 // red\n    dao.upsertAll(fresh.map { it.toEntity() }) // escritura directa\n  }\n}</div><p>La pantalla renderiza datos cacheados instantáneamente y se actualiza en el momento en que <code>refresh()</code> escribe nuevas filas — la base de datos, no la llamada de red, impulsa la UI.</p>"
      }
    ]
  },
  {
    "id": "code-7",
    "kind": "coding",
    "title": "Parsing seguro de JSON con kotlinx.serialization",
    "level": "mid",
    "tags": ["kotlin", "serialization", "error-handling"],
    "promptHtml": "<p>Parsea una respuesta de API en un modelo tipado con <code>kotlinx.serialization</code>, tolerando campos desconocidos/extras, y retorna un <code>Result</code> en lugar de lanzar a la UI. ¿Por qué validar en el límite?</p>",
    "reveal": [
      {
        "label": "Enfoque",
        "html": "<ul><li>Anota el modelo <code>@Serializable</code>; configura <code>Json { ignoreUnknownKeys = true }</code> para que un nuevo campo del servidor no te crashee.</li><li>Envuelve el decoding en try/catch y retorna <code>Result</code>; nunca dejes que un payload malformado lance a Compose.</li><li>Parsea en el límite de red para que el resto de la app confíe en sus tipos.</li></ul>"
      },
      {
        "label": "Solución",
        "html": "<div class=\"code\">@Serializable data class UserDto(val id: String, val name: String)\n\nval json = Json { ignoreUnknownKeys = true; coerceInputValues = true }\n\nfun parseUser(body: String): Result&lt;UserDto&gt; = runCatching {\n  json.decodeFromString&lt;UserDto&gt;(body)\n}</div><p>Los tipos son solo en tiempo de compilación — un payload malo aún crashea en tiempo de ejecución a menos que lo valides. Parsear en un <code>Result</code> en el borde contiene el fallo y mantiene la UI total.</p>"
      }
    ]
  },
  {
    "id": "code-8",
    "kind": "coding",
    "title": "Modifier Compose personalizado: offset de lectura diferida",
    "level": "senior",
    "tags": ["compose", "performance", "modifier"],
    "promptHtml": "<p>Animas la posición horizontal de un elemento desde un estado que cambia rápido. Muestra la versión que se recomposición cada frame y la que no, y explica por qué.</p>",
    "reveal": [
      {
        "label": "Enfoque",
        "html": "<ul><li>Leer el estado en la fase de composición (pasar un valor a <code>offset(x.dp)</code>) recomposa en cada cambio.</li><li>Leerlo dentro del lambda <code>offset { }</code> difiere la lectura a la fase de <b>layout</b> — sin recomposición, solo re-layout.</li></ul>"
      },
      {
        "label": "Solución",
        "html": "<div class=\"code\">// Se recomposa cada frame (lectura de estado en composición):\nBox(Modifier.offset(x = scrollX.value.dp))\n\n// Omite recomposición (lectura de estado diferida a layout):\nBox(Modifier.offset { IntOffset(scrollX.value, 0) })</div><p>La sobrecarga de lambda se invoca en la fase de layout, así que cambiar <code>scrollX</code> solo re-ubica y redibuja — la función composable nunca se re-ejecuta. Este es el truco central para scroll/animación fluida en Compose.</p>"
      }
    ]
  },
  {
    "id": "design-1",
    "kind": "design",
    "title": "Diseña una funcionalidad de chat en tiempo real",
    "level": "senior",
    "tags": ["architecture", "real-time", "offline-first"],
    "promptHtml": "<p>Diseña chat 1:1: entrega en tiempo real, historial de mensajes, envío offline, y acuses de lectura. Cubre transporte, capa de datos, ordenamiento, y compensaciones.</p>",
    "reveal": [
      {
        "label": "Clarificar y transporte",
        "html": "<ul><li>Clarificar: escala, grupo vs 1:1, media, acuses de entrega/lectura, retención.</li><li><b>WebSocket</b> para mensajes bidireccionales en vivo + presencia; <b>FCM</b> push para despertar una app en segundo plano/muerta y desencadenar una sincronización.</li><li>Gestiona el ciclo de vida del socket con la pantalla/app; reconecta con backoff.</li></ul>"
      },
      {
        "label": "Datos y ordenamiento",
        "html": "<ul><li><b>Room es la fuente de verdad</b>; la UI observa un Flow de mensajes, así que el historial carga instantáneamente y offline.</li><li>Los mensajes salientes se escriben localmente como 'enviando' (optimistas), se encolan, y se reconcilian en ack — los fallos reintentan vía WorkManager.</li><li>Ordenar por timestamp/secuencia del servidor; usa IDs temporales del cliente reconciliados con IDs del servidor para evitar duplicados.</li></ul>"
      },
      {
        "label": "Compensaciones",
        "html": "<ul><li>Mantener un socket abierto agota la batería — ciérralo en segundo plano y confía en push, aceptando latencia ligeramente mayor para entrega reanudada.</li><li>Los acuses de lectura añaden ruido; agrúpalos.</li><li>Paginar historial con paginación por cursor; carga lazy de media.</li></ul>"
      }
    ]
  },
  {
    "id": "design-2",
    "kind": "design",
    "title": "Diseña subida de imágenes confiable con una cola offline",
    "level": "senior",
    "tags": ["workmanager", "offline", "resilience"],
    "promptHtml": "<p>Los usuarios seleccionan fotos que deben subirse de forma confiable incluso si la app se mata o está offline. Diseña la cola, reintentos, progreso, y restricciones.</p>",
    "reveal": [
      {
        "label": "Enfoque",
        "html": "<ul><li>Persiste cada subida como una fila (URI, estado) para que sobreviva muerte del proceso — Room como la cola.</li><li>Encadena un <b>WorkManager</b> (comprimir → subir) con restricciones (red conectada, posiblemente sin límite) y trabajo único por imagen.</li><li>Usa un <b>CoroutineWorker</b>: <code>Result.retry()</code> con backoff exponencial para fallos transitorios, <code>failure()</code> para permanentes.</li><li>Reporta progreso con <code>setProgress</code>; ejecuta como expedited/foreground para subidas iniciadas por el usuario.</li></ul>"
      },
      {
        "label": "Compensaciones",
        "html": "<ul><li>El timing de WorkManager es aproximado (Doze) — bien para subidas, no para necesidades instantáneas.</li><li>Idempotencia: envía un ID de subida generado por el cliente para que los reintentos no dupliquen en el servidor.</li><li>Limpia copias locales después del éxito; limita reintentos y muestra un estado 'falló, toca para reintentar'.</li></ul>"
      }
    ]
  },
  {
    "id": "design-3",
    "kind": "design",
    "title": "Diseña un sistema de feature flags / experimentos",
    "level": "architect",
    "tags": ["architecture", "experimentation", "release"],
    "promptHtml": "<p>Diseña feature flags de lado cliente y experimentos A/B: cómo se obtienen, cachean, evalúan, y mantienen consistentes — además de kill switches y analíticas. ¿Compensaciones?</p>",
    "reveal": [
      {
        "label": "Enfoque",
        "html": "<ul><li>Obtén flags al inicio desde un servicio de configuración remota; <b>cachéalos</b> (DataStore) para que la app funcione offline con los últimos valores conocidos + valores por defecto razonables.</li><li>Asigna una variante determinísticamente (hash de userId + experimento) para que un usuario permanezca en un grupo; expón un <code>FlagProvider</code> tipado detrás de una interfaz para testeabilidad.</li><li>Dispara un evento de analítica de 'exposición' cuando se muestra realmente una variante; lee métricas de guardia.</li><li>Cada flag es un <b>kill switch</b> — deshabilita una feature riesgosa del lado del servidor sin un release.</li></ul>"
      },
      {
        "label": "Compensaciones",
        "html": "<ul><li>Evalúa flags consistentemente dentro de una sesión (snapshot al lanzamiento) para que la UI no cambie durante el uso.</li><li>Los valores por defecto deben ser seguros — si la configuración falla, la app aún funciona.</li><li>Higiene de flags: limpia flags obsoletos o se convierten en deuda técnica permanente.</li><li>Nativo no tiene código OTA, así que los flags son cómo cambias el comportamiento entre releases.</li></ul>"
      }
    ]
  },
  {
    "id": "design-4",
    "kind": "design",
    "title": "Diseña analíticas / seguimiento de eventos en el cliente",
    "level": "senior",
    "tags": ["architecture", "analytics", "batching"],
    "promptHtml": "<p>Diseña un pipeline de analíticas del cliente: capturar eventos, agruparlos, sobrevivir offline y muerte del proceso, y evitar bloquear la UI o agotar la batería. ¿Compensaciones?</p>",
    "reveal": [
      {
        "label": "Enfoque",
        "html": "<ul><li>Una interfaz <code>Analytics</code> delgada; eventos escritos a una tabla buffer de <b>Room</b> (durable, sobrevive kill) fuera del hilo principal.</li><li>Un trabajo periódico/desencadenado de <b>WorkManager</b> sube lotes en una buena red y elimina filas enviadas; reintenta con backoff.</li><li>Añade sesión/contexto (versión de app, locale) centralmente; respeta consentimiento/opt-out.</li></ul>"
      },
      {
        "label": "Compensaciones",
        "html": "<ul><li><b>Agrupa</b> en lugar de POSTs por evento — la energía de cola de radio de muchas llamadas pequeñas es un asesino de batería.</li><li>Limita el tamaño del buffer y descarta el más antiguo si es ilimitado; asegura entrega de al-menos-una-vez con IDs de deduplicación si la exactitud importa.</li><li>Nunca bloquees la UI — encola y retorna inmediatamente; muestrea eventos de alto volumen.</li></ul>"
      }
    ]
  },
  {
    "id": "design-5",
    "kind": "design",
    "title": "Diseña un limitador de tasa de token-bucket para llamadas API",
    "level": "mid",
    "tags": ["concurrency", "resilience", "kotlin"],
    "promptHtml": "<p>Debes limitar las solicitudes salientes a N por segundo en toda la app, seguro para coroutines. Diseña un token-bucket y cómo se integra con OkHttp/coroutines. ¿Compensaciones vs limitación del lado del servidor?</p>",
    "reveal": [
      {
        "label": "Enfoque",
        "html": "<ul><li>Un token bucket se rellena a una tasa fija; una solicitud debe <code>acquire()</code> un token (suspendiendo hasta que uno esté disponible) antes de proceder.</li><li>Guarda el bucket con un <code>Mutex</code>; calcula tokens disponibles a partir del tiempo transcurrido en cada acquire.</li><li>Integra como un interceptor de OkHttp o un wrapper alrededor de la llamada API que espera un token.</li></ul>"
      },
      {
        "label": "Compensaciones",
        "html": "<ul><li>La limitación del cliente suaviza ráfagas y protege el backend, pero no puede imponer un límite global entre dispositivos — el servidor aún debe limitar autoritativamente (429 + Retry-After).</li><li>El acquire suspendiendo es mejor que el bloqueante; limita la espera o falla rápido para llamadas sensibles al tiempo.</li><li>Combina con backoff en 429s para que cliente y servidor cooperen.</li></ul>"
      }
    ]
  }
];
