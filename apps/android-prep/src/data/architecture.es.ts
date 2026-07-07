// Guía de diseño de sistemas Android en español. Los módulos tipados son la fuente de verdad — editar directamente.
export type ArchSection = { id: string; num: string; title: string; html: string };
export type DeepDive = { id: string; pill: string; title: string; html: string };

export const ARCH_INTRO = "Un recorrido senior de diseño de sistemas móviles mapeado sobre Android moderno — Compose, MVVM/MVI, Clean Architecture, y offline-first. Este es el material de 'cómo piensas sobre construir una app Android a escala'.";

export const ARCH_SECTIONS: ArchSection[] = [
  {
    "id": "arch-1",
    "num": "01",
    "title": "01 · El marco de diseño de sistemas móviles",
    "html": "<p>Usa una columna vertebral repetible para no congelarte: <b>Clarificar → Diseño de alto nivel → Inmersión profunda → Compensaciones → Resumen</b>.</p>\n      <ul>\n        <li><b>Clarifica</b> por unos minutos primero: requisitos funcionales, escala, expectativas offline, necesidades de tiempo real, SDK mínimo, y qué pantallas importan. Resiste diseñar hasta que hayas acotado.</li>\n        <li><b>DAL</b>: bosqueja las capas — UI (Compose + ViewModel), dominio (casos de uso), datos (repository + fuentes remotas/locales).</li>\n        <li><b>Inmersión profunda</b> en un componente que les importe (ej. el motor de sincronización o el feed).</li>\n        <li><b>Compensaciones</b>: díglasas en voz alta — cada elección tiene un costo.</li>\n        <li><b>Resume</b> y maneja seguimientos.</li>\n      </ul>\n      <div class=\"callout tip\"><span class=\"lbl\">Señal senior</span> Clarifica antes de diseñar, y narra la compensación en cada decisión. Los entrevistadores evalúan tu <i>proceso</i> más que las cajas-y-flechas finales.</div>"
  },
  {
    "id": "arch-2",
    "num": "02",
    "title": "02 · Arquitectura en capas y flujo de datos unidireccional",
    "html": "<p>Tres capas, dependencias apuntando hacia adentro:</p>\n      <ul>\n        <li><b>Capa de UI</b> — Composables renderizan un <code>UiState</code> inmutable; el ViewModel lo expone como <code>StateFlow</code> y recibe eventos como llamadas a funciones.</li>\n        <li><b>Capa de dominio</b> (opcional) — casos de uso puros de Kotlin conteniendo reglas de negocio, sin dependencias de Android, la capa más testeable.</li>\n        <li><b>Capa de datos</b> — repositorios poseen una fuente única de verdad y coordinan fuentes remotas (Retrofit) + locales (Room/DataStore), mapeando DTOs a modelos de dominio.</li>\n      </ul>\n      <p><b>Flujo de datos unidireccional</b>: el estado fluye hacia arriba desde la capa de datos como Flows; los eventos fluyen hacia abajo como llamadas. La UI es una función del estado, así que es predecible y testeable.</p>"
  },
  {
    "id": "arch-3",
    "num": "03",
    "title": "03 · La capa de red",
    "html": "<p>Un cliente robusto separa responsabilidades: <b>OkHttp</b> (motor, pool, caché, interceptores) debajo de <b>Retrofit</b> (API tipada) con <b>Moshi/kotlinx.serialization</b> para JSON.</p>\n      <ul>\n        <li><b>Interceptores</b>: a nivel de aplicación para headers de auth y logging; a nivel de red para control de caché. Un <code>Authenticator</code> maneja el refresh de token 401 en un solo lugar.</li>\n        <li><b>Modelado de resultados</b>: envuelve llamadas en un tipo <code>sealed</code> éxito/error; nunca dejes que <code>HttpException</code>/<code>IOException</code> crudo llegue a Compose.</li>\n        <li><b>Resiliencia</b>: timeouts razonables, retry con backoff solo en llamadas idempotentes, y cancelación vinculada al scope de coroutine del llamador.</li>\n      </ul>\n      <div class=\"map\"><span class=\"lbl\">Compensación</span> Una caché normalizada (por entidad) refleja una actualización en todas partes pero añade complejidad; una caché más simple por solicitud más Room como fuente de verdad generalmente es suficiente en móvil.</div>"
  },
  {
    "id": "arch-4",
    "num": "04",
    "title": "04 · Almacenamiento, caché e invalidación",
    "html": "<p>Elige almacenamiento por forma: <b>Room</b> para datos estructurados/relacionales y lecturas reactivas; <b>DataStore</b> para preferencias clave-valor/tipadas; <b>EncryptedSharedPreferences</b>/Keystore para secretos; archivos/<code>MediaStore</code> para blobs.</p>\n      <ul>\n        <li><b>Evicción de caché</b> (espacio libre): LRU o TTL. <b>Invalidación de caché</b> (corrección): basada en tiempo, basada en eventos (una mutación rompe una clave), o basada en versión.</li>\n        <li><b>Stale-while-revalidate</b>: muestra datos cacheados instantáneamente, refresca en segundo plano, reconcilia — la razón por la que las buenas apps se sienten rápidas.</li>\n        <li>Los DAOs de Room que retornan <code>Flow</code> hacen la caché reactiva: escribe una vez, cada observador se actualiza.</li>\n      </ul>"
  },
  {
    "id": "arch-5",
    "num": "05",
    "title": "05 · Offline-first y sincronización",
    "html": "<p><b>La base de datos local es la fuente de verdad</b>; la red solo la sincroniza. La UI siempre lee datos locales, así que funciona sin señal.</p>\n      <ul>\n        <li><b>Actualizaciones optimistas</b>: aplica el cambio localmente y renderiza inmediatamente; mantén el valor anterior para revertir en fallo.</li>\n        <li><b>Cola de sincronización</b>: encola mutaciones offline y reexecútalas (vía WorkManager) cuando la conectividad regrese, con keys de idempotencia.</li>\n        <li><b>Resolución de conflictos</b>: elige por tipo de datos — última escritura gana, servidor gana, o una fusión. Nombra la política explícitamente.</li>\n      </ul>\n      <div class=\"map\"><span class=\"lbl\">Compensación</span> La UX optimista se siente instantánea pero necesita rollback y manejo de conflictos; para dinero/inventario puedes preferir confirmación pésimista. Di cuál y por qué.</div>"
  },
  {
    "id": "arch-6",
    "num": "06",
    "title": "06 · Tiempo real — WebSocket, SSE, polling y push",
    "html": "<p>Iguala el transporte a la necesidad y la batería:</p>\n      <ul>\n        <li><b>WebSocket</b> para bidireccional, baja latencia (chat, presencia). Gestiona reconexión/backoff y ciclo de vida.</li>\n        <li><b>SSE / long-poll</b> para streams unidireccionales servidor→cliente (feeds, marcadores en vivo).</li>\n        <li><b>Polling</b> para actualizaciones simples y de baja frecuencia sin infraestructura de socket.</li>\n        <li><b>FCM push</b> cuando la app está en segundo plano o muerta — la única forma confiable de despertarla.</li>\n      </ul>\n      <div class=\"map\"><span class=\"lbl\">Compensación</span> Mantener un socket abierto para actualizaciones ocasionales agota la batería (energía de cola de radio). No mantengas una conexión viva cuando push periódico o polling harían el trabajo.</div>"
  },
  {
    "id": "arch-7",
    "num": "07",
    "title": "07 · Paginación a escala (Paging 3)",
    "html": "<p>Para listas grandes, pagina lazy. <b>Paging 3</b> proporciona un <code>PagingSource</code> (o <code>RemoteMediator</code> para red+DB), expone <code>Flow&lt;PagingData&gt;</code>, y maneja estados de carga y reintentos.</p>\n      <ul>\n        <li>La paginación por <b>cursor/keyset</b> es el valor por defecto correcto para feeds — estable bajo inserciones, a diferencia de offset/limit.</li>\n        <li><code>RemoteMediator</code> implementa paginación offline-first: pagina desde Room, obtén + persiste la siguiente página desde la red.</li>\n        <li>Recolecta con <code>collectAsLazyPagingItems()</code> en Compose y renderiza placeholders + spinners de carga al final.</li>\n      </ul>"
  },
  {
    "id": "arch-8",
    "num": "08",
    "title": "08 · Esenciales de rendimiento y seguridad",
    "html": "<p>Incorpora ambos desde el inicio:</p>\n      <ul>\n        <li><b>Rendimiento</b>: disciplina del hilo principal, estabilidad de Compose, Baseline Profiles, y puertas de Macrobenchmark en CI. Mide arranque en frío y jank en builds de producción.</li>\n        <li><b>Seguridad</b>: Keystore para llaves, EncryptedSharedPreferences para secretos, Network Security Config + pinning en tránsito, Play Integrity para certificación, R8 para ofuscación.</li>\n        <li><b>Observabilidad</b>: reporte de crashes (tasa de crash-free como métrica principal), seguimiento de ANR, y control de salud de release en lanzamientos escalonados.</li>\n      </ul>\n      <div class=\"callout tip\"><span class=\"lbl\">Señal senior</span> Trata un deploy como &quot;terminado&quot; solo cuando la tasa de crash-free se mantiene a lo largo del lanzamiento — el monitoreo es parte de distribuir.</div>"
  }
];

