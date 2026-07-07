import type { Level } from "@/lib/levels";

export type PromptKind = "coding" | "design";

export type Prompt = {
  id: string;
  kind: PromptKind;
  title: string;
  level: Level;
  tags: string[];
  /** The question / scenario (rich HTML). */
  promptHtml: string;
  /** Progressively revealed sections (e.g. Approach -> Solution). */
  reveal: { label: string; html: string }[];
};

// Coding + system-design prompts for iOS. Try before you reveal.
export const PROMPTS: Prompt[] = [
  {
    id: "code-1",
    kind: "coding",
    title: "Debounce de un campo de búsqueda en SwiftUI",
    level: "mid",
    tags: ["swiftui", "concurrencia", "búsqueda"],
    promptHtml: `<p>Un campo de búsqueda ejecuta una consulta en cada pulsación de tecla. Haga que solo consulte después
      de que el usuario pause la escritura durante 300ms, y cancele la consulta en curso cuando llegue una nueva
      pulsación — usando concurrencia de Swift, sin Combine.</p>`,
    reveal: [
      {
        label: "Enfoque",
        html: `<ul>
          <li>Dirija un modificador <code>.task(id: query)</code> para que una nueva tarea inicie cuando cambie la
            consulta — y SwiftUI cancele la tarea anterior automáticamente.</li>
          <li>Dentro, <code>try await Task.sleep(for: .milliseconds(300))</code>. Si se cancela durante la
            espera lanza una excepción, por lo que una nueva pulsación aborta la consulta pendiente.</li>
          <li>Después de la espera, ejecute la búsqueda. La cancelación genera el debounce automáticamente.</li>
        </ul>`,
      },
      {
        label: "Solución",
        html: `<div class="code">struct SearchView: View {
  @State private var query = ""
  @State private var results: [Item] = []

  var body: some View {
    List(results) { Text($0.name) }
      .searchable(text: $query)
      .task(id: query) {
        guard !query.isEmpty else { results = []; return }
        do {
          try await Task.sleep(for: .milliseconds(300))
          results = try await api.search(query)
        } catch {
          // cancelled (new keystroke) or failed — ignore
        }
      }
  }
}</div>
        <p>La clave: <code>.task(id:)</code> vincula la vida útil de la tarea al valor, por lo que el
        debounce + la cancelación vienen del framework en lugar de timers manuales.</p>`,
      },
    ],
  },
  {
    id: "code-2",
    kind: "coding",
    title: "Una caché de imágenes thread-safe con un actor",
    level: "senior",
    tags: ["concurrencia", "actor", "caché"],
    promptHtml: `<p>Muchas tareas de vistas solicitan imágenes concurrentemente. Construya una caché en memoria que
      nunca compita, y que <i>deduzca</i> solicitudes concurrentes para la misma URL para que solo se descargue
      una vez.</p>`,
    reveal: [
      {
        label: "Enfoque",
        html: `<ul>
          <li>Use un <code>actor</code> para que todo acceso al diccionario esté serializado — sin locks.</li>
          <li>Almacene una imagen terminada o el <code>Task</code> en curso, para que los llamadores concurrentes
            para la misma URL esperen la misma descarga.</li>
          <li>Espere la tarea almacenada y retorne su valor.</li>
        </ul>`,
      },
      {
        label: "Solución",
        html: `<div class="code">actor ImageCache {
  private enum Entry { case ready(UIImage); case loading(Task&lt;UIImage, Error&gt;) }
  private var cache: [URL: Entry] = [:]

  func image(for url: URL) async throws -&gt; UIImage {
    if case .ready(let img)? = cache[url] { return img }
    if case .loading(let task)? = cache[url] { return try await task.value }

    let task = Task { try await download(url) }
    cache[url] = .loading(task)
    let img = try await task.value
    cache[url] = .ready(img)
    return img
  }
}</div>
        <p>Almacenar el <code>Task</code> en curso es lo que deduplica: diez vistas que preguntan a la vez
        esperan una sola descarga. El actor garantiza que el diccionario nunca se acceda
        concurrentemente.</p>`,
      },
    ],
  },
  {
    id: "code-3",
    kind: "coding",
    title: "Descodificar un JSON desordenado con Codable",
    level: "mid",
    tags: ["data", "codable", "json"],
    promptHtml: `<p>Una API devuelve claves <code>snake_case</code>, fechas ISO-8601 y un objeto anidado. Descodifíquelo
      en modelos Swift limpios sin escribir manualmente cada clave.</p>`,
    reveal: [
      {
        label: "Enfoque",
        html: `<ul>
          <li>Modele la forma con structs <code>Codable</code> anidados.</li>
          <li>Establezca <code>keyDecodingStrategy = .convertFromSnakeCase</code> para que
            <code>full_name</code> se mapee a <code>fullName</code> automáticamente.</li>
          <li>Establezca <code>dateDecodingStrategy = .iso8601</code> para las marcas de tiempo.</li>
        </ul>`,
      },
      {
        label: "Solución",
        html: `<div class="code">struct User: Codable, Identifiable {
  let id: Int
  let fullName: String
  let profile: Profile
  let createdAt: Date
}
struct Profile: Codable { let bio: String }

func decodeUser(_ data: Data) throws -&gt; User {
  let decoder = JSONDecoder()
  decoder.keyDecodingStrategy = .convertFromSnakeCase
  decoder.dateDecodingStrategy = .iso8601
  return try decoder.decode(User.self, from: data)
}</div>
        <p>Las estrategias manejan los casos comunes globalmente; recurrir a <code>CodingKeys</code> explícitos
        solo cuando un campo no sigue el patrón.</p>`,
      },
    ],
  },
  {
    id: "code-4",
    kind: "coding",
    title: "Reintento asíncrono con backoff exponencial",
    level: "senior",
    tags: ["concurrencia", "red", "resiliencia"],
    promptHtml: `<p>Envuelva una operación asíncrona para que reintente en caso de fallo hasta N veces con backoff
      exponencial, respete la cancelación y relance el último error si todos los intentos
      fallan.</p>`,
    reveal: [
      {
        label: "Enfoque",
        html: `<ul>
          <li>Bucle hasta <code>maxAttempts</code>; en éxito retorne, en fallo recuerde el error.</li>
          <li>Entre intentos <code>try await Task.sleep</code> con un creciente retardo (consciente de
            cancelación).</li>
          <li>Después del bucle, lance el último error capturado.</li>
        </ul>`,
      },
      {
        label: "Solución",
        html: `<div class="code">func retry&lt;T&gt;(
  maxAttempts: Int = 3,
  operation: () async throws -&gt; T
) async throws -&gt; T {
  var attempt = 0
  while true {
    do { return try await operation() }
    catch {
      attempt += 1
      if attempt &gt;= maxAttempts { throw error }
      let delay = pow(2.0, Double(attempt))   // 2s, 4s, ...
      try await Task.sleep(for: .seconds(delay))
    }
  }
}</div>
        <p>Debido a que la espera es consciente de cancelación, cancelar la tarea que la contiene detiene los
        reintentos inmediatamente. Agregue jitter en producción para evitar thundering herds.</p>`,
      },
    ],
  },
  {
    id: "code-5",
    kind: "coding",
    title: "Un view model @Observable con estados de carga",
    level: "mid",
    tags: ["swiftui", "mvvm", "estado"],
    promptHtml: `<p>Construya un view model que cargue una lista y exponga estados de carga / cargado / vacío / error
      para que la vista pueda renderizar cada uno limpiamente. Hágalo testeable.</p>`,
    reveal: [
      {
        label: "Enfoque",
        html: `<ul>
          <li>Modele el estado como un <code>enum</code> para que combinaciones imposibles no existan.</li>
          <li>Dependa de un protocolo <code>APIClient</code> (inyectado) para que las pruebas pasen un mock.</li>
          <li>Anote el modelo con <code>@MainActor</code> y <code>@Observable</code>; haga switch sobre el
            estado en la vista.</li>
        </ul>`,
      },
      {
        label: "Solución",
        html: `<div class="code">enum ListState { case loading, empty, loaded([Item]), failed(String) }

@MainActor @Observable
final class ItemsModel {
  private let api: APIClient
  var state: ListState = .loading
  init(api: APIClient) { self.api = api }

  func load() async {
    state = .loading
    do {
      let items = try await api.items()
      state = items.isEmpty ? .empty : .loaded(items)
    } catch {
      state = .failed(error.localizedDescription)
    }
  }
}</div>
        <p>La vista hace <code>switch model.state</code> y renderiza un spinner, lista, vista vacía o error.
        Las pruebas construyen <code>ItemsModel(api: MockAPI())</code> y verifican el estado
        resultante.</p>`,
      },
    ],
  },
  {
    id: "code-6",
    kind: "coding",
    title: "Obtener dos endpoints concurrentemente y combinar",
    level: "mid",
    tags: ["concurrencia", "red"],
    promptHtml: `<p>Una pantalla de perfil necesita el usuario y sus publicaciones de dos endpoints. Obténgalos en
      paralelo y combínelos — no espere uno y luego el otro.</p>`,
    reveal: [
      {
        label: "Enfoque",
        html: `<ul>
          <li>Use <code>async let</code> para iniciar ambas solicitudes inmediatamente.</li>
          <li><code>await</code> ambas al construir el resultado combinado; se ejecutan concurrentemente.</li>
          <li>Si alguna lanza una excepción, toda la función falla (y la hermana se cancela).</li>
        </ul>`,
      },
      {
        label: "Solución",
        html: `<div class="code">func loadProfile(id: Int) async throws -&gt; Profile {
  async let user = api.user(id)
  async let posts = api.posts(forUser: id)
  return try await Profile(user: user, posts: posts)
}</div>
        <p>Dos viajes de red ocurren en paralelo, reduciendo aproximadamente a la mitad la latencia frente a
        awaits secuenciales. Para un número dinámico de hijos, use un <code>TaskGroup</code> en
        su lugar.</p>`,
      },
    ],
  },
  {
    id: "code-7",
    kind: "coding",
    title: "Un almacén de tokens Keychain mínimo",
    level: "senior",
    tags: ["seguridad", "keychain"],
    promptHtml: `<p>Almacene y lea un token de autenticación de forma segura. Explique por qué esto debe estar en el
      Keychain en lugar de <code>UserDefaults</code>.</p>`,
    reveal: [
      {
        label: "Enfoque",
        html: `<ul>
          <li>Use las APIs <code>SecItem</code> del framework Security con
            <code>kSecClassGenericPassword</code>.</li>
          <li>Elimine cualquier elemento existente antes de agregar, para que el guardado sea idempotente.</li>
          <li>UserDefaults es un plist sin cifrar; el Keychain está cifrado y respaldado por hardware.</li>
        </ul>`,
      },
      {
        label: "Solución",
        html: `<div class="code">enum Keychain {
  static func save(_ token: String, account: String) {
    let data = Data(token.utf8)
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrAccount as String: account,
    ]
    SecItemDelete(query as CFDictionary)
    var add = query
    add[kSecValueData as String] = data
    SecItemAdd(add as CFDictionary, nil)
  }

  static func read(account: String) -&gt; String? {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrAccount as String: account,
      kSecReturnData as String: true,
    ]
    var out: AnyObject?
    guard SecItemCopyMatching(query as CFDictionary, &amp;out) == errSecSuccess,
          let data = out as? Data else { return nil }
    return String(decoding: data, as: UTF8.self)
  }
}</div>
        <p>Tokens y contraseñas van aquí, no en UserDefaults. Para mayor seguridad agregue
        <code>kSecAttrAccessible</code> y control de acceso biométrico.</p>`,
      },
    ],
  },
  {
    id: "code-8",
    kind: "coding",
    title: "Conectar una API basada en callbacks a async/await",
    level: "senior",
    tags: ["concurrencia", "interoperabilidad"],
    promptHtml: `<p>Tiene una API legacy <code>load(completion:)</code> que retorna un <code>Result</code>. Exponga una
      versión moderna <code>async throws</code> sin reescribir el código legacy.</p>`,
    reveal: [
      {
        label: "Enfoque",
        html: `<ul>
          <li>Use <code>withCheckedThrowingContinuation</code>.</li>
          <li>Llame a la API legacy; en su completion, <code>resume</code> la continuación con el valor o
            error — exactamente una vez.</li>
          <li>La variante checked detecta si resume cero o múltiples veces.</li>
        </ul>`,
      },
      {
        label: "Solución",
        html: `<div class="code">func load() async throws -&gt; Data {
  try await withCheckedThrowingContinuation { continuation in
    legacyLoad { result in
      switch result {
      case .success(let data): continuation.resume(returning: data)
      case .failure(let err): continuation.resume(throwing: err)
      }
    }
  }
}</div>
        <p>Este es el adaptador estándar para APIs basadas en delegate y completion. Garantice un único
        <code>resume</code> en cada camino o tendrá una fuga o un fallo.</p>`,
      },
    ],
  },
  {
    id: "code-9",
    kind: "coding",
    title: "Lista de scroll infinito con paginación",
    level: "senior",
    tags: ["swiftui", "rendimiento", "paginación"],
    promptHtml: `<p>Renderice una lista larga que cargue la siguiente página cuando el usuario se acerque al final,
      sin cargar todo de antemano y sin disparar solicitudes de página duplicadas.</p>`,
    reveal: [
      {
        label: "Enfoque",
        html: `<ul>
          <li>Use <code>List</code> (perezoso) y active una carga cuando el último elemento aparezca mediante
            <code>.onAppear</code>.</li>
          <li>Proteja con una bandera <code>isLoading</code> para no disparar la misma página dos veces.</li>
          <li>Agregue resultados y avance el cursor de página en el modelo.</li>
        </ul>`,
      },
      {
        label: "Solución",
        html: `<div class="code">struct FeedView: View {
  @State private var model = FeedModel()
  var body: some View {
    List(model.items) { item in
      RowView(item: item)
        .onAppear {
          if item.id == model.items.last?.id {
            Task { await model.loadNextPage() }
          }
        }
    }
  }
}
// In FeedModel.loadNextPage(): guard !isLoading; isLoading = true;
// fetch page; items += new; page += 1; isLoading = false.</div>
        <p><code>List</code> solo materializa las filas visibles, por lo que la memoria se mantiene plana; la
        verificación del último elemento más la protección de carga da una paginación limpia y sin
        duplicados.</p>`,
      },
    ],
  },
  {
    id: "design-1",
    kind: "design",
    title: "Diseñe una app de notas offline-first",
    level: "architect",
    tags: ["arquitectura", "sincronización", "datos"],
    promptHtml: `<p>Los usuarios crean y editan notas que deben funcionar completamente sin conexión y sincronizar entre
      dispositivos. Diseñe el flujo de datos, la estrategia de sincronización y la resolución de
      conflictos.</p>`,
    reveal: [
      {
        label: "Enfoque",
        html: `<ul>
          <li>Aclare: ¿multi-dispositivo, último escritor aceptable? ¿texto enriquecido o plano? ¿escala?</li>
          <li>Almacenamiento local como fuente de verdad; motor de sincronización en segundo plano; cola de
            mutaciones con reintentos.</li>
          <li>Defina la política de conflictos y el rastreo de cambios.</li>
        </ul>`,
      },
      {
        label: "Respuesta modelo",
        html: `<p><b>Fuente de verdad = local.</b> La UI siempre lee/escribe SwiftData (o Core Data); las escrituras
          se renderizan instantáneamente sin spinner. Un <b>motor de sincronización</b> en segundo plano envía una
          cola de mutaciones y obtiene cambios remotos.</p>
        <p><b>Sincronización:</b> cada nota tiene un id estable, un <code>updatedAt</code> y una bandera sucia.
          Las mutaciones se encolan con claves de idempotencia y se reintean al reconectar (con backoff).
          <b>Conflictos:</b> comience con servidor autoritativo o último escritor gana por timestamp; actualice a
          fusión por campo o CRDTs solo si el producto necesita edición concurrente real.
          <b>Observabilidad:</b> muestre un estado de sincronización sutil y un reintento manual. La entrevista
          realmente está evaluando si usted hace el almacenamiento local autoritativo y maneja los casos extremos
          de cola/conflicto explícitamente.</p>`,
      },
    ],
  },
  {
    id: "design-2",
    kind: "design",
    title: "Arquitectura de una app para 30 ingenieros",
    level: "architect",
    tags: ["arquitectura", "modularización", "spm"],
    promptHtml: `<p>Una app de un solo target tiene compilaciones incrementales de 12 minutos y constantes conflictos de
      merge. ¿Cómo la reestructura para que un equipo grande pueda avanzar rápido?</p>`,
    reveal: [
      {
        label: "Enfoque",
        html: `<ul>
          <li>Diagnosticar: un target = compilaciones en serie, dependencias enredadas, dolor de merge.</li>
          <li>Modularizar en paquetes Swift locales con una dirección de dependencia estricta.</li>
          <li>Agregar fundamentos compartidos y herramientas; forzar límites.</li>
        </ul>`,
      },
      {
        label: "Respuesta modelo",
        html: `<p><b>Monolito modular.</b> Dividir en paquetes Swift locales: paquetes de <i>funcionalidad</i>
          (Search, Profile, Checkout) que dependen de paquetes compartidos <i>Core</i>, <i>DesignSystem</i> y
          <i>Networking</i> — y nunca entre sí. El target de la app solo compone funcionalidades.</p>
        <p><b>Resultados:</b> compilaciones paralelas e incrementales, límites forzados por el compilador,
          pruebas y previews por funcionalidad, y la posibilidad de construir una funcionalidad de forma aislada.
          Agregue un router para que las funcionalidades permanezcan desacopladas de la navegación, un sistema de
          diseño para consistencia y CI que compile/pruebe paquetes modificados. La señal de arquitecto es tratar
          los <b>límites de módulos y la dirección de dependencia</b> como la decisión central, más un plan de
          migración (extraer funcionalidades hoja primero).</p>`,
      },
    ],
  },
  {
    id: "design-3",
    kind: "design",
    title: "Diseñe un feed de imágenes fluido",
    level: "senior",
    tags: ["rendimiento", "swiftui", "medios"],
    promptHtml: `<p>Diseñe un feed social de fotos en alta resolución que se desplace a una tasa de frames constante en
      dispositivos antiguos y no exceda el presupuesto de memoria.</p>`,
    reveal: [
      {
        label: "Enfoque",
        html: `<ul>
          <li>Renderizado perezoso, descodificación fuera del principal, reducción de resolución, caché,
            identidad estable.</li>
          <li>Preobtener por adelantado; cancelar cargas para celdas que se desplazan fuera.</li>
        </ul>`,
      },
      {
        label: "Respuesta modelo",
        html: `<p><b>Renderice perezosamente</b> con <code>List</code>/<code>LazyVStack</code> para que solo existan
          las celdas visibles. <b>Reduzca la resolución</b> de imágenes al tamaño de pantalla fuera del actor
          principal (nunca descodifique 4000px para una celda de 300px). <b>Cachée</b> miniaturas descodificadas
          en una caché respaldada por actor con clave por URL+tamaño, deduplicando cargas concurrentes. Dé a las
          filas <b>identidad estable</b> para que SwiftUI reutilice vistas. <b>Obtenga</b> algunas filas por
          adelantado y <b>cancele</b> cargas cuando las celdas desaparezcan (vincule el trabajo a
          <code>.task</code>). Valide con Time Profiler (sin descodificación en el hilo principal) y Allocations
          (memoria plana). La señal de senior: fluido = haga menos por frame, fuera del hilo
          principal.</p>`,
      },
    ],
  },
  {
    id: "design-4",
    kind: "design",
    title: "Diseñe la capa de red y datos",
    level: "senior",
    tags: ["arquitectura", "red", "caché"],
    promptHtml: `<p>Diseñe la capa entre su UI y el backend: cómo encajan las solicitudes, descodificación, caché,
      renovación de autenticación y pruebas.</p>`,
    reveal: [
      {
        label: "Enfoque",
        html: `<ul>
          <li>En capas: ViewModel → Repository → (APIClient + Store).</li>
          <li>Protocolos en cada seam; auth/reintentos centralizados; política de caché.</li>
        </ul>`,
      },
      {
        label: "Respuesta modelo",
        html: `<p><b>APIClient</b> (un protocolo) posee el transporte: construye <code>URLRequest</code>s, ejecuta
          <code>URLSession</code>, descodifica <code>Codable</code>, mapea errores. Un <b>Repository</b> se sitúa
          encima, retornando modelos de dominio y poseyendo la decisión de fresco vs en caché (memoria/disco/
          tienda) y paginación. Los <b>ViewModels</b> dependen solo de protocolos de repository, por lo que las
          pruebas inyectan fakes. Centralice la <b>renovación de auth</b> (interceptar 401, renovar una vez,
          reintentar solicitudes en cola) y <b>reintentos/backoff</b> en un solo lugar. La ventaja es una fuente
          de verdad, seams claros para pruebas y lógica de red no duplicada en las vistas.</p>`,
      },
    ],
  },
  {
    id: "design-5",
    kind: "design",
    title: "Diseñe navegación y deep linking",
    level: "senior",
    tags: ["arquitectura", "navegación"],
    promptHtml: `<p>Diseñe la navegación de una app con múltiples pestañas que debe soportar deep links, enrutamiento
      de notificaciones push y restauración de estado.</p>`,
    reveal: [
      {
        label: "Enfoque",
        html: `<ul>
          <li>Navegación como datos: una ruta de valores Route tipados.</li>
          <li>Un router mapea rutas a destinos; enlaces/notificaciones se descodifican a rutas.</li>
        </ul>`,
      },
      {
        label: "Respuesta modelo",
        html: `<p>Modele la navegación como <b>datos</b>: un <code>NavigationStack(path:)</code> vinculado a un array
          de valores <code>Route</code> tipados por pestaña. Un <b>router</b> posee la ruta y mapea rutas a
          destinos mediante <code>navigationDestination(for:)</code>; las funcionalidades emiten rutas en lugar
          de presentar pantallas directamente. Los <b>deep links y notificaciones</b> descodifican un
          URL/carga en valores <code>Route</code> que se agregan a la ruta — el mismo mecanismo que la
          navegación en la app. La <b>restauración de estado</b> se convierte en persistir y recargar la
          ruta. Esto desacopla &quot;qué mostrar&quot; de &quot;cómo presentar&quot;, hace los flujos testables
          y da un lugar para razonar sobre todo el grafo de navegación.</p>`,
      },
    ],
  },
  {
    id: "design-6",
    kind: "design",
    title: "Diseñe un pipeline de CI/CD y lanzamiento",
    level: "senior",
    tags: ["cicd", "lanzamiento", "firmado"],
    promptHtml: `<p>Configure build, pruebas, firmado y lanzamiento para un equipo para que cada cambio esté verificado
      y la distribución sea a un clic — con una implementación segura.</p>`,
    reveal: [
      {
        label: "Enfoque",
        html: `<ul>
          <li>El CI de PR ejecuta pruebas; main envía automáticamente TestFlight; los lanzamientos se promueven
            con phased rollout.</li>
          <li>Firmado reproducible; versionado; observabilidad + rollback.</li>
        </ul>`,
      },
      {
        label: "Respuesta modelo",
        html: `<p><b>En PR:</b> CI construye y ejecuta pruebas unitarias + de UI y lint. <b>Al merge a main:</b>
          archive automático, firmado y carga de un build de <b>TestFlight</b>, autoincrementando
          <code>CFBundleVersion</code>. <b>Lanzamiento:</b> promueva un build de TestFlight a App Store con un
          <b>phased rollout</b>. Use <b>Xcode Cloud</b> para integración estrecha con App Store Connect, o lanes
          de <b>Fastlane</b> en GitHub Actions para mayor control; gestione el firmado de forma reproducible
          (Fastlane <i>match</i> o firmado automático). <b>Red de seguridad:</b> monitoreo de crashes + una
          bandera de apagado de funcionalidad para que un lanzamiento defectuoso pueda desactivarse sin un nuevo
          build. La señal es un camino repetible desde commit hasta tienda con un plan de rollback.</p>`,
      },
    ],
  },
  {
    id: "design-7",
    kind: "design",
    title: "Diseñe búsqueda semántica en el dispositivo",
    level: "beyond",
    tags: ["ai", "coreml", "búsqueda"],
    promptHtml: `<p>Permita a los usuarios buscar su contenido por <i>significado</i>, no solo por palabras clave, total
      y directamente en el dispositivo por privacidad. Diseñelo.</p>`,
    reveal: [
      {
        label: "Enfoque",
        html: `<ul>
          <li>Incruste contenido con un pequeño modelo en el dispositivo; almacene vectores localmente.</li>
          <li>En el momento de la consulta, incruste la consulta y clasifique por similitud coseno.</li>
        </ul>`,
      },
      {
        label: "Respuesta modelo",
        html: `<p><b>Índice:</b> ejecute cada elemento a través de un pequeño modelo de incrustación via
          <b>Core ML</b> (en el Neural Engine) para obtener un vector normalizado; almacene vectores junto a los
          elementos localmente. <b>Consulta:</b> incruste la consulta con el mismo modelo y clasifique elementos
          por <b>similitud coseno</b> (top-k). Mantenga un respaldo por palabras clave y mezcle puntuaciones.
          <b>Ingeniería:</b> incruste perezosamente/incrementalmente, cachée vectores, cuantice el modelo para
          ajustar memoria/latencia y ejecute la indexación fuera del actor principal. Es privado (nada sale del
          dispositivo), funciona sin conexión y no tiene costo por consulta — exactamente la arquitectura que la
          propia búsqueda de esta guía usa como demostración en vivo en su navegador.</p>`,
      },
    ],
  },
];
