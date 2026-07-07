export type QuizQuestion = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  options: string[];
  answer: number;
  explanationHtml: string;
};

export const QUIZ_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "swift", label: "Lenguaje Swift" },
  { value: "swiftui", label: "SwiftUI" },
  { value: "concurrencia", label: "Concurrencia" },
  { value: "data", label: "Datos y Red" },
  { value: "arch", label: "Arquitectura" },
  { value: "perf", label: "Rendimiento" },
  { value: "cicd", label: "CI/CD y Herramientas" },
  { value: "security", label: "Seguridad" },
  { value: "appstore", label: "App Store" },
  { value: "ai", label: "IA en el Dispositivo" },
];

export const QUIZ: QuizQuestion[] = [
  {
    id: "z1",
    category: "swift",
    categoryLabel: "Lenguaje Swift",
    question: "Asigna un valor struct a una nueva variable y muta la copia. El original es:",
    options: ["También mutado (compartido)", "Sin cambios (semántica de valor)", "Establecido a nil", "Un error de compilación"],
    answer: 1,
    explanationHtml: `<p>Los structs son tipos por valor — la asignación copia. Mutar la copia deja el original
      intacto. Una clase se compartiría por referencia y cambiaría.</p>`,
  },
  {
    id: "z2",
    category: "swift",
    categoryLabel: "Lenguaje Swift",
    question: "¿Cuál es la forma más segura de manejar un valor que puede ser nil?",
    options: ["Desenvolver con !", "guard let / if let", "Asumir que está establecido", "Castear con as!"],
    answer: 1,
    explanationHtml: `<p><code>guard let</code> / <code>if let</code> desenvuelven de forma segura y le permiten manejar
      el caso nil. La desenvoltura forzada falla con nil y debe ser rara.</p>`,
  },
  {
    id: "z3",
    category: "swift",
    categoryLabel: "Lenguaje Swift",
    question: "¿Qué previene un ciclo de referencia fuerte entre dos instancias de clase?",
    options: ["Marcar una referencia como weak o unowned", "Usar un struct para ambos", "Agregar @MainActor", "Llamar deinit manualmente"],
    answer: 0,
    explanationHtml: `<p>Haga un lado <code>weak</code> (optional, se vuelve nil) o <code>unowned</code> (asume que
      sobrevive) para que ARC pueda liberar los objetos. No puede llamar <code>deinit</code> usted mismo.</p>`,
  },
  {
    id: "z4",
    category: "swift",
    categoryLabel: "Lenguaje Swift",
    question: "El cambio principal de Swift 6 es:",
    options: ["Un nuevo framework de UI", "Seguridad contra carreras de datos en tiempo de compilación", "Eliminar optionals", "Reemplazar Codable"],
    answer: 1,
    explanationHtml: `<p>Swift 6 aplica el aislamiento de actors y <code>Sendable</code> en tiempo de compilación,
      convirtiendo muchos errores de concurrencia en errores de compilación. Es opcional por modo de
      lenguaje.</p>`,
  },
  {
    id: "z5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "En ForEach, usar el índice del array como id puede causar:",
    options: ["Renderizado más rápido", "El estado se adhiere a la fila incorrecta al reordenar", "Errores de tipo", "Binarios más pequeños"],
    answer: 1,
    explanationHtml: `<p>SwiftUI vincula estado/animaciones a la identidad. Index-as-id reasigna el estado al
      elemento incorrecto cuando la colección cambia. Use un id estable
      (<code>Identifiable</code>).</p>`,
  },
  {
    id: "z6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "¿Qué wrapper marca el estado POSEÍDO por la vista actual?",
    options: ["@Binding", "@Environment", "@State", "@Bindable"],
    answer: 2,
    explanationHtml: `<p><code>@State</code> posee el estado local de la vista. <code>@Binding</code> referencia estado
      poseído en otro lugar; <code>@Bindable</code> se vincula a un modelo <code>@Observable</code>;
      <code>@Environment</code> lee valores inyectados.</p>`,
  },
  {
    id: "z7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "La ventaja de @Observable sobre ObservableObject es:",
    options: ["Solo funciona en UIKit", "Rastreo de lectura por propiedad, menos re-renders", "Elimina la necesidad de estado", "Se ejecuta fuera del hilo principal"],
    answer: 1,
    explanationHtml: `<p>El framework de Observación rastrea qué propiedades lee una vista, por lo que solo las
      vistas afectadas se vuelven a renderizar. <code>@Published</code> invalidaba todos los observadores del
      objeto.</p>`,
  },
  {
    id: "z8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: ".padding().background(.red) vs .background(.red).padding() difieren porque:",
    options: ["Los modificadores no tienen orden", "Cada modificador envuelve la vista anterior", "El color sobreescribe el padding", "Solo el primer modificador se aplica"],
    answer: 1,
    explanationHtml: `<p>Los modificadores se componen hacia afuera, cada uno envolviendo la vista anterior. Padding
      después de background colorea la región con padding; background después de padding solo colorea el contenido
      y agrega padding afuera.</p>`,
  },
  {
    id: "z9",
    category: "concurrencia",
    categoryLabel: "Concurrencia",
    question: "¿Qué hace awaiting una llamada asíncrona al hilo?",
    options: ["Lo bloquea hasta terminar", "Lo libera; la función se suspende y se reanuda después", "Genera un nuevo hilo", "Nada — es síncrono"],
    answer: 1,
    explanationHtml: `<p>Un <code>await</code> puede suspender la función y liberar el hilo, que realiza otro trabajo
      hasta que la tarea esperada se complete — concurrencia sin bloquear.</p>`,
  },
  {
    id: "z10",
    category: "concurrencia",
    categoryLabel: "Concurrencia",
    question: "Para proteger una caché mutable accedida por muchas tareas, usaría:",
    options: ["Una var global", "Un actor", "@State", "Un struct"],
    answer: 1,
    explanationHtml: `<p>Un <code>actor</code> serializa el acceso a su estado mutable, previniendo carreras de datos.
      Los llamadores <code>await</code> sus métodos. Swift 6 verifica esto en tiempo de compilación.</p>`,
  },
  {
    id: "z11",
    category: "concurrencia",
    categoryLabel: "Concurrencia",
    question: "El código que actualiza la UI debe ejecutarse en:",
    options: ["Cualquier actor de fondo", "El actor principal (@MainActor)", "Una tarea detached", "La cola global"],
    answer: 1,
    explanationHtml: `<p>La UI debe ejecutarse en el hilo principal. Anote los view models con <code>@MainActor</code>
      en lugar de esparcir <code>DispatchQueue.main.async</code>.</p>`,
  },
  {
    id: "z12",
    category: "concurrencia",
    categoryLabel: "Concurrencia",
    question: "async let se usa para:",
    options: ["Declarar una constante", "Ejecutar trabajo hijo concurrentemente dentro de un ámbito", "Bloquear el hilo principal", "Reemplazar Codable"],
    answer: 1,
    explanationHtml: `<p><code>async let</code> inicia una tarea hija que se ejecuta concurrentemente; usted la
      <code>await</code> después. Los hijos están delimitados y se cancelan con el padre — concurrencia
      estructurada.</p>`,
  },
  {
    id: "z13",
    category: "data",
    categoryLabel: "Datos y Red",
    question: "¿Dónde se debe almacenar un token de autenticación?",
    options: ["UserDefaults", "Un plist en el bundle", "El Keychain", "Una variable global"],
    answer: 2,
    explanationHtml: `<p>El Keychain está cifrado y respaldado por hardware. <code>UserDefaults</code> es un plist
      sin cifrar — nunca ponga secretos allí.</p>`,
  },
  {
    id: "z14",
    category: "data",
    categoryLabel: "Datos y Red",
    question: "Para mapear JSON full_name a una propiedad Swift fullName puede:",
    options: ["Nada — funciona directamente", "Usar CodingKeys o convertFromSnakeCase", "Renombrar el JSON", "Usar una clase en lugar de un struct"],
    answer: 1,
    explanationHtml: `<p>Proporcione un mapeo <code>CodingKeys</code>, o establezca
      <code>keyDecodingStrategy = .convertFromSnakeCase</code> en el decodificador.</p>`,
  },
  {
    id: "z15",
    category: "data",
    categoryLabel: "Datos y Red",
    question: "SwiftData se mejor describe como:",
    options: ["Una librería de red", "Una capa de persistencia moderna de Swift construida sobre Core Data", "Un reemplazo para SwiftUI", "Un framework de pruebas"],
    answer: 1,
    explanationHtml: `<p>SwiftData (iOS 17+) es una API de persistencia nativa de Swift (<code>@Model</code>,
      <code>@Query</code>) sobre Core Data, con mucho menos código boilerplate.</p>`,
  },
  {
    id: "z16",
    category: "arch",
    categoryLabel: "Arquitectura",
    question: "La mayor ganancia de build/estructura para una app grande generalmente es:",
    options: ["Un solo target gigante", "Dividir en paquetes Swift locales", "Más singletons", "Deshabilitar pruebas"],
    answer: 1,
    explanationHtml: `<p>Modularizar en paquetes locales con una dirección de dependencia clara acelera las
      compilaciones, fuerza límites y aísla pruebas — el &quot;monolito modular&quot;.</p>`,
  },
  {
    id: "z17",
    category: "arch",
    categoryLabel: "Arquitectura",
    question: "Inyectar un protocolo APIClient en un view model mejora principalmente:",
    options: ["El tamaño de la app", "La testeabilidad y el desacoplamiento", "El tiempo de lanzamiento", "La duración de la batería"],
    answer: 1,
    explanationHtml: `<p>Depender de una abstracción le permite inyectar un mock en pruebas y un stub en previews, y
      desacopla la funcionalidad de la capa de red concreta.</p>`,
  },
  {
    id: "z18",
    category: "perf",
    categoryLabel: "Rendimiento",
    question: "Antes de optimizar, debería:",
    options: ["Reescribir en UIKit", "Medir con Instruments", "Agregar más hilos", "Deshabilitar animaciones"],
    answer: 1,
    explanationHtml: `<p>Perfile primero — el cuello de botella generalmente no está donde usted supondría. Time Profiler,
      Allocations y el instrumento SwiftUI le señalan el verdadero punto caliente.</p>`,
  },
  {
    id: "z19",
    category: "perf",
    categoryLabel: "Rendimiento",
    question: "Un feed de imágenes con tirones mejora más cuando usted:",
    options: ["Carga imágenes de resolución completa ansiosamente", "Reduce la resolución fuera del principal y cachea miniaturas", "Usa VStack en lugar de List", "Aumenta el tamaño de imagen"],
    answer: 1,
    explanationHtml: `<p>Descodificar imágenes enormes para celdas pequeñas eleva la memoria y bloquea el hilo
      principal. Reduzca la resolución fuera del actor principal, cachee miniaturas descodificadas y use
      contenedores perezosos.</p>`,
  },
  {
    id: "z20",
    category: "cicd",
    categoryLabel: "CI/CD y Herramientas",
    question: "Un provisioning profile vincula:",
    options: ["Solo el icono de la app", "App ID + dispositivos + un certificado", "Solo el número de versión", "La descripción de App Store"],
    answer: 1,
    explanationHtml: `<p>Autoriza un build vinculando un App ID, dispositivos permitidos y un certificado de
      firmado. El certificado identifica al equipo; el profile dice qué puede ejecutar/distribuir esa
      identidad.</p>`,
  },
  {
    id: "z21",
    category: "cicd",
    categoryLabel: "CI/CD y Herramientas",
    question: "CFBundleVersion (número de build) debe:",
    options: ["Permanecer constante", "Incrementarse con cada carga a App Store Connect", "Coincidir con la versión de iOS", "Ser una fecha"],
    answer: 1,
    explanationHtml: `<p>El número de build debe incrementarse por carga, incluso dentro de la misma versión de
      marketing (<code>CFBundleShortVersionString</code>). El CI típicamente lo autoincrementa.</p>`,
  },
  {
    id: "z22",
    category: "appstore",
    categoryLabel: "App Store",
    question: "Una phased release le permite:",
    options: ["Omitir la revisión", "Implementar a un % creciente y pausar si los crashes aumentan", "Evitar TestFlight", "Saltarse el firmado"],
    answer: 1,
    explanationHtml: `<p>La phased release aumenta una actualización durante ~7 días; puede pausarla si las tasas de
      crash suben y enviar una corrección antes de que toda la base de usuarios se actualice.</p>`,
  },
  {
    id: "z23",
    category: "security",
    categoryLabel: "Seguridad",
    question: "App Transport Security (ATS) por defecto:",
    options: ["Permite HTTP en texto plano", "Requiere HTTPS/TLS para llamadas de red", "Deshabilita el Keychain", "Cifra UserDefaults"],
    answer: 1,
    explanationHtml: `<p>ATS obliga conexiones HTTPS seguras; HTTP en texto plano necesita una excepción justificada
      en Info.plist que App Review examina. Mantenga ATS activado.</p>`,
  },
  {
    id: "z24",
    category: "ai",
    categoryLabel: "IA en el Dispositivo",
    question: "Un beneficio clave de la ML en el dispositivo (Core ML) sobre una llamada al servidor es:",
    options: ["Tamaño de modelo ilimitado", "Privacidad, baja latencia y uso sin conexión", "No necesita un modelo", "Evita Swift"],
    answer: 1,
    explanationHtml: `<p>La inferencia en el dispositivo mantiene los datos privados, elimina la ida y vuelta de red,
      funciona sin conexión y no tiene costo por llamada — acelerada por el Neural Engine.</p>`,
  },
];
