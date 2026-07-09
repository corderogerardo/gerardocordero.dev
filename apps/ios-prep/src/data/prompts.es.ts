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
        html: `<p>Cada pulsación innecesaria que llega a la red desperdicia ancho de banda y puede devolver
          resultados desordenados — el framework ya resuelve ambos problemas si ata la vida de la solicitud al
          valor de la consulta.</p>
        <ul>
          <li>1. Dirija un modificador <code>.task(id: query)</code> para que una nueva tarea inicie cuando cambie la
            consulta — y SwiftUI cancele la tarea anterior automáticamente.</li>
          <li>2. Dentro, <code>try await Task.sleep(for: .milliseconds(300))</code>. Si se cancela durante la
            espera lanza una excepción, por lo que una nueva pulsación aborta la consulta pendiente.</li>
          <li>3. Después de la espera, ejecute la búsqueda. La cancelación genera el debounce automáticamente.</li>
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
        <p><b>Atar la vida de la tarea al valor es todo el truco</b> — el debounce y la cancelación vienen del
        framework en lugar de un timer manual o el <code>.debounce</code> de Combine.</p>
        <p>Señal de alerta: recurrir a un <code>Timer</code> o a un <code>DispatchWorkItem</code> manual para
        cancelar la llamada anterior — funciona, pero es exactamente el boilerplate que <code>.task(id:)</code>
        existe para eliminar, y los entrevistadores lo leen como no conocer la concurrencia estructurada.</p>`,
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
        html: `<p>Un diccionario simple detrás de un lock solo resuelve la competencia por datos — no evita que
          diez celdas que aparecen a la vez en pantalla disparen cada una la misma descarga. Cachear el trabajo
          en curso, no solo el resultado, es lo que colapsa eso en una sola solicitud.</p>
        <ul>
          <li>1. Use un <code>actor</code> para que todo acceso al diccionario esté serializado — sin locks.</li>
          <li>2. Almacene una imagen terminada o el <code>Task</code> en curso, para que los llamadores concurrentes
            para la misma URL esperen la misma descarga.</li>
          <li>3. Espere la tarea almacenada y retorne su valor.</li>
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
        <p><b>Almacenar el <code>Task</code> en curso, no solo el resultado terminado, es lo que deduplica</b>
        — diez vistas que preguntan a la vez esperan una sola descarga, y el actor garantiza que el diccionario
        nunca se toque concurrentemente.</p>`,
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
        html: `<p>Escribir <code>CodingKeys</code> a mano para cada campo es deuda de mantenimiento que se rompe
          en silencio en cuanto el backend agrega un campo — las estrategias a nivel de decoder resuelven las
          transformaciones comunes una sola vez, para todos los modelos de la app.</p>
        <ul>
          <li>1. Modele la forma con structs <code>Codable</code> anidados.</li>
          <li>2. Establezca <code>keyDecodingStrategy = .convertFromSnakeCase</code> para que
            <code>full_name</code> se mapee a <code>fullName</code> automáticamente.</li>
          <li>3. Establezca <code>dateDecodingStrategy = .iso8601</code> para las marcas de tiempo.</li>
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
        <p><b>Las estrategias manejan los casos comunes globalmente; recurra a <code>CodingKeys</code> explícitos
        solo cuando un campo no sigue el patrón.</b> Escribir <code>CodingKeys</code> completos para cada modelo
        cuando una estrategia bastaría es la señal de que alguien no ha usado <code>Codable</code> a escala.</p>`,
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
        html: `<p>Reintentar de inmediato tras un fallo solo martilla más a un servidor que ya está en apuros;
          hacer crecer el retardo entre intentos es lo que evita que una red inestable se convierta en una
          caída autoinfligida.</p>
        <ul>
          <li>1. Bucle hasta <code>maxAttempts</code>; en éxito retorne, en fallo recuerde el error.</li>
          <li>2. Entre intentos <code>try await Task.sleep</code> con un retardo creciente (consciente de
            cancelación).</li>
          <li>3. Después del bucle, lance el último error capturado.</li>
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
        <p><b>Debido a que la espera es consciente de cancelación, cancelar la tarea que la contiene detiene los
        reintentos inmediatamente</b> — sin trabajo en segundo plano huérfano. Agregue jitter en producción para
        que muchos clientes reintentando a la vez no se resincronicen en un thundering herd.</p>`,
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
        html: `<p>Una vista que maneja por separado booleanos como <code>isLoading</code>/<code>items</code>/
          <code>error</code> puede representar estados imposibles (cargando <i>y</i> con error a la vez) —
          modelar el estado como un solo enum hace irrepresentables esos casos, y inyectar la dependencia de la
          API es lo que lo hace testeable siquiera.</p>
        <ul>
          <li>1. Modele el estado como un <code>enum</code> para que combinaciones imposibles no existan.</li>
          <li>2. Dependa de un protocolo <code>APIClient</code> (inyectado) para que las pruebas pasen un mock.</li>
          <li>3. Anote el modelo con <code>@MainActor</code> y <code>@Observable</code>; haga switch sobre el
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
        <p><b>La vista simplemente hace <code>switch model.state</code></b> y renderiza un spinner, lista, vista
        vacía o error — sin lógica combinatoria de booleanos. Las pruebas construyen
        <code>ItemsModel(api: MockAPI())</code> y verifican el estado resultante directamente.</p>`,
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
        html: `<p>Esperar las dos solicitudes de forma secuencial paga su latencia completa dos veces sin
          motivo — las solicitudes no dependen entre sí, así que deberían estar en vuelo al mismo tiempo.</p>
        <ul>
          <li>1. Use <code>async let</code> para iniciar ambas solicitudes inmediatamente.</li>
          <li>2. <code>await</code> ambas al construir el resultado combinado; se ejecutan concurrentemente.</li>
          <li>3. Si alguna lanza una excepción, toda la función falla (y la hermana se cancela).</li>
        </ul>`,
      },
      {
        label: "Solución",
        html: `<div class="code">func loadProfile(id: Int) async throws -&gt; Profile {
  async let user = api.user(id)
  async let posts = api.posts(forUser: id)
  return try await Profile(user: user, posts: posts)
}</div>
        <p><b>Dos viajes de red ocurren en paralelo, reduciendo aproximadamente a la mitad la latencia frente a
        awaits secuenciales.</b> Para un conjunto fijo y conocido de solicitudes <code>async let</code> es la
        herramienta correcta; para un número dinámico de hijos, use un <code>TaskGroup</code> en su lugar.</p>`,
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
        html: `<p>Un token de autenticación en <code>UserDefaults</code> vive en un plist sin cifrar que
          cualquier proceso con acceso al contenedor puede leer — el Keychain existe específicamente para
          mantener los secretos cifrados y respaldados por hardware, algo que en la mayoría de los equipos es un
          requisito de cumplimiento, no un extra.</p>
        <ul>
          <li>1. Use las APIs <code>SecItem</code> del framework Security con
            <code>kSecClassGenericPassword</code>.</li>
          <li>2. Elimine cualquier elemento existente antes de agregar, para que el guardado sea idempotente.</li>
          <li>3. Léalo de vuelta con una consulta coincidente y descodifique el <code>Data</code> retornado.</li>
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
        <p><b>Tokens y contraseñas van en el Keychain, nunca en UserDefaults.</b> Para mayor seguridad agregue
        <code>kSecAttrAccessible</code> y control de acceso biométrico.</p>
        <p>Señal de alerta: decir "yo simplemente cifraría el valor de UserDefaults" — eso solo mueve el
        problema de dónde guardar la clave un nivel más abajo, sin el respaldo de hardware que el Keychain ya
        da gratis.</p>`,
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
        html: `<p>Reescribir la API legacy basada en completion arriesga romper cada llamador existente sin
          ninguna ganancia — el puente de continuación permite que los nuevos sitios de llamada adopten
          async/await mientras la implementación legacy queda intacta.</p>
        <ul>
          <li>1. Use <code>withCheckedThrowingContinuation</code>.</li>
          <li>2. Llame a la API legacy; en su completion, <code>resume</code> la continuación con el valor o
            error — exactamente una vez.</li>
          <li>3. Retorne el valor esperado; la variante checked detecta si resume cero o múltiples veces.</li>
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
        <p><b>Este es el adaptador estándar para APIs basadas en delegate y completion.</b> Garantice un único
        <code>resume</code> en cada camino — la continuación checked lanza un trap en tiempo de ejecución si la
        resume cero o más de una vez, que es exactamente la clase de bug que está diseñada para exponer
        temprano.</p>`,
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
        html: `<p>Cargar todo el conjunto de datos de antemano consume memoria y ancho de banda que el usuario
          puede nunca necesitar si no llega a desplazarse tan lejos — el renderizado perezoso más una carga
          disparada por aparición mantiene ambos planos sin perder la sensación de continuidad.</p>
        <ul>
          <li>1. Use <code>List</code> (perezoso) y active una carga cuando el último elemento aparezca mediante
            <code>.onAppear</code>.</li>
          <li>2. Proteja con una bandera <code>isLoading</code> para no disparar la misma página dos veces.</li>
          <li>3. Agregue resultados y avance el cursor de página en el modelo.</li>
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
        <p><b><code>List</code> solo materializa las filas visibles, por lo que la memoria se mantiene plana; la
        verificación del último elemento más la protección de carga da una paginación limpia y sin
        duplicados.</b></p>
        <p>Señal de alerta: olvidar la protección <code>isLoading</code> — <code>.onAppear</code> puede
        dispararse más de una vez para la misma fila durante un scroll rápido, y sin la protección disparará la
        misma solicitud de página dos veces.</p>`,
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
        html: `<p>Una app que trata la red como fuente de verdad se vuelve inutilizable en cuanto se pierde la
          conexión — offline-first significa que el almacenamiento local es autoritativo y la sincronización es
          una preocupación en segundo plano montada encima, no una dependencia bloqueante de cada escritura.</p>
        <ul>
          <li>1. Aclare: ¿multi-dispositivo, último escritor aceptable? ¿texto enriquecido o plano? ¿escala?</li>
          <li>2. Haga que el almacenamiento local sea la fuente de verdad; agregue un motor de sincronización en
            segundo plano con una cola de mutaciones y reintentos.</li>
          <li>3. Defina la política de conflictos y cómo se rastrean los cambios.</li>
        </ul>`,
      },
      {
        label: "Respuesta modelo",
        html: `<p><b>Fuente de verdad = local.</b> La UI siempre lee/escribe SwiftData (o Core Data); las escrituras
          se renderizan instantáneamente sin spinner. Un <b>motor de sincronización</b> en segundo plano envía una
          cola de mutaciones y obtiene cambios remotos.</p>
        <p><b>Sincronización:</b> cada nota tiene un id estable, un <code>updatedAt</code> y una bandera sucia.
          Las mutaciones se encolan con claves de idempotencia y se reintentan al reconectar (con backoff).
          <b>Conflictos:</b> comience con servidor autoritativo o último escritor gana por timestamp; actualice a
          fusión por campo o CRDTs solo si el producto necesita edición concurrente real.
          <b>Observabilidad:</b> muestre un estado de sincronización sutil y un reintento manual.</p>
        <p>Sí, una cola de mutaciones con claves de idempotencia es más código que "simplemente hacer un PUT de
          la nota" — pero la alternativa es pérdida silenciosa de datos en cuanto dos dispositivos editan sin
          conexión y luego se reconectan, algo mucho más caro de depurar en producción que de construir de
          antemano. Trátelo como infraestructura que se escribe una vez y toda funcionalidad futura reutiliza, y
          presupueste también el costo a largo plazo: los CRDTs en particular necesitan recolección de basura de
          tombstones o sus metadatos crecen sin límite. <b>La entrevista realmente está evaluando si usted hace
          el almacenamiento local autoritativo y maneja los casos extremos de cola/conflicto
          explícitamente.</b></p>`,
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
        html: `<p>Un solo target obliga al compilador a reconstruir todo ante cualquier cambio y obliga a cada
          ingeniero a editar los mismos archivos — la solución no es una máquina más rápida, es eliminar el
          acoplamiento que hace que las compilaciones sean en serie y los diffs choquen entre sí.</p>
        <ul>
          <li>1. Diagnostique: un target = compilaciones en serie, dependencias enredadas, dolor de merge.</li>
          <li>2. Modularice en paquetes Swift locales con una dirección de dependencia estricta.</li>
          <li>3. Agregue fundamentos compartidos y herramientas, y fuerce los límites en CI.</li>
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
          diseño para consistencia y CI que compile/pruebe paquetes modificados.</p>
        <p>La migración en sí cuesta tiempo real de sprint y un tramo de doble mantenimiento mientras se extraen
          los paquetes — pero dejarlo como un solo target cuesta ese mismo tiempo cada semana para siempre, en
          minutos de compilación y conflictos de merge entre 30 ingenieros. Extraiga primero las funcionalidades
          hoja para que el beneficio se acumule pronto, y planifíquelo como una inversión en velocidad, no como
          una limpieza puntual: a medida que el equipo crece, los límites de módulos son lo que mantiene el
          onboarding y el code review manejables. <b>La señal de arquitecto es tratar los límites de módulos y la
          dirección de dependencia como la decisión central</b>, con un plan de migración concreto.</p>`,
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
        html: `<p>Los frames perdidos durante el scroll casi siempre significan que se está haciendo demasiado
          trabajo en el hilo principal por frame — la solución es hacer menos trabajo ahí, no un dispositivo más
          rápido.</p>
        <ul>
          <li>1. Renderice perezosamente, descodifique fuera del hilo principal, reduzca resolución, cachée y dé
            identidad estable a las filas.</li>
          <li>2. Preobtenga algunas filas por adelantado; cancele cargas para celdas que se desplazan fuera.</li>
        </ul>`,
      },
      {
        label: "Respuesta modelo",
        html: `<p><b>Renderice perezosamente</b> con <code>List</code>/<code>LazyVStack</code> para que solo existan
          las celdas visibles. <b>Reduzca la resolución</b> de imágenes al tamaño de pantalla fuera del actor
          principal (nunca descodifique 4000px para una celda de 300px). <b>Cachée</b> miniaturas descodificadas
          en una caché respaldada por actor con clave por URL+tamaño, deduplicando cargas concurrentes. Dé a las
          filas <b>identidad estable</b> para que SwiftUI reutilice vistas. <b>Preobtenga</b> algunas filas por
          adelantado y <b>cancele</b> cargas cuando las celdas desaparezcan (vincule el trabajo a
          <code>.task</code>). Valide con Time Profiler (sin descodificación en el hilo principal) y Allocations
          (memoria plana).</p>
        <p><b>Fluido = haga menos por frame, fuera del hilo principal</b> — esa es la frase para abrir cuando le
          pregunten cómo abordaría cualquier problema de rendimiento de scroll, sea un feed de imágenes o no.</p>`,
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
        html: `<p>La lógica de red dispersa por los view models hace que la renovación de auth y el reintento se
          reimplementen (y se rompan de nuevo) en cada pantalla — una arquitectura en capas pone cada
          responsabilidad en exactamente un solo lugar.</p>
        <ul>
          <li>1. Organice en capas: ViewModel → Repository → (APIClient + Store).</li>
          <li>2. Ponga un protocolo en cada seam para que las pruebas puedan inyectar fakes.</li>
          <li>3. Centralice la política de renovación de auth y reintento en un solo lugar, no por sitio de
            llamada.</li>
        </ul>`,
      },
      {
        label: "Respuesta modelo",
        html: `<p><b>APIClient</b> (un protocolo) posee el transporte: construye <code>URLRequest</code>s, ejecuta
          <code>URLSession</code>, descodifica <code>Codable</code>, mapea errores. Un <b>Repository</b> se sitúa
          encima, retornando modelos de dominio y poseyendo la decisión de fresco vs en caché (memoria/disco/
          tienda) y paginación. Los <b>ViewModels</b> dependen solo de protocolos de repository, por lo que las
          pruebas inyectan fakes. Centralice la <b>renovación de auth</b> (interceptar 401, renovar una vez,
          reintentar solicitudes en cola) y <b>reintentos/backoff</b> en un solo lugar.</p>
        <p><b>Una sola fuente de verdad para auth y reintentos, con seams claros para pruebas, gana frente a
          lógica de red duplicada por las vistas.</b> Diga esa frase cuando le pregunten por qué molestarse con
          una capa Repository en lugar de llamar a la API directamente desde el view model.</p>`,
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
        html: `<p>Una navegación imperativa — pantallas que presentan otras pantallas directamente — no puede
          activarse desde un evento externo como una notificación push o un deep link sin encadenar delegates al
          estilo UIKit por toda la app. Modelar la navegación como datos elimina ese problema por completo.</p>
        <ul>
          <li>1. Modele la navegación como una ruta de valores <code>Route</code> tipados.</li>
          <li>2. Un router mapea rutas a destinos.</li>
          <li>3. Descodifique los deep links y las cargas de notificaciones a los mismos valores
            <code>Route</code>.</li>
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
          ruta.</p>
        <p><b>Esto desacopla "qué mostrar" de "cómo presentar", hace los flujos testables y da un lugar para
          razonar sobre todo el grafo de navegación</b> — la frase para abrir cuando le pregunten por qué las
          rutas como datos superan a las pantallas presentando pantallas.</p>`,
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
        html: `<p>El firmado manual y las subidas manuales a TestFlight no escalan más allá de un par de
          ingenieros y convierten "lanzarlo" en un ritual de medio día — automatizar build → firmar → distribuir
          es lo que hace que los lanzamientos sean aburridos, que es el objetivo.</p>
        <ul>
          <li>1. En cada PR, ejecute pruebas y lint en CI.</li>
          <li>2. Al merge a main, archive, firme y suba automáticamente un build de TestFlight.</li>
          <li>3. Promueva los lanzamientos con un phased rollout, y mantenga un camino de rollback.</li>
        </ul>`,
      },
      {
        label: "Respuesta modelo",
        html: `<p><b>En PR:</b> CI construye y ejecuta pruebas unitarias + de UI y lint. <b>Al merge a main:</b>
          archive automático, firmado y carga de un build de <b>TestFlight</b>, autoincrementando
          <code>CFBundleVersion</code>. <b>Lanzamiento:</b> promueva un build de TestFlight a App Store con un
          <b>phased rollout</b>. Use <b>Xcode Cloud</b> para integración estrecha con App Store Connect, o lanes
          de <b>Fastlane</b> en GitHub Actions para mayor control; gestione el firmado de forma reproducible
          (Fastlane <i>match</i> o firmado automático).</p>
        <p>Montar esto cuesta tiempo real por adelantado, y el phased rollout significa que un fix tarda más en
          llegar al 100% de los usuarios que un lanzamiento único de golpe — pero la alternativa es que un build
          defectuoso llegue a todos a la vez sin forma de volver atrás salvo una revisión acelerada. Agregue
          monitoreo de crashes + una bandera de apagado de funcionalidad como red de seguridad a largo plazo, para
          que un lanzamiento defectuoso pueda desactivarse sin un nuevo build. <b>La señal es un camino repetible
          desde commit hasta tienda con un plan de rollback</b>, no solo un CI en verde.</p>`,
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
        html: `<p>Enviar contenido a un servidor para calcular embeddings es el camino fácil, pero significa que
          los datos del usuario salen del dispositivo y la funcionalidad deja de funcionar sin conexión — un
          modelo de embeddings en el dispositivo cambia un cliente más pesado por privacidad y costo cero por
          consulta.</p>
        <ul>
          <li>1. Incruste contenido con un pequeño modelo en el dispositivo; almacene vectores localmente.</li>
          <li>2. En el momento de la consulta, incruste la consulta y clasifique por similitud coseno.</li>
        </ul>`,
      },
      {
        label: "Respuesta modelo",
        html: `<p><b>Índice:</b> ejecute cada elemento a través de un pequeño modelo de incrustación via
          <b>Core ML</b> (en el Neural Engine) para obtener un vector normalizado; almacene vectores junto a los
          elementos localmente. <b>Consulta:</b> incruste la consulta con el mismo modelo y clasifique elementos
          por <b>similitud coseno</b> (top-k). Mantenga un respaldo por palabras clave y mezcle puntuaciones.
          <b>Ingeniería:</b> incruste perezosamente/incrementalmente, cachée vectores, cuantice el modelo para
          ajustar memoria/latencia y ejecute la indexación fuera del actor principal.</p>
        <p>Un modelo en el dispositivo agrega tamaño a la app y necesita trabajo de cuantización que un modelo
          del lado del servidor no exigiría — pero un viaje al servidor significa que el contenido del usuario
          sale del dispositivo y la funcionalidad muere sin conexión, algo inaceptable para cualquier cosa
          sensible a la privacidad. <b>Es privado (nada sale del dispositivo), funciona sin conexión y no tiene
          costo por consulta</b> — exactamente la arquitectura que la propia búsqueda de esta guía usa como
          demostración en vivo en su navegador. Planifique volver a calcular embeddings a medida que el modelo
          mejore; trate el índice como algo que se versiona, no como una construcción de una sola vez.</p>`,
      },
    ],
  },
];
