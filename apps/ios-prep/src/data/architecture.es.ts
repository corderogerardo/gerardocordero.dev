export type ArchSection = { id: string; num: string; title: string; html: string };
export type DeepDive = { id: string; pill: string; title: string; html: string };

export const ARCH_INTRO =
  "Un recorrido por cómo se diseñan las apps de iOS a escala — patrones, límites de módulos, flujo de datos, concurrencia y lanzamiento. Este es el material de &quot;cómo construiría una app iOS grande&quot; que diferencia las respuestas de senior y arquitecto del trabajo de funcionalidades.";

export const ARCH_SECTIONS: ArchSection[] = [
  {
    id: "arch-1",
    num: "01",
    title: "01 · Patrones de arquitectura: MVC → MVVM → TCA",
    html: `<p>iOS ha pasado del <b>MVC</b> de UIKit (que a menudo se convertía en &quot;Massive View Controller&quot;) a
      <b>MVVM</b>, donde un view model mantiene la lógica de presentación y el estado, y la vista permanece
      delgada y testeable. El flujo de datos de SwiftUI es naturalmente compatible con MVVM; algunos equipos van
      más lejos con un enfoque <b>unidireccional</b> / <b>TCA</b> (The Composable Architecture): estado en un
      lugar, cambios vía acciones a través de un reducer, efectos secundarios aislados y testeables.</p>
    <div class="callout tip"><span class="lbl">Cómo elegir</span> App pequeña/mediana o equipo nuevo en esto:
      MVVM con el framework de Observación. App grande, muchos ingenieros, mucha lógica, un premium en
      testeabilidad y consistencia: una arquitectura unidireccional (TCA o un equivalente hecho a mano) rinde
      frutos. <b>&quot;Emparejo la arquitectura con el equipo y la complejidad del producto — no copio un mismo
      patrón en todas partes.&quot;</b></div>`,
  },
  {
    id: "arch-2",
    num: "02",
    title: "02 · Modularización con paquetes Swift",
    html: `<p>A medida que una app crece, un solo target se convierte en un cuello de botella: compilaciones
      lentas, dependencias enredadas y dolor de merge. Divídalo en <b>paquetes Swift locales</b> — módulos de
      funcionalidad más paquetes compartidos <i>Core</i> / <i>DesignSystem</i> / <i>Networking</i> — con una
      <b>dirección de dependencia</b> explícita (las funcionalidades dependen del core, nunca entre
      sí).</p>
    <div class="callout tip"><span class="lbl">Resultado</span> Compilaciones incrementales y paralelas más
      rápidas, límites forzados (sin importaciones accidentales entre funcionalidades), pruebas y previews a
      nivel de funcionalidad, y la posibilidad de construir una funcionalidad de forma aislada. Esta es la
      decisión de arquitectura de mayor impacto en un código iOS grande.</div>`,
  },
  {
    id: "arch-3",
    num: "03",
    title: "03 · Inyección de dependencias y testeabilidad",
    html: `<p>Dependa de <b>protocolos</b>, no de tipos concretos, y pase las dependencias (inyección por
      initializer o <code>@Environment</code> de SwiftUI) en lugar de recurrir a singletons. Esa única disciplina
      hace que los view models sean testeables con fakes, desacopla las funcionalidades de la infraestructura y
      le permite intercambiar implementaciones (por ejemplo, un stub API en previews).</p>
    <div class="callout warn"><span class="lbl">Señal de alerta</span> Un view model que construye
      <code>URLSession.shared</code> o un singleton global internamente no puede probarse sin la red.
      <b>&quot;Inyecto un protocolo APIClient para que el view model nunca hable con la red directamente — eso es
      lo que lo hace testeable con un fake.&quot;</b></div>`,
  },
  {
    id: "arch-4",
    num: "04",
    title: "04 · Red y patrón repository",
    html: `<p>Ponga un <b>repository</b> entre su UI y las capas de red/persistencia. Los view models piden al
      repository los modelos de dominio; el repository posee el <code>APIClient</code>, descodificación, caché y la
      decisión de cuándo servir datos en caché vs frescos. Esto mantiene una única fuente de verdad y un único
      lugar para agregar reintentos, renovación de auth y paginación.</p>
    <div class="callout tip"><span class="lbl">Argumento</span> &quot;UI → ViewModel → Repository → (APIClient +
      Store).&quot; Cada capa tiene un trabajo y un seam de protocolo para pruebas. La caché y el comportamiento
      sin conexión viven en el repository, no esparcidos por las vistas.</div>`,
  },
  {
    id: "arch-5",
    num: "05",
    title: "05 · Offline-first y sincronización",
    html: `<p>Para apps que deben funcionar sin conexión, haga del <b>almacenamiento local la fuente de
      verdad</b>: la UI siempre lee de SwiftData/Core Data, y un motor de sincronización reconcilia con el
      servidor en segundo plano. Necesita una estrategia para la <b>resolución de conflictos</b> (último escritor
      gana, servidor autoritativo o fusión por campo), rastreo de cambios y reintento de mutaciones
      fallidas.</p>
    <div class="callout warn"><span class="lbl">Partes difíciles</span> Orden e idempotencia de mutaciones
      encoladas, desviación de reloj y fallos parciales. <b>&quot;Diseño la cola de mutaciones y la política de
      conflictos de forma explícita desde el principio — la sincronización offline falla en los bordes, no en el
      camino feliz.&quot;</b></div>`,
  },
  {
    id: "arch-6",
    num: "06",
    title: "06 · Arquitectura de navegación",
    html: `<p>Centralice el enrutamiento para que la navegación sean <b>datos, no <code>NavigationLink</code>s
      esparcidos</b>. Un router/coordinator posee una ruta <code>NavigationStack</code> de valores
      <code>Route</code>; las funcionalidades emiten rutas, el router decide cómo presentarlas. Los deep links y
      notificaciones push se descodifican en los mismos valores <code>Route</code>, y la restauración de estado
      se convierte en &quot;persistir y recargar la ruta&quot;.</p>
    <div class="callout tip"><span class="lbl">Por qué</span> Desacoplar &quot;qué mostrar&quot; de &quot;cómo
      presentarlo&quot; mantiene las funcionalidades independientes, hace que el deep linking y los flujos
      A/B-tested sean triviales, y le da un lugar para razonar sobre todo el grafo de
      navegación. <b>&quot;La navegación es datos en mis apps — un router posee la ruta, así que los deep links,
      las notificaciones push y la restauración de estado solo agregan una Route.&quot;</b></div>`,
  },
  {
    id: "arch-7",
    num: "07",
    title: "07 · Arquitectura de concurrencia",
    html: `<p>Diseñe el aislamiento deliberadamente: la UI y los view models se ejecutan en el
      <code>@MainActor</code>; el estado mutable compartido (cachés, tiendas en memoria) vive detrás de
      <b>actors</b>; el trabajo costoso se ejecuta en tareas de fondo y vuelve al actor principal solo para
      publicar resultados. Bajo Swift 6, hacer los tipos <code>Sendable</code> y respetar el aislamiento se
      aplica en tiempo de compilación — por lo que la arquitectura debe ser intencional, no
      accidental.</p>
    <div class="callout warn"><span class="lbl">Señal de alerta</span> Esparcir <code>DispatchQueue.main.async</code>
      y locks por todas partes es síntoma de un aislamiento no diseñado. <b>&quot;Pongo el estado mutable
      compartido detrás de actors y fijo la UI a @MainActor para que el compilador demuestre que estoy libre de
      carreras, en vez de vigilarlo por convención.&quot;</b></div>`,
  },
  {
    id: "arch-8",
    num: "08",
    title: "08 · Observabilidad, banderas y lanzamiento",
    html: `<p>La preparación para producción es parte de la arquitectura. Conecte <b>logging estructurado</b>
      (OSLog), <b>métricas</b>/MetricKit y <b>reporte de crashes</b>; proteja funcionalidades riesgosas detrás
      de <b>feature flags</b> para que pueda distribuir a oscuras e implementar gradualmente; y use
      <b>phased release</b> en App Store con un plan de rollback (una bandera para desactivar, o una corrección
      expedita). Defina presupuestos — lanzamiento en frío, tasa sin crashes — y monitoreelos.</p>
    <div class="callout tip"><span class="lbl">Perspectiva de Arquitecto</span> &quot;¿Cómo sabe que está
      saludable, y cómo lo apaga si no lo está?&quot; Una respuesta segura a esa pregunta — banderas, paneles,
      phased rollout, rollback — es lo que diferencia el pensamiento a nivel de arquitecto.</div>`,
  },
];

