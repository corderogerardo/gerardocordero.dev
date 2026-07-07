import type { Level } from "@/lib/levels";

export type Flashcard = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  answerHtml: string;
  /** Optional seniority level; defaults are derived per-category in lib/levels. */
  level?: Level;
};

export const FLASHCARD_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "swift", label: "Lenguaje Swift" },
  { value: "swiftui", label: "SwiftUI" },
  { value: "uikit", label: "UIKit" },
  { value: "concurrencia", label: "Concurrencia" },
  { value: "arch", label: "Arquitectura" },
  { value: "data", label: "Datos y Red" },
  { value: "perf", label: "Rendimiento" },
  { value: "test", label: "Pruebas" },
  { value: "cicd", label: "CI/CD y Herramientas" },
  { value: "appstore", label: "App Store" },
  { value: "security", label: "Seguridad" },
  { value: "ai", label: "IA en el Dispositivo" },
];

export const FLASHCARDS: Flashcard[] = [
  {
    id: "q1",
    category: "swift",
    categoryLabel: "Lenguaje Swift",
    question: "Struct vs class — ¿cuál es la diferencia fundamental y cuándo se elige cada uno?",
    answerHtml: `<p>Los structs son <b>tipos por valor</b> (se copian al asignar, sin identidad compartida); las clases son
      <b>tipos por referencia</b> (compartidas, con identidad, gestionadas por ARC). Por defecto, use
      <code>struct</code> para modelos y vistas SwiftUI; use <code>class</code> cuando necesite estado mutable
      compartido, identidad, herencia o semántica de referencia (por ejemplo, un modelo
      <code>@Observable</code>).</p>`,
    level: "junior",
  },
  {
    id: "q2",
    category: "swift",
    categoryLabel: "Lenguaje Swift",
    question: "¿Cómo se trabaja de forma segura con optionals?",
    answerHtml: `<p>Desenvuelva con <code>if let</code> / <code>guard let</code>, proporcione valores por defecto con
      <code>??</code>, y encadene con <code>?.</code>. Evite la desenvoltura forzada con <code>!</code> excepto
      cuando un <code>nil</code> sea realmente un error del programador.
      <code>guard let … else { return }</code> mantiene el camino feliz sin sangría adicional.</p>`,
    level: "junior",
  },
  {
    id: "q3",
    category: "swift",
    categoryLabel: "Lenguaje Swift",
    question: "¿Qué es copy-on-write y por qué es importante para los tipos por valor?",
    answerHtml: `<p>Las colecciones estándar de Swift (Array, Dictionary, Set, String) comparten almacenamiento hasta que
      una copia es mutada, momento en que se copian de forma perezosa. Así que pasar un <code>Array</code> es
      barato hasta que escribe en una segunda referencia. Esto proporciona semántica de valor sin pagar una copia
      en cada asignación.</p>`,
    level: "mid",
  },
  {
    id: "q4",
    category: "swift",
    categoryLabel: "Lenguaje Swift",
    question: "strong vs weak vs unowned — ¿y qué es un retain cycle?",
    answerHtml: `<p>Un retain cycle es cuando dos tipos de referencia se mantienen fuertemente el uno al otro, de modo que
      ninguno se libera nunca. Rompalo con <code>weak</code> (se vuelve <code>nil</code> cuando el objetivo se
      desasigna — use cuando la referencia pueda sobrevivir) o <code>unowned</code> (asume que el objetivo
      sobrevive — sin optional, pero falla si está mal). Caso clásico: <code>[weak self]</code> en un closure
      que escapa.</p>`,
    level: "mid",
  },
  {
    id: "q5",
    category: "swift",
    categoryLabel: "Lenguaje Swift",
    question: "¿Qué es la programación orientada a protocolos en Swift?",
    answerHtml: `<p>Diseñar alrededor de <b>protocolos</b> (con implementaciones predeterminadas mediante extensiones) en
      lugar de herencia de clases. Usted compone comportamiento a partir de pequeños protocolos, obtiene
      polimorfismo sin una clase base y mantiene los tipos por valor. Es la alternativa idiomática de Swift a las
      jerarquías de clases profundas.</p>`,
  },
  {
    id: "q6",
    category: "swift",
    categoryLabel: "Lenguaje Swift",
    question: "¿Qué proporcionan los enums con valores asociados?",
    answerHtml: `<p>Modelan <b>estados mutualmente excluyentes que llevan datos</b> — por ejemplo,
      <code>enum Load { case idle; case loading; case loaded([Item]); case failed(Error) }</code>. Combinados con
      un <code>switch</code>, el compilador le obliga a manejar cada caso, eliminando estados imposibles.</p>`,
    level: "mid",
  },
  {
    id: "q7",
    category: "swift",
    categoryLabel: "Lenguaje Swift",
    question: "¿Qué son los property wrappers? Nombre algunos que use.",
    answerHtml: `<p>Comportamiento reutilizable para propiedades, definido una vez y aplicado con <code>@</code>. SwiftUI
      se construye sobre ellos: <code>@State</code>, <code>@Binding</code>, <code>@Environment</code>,
      <code>@Bindable</code>, <code>@Query</code>. Puede escribir los suyos (por ejemplo, un wrapper
      <code>@UserDefault</code>).</p>`,
  },
  {
    id: "q8",
    category: "swift",
    categoryLabel: "Lenguaje Swift",
    question: "¿Qué cambió con Swift 6?",
    answerHtml: `<p>Swift 6 habilita la <b>seguridad completa contra carreras de datos en tiempo de compilación</b>: el
      compilador verifica el aislamiento de actors y que los valores que cruzan límites de concurrencia sean
      <code>Sendable</code>. Es opcional mediante el modo de lenguaje para que pueda migrar incrementalmente.
      El efecto práximo: muchos errores de concurrencia se convierten en errores de compilación en lugar de
      fallos en tiempo de ejecución.</p>`,
    level: "senior",
  },
  {
    id: "q9",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "¿Qué significa &quot;UI declarativa&quot; en SwiftUI?",
    answerHtml: `<p>Describe la UI como una función del estado (<code>body</code> retorna vistas para el estado actual);
      SwiftUI diff y actualiza la pantalla cuando el estado cambia. No muta las vistas imperativamente como en
      UIKit — cambia el estado y deja que el framework reconcile.</p>`,
    level: "junior",
  },
  {
    id: "q10",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "¿Por qué importa el orden de los modificadores?",
    answerHtml: `<p>Cada modificador envuelve la vista a la que se aplica, por lo que la cadena se construye hacia afuera.
      <code>.padding().background(.red)</code> primero agrega padding y luego colorea el área con padding; en
      orden inverso, el fondo se ajusta al contenido y el padding queda afuera. El orden cambia el resultado.</p>`,
    level: "junior",
  },
  {
    id: "q11",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "@State vs @Binding vs @Observable — ¿quién posee qué?",
    answerHtml: `<p><code>@State</code> = estado <i>poseído</i> por esta vista. <code>@Binding</code> = una referencia
      bidireccional al estado poseído en otro lugar. <code>@Observable</code> = un modelo de tipo referencia que
      las vistas observan; posealo con <code>@State</code> y vincule con <code>@Bindable</code>. Una única fuente
      de verdad, pasada hacia abajo como bindings.</p>`,
    level: "mid",
  },
  {
    id: "q12",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "¿Cómo mejora el framework de Observación (@Observable) sobre ObservableObject?",
    answerHtml: `<p>Rastrea las lecturas a nivel de <b>propiedad</b>, por lo que solo las vistas que realmente leen una
      propiedad modificada se vuelven a renderizar. <code>ObservableObject</code>/<code>@Published</code>
      invalidaba <i>todos</i> los observadores del objeto. <code>@Observable</code> (iOS 17+) requiere menos
      código boilerplate y es más eficiente.</p>`,
    level: "mid",
  },
  {
    id: "q13",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "¿Por qué los elementos de ForEach deben tener una identidad estable?",
    answerHtml: `<p>SwiftUI vincula el estado y las animaciones de las vistas a la identidad. Usar el <i>índice</i> del
      array como <code>id</code> reasigna el estado al elemento incorrecto cuando la lista se reordena o los
      elementos se insertan/eliminan. Use un id estable real (haga que el modelo cumpla con
      <code>Identifiable</code>).</p>`,
    level: "mid",
  },
  {
    id: "q14",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "¿Cuándo debe usar LazyVStack en lugar de VStack?",
    answerHtml: `<p><code>VStack</code> construye todos los hijos inmediatamente; <code>LazyVStack</code> (dentro de un
      <code>ScrollView</code>) solo crea vistas cuando se desplazan a la vista. Use stacks perezosos (o
      <code>List</code>) para contenido largo o ilimitado para reducir el costo de memoria y layout.</p>`,
    level: "mid",
  },
  {
    id: "q15",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "¿Para qué sirve el property wrapper @Environment?",
    answerHtml: `<p>Lee valores inyectados en el árbol de vistas — valores del sistema (<code>colorScheme</code>,
      <code>dismiss</code>, <code>modelContext</code>) o los propios mediante <code>environment(_:)</code>. Es la
      inyección de dependencias incorporada de SwiftUI: establezca una vez arriba, lea en cualquier lugar
      abajo.</p>`,
  },
  {
    id: "q16",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "¿Cómo anima un cambio de estado en SwiftUI?",
    answerHtml: `<p>Envuelva la mutación del estado en <code>withAnimation { … }</code>, o adjunte
      <code>.animation(_:value:)</code> a una vista para que se anime cuando ese valor cambie. SwiftUI interpola
      automáticamente entre los estados antes/después.</p>`,
    level: "junior",
  },
  {
    id: "q17",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "Describa el ciclo de vida de UIViewController.",
    answerHtml: `<p><code>loadView → viewDidLoad</code> (una vez, configure las subvistas) →
      <code>viewWillAppear → viewDidAppear</code> (cada vez que se muestra) →
      <code>viewWillDisappear → viewDidDisappear</code>. Haga la configuración de una vez en
      <code>viewDidLoad</code>; refresque datos en <code>viewWillAppear</code>.</p>`,
    level: "mid",
  },
  {
    id: "q18",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "¿Cómo incrusta una vista SwiftUI en UIKit y viceversa?",
    answerHtml: `<p>SwiftUI dentro de UIKit: envuelva en un <code>UIHostingController</code> y agréguelo como hijo VC.
      UIKit dentro de SwiftUI: cumpla con <code>UIViewRepresentable</code> /
      <code>UIViewControllerRepresentable</code> e implemente <code>makeUIView</code>/<code>updateUIView</code>
      (más un Coordinator para delegados).</p>`,
    level: "mid",
  },
  {
    id: "q19",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "¿Qué problema resuelven los diffable data sources?",
    answerHtml: `<p>Sustituyen la gestión manual de <code>insertRows</code>/<code>deleteRows</code> para
      table/collection views. Aplica una <b>snapshot</b> de secciones + elementos y UIKit calcula y anima
      la diferencia — mucho menos errores de inconsistencia en &quot;number of rows&quot;.</p>`,
    level: "senior",
  },
  {
    id: "q20",
    category: "uikit",
    categoryLabel: "UIKit",
    question: "¿Cuándo todavía debería usar UIKit en una app de SwiftUI?",
    answerHtml: `<p>Para APIs que SwiftUI no expone completamente o donde necesita control fino: entrada de texto
      compleja, ciertas vistas de cámara/AVFoundation, layouts avanzados de collection, control preciso de
      scroll, o integración incremental de una base de código UIKit existente grande.</p>`,
  },
  {
    id: "q21",
    category: "concurrencia",
    categoryLabel: "Concurrencia",
    question: "¿Qué hace async/await realmente bajo el capó?",
    answerHtml: `<p>Un <code>await</code> puede <b>suspender</b> la función y liberar el hilo hasta que el trabajo
      esperado se complete, y luego reanudar — sin bloquear. Es programación cooperativa en un pool de hilos,
      por lo que obtiene concurrencia sin gestionar hilos manualmente ni anidar completion handlers.</p>`,
    level: "mid",
  },
  {
    id: "q22",
    category: "concurrencia",
    categoryLabel: "Concurrencia",
    question: "¿Qué es la concurrencia estructurada (async let, task groups)?",
    answerHtml: `<p>Las tareas hijas tienen un ámbito definido vinculado a su padre: con <code>async let</code> o un
      <code>TaskGroup</code>, los hijos se ejecutan concurrentemente y se <b>esperan (y cancelan) juntos</b>. Sin
      trabajo huérfano — cuando el ámbito se sale, los hijos están hechos o cancelados.</p>`,
    level: "senior",
  },
  {
    id: "q23",
    category: "concurrencia",
    categoryLabel: "Concurrencia",
    question: "¿Qué es un actor y qué problema resuelve?",
    answerHtml: `<p>Un <code>actor</code> es un tipo de referencia que <b>serializa el acceso a su estado mutable</b>,
      de modo que los llamadores concurrentes no puedan competir. Usted <code>await</code> sus métodos desde
      afuera. Reemplaza los locks/colas manuales para proteger el estado compartido (por ejemplo, una
      caché).</p>`,
    level: "senior",
  },
  {
    id: "q24",
    category: "concurrencia",
    categoryLabel: "Concurrencia",
    question: "¿Qué significa @MainActor?",
    answerHtml: `<p>Ancle un tipo o función al <b>hilo principal</b>. El trabajo de UI debe estar en el actor
      principal; anote los view models con <code>@MainActor</code> para que sus actualizaciones de estado sean
      seguras para el hilo principal por defecto, en lugar de esparcir <code>DispatchQueue.main.async</code>.</p>`,
    level: "mid",
  },
  {
    id: "q25",
    category: "concurrencia",
    categoryLabel: "Concurrencia",
    question: "¿Qué es Sendable?",
    answerHtml: `<p>Un protocolo de marcado que significa que un valor es <b>seguro para pasar a través de límites de
      concurrencia</b>. Los tipos por valor con miembros Sendable son Sendable; los tipos de referencia generalmente
      no lo son a menos que sean inmutables o estén protegidos de otra manera. Swift 6 lo aplica en tiempo de
      compilación, atrapando carreras de datos temprano.</p>`,
    level: "senior",
  },
  {
    id: "q26",
    category: "concurrencia",
    categoryLabel: "Concurrencia",
    question: "¿Cómo conecta una API basada en completion-handler con async/await?",
    answerHtml: `<p>Envuélvala con <code>withCheckedContinuation</code> (o
      <code>withCheckedThrowingContinuation</code>): llame a la API antigua y luego <code>resume</code> la
      continuación exactamente una vez con el resultado o error. Resumir cero o múltiples veces es un error que
      la variante checked detecta.</p>`,
    level: "senior",
  },
  {
    id: "q27",
    category: "concurrencia",
    categoryLabel: "Concurrencia",
    question: "¿Cómo funciona la cancelación de tareas?",
    answerHtml: `<p>La cancelación es <b>cooperativa</b>: cancelar un <code>Task</code> establece una bandera; su código
      debe verificarla (<code>Task.isCancelled</code> o <code>try Task.checkCancellation()</code>) y detenerse.
      Muchas llamadas asíncronas de la biblioteca estándar lanzan <code>CancellationError</code> al await. Los
      hijos estructurados se cancelan con su padre.</p>`,
    level: "senior",
  },
  {
    id: "q28",
    category: "arch",
    categoryLabel: "Arquitectura",
    question: "¿Cómo se ve MVVM en SwiftUI?",
    answerHtml: `<p>La Vista renderiza el estado y reenvía la intención del usuario; un ViewModel <code>@Observable</code>
      mantiene el estado de presentación y la lógica, y habla con servicios/repositorios. La Vista permanece delgada
      y el ViewModel es testeable sin UI. El flujo de datos de SwiftUI hace esto natural.</p>`,
    level: "mid",
  },
  {
    id: "q29",
    category: "arch",
    categoryLabel: "Arquitectura",
    question: "¿Por qué modularizar una app en paquetes Swift?",
    answerHtml: `<p>Compilaciones incrementales y paralelas más rápidas, límites forzados (las funciones no pueden importarse
      entre sí), pruebas y previews aislados, y una propiedad más clara. Es la decisión estructural de mayor
      impacto en un código iOS grande — un &quot;monolito modular&quot;.</p>`,
    level: "architect",
  },
  {
    id: "q30",
    category: "arch",
    categoryLabel: "Arquitectura",
    question: "¿Cómo hace que un view model sea testeable?",
    answerHtml: `<p>Dependa de <b>protocolos</b> e inyectelos (inyección por initializer o <code>@Environment</code>) en
      lugar de construir singletons/<code>URLSession</code> internamente. En pruebas pasa un fake; en previews un
      stub. Sin red, resultados deterministas.</p>`,
    level: "senior",
  },
  {
    id: "q31",
    category: "arch",
    categoryLabel: "Arquitectura",
    question: "¿Qué es el patrón Repository y por qué usarlo?",
    answerHtml: `<p>Un repository se sitúa entre la UI y las fuentes de datos (red + almacenamiento local). Los view models
      le piden modelos de dominio; él se encarga del descodificado, la caché y la decisión de fresco vs en caché.
      Beneficios: una fuente de verdad, una separación limpia para pruebas y un lugar para reintentos/auth/
      paginación.</p>`,
    level: "senior",
  },
  {
    id: "q32",
    category: "data",
    categoryLabel: "Datos y Red",
    question: "¿Qué es Codable y cómo mapea claves JSON que no coinciden?",
    answerHtml: `<p><code>Codable = Encodable & Decodable</code> — mapeo automático JSON↔tipo. Renombre campos
      con un enum <code>CodingKeys</code>, o establezca
      <code>decoder.keyDecodingStrategy = .convertFromSnakeCase</code>. Fechas personalizadas mediante
      <code>dateDecodingStrategy</code>.</p>`,
    level: "junior",
  },
  {
    id: "q33",
    category: "data",
    categoryLabel: "Datos y Red",
    question: "¿Cómo obtiene datos con URLSession moderno?",
    answerHtml: `<p><code>let (data, response) = try await URLSession.shared.data(from: url)</code>, verifique el
      estado <code>HTTPURLResponse</code>, luego <code>JSONDecoder().decode(...)</code>. Sin completion handlers,
      sin saltos manuales de hilo — es asíncrono y cancelable.</p>`,
    level: "junior",
  },
  {
    id: "q34",
    category: "data",
    categoryLabel: "Datos y Red",
    question: "SwiftData vs Core Data — ¿cuándo usar cada uno?",
    answerHtml: `<p>SwiftData (iOS 17+) es la capa moderna, nativa de Swift: clases <code>@Model</code>,
      <code>@Query</code>, menos código boilerplate. Core Data es más antiguo pero más poderoso para migraciones
      complejas, control fino y objetivos de despliegue más antiguos. SwiftData se construye sobre Core Data bajo
      el capó.</p>`,
    level: "mid",
  },
  {
    id: "q35",
    category: "data",
    categoryLabel: "Datos y Red",
    question: "¿Dónde debe almacenar un token de autenticación?",
    answerHtml: `<p>En el <b>Keychain</b> — está cifrado y respaldado por hardware. Nunca en <code>UserDefaults</code>
      (un plist sin cifrar). UserDefaults es solo para preferencias pequeñas no sensibles.</p>`,
    level: "mid",
  },
  {
    id: "q36",
    category: "data",
    categoryLabel: "Datos y Red",
    question: "¿Cómo diseña una app offline-first?",
    answerHtml: `<p>Haga del <b>almacenamiento local la fuente de verdad</b>: la UI lee de SwiftData/Core Data y
      un motor de sincronización en segundo plano reconcilia con el servidor. Cola mutaciones (idempotentes),
      reintente al reconectar y defina una política de resolución de conflictos (último escritor gana, servidor
      autoritativo, o fusión por campo).</p>`,
    level: "architect",
  },
  {
    id: "q37",
    category: "perf",
    categoryLabel: "Rendimiento",
    question: "¿Cuál es la primera regla de la optimización y qué herramienta usar?",
    answerHtml: `<p><b>Mida primero</b> — las suposiciones suelen estar equivocadas. Use <b>Instruments</b>: Time Profiler
      para CPU, Allocations/Leaks para memoria, el instrumento SwiftUI para conteo de view-body, y Hangs para
      bloqueos del hilo principal. Encuentre el punto caliente, luego corríjalo.</p>`,
    level: "senior",
  },
  {
    id: "q38",
    category: "perf",
    categoryLabel: "Rendimiento",
    question: "¿Por qué una lista de SwiftUI puede tener mal scroll y cómo se arregla?",
    answerHtml: `<p>Normalmente es trabajo costoso en <code>body</code> (descodificación, ordenamiento) o imágenes de
      resolución completa en celdas pequeñas. Solución: mantenga <code>body</code> ligero y puro, reduzca la
      resolución de imágenes fuera del actor principal y cacheelas, use <code>List</code>/<code>LazyVStack</code>,
      y dé a las filas identidad estable para que las vistas se reutilicen.</p>`,
    level: "senior",
  },
  {
    id: "q39",
    category: "perf",
    categoryLabel: "Rendimiento",
    question: "¿Cómo encuentra y corrige una fuga de memoria?",
    answerHtml: `<p>Use los instrumentos Leaks/Allocations (o el depurador Memory Graph) para detectar objetos que
      nunca se desasignan — normalmente un <b>retain cycle</b>. Corrija haciendo una referencia
      <code>weak</code>/<code>unowned</code>, comúnmente <code>[weak self]</code> en un closure que
      escapa.</p>`,
    level: "senior",
  },
  {
    id: "q40",
    category: "perf",
    categoryLabel: "Rendimiento",
    question: "¿Qué ralentiza el lanzamiento de la app y cómo se mejora?",
    answerHtml: `<p>Trabajo pesado en el hilo principal al iniciar, demasiada inicialización ansiosa, cargas grandes de
      recursos. Diferir la configuración no esencial, carga perezosa, mover el trabajo fuera del actor principal,
      y medir el lanzamiento en frío con el instrumento App Launch. Establezca un presupuesto de tiempo de
      lanzamiento y monitoreelo en CI.</p>`,
    level: "senior",
  },
  {
    id: "q41",
    category: "test",
    categoryLabel: "Pruebas",
    question: "¿XCTest vs Swift Testing?",
    answerHtml: `<p>XCTest es el framework establecido (<code>XCTAssert</code>, <code>setUp/tearDown</code>).
      Swift Testing (Xcode 16+) es el moderno: funciones <code>@Test</code>, macros <code>#expect</code>/
      <code>#require</code>, pruebas parametrizadas incorporadas y soporte asíncrono limpio. Los proyectos nuevos
      favorecen Swift Testing; ambos coexisten.</p>`,
    level: "mid",
  },
  {
    id: "q42",
    category: "test",
    categoryLabel: "Pruebas",
    question: "¿Cómo prueba código que hace llamadas de red?",
    answerHtml: `<p>No golpee la red. Dependa de un protocolo <code>APIClient</code> e inyecte un mock que
      retorne respuestas predefinidas (o un stub <code>URLProtocol</code>). El view model se ejecuta
      determinísticamente y sin conexión. Por eso importa la inyección de dependencias.</p>`,
    level: "mid",
  },
  {
    id: "q43",
    category: "test",
    categoryLabel: "Pruebas",
    question: "¿Qué va en una prueba de UI vs una prueba unitaria?",
    answerHtml: `<p>Las pruebas unitarias cubren lógica (view models, parsing, reglas de negocio) — rápidas y numerosas.
      Las pruebas de UI (XCUITest) cubren algunos flujos críticos de extremo a extremo (login, checkout) — más
      lentas y frágiles, así que mantenlas enfocadas. Empuje la lógica a unidades testeables para que las pruebas
      de UI permanezcan delgadas.</p>`,
  },
  {
    id: "q44",
    category: "cicd",
    categoryLabel: "CI/CD y Herramientas",
    question: "¿Xcode Cloud vs Fastlane?",
    answerHtml: `<p>Xcode Cloud es el CI alojado de Apple, estrechamente integrado con App Store Connect y el firmado —
      configuración baja. Fastlane es el estándar de automatización multiplataforma (lanes para build/test/ship)
      que se ejecuta en cualquier CI como GitHub Actions y ofrece más control. Los equipos suelen usar uno o
      ambos.</p>`,
    level: "senior",
  },
  {
    id: "q45",
    category: "cicd",
    categoryLabel: "CI/CD y Herramientas",
    question: "Explique el firmado de código: certificados vs provisioning profiles.",
    answerHtml: `<p>Un <b>certificado</b> identifica al desarrollador/equipo (identidad de firmado). Un
      <b>provisioning profile</b> vincula un App ID, dispositivos permitidos y un certificado para autorizar un
      build para ejecución/distribución. El firmado automático maneja los casos comunes; Fastlane <i>match</i>
      los comparte de forma reproducible en un equipo.</p>`,
    level: "senior",
  },
  {
    id: "q46",
    category: "cicd",
    categoryLabel: "CI/CD y Herramientas",
    question: "¿Cadena de versión vs número de build?",
    answerHtml: `<p><b>Versión</b> (<code>CFBundleShortVersionString</code>, por ejemplo 2.3.0) es la versión de
      marketing que los usuarios ven. El <b>número de build</b> (<code>CFBundleVersion</code>) debe incrementarse
      con cada carga a App Store Connect, incluso para la misma versión. El CI generalmente autoincrementa el
      número de build.</p>`,
    level: "mid",
  },
  {
    id: "q47",
    category: "appstore",
    categoryLabel: "App Store",
    question: "¿Cuáles son las rechazos comunes en la revisión de App Store?",
    answerHtml: `<p>Crashes/funciones incompletas, problemas de privacidad (cadenas de descripción de uso faltantes,
      recopilación de datos no revelada), metadatos o capturas de pantalla engañosos, uso de APIs privadas y
      enlaces rotos. La mayoría se pueden evitar con metadatos completos, respuestas honestas de App Privacy y
      pruebas con TestFlight primero.</p>`,
    level: "senior",
  },
  {
    id: "q48",
    category: "appstore",
    categoryLabel: "App Store",
    question: "¿Qué es una phased release?",
    answerHtml: `<p>Una implementación gradual automática de una actualización de App Store a un porcentaje creciente de
      usuarios durante aproximadamente 7 días. Si las tasas de crash aumentan, puede pausarla y enviar una corrección
      antes de que todos se actualicen. Combínela con monitoreo de crashes y una bandera de apagado.</p>`,
    level: "senior",
  },
  {
    id: "q49",
    category: "appstore",
    categoryLabel: "App Store",
    question: "¿Para qué sirve TestFlight?",
    answerHtml: `<p>La distribución beta de Apple: cargue un build e invite testers internos (equipo) o externos (hasta
      10,000) antes del lanzamiento en App Store. Realiza verificaciones ligeras de revisión y recopila
      comentarios y registros de crash — su última puerta antes de distribuir.</p>`,
    level: "mid",
  },
  {
    id: "q50",
    category: "security",
    categoryLabel: "Seguridad",
    question: "¿Cómo agrega Face ID / Touch ID a un flujo?",
    answerHtml: `<p>Use el framework LocalAuthentication: cree un <code>LAContext</code>, verifique
      <code>canEvaluatePolicy</code>, luego <code>evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, …)</code>.
      Siempre proporcione un respaldo (código de acceso) y un <code>localizedReason</code> claro.</p>`,
    level: "senior",
  },
  {
    id: "q51",
    category: "security",
    categoryLabel: "Seguridad",
    question: "¿Qué es App Transport Security (ATS)?",
    answerHtml: `<p>Una política que obliga a que las conexiones de red usen <b>HTTPS con TLS moderno</b> por defecto.
      HTTP en texto plano está bloqueado a menos que agregue una excepción (justificada, examinada por App Review)
      en <code>Info.plist</code>. Manténgalo activado.</p>`,
    level: "senior",
  },
  {
    id: "q52",
    category: "security",
    categoryLabel: "Seguridad",
    question: "¿Qué es un privacy manifest y por qué importa?",
    answerHtml: `<p>Un archivo <code>PrivacyInfo.xcprivacy</code> que declara los datos que su app (y SDK) recopila y
      las <b>APIs de razón requerida</b> que utiliza. Apple lo requiere para la submission y lo usa para construir
      la etiqueta de App Privacy. Los manifests faltantes o inexactos causan rechazos.</p>`,
    level: "senior",
  },
  {
    id: "q53",
    category: "ai",
    categoryLabel: "IA en el Dispositivo",
    question: "¿Por qué ejecutar ML en el dispositivo en lugar de en un servidor?",
    answerHtml: `<p><b>Privacidad</b> (los datos nunca salen del dispositivo), <b>latencia</b> (sin ida y vuelta),
      uso <b>sin conexión</b> y <b>sin costo por llamada</b>. El Neural Engine lo acelera. Vuelva a un servidor
      solo cuando la tarea exceda la capacidad del dispositivo.</p>`,
    level: "beyond",
  },
  {
    id: "q54",
    category: "ai",
    categoryLabel: "IA en el Dispositivo",
    question: "¿Qué es Core ML y cómo llegan los modelos allí?",
    answerHtml: `<p>Core ML ejecuta modelos entrenados en el dispositivo, optimizados para CPU/GPU/Neural Engine. Entrene
      con Create ML o convierta modelos PyTorch/TensorFlow usando <code>coremltools</code>, luego optimice
      (cuantice, poda) para ajustar a presupuestos de latencia y memoria.</p>`,
    level: "beyond",
  },
  {
    id: "q55",
    category: "ai",
    categoryLabel: "IA en el Dispositivo",
    question: "¿Qué frameworks cubren las tareas comunes de ML en el dispositivo?",
    answerHtml: `<p><b>Vision</b> para imágenes (detección, reconocimiento de texto), <b>Natural Language</b> para
      texto, <b>Speech</b> para transcripción y <b>Sound Analysis</b> para audio — todo en el dispositivo.
      <b>Apple Intelligence</b> agrega funciones generativas a nivel de sistema y modelos fundamentales en el
      dispositivo.</p>`,
    level: "beyond",
  },
];
