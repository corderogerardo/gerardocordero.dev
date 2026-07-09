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
    explanationHtml: `<p>La semántica de valor es lo que hace seguro pasar structs sin copias defensivas —
      es la garantía de correctitud detrás del estado en SwiftUI. La asignación copia, así que mutar la
      copia deja el original intacto.</p>
      <p>Señal de alerta: responder "también mutado" — eso es semántica de referencia, que solo aplica a
      clases, donde dos variables pueden apuntar a la misma instancia.</p>`,
  },
  {
    id: "z2",
    category: "swift",
    categoryLabel: "Lenguaje Swift",
    question: "¿Cuál es la forma más segura de manejar un valor que puede ser nil?",
    options: ["Desenvolver con !", "guard let / if let", "Asumir que está establecido", "Castear con as!"],
    answer: 1,
    explanationHtml: `<p>El objetivo es una app sin crashes, no solo silenciar la advertencia del compilador —
      por eso <code>guard let</code> / <code>if let</code> desenvuelven de forma segura y le permiten
      manejar el caso nil explícitamente.</p>
      <p>Señal de alerta: usar <code>!</code> "porque compila" — la desenvoltura forzada convierte un nil
      inesperado en un crash en tiempo de ejecución en lugar de un camino manejado.</p>`,
  },
  {
    id: "z3",
    category: "swift",
    categoryLabel: "Lenguaje Swift",
    question: "¿Qué previene un ciclo de referencia fuerte entre dos instancias de clase?",
    options: ["Marcar una referencia como weak o unowned", "Usar un struct para ambos", "Agregar @MainActor", "Llamar deinit manualmente"],
    answer: 0,
    explanationHtml: `<p>Dos objetos reteniéndose fuertemente entre sí significa que el conteo de referencias
      de ARC nunca llega a cero, así que ninguno se libera — una fuga de memoria silenciosa. Rómpalo
      haciendo un lado <code>weak</code> (optional, se vuelve nil) o <code>unowned</code> (asume que
      sobrevive).</p>
      <p>Señal de alerta: pensar que un struct "arregla" el ciclo — los structs no tienen conteo de
      referencias basado en identidad, así que la solución es elegir la ownership correcta en la referencia
      de clase, no cambiar de tipo.</p>`,
  },
  {
    id: "z4",
    category: "swift",
    categoryLabel: "Lenguaje Swift",
    question: "El cambio principal de Swift 6 es:",
    options: ["Un nuevo framework de UI", "Seguridad contra carreras de datos en tiempo de compilación", "Eliminar optionals", "Reemplazar Codable"],
    answer: 1,
    explanationHtml: `<p>Las carreras de datos solían ser un crash en tiempo de ejecución que solo se
      encontraba en producción; Swift 6 mueve esa verificación al tiempo de compilación aplicando el
      aislamiento de actors y la conformidad <code>Sendable</code>, convirtiendo muchos errores de
      concurrencia en errores de compilación. Es opcional por modo de lenguaje.</p>
      <b>Trato la concurrencia estricta de Swift 6 como pruebas gratuitas de condiciones de carrera en
      tiempo de compilación.</b>`,
  },
  {
    id: "z5",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "En ForEach, usar el índice del array como id puede causar:",
    options: ["Renderizado más rápido", "El estado se adhiere a la fila incorrecta al reordenar", "Errores de tipo", "Binarios más pequeños"],
    answer: 1,
    explanationHtml: `<p>SwiftUI vincula el estado y las animaciones a la identidad, no a la posición — así que
      cuando el índice de una fila cambia, index-as-id reasigna silenciosamente el estado de esa fila a lo
      que sea que ahora ocupe esa posición. Use un id estable (<code>Identifiable</code>) que siga a los
      datos, no al slot.</p>
      <p>Señal de alerta: asumir que index-as-id es "solo un detalle menor de rendimiento" — es un bug de
      correctitud que se manifiesta como selecciones o animaciones mezcladas al reordenar, no uno de
      rendimiento.</p>`,
  },
  {
    id: "z6",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "¿Qué wrapper marca el estado POSEÍDO por la vista actual?",
    options: ["@Binding", "@Environment", "@State", "@Bindable"],
    answer: 2,
    explanationHtml: `<p>La ownership es la distinción clave aquí: <code>@State</code> posee el estado local de
      la vista y es la fuente de verdad. <code>@Binding</code> solo referencia estado poseído en otro
      lugar; <code>@Bindable</code> se vincula a un modelo <code>@Observable</code>; <code>@Environment</code>
      lee valores inyectados que tampoco posee.</p>
      <p>Señal de alerta: decir que <code>@Binding</code> "es lo mismo que @State" — un binding es un
      puntero de lectura/escritura al estado de otro, así que mutarlo nunca crea ni posee almacenamiento
      local.</p>`,
  },
  {
    id: "z7",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: "La ventaja de @Observable sobre ObservableObject es:",
    options: ["Solo funciona en UIKit", "Rastreo de lectura por propiedad, menos re-renders", "Elimina la necesidad de estado", "Se ejecuta fuera del hilo principal"],
    answer: 1,
    explanationHtml: `<p>La ganancia está en el alcance del re-render: el framework de Observación rastrea qué
      propiedades lee realmente cada vista, por lo que solo las vistas que tocan una propiedad modificada
      se re-renderizan. El modelo anterior <code>ObservableObject</code>/<code>@Published</code> invalidaba
      a todos los observadores del objeto ante cualquier cambio, sin importar qué propiedad usaran.</p>
      <b>@Observable da rastreo de cambios por propiedad, así que una vista que solo lee un campo no se
      re-renderiza cuando cambia un campo hermano.</b>`,
  },
  {
    id: "z8",
    category: "swiftui",
    categoryLabel: "SwiftUI",
    question: ".padding().background(.red) vs .background(.red).padding() difieren porque:",
    options: ["Los modificadores no tienen orden", "Cada modificador envuelve la vista anterior", "El color sobreescribe el padding", "Solo el primer modificador se aplica"],
    answer: 1,
    explanationHtml: `<p>El orden de los modificadores es estructural, no cosmético — cada modificador envuelve
      la vista producida por el anterior, construyendo una nueva vista cada vez. Padding-luego-background
      colorea la región con padding; background-luego-padding solo colorea el contenido y agrega padding
      afuera.</p>
      <p>Señal de alerta: decir "los modificadores no tienen orden" — ese es el modelo mental que produce
      bugs de layout inexplicables; trate cada llamada a <code>.modifier()</code> como una envoltura, de
      arriba hacia abajo.</p>`,
  },
  {
    id: "z9",
    category: "concurrencia",
    categoryLabel: "Concurrencia",
    question: "¿Qué hace awaiting una llamada asíncrona al hilo?",
    options: ["Lo bloquea hasta terminar", "Lo libera; la función se suspende y se reanuda después", "Genera un nuevo hilo", "Nada — es síncrono"],
    answer: 1,
    explanationHtml: `<p>Por eso async/await escala mejor que las llamadas bloqueantes: un <code>await</code>
      suspende la función y libera el hilo de vuelta al pool, que realiza otro trabajo hasta que la tarea
      esperada se complete — concurrencia sin ocupar un hilo por cada operación en curso.</p>
      <p>Señal de alerta: decir "bloquea el hilo" — ese es el modelo mental antiguo de semáforos/locks; el
      punto de la concurrencia estructurada es justo que suspender no es bloquear.</p>`,
  },
  {
    id: "z10",
    category: "concurrencia",
    categoryLabel: "Concurrencia",
    question: "Para proteger una caché mutable accedida por muchas tareas, usaría:",
    options: ["Una var global", "Un actor", "@State", "Un struct"],
    answer: 1,
    explanationHtml: `<p>La garantía de correctitud que necesita para una caché mutable compartida es acceso
      serializado, y eso es exactamente lo que da un <code>actor</code> — aísla su estado y procesa
      llamadas una a la vez. Los llamadores hacen <code>await</code> a sus métodos; Swift 6 verifica el
      aislamiento en tiempo de compilación.</p>
      <p>Señal de alerta: usar una <code>var</code> global — esa es la carrera de datos esperando a
      ocurrir; un struct tampoco ayuda porque no tiene aislamiento, solo copia por valor.</p>`,
  },
  {
    id: "z11",
    category: "concurrencia",
    categoryLabel: "Concurrencia",
    question: "El código que actualiza la UI debe ejecutarse en:",
    options: ["Cualquier actor de fondo", "El actor principal (@MainActor)", "Una tarea detached", "La cola global"],
    answer: 1,
    explanationHtml: `<p>UIKit/SwiftUI no son thread-safe, así que cualquier mutación de UI fuera del hilo
      principal es comportamiento indefinido, no solo lento. Anote los view models con
      <code>@MainActor</code> para que el compilador lo obligue, en lugar de esparcir llamadas a
      <code>DispatchQueue.main.async</code> y confiar en haber cubierto todos los casos.</p>
      <b>Pongo @MainActor en el propio view model para que el sistema de tipos — no el code review —
      atrape cualquier actualización de UI desde un contexto en segundo plano.</b>`,
  },
  {
    id: "z12",
    category: "concurrencia",
    categoryLabel: "Concurrencia",
    question: "async let se usa para:",
    options: ["Declarar una constante", "Ejecutar trabajo hijo concurrentemente dentro de un ámbito", "Bloquear el hilo principal", "Reemplazar Codable"],
    answer: 1,
    explanationHtml: `<p>El valor sobre una tarea detached es la seguridad de ciclo de vida:
      <code>async let</code> inicia una tarea hija que se ejecuta concurrentemente, y esa hija está
      delimitada y se cancela junto con su padre — concurrencia estructurada significa que no queda
      trabajo huérfano sobreviviendo a la función que lo lanzó.</p>
      <p>Señal de alerta: confundirlo con una simple declaración de constante — <code>async let</code> es
      el lanzamiento de una tarea, no un binding de valor, y olvidar el <code>await</code> filtra la
      concurrencia.</p>`,
  },
  {
    id: "z13",
    category: "data",
    categoryLabel: "Datos y Red",
    question: "¿Dónde se debe almacenar un token de autenticación?",
    options: ["UserDefaults", "Un plist en el bundle", "El Keychain", "Una variable global"],
    answer: 2,
    explanationHtml: `<p>Un token de autenticación es una credencial, así que necesita almacenamiento con
      garantías reales de seguridad: el Keychain está cifrado y respaldado por hardware.
      <code>UserDefaults</code> es solo un plist sin cifrar en disco — trivialmente legible en un
      dispositivo con jailbreak o desde un backup.</p>
      <p>Señal de alerta: "UserDefaults está bien, es solo para datos de la app" — ese razonamiento es
      cómo los tokens terminan en backups en texto plano; los secretos siempre van al Keychain, sin
      excepciones.</p>`,
  },
  {
    id: "z14",
    category: "data",
    categoryLabel: "Datos y Red",
    question: "Para mapear JSON full_name a una propiedad Swift fullName puede:",
    options: ["Nada — funciona directamente", "Usar CodingKeys o convertFromSnakeCase", "Renombrar el JSON", "Usar una clase en lugar de un struct"],
    answer: 1,
    explanationHtml: `<p>La convención de nombres de Swift y la de la API son dos cosas separadas que
      Codable está diseñado para conectar — no renombra ninguno de los dos lados. Proporcione un mapeo
      <code>CodingKeys</code>, o establezca <code>keyDecodingStrategy = .convertFromSnakeCase</code> en el
      decodificador para todo el payload.</p>
      <p>Señal de alerta: "funciona directamente" — Codable empareja nombres de propiedad con claves de
      forma exacta por defecto; un desajuste lanza un error de decodificación, no adivina en silencio.</p>`,
  },
  {
    id: "z15",
    category: "data",
    categoryLabel: "Datos y Red",
    question: "SwiftData se mejor describe como:",
    options: ["Una librería de red", "Una capa de persistencia moderna de Swift construida sobre Core Data", "Un reemplazo para SwiftUI", "Un framework de pruebas"],
    answer: 1,
    explanationHtml: `<p>La propuesta de SwiftData es quitar la ceremonia de Core Data sin perder su motor de
      almacenamiento probado: es una API de persistencia nativa de Swift (<code>@Model</code>,
      <code>@Query</code>) construida sobre Core Data, así que obtiene modelos basados en macros y mucho
      menos boilerplate sobre el mismo almacén subyacente.</p>
      <b>Uso SwiftData cuando una funcionalidad necesita persistencia real con consultas, no solo cachear
      una respuesta de red.</b>`,
  },
  {
    id: "z16",
    category: "arch",
    categoryLabel: "Arquitectura",
    question: "La mayor ganancia de build/estructura para una app grande generalmente es:",
    options: ["Un solo target gigante", "Dividir en paquetes Swift locales", "Más singletons", "Deshabilitar pruebas"],
    answer: 1,
    explanationHtml: `<p>1. Divida por funcionalidad/capa en paquetes Swift locales con un grafo de
      dependencias claro y unidireccional. 2. Cada paquete compila y prueba de forma independiente, así
      que las compilaciones incrementales solo recompilan lo que cambió. 3. Los límites de los paquetes se
      vuelven límites de módulo obligatorios — se acabó el "importar cualquier cosa desde cualquier
      lugar".</p>
      <p>Señal de alerta: "un solo target gigante es más simple" — lo es el primer día y se convierte en
      una recompilación completa en cada cambio para el mes seis; modularizar es lo que mantiene sanos los
      tiempos de build y el aislamiento de pruebas en una app grande.</p>`,
  },
  {
    id: "z17",
    category: "arch",
    categoryLabel: "Arquitectura",
    question: "Inyectar un protocolo APIClient en un view model mejora principalmente:",
    options: ["El tamaño de la app", "La testeabilidad y el desacoplamiento", "El tiempo de lanzamiento", "La duración de la batería"],
    answer: 1,
    explanationHtml: `<p>La dependencia es lo que realmente está gestionando aquí: depender de un protocolo en
      lugar del cliente concreto le permite inyectar un mock en pruebas y un stub en previews, y desacopla
      la funcionalidad de los detalles de implementación de la capa de red.</p>
      <b>Inyecto un protocolo APIClient para que las pruebas de mi view model nunca toquen la red —
      corren en milisegundos contra un mock.</b>`,
  },
  {
    id: "z18",
    category: "perf",
    categoryLabel: "Rendimiento",
    question: "Antes de optimizar, debería:",
    options: ["Reescribir en UIKit", "Medir con Instruments", "Agregar más hilos", "Deshabilitar animaciones"],
    answer: 1,
    explanationHtml: `<p>1. Mida con Instruments antes de tocar código — el cuello de botella casi nunca está
      donde la intuición dice. 2. Use Time Profiler para puntos calientes de CPU, Allocations para churn
      de memoria y el instrumento SwiftUI para tormentas de re-render. 3. Corrija el punto caliente
      específico que señalan los datos, y vuelva a medir.</p>
      <p>Señal de alerta: "agregar más hilos" sin perfilar primero — eso puede empeorar la contención y
      gasta esfuerzo en un cuello de botella que no ha confirmado que exista.</p>`,
  },
  {
    id: "z19",
    category: "perf",
    categoryLabel: "Rendimiento",
    question: "Un feed de imágenes con tirones mejora más cuando usted:",
    options: ["Carga imágenes de resolución completa ansiosamente", "Reduce la resolución fuera del principal y cachea miniaturas", "Usa VStack en lugar de List", "Aumenta el tamaño de imagen"],
    answer: 1,
    explanationHtml: `<p>El tirón viene del costo de decodificación, no del renderizado de la lista: decodificar
      una imagen de resolución completa para una celda del tamaño de una miniatura eleva la memoria y puede
      bloquear el hilo principal. Reduzca la resolución fuera del actor principal, cachee las miniaturas ya
      decodificadas y deje que un contenedor perezoso maneje el reciclaje.</p>
      <p>Señal de alerta: "cambiar VStack por List" — un contenedor no perezoso no es la causa raíz aquí;
      lo es el costo de decodificación por imagen, y arreglar el contenedor sin reducir la resolución solo
      mueve el tirón.</p>`,
  },
  {
    id: "z20",
    category: "cicd",
    categoryLabel: "CI/CD y Herramientas",
    question: "Un provisioning profile vincula:",
    options: ["Solo el icono de la app", "App ID + dispositivos + un certificado", "Solo el número de versión", "La descripción de App Store"],
    answer: 1,
    explanationHtml: `<p>El firmado existe para probar tanto quién construyó la app como qué puede ejecutar. El
      profile es la capa de vinculación: autoriza un build uniendo un App ID, los dispositivos permitidos y
      un certificado de firmado. El certificado identifica al equipo; el profile dice qué puede
      ejecutar/distribuir esa identidad.</p>
      <b>Cuando el firmado falla, reviso primero la coincidencia profile-certificado-dispositivo antes de
      tocar cualquier otra cosa — casi siempre es un desajuste, no un problema de código.</b>`,
  },
  {
    id: "z21",
    category: "cicd",
    categoryLabel: "CI/CD y Herramientas",
    question: "CFBundleVersion (número de build) debe:",
    options: ["Permanecer constante", "Incrementarse con cada carga a App Store Connect", "Coincidir con la versión de iOS", "Ser una fecha"],
    answer: 1,
    explanationHtml: `<p>App Store Connect usa el número de build para diferenciar cargas dentro de una misma
      versión de marketing, así que debe incrementarse en cada carga individual — incluso dos builds de la
      misma <code>CFBundleShortVersionString</code>. El CI típicamente lo autoincrementa para que nadie
      tenga que recordarlo.</p>
      <p>Señal de alerta: subir solo la versión de marketing y olvidar el número de build — Connect
      rechazará la carga como duplicada.</p>`,
  },
  {
    id: "z22",
    category: "appstore",
    categoryLabel: "App Store",
    question: "Una phased release le permite:",
    options: ["Omitir la revisión", "Implementar a un % creciente y pausar si los crashes aumentan", "Evitar TestFlight", "Saltarse el firmado"],
    answer: 1,
    explanationHtml: `<p>El valor está en limitar el radio de impacto: una phased release escala una
      actualización durante ~7 días en lugar de llegar al 100% de usuarios de una vez, así que puede
      pausarla si las tasas de crash suben y enviar una corrección antes de que toda la base de usuarios se
      actualice.</p>
      <b>Lanzo las versiones riesgosas de forma escalonada, así un build defectuoso solo llega a una
      fracción de usuarios antes de que pueda pausarlo.</b>`,
  },
  {
    id: "z23",
    category: "security",
    categoryLabel: "Seguridad",
    question: "App Transport Security (ATS) por defecto:",
    options: ["Permite HTTP en texto plano", "Requiere HTTPS/TLS para llamadas de red", "Deshabilita el Keychain", "Cifra UserDefaults"],
    answer: 1,
    explanationHtml: `<p>ATS existe para que el tráfico de red en texto plano sea la excepción, no la
      norma: fuerza HTTPS/TLS en las conexiones salientes, y el HTTP en texto plano necesita una excepción
      justificada en Info.plist que App Review examina.</p>
      <p>Señal de alerta: deshabilitar ATS globalmente para "arreglar" un error de red en lugar de arreglar
      el endpoint — esa excepción es una regresión de seguridad real que App Review cuestionará.</p>`,
  },
  {
    id: "z24",
    category: "ai",
    categoryLabel: "IA en el Dispositivo",
    question: "Un beneficio clave de la ML en el dispositivo (Core ML) sobre una llamada al servidor es:",
    options: ["Tamaño de modelo ilimitado", "Privacidad, baja latencia y uso sin conexión", "No necesita un modelo", "Evita Swift"],
    answer: 1,
    explanationHtml: `<p>El trade-off que un candidato senior debería nombrar explícitamente: la inferencia en
      el dispositivo mantiene los datos del usuario privados, elimina la ida y vuelta de red, funciona sin
      conexión y no tiene costo por llamada al servidor — a cambio de estar limitada por el Neural Engine
      del dispositivo y el tamaño del binario/modelo.</p>
      <b>Por defecto uso Core ML para todo lo que toca datos del usuario directamente, y solo recurro a un
      modelo en servidor cuando el modelo es demasiado grande o necesita reentrenamiento frecuente.</b>`,
  },
];