export const DEEPDIVES_INTRO =
  "El playbook de senior en la forma de concepto → ejemplo → problema → solución, para que cada idea se fije como una decisión de ingeniería real en lugar de una definición.";

export const DEEP_DIVES: DeepDive[] = [
  {
    id: "dd-1",
    pill: "Estado",
    title: "MVVM vs The Composable Architecture",
    html: `<div class="dd-row">
      <div class="dd-block dd-concept"><span class="lbl">Concepto</span> MVVM mantiene el estado en view models;
        TCA centraliza el estado y enruta cada cambio a través de acciones y un reducer, aislando efectos
        secundarios.</div>
      <div class="dd-block dd-example"><span class="lbl">Ejemplo</span> Un checkout de múltiples pasos con
        estado compartido, analíticas y validación compleja entre pantallas.</div>
      <div class="dd-block dd-problem"><span class="lbl">Problema</span> Con MVVM ad-hoc, el estado se filtra
        entre view models, los bugs de orden se cuelan y los efectos secundarios son difíciles de
        probar.</div>
      <div class="dd-block dd-solution"><span class="lbl">Solución</span> Un store unidireccional hace que las
        transiciones de estado sean explícitas y testeables de forma exhaustiva; recurra a ella cuando la
        complejidad y el tamaño del equipo justifiquen la ceremonia — de lo contrario MVVM es más
        ligero.</div>
    </div>`,
  },
  {
    id: "dd-2",
    pill: "Modularidad",
    title: "El monolito modular con SPM",
    html: `<div class="dd-row">
      <div class="dd-block dd-concept"><span class="lbl">Concepto</span> Mantenga una app, pero divídala en
        paquetes Swift locales con una dirección de dependencia estricta.</div>
      <div class="dd-block dd-example"><span class="lbl">Ejemplo</span> 30 ingenieros, un target de app,
        compilaciones incrementales de 12 minutos y constantes conflictos de merge.</div>
      <div class="dd-block dd-problem"><span class="lbl">Problema</span> Todo depende de todo; un cambio en
        cualquier lugar recompila el mundo y riesga romper funcionalidades no relacionadas.</div>
      <div class="dd-block dd-solution"><span class="lbl">Solución</span> Los paquetes de funcionalidad dependen
        solo de Core / DesignSystem; las compilaciones se paralelizan, los límites son forzados por el
        compilador, y las funcionalidades se distribuyen y prueban independientemente. <b>&quot;Dejo que el
        compilador imponga los límites de módulo en lugar de una regla de lint o una convención de code
        review.&quot;</b></div>
    </div>`,
  },
  {
    id: "dd-3",
    pill: "Datos",
    title: "Sincronización offline-first",
    html: `<div class="dd-row">
      <div class="dd-block dd-concept"><span class="lbl">Concepto</span> La base de datos local es la fuente de
        verdad; un motor de sincronización reconcilia con el servidor en segundo plano.</div>
      <div class="dd-block dd-example"><span class="lbl">Ejemplo</span> Una app de notas que los usuarios editan
        en el metro sin señal.</div>
      <div class="dd-block dd-problem"><span class="lbl">Problema</span> Un &quot;guardar en el servidor al tocar&quot;
        ingenuo pierde ediciones sin conexión y muestra spinners por todas partes.</div>
      <div class="dd-block dd-solution"><span class="lbl">Solución</span> Escriba localmente y renderice
        instantáneamente; encole mutaciones con claves de idempotencia; sincronice con una política de conflictos
        definida y reintente al reconectar. <b>&quot;El almacenamiento local es la fuente de verdad — la UI nunca
        espera a la red para mostrar lo que el usuario acaba de hacer.&quot;</b></div>
    </div>`,
  },
  {
    id: "dd-4",
    pill: "Concurrencia",
    title: "Estado compartido basado en actors",
    html: `<div class="dd-row">
      <div class="dd-block dd-concept"><span class="lbl">Concepto</span> Un actor serializa el acceso a estado
        mutable, eliminando carreras de datos por construcción.</div>
      <div class="dd-block dd-example"><span class="lbl">Ejemplo</span> Una caché de imágenes en memoria accedida
        desde muchas tareas de vistas concurrentes.</div>
      <div class="dd-block dd-problem"><span class="lbl">Problema</span> Un caché de diccionario simple accedido
        desde múltiples tareas falla o corrompe datos bajo carga.</div>
      <div class="dd-block dd-solution"><span class="lbl">Solución</span> Envuelva el caché en un actor; los
        llamadores <code>await</code> sus métodos. Swift 6 entonces demuestra la ausencia de carreras en tiempo
        de compilación. <b>&quot;Recurro a un actor en lugar de un lock porque hace la carrera imposible, no solo
        improbable.&quot;</b></div>
    </div>`,
  },
  {
    id: "dd-5",
    pill: "Rendimiento",
    title: "Un feed de imágenes que mantiene 120fps",
    html: `<div class="dd-row">
      <div class="dd-block dd-concept"><span class="lbl">Concepto</span> Scroll fluido = celdas ligeras, carga
        perezosa y sin trabajo en el hilo principal por frame.</div>
      <div class="dd-block dd-example"><span class="lbl">Ejemplo</span> Un feed social de fotos en resolución
        completa en una lista con scroll.</div>
      <div class="dd-block dd-problem"><span class="lbl">Problema</span> Descodificar imágenes de 4000px para
        celdas de 300px eleva la memoria y pierde frames; Time Profiler muestra la descodificación en el hilo
        principal.</div>
      <div class="dd-block dd-solution"><span class="lbl">Solución</span> Reduzca la resolución fuera del actor
        principal, cachée miniaturas descodificadas en un actor, use <code>LazyVStack</code> y dé a las filas
        identidad estable para que SwiftUI las reutilice. <b>&quot;Los frames perdidos casi siempre son trabajo
        de decodificación filtrándose al hilo principal — muévalo, cachee el resultado, y el frame rate se
        resuelve solo.&quot;</b></div>
    </div>`,
  },
  {
    id: "dd-6",
    pill: "IA",
    title: "Una funcionalidad de IA en el dispositivo",
    html: `<div class="dd-row">
      <div class="dd-block dd-concept"><span class="lbl">Concepto</span> Ejecute inferencia en el dispositivo por
        privacidad, uso sin conexión y costo cero por llamada; vuelva al servidor solo cuando sea
        necesario.</div>
      <div class="dd-block dd-example"><span class="lbl">Ejemplo</span> Búsqueda inteligente que clasifica notas
        por significado, no solo por palabras clave.</div>
      <div class="dd-block dd-problem"><span class="lbl">Problema</span> Enviar cada nota a un servidor es lento,
        costoso y un riesgo de privacidad.</div>
      <div class="dd-block dd-solution"><span class="lbl">Solución</span> Incruste contenido con un pequeño modelo
        Core ML en el Neural Engine, almacene vectores localmente y clasifique por similitud coseno — exactamente
        lo que la propia búsqueda de esta guía hace en su navegador. <b>&quot;La inferencia en el dispositivo no
        es solo un argumento de privacidad — es costo marginal cero por consulta y sigue funcionando sin
        señal.&quot;</b></div>
    </div>`,
  },
  {
    id: "dd-7",
    pill: "Capas",
    title: "Clean Architecture y la regla de dependencia",
    html: `<div class="dd-row">
      <div class="dd-block dd-concept"><span class="lbl">Concepto</span> Capas concéntricas (dominio → casos de
        uso → adaptadores → frameworks) con dependencias que apuntan solo hacia adentro; el dominio no importa
        nada.</div>
      <div class="dd-block dd-example"><span class="lbl">Ejemplo</span> Un motor de precios reutilizado en una
        app, un widget y un target de Swift del lado del servidor.</div>
      <div class="dd-block dd-problem"><span class="lbl">Problema</span> Reglas de negocio enredadas con SwiftUI y
        URLSession no pueden reutilizarse ni probarse sin iniciar toda la app.</div>
      <div class="dd-block dd-solution"><span class="lbl">Solución</span> Ponga las reglas en un paquete de dominio
        sin frameworks; las capas externas implementan sus protocolos y se conectan en una raíz de composición.
        Ahora el core es portátil y testeable unitariamente sin simulador.</div>
    </div>`,
  },
  {
    id: "dd-8",
    pill: "Pruebas",
    title: "Una estrategia de pruebas que realmente escala",
    html: `<div class="dd-row">
      <div class="dd-block dd-concept"><span class="lbl">Concepto</span> Una pirámide: muchas pruebas unitarias
        rápidas, menos pruebas de integración, una capa delgada de pruebas de UI de extremo a extremo en flujos
        críticos.</div>
      <div class="dd-block dd-example"><span class="lbl">Ejemplo</span> Login, checkout y sincronización en una
        app en crecimiento con un presupuesto de CI de 20 minutos.</div>
      <div class="dd-block dd-problem"><span class="lbl">Problema</span> Apoyarse en XCUITests lentos y frágiles
        para todo hace que CI sea lento y falle por tiempos, así que la gente deja de confiar en
        él.</div>
      <div class="dd-block dd-solution"><span class="lbl">Solución</span> Empuje la lógica a view models
        inyectables cubiertos por pruebas unitarias rápidas; mantenga un puñado de pruebas de UI para los flujos
        principales; paralice en clones de simulador mediante un plan de pruebas. <b>&quot;Mantengo la forma de
        pirámide a propósito — las pruebas de UI verifican que los flujos críticos siguen funcionando de extremo
        a extremo, las pruebas unitarias cubren los casos límite de forma exhaustiva.&quot;</b></div>
    </div>`,
  },
];