export const DEEPDIVES_INTRO = "El playbook senior en una forma de concepto → ejemplo → problema → solución, para que cada idea se quede como una decisión de ingeniería real en lugar de una definición.";

export const DEEP_DIVES: DeepDive[] = [
  {
    "id": "dd-1",
    "pill": "Estado",
    "title": "Recolección de Flow segura del ciclo de vida",
    "html": "<p><b>Concepto:</b> recolectar un Flow mantiene el upstream funcionando mientras el collector esté activo.</p>\n      <p><b>Problema:</b> recolectar en <code>onCreate</code> con un <code>lifecycleScope.launch</code> simple sigue recolectando en segundo plano — trabajo desperdiciado y actualizaciones de UI obsoletas.</p>\n      <p><b>Solución:</b> vincula la recolección al ciclo de vida.</p>\n      <div class=\"code\">// Compose\nval ui by viewModel.uiState.collectAsStateWithLifecycle()\n\n// Views\nlifecycleScope.launch {\n  repeatOnLifecycle(Lifecycle.State.STARTED) {\n    viewModel.uiState.collect { render(it) }\n  }\n}</div>\n      <p>La recolección ahora se detiene debajo de STARTED y se reinicia al regresar — sin churn en segundo plano.</p>"
  },
  {
    "id": "dd-2",
    "pill": "Estado",
    "title": "Cacheo de StateFlow con stateIn(WhileSubscribed)",
    "html": "<p><b>Concepto:</b> un Flow frío se reinicia por collector; quieres un stream de estado compartido y cacheado.</p>\n      <p><b>Problema:</b> en rotación el suscriptor cae brevemente, y un share naive desmonta y re-obtiene.</p>\n      <p><b>Solución:</b> comparte con un stop-timeout para que un cambio de configuración no reinicie el upstream.</p>\n      <div class=\"code\">val uiState: StateFlow&lt;UiState&gt; =\n  repository.observeItems()\n    .map { UiState(items = it) }\n    .stateIn(\n      scope = viewModelScope,\n      started = SharingStarted.WhileSubscribed(5_000),\n      initialValue = UiState(loading = true),\n    )</div>\n      <p>La ventana de 5s conserva el valor cacheado a través de rotación mientras aún detiene el trabajo cuando la pantalla realmente se fue.</p>"
  },
  {
    "id": "dd-3",
    "pill": "Flow",
    "title": "Búsqueda con flatMapLatest + debounce",
    "html": "<p><b>Concepto:</b> una caja de búsqueda debería cancelar la consulta anterior cuando el usuario sigue escribiendo.</p>\n      <p><b>Problema:</b> disparar una solicitud por tecla desperdicia la red y puede renderizar resultados obsoletos fuera de orden.</p>\n      <p><b>Solución:</b> debuncia la consulta y cambia al más reciente con <code>flatMapLatest</code>.</p>\n      <div class=\"code\">val results = queryFlow\n  .debounce(300)\n  .distinctUntilChanged()\n  .flatMapLatest { q -&gt;\n    if (q.isBlank()) flowOf(emptyList())\n    else repository.search(q) // se cancela cuando q cambia\n  }\n  .flowOn(Dispatchers.Default)</div>\n      <p><code>flatMapLatest</code> cancela el flow interno en vuelo en el momento en que llega una nueva consulta — sin carrera, sin lista obsoleta.</p>"
  },
  {
    "id": "dd-4",
    "pill": "Compose",
    "title": "Arreglando sobre-recomposición con estabilidad",
    "html": "<p><b>Concepto:</b> Compose omite un composable solo cuando sus parámetros son estables e inmutables.</p>\n      <p><b>Problema:</b> un elemento de lista toma <code>items: List&lt;Item&gt;</code>; <code>List</code> se trata como inestable, así que cada elemento se recomposición en cualquier cambio.</p>\n      <p><b>Solución:</b> usa una colección inmutable (o anota el modelo) para que Compose pueda omitir.</p>\n      <div class=\"code\">// build.gradle: implementation(\"org.jetbrains.kotlinx:kotlinx-collections-immutable:...\")\n\n@Immutable\ndata class Item(val id: String, val title: String)\n\n@Composable\nfun Feed(items: ImmutableList&lt;Item&gt;) {\n  LazyColumn {\n    items(items, key = { it.id }) { ItemRow(it) }\n  }\n}</div>\n      <p>Verifica con contadores de recomposición del Layout Inspector o el reporte de métricas del compilador de Compose.</p>"
  },
  {
    "id": "dd-5",
    "pill": "Concurrencia",
    "title": "Seguridad del principal con withContext",
    "html": "<p><b>Concepto:</b> una función <code>suspend</code> debe ser segura para llamar desde el hilo principal.</p>\n      <p><b>Problema:</b> hacer I/O bloqueante (disco, parseo JSON) en <code>Dispatchers.Main</code> pierde frames o dispara un ANR.</p>\n      <p><b>Solución:</b> cambia dispatchers <i>dentro</i> de la función, y inyecta el dispatcher para testeabilidad.</p>\n      <div class=\"code\">class Repo(private val io: CoroutineDispatcher = Dispatchers.IO) {\n  suspend fun load(id: String): Model = withContext(io) {\n    val dto = api.fetch(id)   // seguro para bloqueo en IO\n    dto.toModel()\n  }\n}\n// test: Repo(StandardTestDispatcher())</div>\n      <p>Los llamadores permanecen en Main; la función posee sus hilos. Inyectar <code>io</code> permite que los tests lo controlen.</p>"
  },
  {
    "id": "dd-6",
    "pill": "Jetpack",
    "title": "Trabajo garantizado en segundo plano con WorkManager",
    "html": "<p><b>Concepto:</b> algo de trabajo debe completarse incluso a través de muerte del proceso y reinicio.</p>\n      <p><b>Problema:</b> una coroutine en <code>viewModelScope</code> muere con la pantalla; un Service crudo es pesado y frágil para una sincronización diferida.</p>\n      <p><b>Solución:</b> encadena un <code>CoroutineWorker</code> con restricciones.</p>\n      <div class=\"code\">class SyncWorker(c: Context, p: WorkerParameters) : CoroutineWorker(c, p) {\n  override suspend fun doWork(): Result =\n    try { repo.sync(); Result.success() }\n    catch (e: IOException) { Result.retry() }\n}\n\nval req = OneTimeWorkRequestBuilder&lt;SyncWorker&gt;()\n  .setConstraints(Constraints(requiredNetworkType = NetworkType.CONNECTED))\n  .build()\nWorkManager.getInstance(ctx)\n  .enqueueUniqueWork(&quot;sync&quot;, ExistingWorkPolicy.KEEP, req)</div>"
  },
  {
    "id": "dd-7",
    "pill": "DI",
    "title": "Scopes de Hilt y @Binds vs @Provides",
    "html": "<p><b>Concepto:</b> Hilt genera un grafo de dependencias vinculado a ciclos de vida de Android.</p>\n      <p><b>Problema:</b> necesitas un binding interfaz→impl y un objeto de terceros que no posees, con los tiempos de vida correctos.</p>\n      <p><b>Solución:</b> <code>@Binds</code> para interfaces, <code>@Provides</code> para tipos poseídos por otros, con scope correcto.</p>\n      <div class=\"code\">@Module @InstallIn(SingletonComponent::class)\nabstract class DataModule {\n  @Binds @Singleton\n  abstract fun bindRepo(impl: RepoImpl): Repo\n\n  companion object {\n    @Provides @Singleton\n    fun retrofit(): Retrofit = Retrofit.Builder()\n      .baseUrl(BASE).addConverterFactory(/* ... */).build()\n  }\n}\n\n@HiltViewModel\nclass FeedViewModel @Inject constructor(private val repo: Repo) : ViewModel()</div>\n      <p>Un binding faltante es un <b>error de compilación</b>, no un crash en tiempo de ejecución — una ventaja real que debes nombrar.</p>"
  },
  {
    "id": "dd-8",
    "pill": "Datos",
    "title": "Room como la fuente única de verdad",
    "html": "<p><b>Concepto:</b> la UI observa la base de datos; la red solo la actualiza.</p>\n      <p><b>Problema:</b> obtener directo a la UI da spinners en todas partes y copias divergentes de los datos.</p>\n      <p><b>Solución:</b> lee desde un DAO <code>Flow</code>; el refresh escribe de vuelta a Room, que re-emite.</p>\n      <div class=\"code\">@Dao interface ItemDao {\n  @Query(&quot;SELECT * FROM items ORDER BY updatedAt DESC&quot;)\n  fun observeAll(): Flow&lt;List&lt;ItemEntity&gt;&gt;\n  @Upsert suspend fun upsertAll(items: List&lt;ItemEntity&gt;)\n}\n\nfun observeItems(): Flow&lt;List&lt;Item&gt;&gt; = dao.observeAll().map { it.toDomain() }\nsuspend fun refresh() { dao.upsertAll(api.fetch().toEntities()) }</div>\n      <p>La pantalla renderiza instantáneamente desde caché y se actualiza en el momento en que <code>refresh()</code> escribe — stale-while-revalidate, incorporado.</p>"
  },
  {
    "id": "dd-9",
    "pill": "Seguridad",
    "title": "Certificate pinning (y su riesgo de rotación)",
    "html": "<p><b>Concepto:</b> el pinning confía solo en el certificado/clave pública de tu servidor, bloqueando man-in-the-middle vía un CA fraudulento.</p>\n      <p><b>Problema:</b> si haces pin de un solo certificado y lo rotas, cada cliente antiguo se rompe.</p>\n      <p><b>Solución:</b> haz pin con OkHttp, incluye un pin de respaldo, y distribuye pins antes de la rotación.</p>\n      <div class=\"code\">val pinner = CertificatePinner.Builder()\n  .add(&quot;api.example.com&quot;, &quot;sha256/AAAA…&quot;) // actual\n  .add(&quot;api.example.com&quot;, &quot;sha256/BBBB…&quot;) // respaldo / siguiente\n  .build()\nval client = OkHttpClient.Builder().certificatePinner(pinner).build()</div>\n      <p>Prefer hacer pin del SPKI (clave pública) sobre el certificado hoja, y siempre mantén un pin de respaldo para sobrevivir la rotación.</p>"
  },
  {
    "id": "dd-10",
    "pill": "Rendimiento",
    "title": "Baseline Profiles para arranque en frío",
    "html": "<p><b>Concepto:</b> un Baseline Profile lista código caliente para que ART lo compile AOT al momento de instalación en lugar de interpretar en la primera ejecución.</p>\n      <p><b>Problema:</b> el primer lanzamiento y el primer scroll son lentos porque ese código se compila JIT en frío.</p>\n      <p><b>Solución:</b> genera un perfil con un recorrido de Macrobenchmark y distribúyelo.</p>\n      <div class=\"code\">@Test fun generate() = baselineRule.collect(\n  packageName = &quot;com.example.app&quot;,\n) {\n  startActivityAndWait()\n  // haz scroll del feed para que se capture la ruta caliente\n  device.findObject(By.res(&quot;feed&quot;)).fling(Direction.DOWN)\n}</div>\n      <p>Mide el antes/después con un Macrobenchmark separado y mantenlo en CI para que la victoria no pueda tener regresión.</p>"
  }
];
