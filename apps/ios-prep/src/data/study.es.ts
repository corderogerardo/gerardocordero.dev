// iOS study guide — typed content is the source of truth. Edit directly.
export type StudySection = { id: string; num: string; title: string; html: string };

export const STUDY_INTRO_HTML = `<span class="lbl">Cómo leer esto</span> Cada tema comienza con <b>qué es</b>,
  luego los puntos que una entrevista realmente sondea, y una nota de <b>nivel</b> para que sepa si es requisito
  básico (junior/intermedio) o diferenciador (senior/arquitecto). Léalo de arriba a abajo una vez, luego regrese
  a través de las <a href="/flashcards">flashcards</a> y las <a href="/practice">prompts</a> para que se
  fije.`;

export const STUDY_SECTIONS: StudySection[] = [
  {
    id: "st-1",
    num: "01",
    title: "01 · Fundamentos del Lenguaje Swift",
    html: `<p><b>Qué es.</b> Swift es un lenguaje orientado a valores y tipado de forma segura. La idea más
      importante para interiorizar temprano es <b>tipos por valor vs tipos por referencia</b>: <code>struct</code> y
      <code>enum</code> se copian al asignar (semántica de valor), mientras que las instancias de <code>class</code>
      se comparten por referencia. SwiftUI se apoya fuertemente en tipos por valor, así que use <code>struct</code>
      por defecto y recurrirá a <code>class</code> solo cuando necesite identidad o semántica de referencia.</p>
    <p>Fluidez básica que la entrevista asume: <b>optionals</b> (y desenvoltura segura con <code>if let</code> /
      <code>guard let</code> en lugar de desenvoltura forzada con <code>!</code>), <b>enums con valores
      asociados</b>, <b>closures</b> y cómo capturan, <b>protocolos</b> y diseño orientado a protocolos,
      <b>genéricos</b> y <b>manejo de errores</b> con <code>do/try/catch</code>.</p>
    <div class="code">// Value vs reference
struct Point { var x = 0 }      // copied
final class Box { var x = 0 }   // shared

var a = Point(); var b = a; b.x = 9   // a.x still 0
let p = Box(); let q = p; q.x = 9     // p.x is now 9

// Optionals, no force-unwrap
func first(_ xs: [Int]) -&gt; Int {
  guard let head = xs.first else { return 0 }
  return head
}</div>
    <div class="callout warn"><span class="lbl">Memoria</span> Las clases tienen conteo de referencias (ARC). Un
      closure que captura <code>self</code> fuertemente dentro de una propiedad almacenada crea un <b>retain
      cycle</b> — rompalo con <code>[weak self]</code>. Esta es una pregunta clásica de seguimiento para
      senior.</div>
    <div class="callout tip"><span class="lbl">Nivel</span> Junior: optionals, structs, closures. Senior:
      diseño orientado a protocolos, genéricos con restricciones, y razonamiento sobre ARC y rendimiento de
      semántica de valor (copy-on-write).</div>`,
  },
  {
    id: "st-2",
    num: "02",
    title: "02 · Fundamentos de SwiftUI",
    html: `<p><b>Qué es.</b> SwiftUI es un framework de UI <i>declarativo</i>: describe cómo debería verse la UI
      para un estado dado, y el framework diff y actualiza la pantalla cuando el estado cambia. Una vista es un
      <code>struct</code> ligero que cumple con <code>View</code> con un <code>body</code> que retorna más
      vistas.</p>
    <p>Domine los <b>modificadores</b> (y que <i>el orden importa</i> — <code>.padding().background()</code>
      difiere de <code>.background().padding()</code>), el <b>layout</b> con <code>VStack</code>/<code>HStack</code>/
      <code>ZStack</code>, <code>Spacer</code>, <code>frame</code> y alineación, y las <b>listas</b> con
      <code>List</code> y <code>ForEach</code> con clave por identidad estable.</p>
    <div class="code">struct Greeting: View {
  let name: String
  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text("Hello, \\(name)").font(.title.bold())
      Text("Welcome back").foregroundStyle(.secondary)
    }
    .padding()
  }
}</div>
    <div class="callout warn"><span class="lbl">Identidad</span> SwiftUI rastrea las vistas por <b>identidad</b>.
      En <code>ForEach</code>, use un <code>id</code> estable (un id real del modelo, no el índice del array) o las
      animaciones y el estado se adherirán a la fila incorrecta.</div>
    <div class="callout tip"><span class="lbl">Nivel</span> Junior/intermedio: construir pantallas, componer
      vistas, usar modificadores correctamente. Senior: razonar sobre identidad de vistas, diffing y cuándo un
      re-render es innecesario (véase Rendimiento, tema 09).</div>`,
  },
  {
    id: "st-3",
    num: "03",
    title: "03 · Estado y Flujo de Datos en SwiftUI",
    html: `<p><b>Qué es.</b> SwiftUI está impulsado por una <b>única fuente de verdad</b>. Elija el wrapper de
      propiedad adecuado para quién posee el estado:</p>
    <ul>
      <li><code>@State</code> — valor poseído por <i>esta</i> vista (privado, estado UI transitorio).</li>
      <li><code>@Binding</code> — una referencia bidireccional al estado poseído en otro lugar.</li>
      <li><code>@Observable</code> (el framework de Observación, iOS 17+) — modelo de tipo referencia cuyas
        propiedades las vistas observan automáticamente; combine con <code>@State</code> para poseerlo y
        <code>@Bindable</code> para vincularse a él.</li>
      <li><code>@Environment</code> — dependencias inyectadas hacia abajo en el árbol de vistas.</li>
    </ul>
    <p>Antes de iOS 17 esto era <code>ObservableObject</code> + <code>@Published</code> + <code>@StateObject</code>/
      <code>@ObservedObject</code>; conozca ambos, porque mucho código todavía usa la API anterior.</p>
    <div class="code">@Observable
final class CounterModel { var count = 0 }

struct CounterView: View {
  @State private var model = CounterModel()
  var body: some View {
    Button("Tapped \\(model.count)") { model.count += 1 }
  }
}</div>
    <div class="callout tip"><span class="lbl">Por qué importa</span> El framework de Observación rastrea las
      lecturas a nivel de <i>propiedad</i>, por lo que solo las vistas que realmente leen una propiedad modificada
      se vuelven a renderizar — una ganancia real de rendimiento sobre el modelo anterior <code>@Published</code>,
      que invalidaba todos los observadores.</div>`,
  },
  {
    id: "st-4",
    num: "04",
    title: "04 · UIKit e Interoperabilidad",
    html: `<p><b>Qué es.</b> UIKit es el framework de UI imperativo y maduro que impulsó iOS durante una década.
      Incluso en una app SwiftUI-first lo necesita para APIs que SwiftUI no cubre completamente, personalización
      profunda y bases de código existentes grandes. Conozca el <b>ciclo de vida de UIViewController</b>
      (<code>viewDidLoad → viewWillAppear → viewDidAppear → …</code>), las restricciones de <b>Auto Layout</b>,
      y <code>UITableView</code>/<code>UICollectionView</code> con <b>diffable data sources</b>.</p>
    <p>El puente funciona en ambas direcciones: envuelva UIKit en SwiftUI con <code>UIViewRepresentable</code> /
      <code>UIViewControllerRepresentable</code>, y aloje SwiftUI dentro de UIKit con
      <code>UIHostingController</code>.</p>
    <div class="code">struct MapView: UIViewRepresentable {
  func makeUIView(context: Context) -&gt; MKMapView { MKMapView() }
  func updateUIView(_ view: MKMapView, context: Context) { /* sync state */ }
}</div>
    <div class="callout tip"><span class="lbl">Nivel</span> Intermedio: usar componentes UIKit y los wrappers
      representable. Senior: dirigir una migración UIKit ↔ SwiftUI, gestionar el patrón Coordinator para
      delegados, y saber qué framework posee el stack de navegación.</div>`,
  },
  {
    id: "st-5",
    num: "05",
    title: "05 · Concurrencia de Swift",
    html: `<p><b>Qué es.</b> La concurrencia asíncrona moderna de iOS se construye sobre <b>async/await</b> y la
      <b>concurrencia estructurada</b>. Las funciones <code>async</code> se suspenden sin bloquear un hilo;
      <code>Task</code> inicia trabajo concurrente; <code>async let</code> y <code>TaskGroup</code> ejecutan hijos
      en paralelo y los unen. Los <b>actors</b> protegen el estado mutable de carreras de datos serializando el
      acceso, y <code>@MainActor</code> garantiza que el código se ejecute en el hilo principal (requerido para
      UI).</p>
    <p>Swift 6 convierte esto en <b>seguridad contra carreras de datos en tiempo de compilación</b>: los tipos
      que cruzan límites de concurrencia deben ser <code>Sendable</code>, y el compilador aplica el aislamiento
      de actors. Entender el aislamiento, <code>Sendable</code> y <code>@MainActor</code> es la conversación de
      concurrencia para senior.</p>
    <div class="code">func loadProfile() async throws -&gt; Profile {
  async let user = api.user()        // these two run
  async let posts = api.posts()      // concurrently
  return try await Profile(user: user, posts: posts)
}

@MainActor
func show(_ p: Profile) { self.profile = p }  // safe UI update</div>
    <div class="callout warn"><span class="lbl">Trampa</span> No recurrir a <code>DispatchQueue.main.async</code>
      por hábito — use <code>@MainActor</code>. Y nunca bloquee el actor principal con trabajo síncrono; muévalo
      fuera con un <code>Task</code> o un actor de fondo.</div>
    <div class="callout tip"><span class="lbl">Nivel</span> Intermedio: usar async/await y <code>@MainActor</code>.
      Senior: explicar el aislamiento de actors, <code>Sendable</code>, cancelación y cómo migrar una API basada
      en callbacks a async con <code>withCheckedContinuation</code>.</div>`,
  },
  {
    id: "st-6",
    num: "06",
    title: "06 · Red y Codable",
    html: `<p><b>Qué es.</b> El stack estándar es la API asíncrona de <code>URLSession</code> más
      <b>Codable</b> para JSON. <code>Codable</code> (= <code>Encodable & Decodable</code>) mapea JSON a tipos
      Swift automáticamente; use <code>CodingKeys</code> para renombrar campos y estrategias de decodificador
      (por ejemplo <code>.convertFromSnakeCase</code>, decodificación de fechas personalizada) para manejar
      payloads del mundo real.</p>
    <div class="code">struct User: Codable, Identifiable {
  let id: Int
  let fullName: String
  enum CodingKeys: String, CodingKey {
    case id, fullName = "full_name"
  }
}

func fetchUser(id: Int) async throws -&gt; User {
  let url = URL(string: "https://api.example.com/users/\\(id)")!
  let (data, response) = try await URLSession.shared.data(from: url)
  guard (response as? HTTPURLResponse)?.statusCode == 200 else {
    throw URLError(.badServerResponse)
  }
  return try JSONDecoder().decode(User.self, from: data)
}</div>
    <div class="callout tip"><span class="lbl">Argumento</span> Envuelva la red detrás de un protocolo
      (<code>APIClient</code>) para que los view models dependan de una abstracción que puede mockear en pruebas.
      Agregue caché en capas con <code>URLCache</code> o su tienda de persistencia, y centralice la lógica de
      reintento/renovación de auth.</div>`,
  },
  {
    id: "st-7",
    num: "07",
    title: "07 · Persistencia",
    html: `<p><b>Qué es.</b> Elija el almacenamiento según los datos: <b>SwiftData</b> (iOS 17+) para modelos de
      app — anote una clase con <code>@Model</code>, guarde a través de un <code>ModelContext</code> y consulte
      reactivamente con <code>@Query</code>; <b>Core Data</b> para objetivos más antiguos o control avanzado;
      <b>UserDefaults</b> para preferencias pequeñas; el <b>Keychain</b> para secretos (tokens, contraseñas —
      nunca UserDefaults); y el sistema de archivos para blobs.</p>
    <div class="code">@Model
final class Task {
  var title: String
  var isDone = false
  init(title: String) { self.title = title }
}

struct TaskList: View {
  @Query(sort: \\Task.title) private var tasks: [Task]
  @Environment(\\.modelContext) private var context
  var body: some View {
    List(tasks) { Text($0.title) }
  }
}</div>
    <div class="callout warn"><span class="lbl">No haga</span> Almacene tokens de autenticación o PII en
      <code>UserDefaults</code> — es un plist sin cifrar. Use el Keychain (véase Seguridad, tema
      14).</div>
    <div class="callout tip"><span class="lbl">Nivel</span> Intermedio: modelar datos y hacer CRUD con SwiftData/
      Core Data. Senior: diseñar migraciones, razonar sobre el modelo de contexto/hilos y sincronizar con un
      backend (offline-first — véase Arquitectura).</div>`,
  },
  {
    id: "st-8",
    num: "08",
    title: "08 · Navegación y Estructura de la App",
    html: `<p><b>Qué es.</b> El punto de entrada de una app es un <code>struct</code> que cumple con <code>App</code>
      con <code>@main</code>, componiendo <code>Scene</code>s (usualmente un <code>WindowGroup</code>). Para la
      navegación, <code>NavigationStack</code> con <code>navigationDestination</code> reemplazó al antiguo
      <code>NavigationView</code> y habilita la <b>navegación programática basada en valores</b>: vincule un
      array <code>path</code> y haga push/pop mutándolo. <code>TabView</code> maneja las secciones de nivel
      superior, y los deep links mapean un URL sobre esa ruta.</p>
    <div class="code">@main
struct MyApp: App {
  var body: some Scene { WindowGroup { RootView() } }
}

struct RootView: View {
  @State private var path: [Route] = []
  var body: some View {
    NavigationStack(path: $path) {
      HomeView()
        .navigationDestination(for: Route.self) { route in
          DetailView(route: route)
        }
    }
  }
}</div>
    <div class="callout tip"><span class="lbl">Argumento</span> La navegación basada en valores hace que el deep
      linking y la restauración de estado sean sencillos: un URL o notificación push se descodifica en valores
      <code>Route</code> que se agregan a <code>path</code>. Ese es el encuadre senior — navegación como
      datos.</div>`,
  },
  {
    id: "st-9",
    num: "09",
    title: "09 · Rendimiento e Instruments",
    html: `<p><b>Qué es.</b> El trabajo de rendimiento se trata principalmente de hacer <i>menos</i>: menos
      re-renders, menos asignaciones, menos trabajo en el hilo principal. En SwiftUI eso significa mantener
      <code>body</code> ligero y puro (sin cálculos pesados, sin efectos secundarios), dar a las vistas identidad
      estable, usar <code>LazyVStack</code>/<code>LazyHStack</code> y <code>List</code> para contenido largo, y
      dejar que el framework de Observación re-renderice solo las vistas que leen una propiedad modificada.</p>
    <p>Mida con <b>Instruments</b>: <b>Time Profiler</b> para puntos calientes de CPU,
      <b>Allocations</b>/<b>Leaks</b> para memoria y retain cycles, el instrumento <b>SwiftUI</b> para conteo de
      view-body, y <b>Hangs</b> para bloqueos del hilo principal. Regla uno: perfile antes de optimizar — las
      suposiciones suelen estar equivocadas.</p>
    <div class="callout warn"><span class="lbl">Errores comunes</span> Descodificar u ordenar dentro de
      <code>body</code>; cargar imágenes de resolución completa en miniaturas pequeñas (reduzca la resolución
      primero); retain cycles de closures que capturan <code>self</code>; y bloquear el actor principal con E/S
      síncrona.</div>
    <div class="callout tip"><span class="lbl">Nivel</span> Senior: leer un trace de Instruments, encontrar el
      punto caliente y explicar la solución. Arquitecto: establecer presupuestos de rendimiento (lanzamiento en
      frío, scroll, memoria) y conectarlos a CI y observabilidad.</div>`,
  },
  {
    id: "st-10",
    num: "10",
    title: "10 · Pruebas",
    html: `<p><b>Qué es.</b> Hoy se shippean dos frameworks de pruebas unitarias: el establecido <b>XCTest</b> y el
      más nuevo <b>Swift Testing</b> (funciones <code>@Test</code> con macros <code>#expect</code>/<code>#require</code>,
      pruebas parametrizadas y soporte asíncrono), introducido con Xcode 16. Los flujos de UI se cubren con
      <b>XCUITest</b>. Lo que las entrevistas sondean es la <i>testeabilidad</i>: inyecte dependencias detrás de
      protocolos para poder sustituir fakes, y mantenga la lógica en view models en lugar de vistas.</p>
    <div class="code">import Testing

@Test func totalsAreSummed() {
  let cart = Cart(items: [2, 3])
  #expect(cart.total == 5)
}

@Test func loadsUser() async throws {
  let client = MockAPIClient(user: .stub)
  let model = ProfileModel(api: client)
  try await model.load()
  #expect(model.user?.id == 1)
}</div>
    <div class="callout tip"><span class="lbl">Argumento</span> &quot;Dependo de un protocolo
      <code>APIClient</code>, no de <code>URLSession</code>, por lo que el view model toma un mock en pruebas y
      se ejecuta sin red.&quot; Esa una oración señala que usted diseña para testeabilidad.</div>`,
  },
  {
    id: "st-11",
    num: "11",
    title: "11 · Dependencias y Swift Package Manager",
    html: `<p><b>Qué es.</b> <b>Swift Package Manager (SPM)</b> es la forma nativa de agregar dependencias y —
      igualmente importante — de <b>modularizar su propia app</b> en paquetes locales. Un manifiesto
      <code>Package.swift</code> declara targets (código) y productos (lo que expone). Dividir una funcionalidad en
      su propio paquete fuerza límites, acelera compilaciones incrementales y permite que las funcionalidades se
      prueben de forma aislada. CocoaPods y Carthage todavía existen en proyectos legacy, pero SPM es el
      predeterminado para trabajo nuevo.</p>
    <div class="code">// Package.swift
let package = Package(
  name: "Feature",
  products: [.library(name: "Feature", targets: ["Feature"])],
  dependencies: [],
  targets: [
    .target(name: "Feature"),
    .testTarget(name: "FeatureTests", dependencies: ["Feature"]),
  ]
)</div>
    <div class="callout tip"><span class="lbl">Perspectiva de Arquitecto</span> Los paquetes locales son la forma
      más barata de obtener arquitectura modular: una dirección de dependencia clara, sin importaciones accidentales
      entre funcionalidades y compilación en paralelo. Esta es una respuesta recurrente de diseño de sistemas
      (véase Arquitectura).</div>`,
  },
  {
    id: "st-12",
    num: "12",
    title: "12 · CI/CD y Lanzamiento",
    html: `<p><b>Qué es.</b> Un pipeline repetible que construye, prueba, firma y distribuye cada cambio.
      <b>Xcode Cloud</b> es el CI alojado de Apple integrado con App Store Connect; <b>Fastlane</b> es el
      estándar de automatización multiplataforma (y se ejecuta en GitHub Actions, etc.). La parte que complica a
      todos es el <b>firma de código</b>: los certificados identifican al equipo, los provisioning profiles vinculan
      un app id + dispositivos + certificado juntos. El firmado automático maneja el caso común; los equipos
      suelen gestionarlo explícitamente (por ejemplo, Fastlane <i>match</i>) para credenciales compartidas y
      reproducibles.</p>
    <div class="code"># Fastlane: build & ship a TestFlight beta
lane :beta do
  increment_build_number
  build_app(scheme: "App")
  upload_to_testflight
end</div>
    <div class="callout tip"><span class="lbl">Argumento</span> Distinga la <b>versión</b> (marketing,
      <code>CFBundleShortVersionString</code>) del <b>número de build</b> (<code>CFBundleVersion</code>, debe
      incrementarse por carga). Respuesta senior: los PR ejecutan pruebas unitarias + de UI en CI; merges a main
      envían automáticamente un build de TestFlight; los lanzamientos se promueven con un phased rollout.</div>`,
  },
  {
    id: "st-13",
    num: "13",
    title: "13 · Revisión de App Store y Distribución",
    html: `<p><b>Qué es.</b> El lanzamiento se realiza a través de <b>App Store Connect</b>: cargue un build,
      complete los metadatos y capturas de pantalla, complete <b>App Privacy</b> (la &quot;etiqueta de nutrición&quot;
      de privacidad) y envíe para <b>revisión</b> según las App Store Review Guidelines. Las pruebas beta se
      realizan a través de <b>TestFlight</b>. Conozca las razones de rechazo comunes para poder evitarlas:
      funcionalidad rota/incompleta, problemas de privacidad (cadenas de descripción de uso faltantes,
      recopilación de datos no revelada), metadatos engañosos y uso de APIs privadas.</p>
    <ul>
      <li><b>Phased release</b> implementa una actualización a un % creciente de usuarios durante ~7 días — pause si las tasas de crash aumentan.</li>
      <li>Los <b>privacy manifests</b> y las APIs de razón requerida deben declararse (véase Seguridad, tema 14).</li>
      <li><b>StoreKit</b> maneja las compras en app y suscripciones; Apple requiere IAP para bienes digitales.</li>
    </ul>
    <div class="callout warn"><span class="lbl">Realidad</span> La revisión son principalmente verificaciones
      automáticas más un pase humano; la mayoría de rechazos se pueden evitar con metadatos completos, respuestas
      honestas de privacidad y un build que no falle en el primer lanzamiento. Use TestFlight para atrapar lo
      obvio primero.</div>`,
  },
  {
    id: "st-14",
    num: "14",
    title: "14 · Seguridad y Privacidad",
    html: `<p><b>Qué es.</b> Almacene secretos en el <b>Keychain</b> (cifrado, respaldado por hardware), nunca en
      <code>UserDefaults</code>. Proteja flujos sensibles con <b>biometría</b> a través del framework
      LocalAuthentication (Face ID / Touch ID). Mantenga <b>App Transport Security</b> (solo HTTPS) activado.
      Use clases de <b>protección de datos</b> para que los archivos estén cifrados en reposo cuando el
      dispositivo esté bloqueado. Respete la privacidad: declare un <b>privacy manifest</b>
      (<code>PrivacyInfo.xcprivacy</code>) y el uso de APIs de razón requerida, y solicite permiso de rastreo
      a través de <b>App Tracking Transparency</b> antes de usar el IDFA.</p>
    <div class="code">import LocalAuthentication

func authenticate() async -&gt; Bool {
  let ctx = LAContext()
  guard ctx.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)
  else { return false }
  return (try? await ctx.evaluatePolicy(
    .deviceOwnerAuthenticationWithBiometrics,
    localizedReason: "Unlock your vault")) ?? false
}</div>
    <div class="callout tip"><span class="lbl">Nivel</span> Senior: Keychain, biometría, ATS y privacy manifests
      son lo esperado. Arquitecto: posea la postura de privacidad de la app — minimización de datos, procesamiento
      en el dispositivo (véase tema 15) y una respuesta defendible a &quot;qué datos salen del dispositivo y
      por qué&quot;.</div>`,
  },
  {
    id: "st-15",
    num: "15",
    title: "15 · IA en el Dispositivo y Machine Learning",
    html: `<p><b>Qué es.</b> La ML de Apple se ejecuta <i>en el dispositivo</i> por privacidad, baja latencia y uso
      sin conexión, acelerada por el Neural Engine. La caja de herramientas: <b>Core ML</b> (ejecutar modelos
      entrenados), <b>Create ML</b> (entrenar sin salir de Swift) y frameworks de tareas — <b>Vision</b>
      (imágenes), <b>Natural Language</b> (texto), <b>Speech</b> (transcripción) y <b>Sound Analysis</b>.
      <b>Apple Intelligence</b> lleva esto más lejos con funciones generativas a nivel de sistema y modelos
      fundamentales en el dispositivo. Convierta modelos de terceros a Core ML con <code>coremltools</code>, y
      optimice (cuantice, poda) para ajustar a presupuestos de memoria y latencia.</p>
    <div class="code">import Vision

func detectText(in image: CGImage) async throws -&gt; [String] {
  let request = VNRecognizeTextRequest()
  request.recognitionLevel = .accurate
  let handler = VNImageRequestHandler(cgImage: image)
  try handler.perform([request])
  return request.results?.compactMap {
    $0.topCandidates(1).first?.string
  } ?? []
}</div>
    <div class="callout tip"><span class="lbl">Encuadre de frontera</span> &quot;Ejecute inferencia en el
      dispositivo cuando pueda — es privado, funciona sin conexión y no tiene costo por llamada; vuelva a un
      modelo de servidor solo cuando la tarea exceda la capacidad del dispositivo.&quot; La propia búsqueda de
      esta guía ejecuta un pequeño modelo de incrustación en su navegador como demostración
      funcional.</div>`,
  },
];
