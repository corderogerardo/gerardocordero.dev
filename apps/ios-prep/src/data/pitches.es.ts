export type Pitch = {
  id: string;
  num: string;
  title: string;
  metaHtml: string;
  scriptHtml: string;
  tipsHtml: string;
};

export const PITCHES_INTRO_HTML = `<span class="lbl">Cómo practicar</span>
  No memorice palabra por palabra — suena robótico. Aprenda la <b>estructura</b> de cada respuesta (los beats),
  luego dígalo con sus propias palabras. Estas son explicaciones orales de temas centrales de iOS — exactamente
  lo que un entrevistador significa cuando dice &quot;explíqueme X&quot;. Grabe, vea una vez, corrija una cosa,
  grabe de nuevo.`;

export const PITCHES: Pitch[] = [
  {
    id: "p1",
    num: "Pitch 01",
    title: "Explique tipos por valor vs por referencia",
    metaHtml: `<span class="pill">¿Cuál es la diferencia entre un struct y una clase?</span><span class="pill accent">~45 seg</span>`,
    scriptHtml: `<p>En Swift la gran distinción es entre tipos por valor y tipos por referencia. Los structs y
        enums son tipos por valor — cuando los asigna o los pasa, obtiene una copia, por lo que no hay estado
        mutable compartido de que preocuparse. Las clases son tipos por referencia: cada referencia apunta a la
        misma instancia, y están gestionadas por conteo de referencias automático.</p>
      <p>Por defecto uso un struct, especialmente para modelos y vistas SwiftUI, porque la semántica de valor hace
        que el código sea más fácil de razonar. Recurro a una clase cuando genuinamente necesito identidad o
        comportamiento de referencia compartidos — por ejemplo un objeto modelo observable. Y el costo de copiar
        generalmente no es un problema porque las colecciones de Swift usan copy-on-write: solo copian realmente
        cuando muta una segunda referencia.</p>`,
    tipsHtml: `<span class="lbl">Consejos de entrega</span> Aterrice el resumen de una línea primero —
      &quot;los valores se copian, las referencias se comparten&quot; — luego dé la parte de &quot;cuándo elijo
      cada uno&quot;. Diga <i>enum</i> como &quot;ee-num&quot;, y no apresure &quot;copy-on-write&quot;; haga
      una pausa antes para que caiga como el detalle de senior.`,
  },
  {
    id: "p2",
    num: "Pitch 02",
    title: "Explíqueme el flujo de datos de SwiftUI",
    metaHtml: `<span class="pill">¿Cómo funciona el estado en SwiftUI?</span><span class="pill accent">~60 seg</span>`,
    scriptHtml: `<p>SwiftUI es declarativo: una vista es una función del estado, así que describo cómo debería
        verse la UI para el estado actual y el framework diff y actualiza la pantalla cuando ese estado
        cambia.</p>
      <p>La habilidad es elegir la posesión correcta. <code>@State</code> es para el estado que una vista posee
        por sí misma. <code>@Binding</code> es una referencia bidireccional al estado poseído en otro lugar, para
        que un hijo pueda editar el valor de un padre. Para modelos compartidos uso el framework de Observación —
        una clase <code>@Observable</code> que mantengo con <code>@State</code> y vinculo con
        <code>@Bindable</code>. Y <code>@Environment</code> es la inyección de dependencias incorporada de
        SwiftUI para las cosas que se pasan hacia abajo en el árbol.</p>
      <p>El principio debajo de todo esto es una única fuente de verdad: el estado vive en un lugar y fluye hacia
        abajo como bindings, por lo que la UI siempre es una reflexión consistente de ese estado.</p>`,
    tipsHtml: `<span class="lbl">Consejos de entrega</span> Estructúrelo como &quot;declarativo → quién posee el
      estado → una fuente de verdad&quot;. Si quieren profundidad, mencione que <code>@Observable</code> rastrea
      lecturas por propiedad, por lo que solo las vistas que leen un valor modificado se vuelven a renderizar.
      Diga &quot;binding&quot;, &quot;observable&quot;, &quot;environment&quot; con claridad.`,
  },
  {
    id: "p3",
    num: "Pitch 03",
    title: "Explique la concurrencia de Swift y los actors",
    metaHtml: `<span class="pill">¿Cómo maneja la concurrencia?</span><span class="pill accent">~90 seg</span>`,
    scriptHtml: `<p>El Swift moderno se construye sobre async/await y la concurrencia estructurada. Una función
        asíncrona puede suspender sin bloquear un hilo, por lo que escribo código asíncrono que se lee de arriba a
        abajo en lugar de anidar completion handlers. Para trabajo paralelo uso <code>async let</code> o un task
        group — los hijos se ejecutan concurrentemente y se esperan y cancelan juntos como una unidad.</p>
      <p>Para el estado mutable compartido uso actors. Un actor serializa el acceso a su estado, por lo que los
        llamadores concurrentes no pueden competir — reemplaza locks y colas manuales. Y <code>@MainActor</code>
      garantiza que el código se ejecute en el hilo principal, donde mantengo la UI y los view models, en lugar
        de esparcir dispatch-to-main por todas partes.</p>
      <p>Lo que une todo esto ahora es Swift 6, que verifica todo esto en tiempo de compilación: los tipos que
        cruzan límites de concurrencia deben ser <code>Sendable</code>, y el compilador aplica el aislamiento de
        actors. Así que una clase entera de carreras de datos se convierte en un error de compilación en lugar
        de un fallo en producción.</p>`,
    tipsHtml: `<span class="lbl">Consejos de entrega</span> Tres beats: &quot;async/await + concurrencia
      estructurada → actors para estado compartido → Swift 6 lo hace seguro en tiempo de compilación&quot;. Diga
      <i>actor</i>, <i>Sendable</i> (&quot;SEND-a-bull&quot;) y <i>aislamiento</i> con claridad — estas son las
      palabras que señalan profundidad de senior.`,
  },
  {
    id: "p4",
    num: "Pitch 04",
    title: "¿Cómo piensa sobre la arquitectura de apps?",
    metaHtml: `<span class="pill">¿Cómo arquitectaría una app iOS grande?</span><span class="pill accent">~90 seg</span>`,
    scriptHtml: `<p>Empiezo por el equipo y el producto, no por un patrón favorito. Para la mayoría de las apps
        uso MVVM con el framework de Observación — vistas delgadas, un view model observable con la lógica y
        dependencias inyectadas detrás de protocolos para que todo sea testeable. Cuando una app se vuelve grande
        y con mucha lógica, me acerco a una arquitectura unidireccional como TCA, donde el estado vive en un
        lugar y los cambios fluyen a través de acciones, lo que hace que el comportamiento sea testeable de forma
        exhaustiva.</p>
      <p>La decisión que más me importa a escala es la modularización. Divido la app en paquetes Swift locales —
        módulos de funcionalidad que dependen de paquetes compartidos Core, DesignSystem y Networking, nunca entre
        sí. Eso fuerza límites, paraleliza las compilaciones y permite que las funcionalidades se prueben y
        previsualicen de forma aislada.</p>
      <p>Y trato la preparación para producción como parte de la arquitectura: un router para que la navegación
        sean solo datos, observabilidad y reporte de crashes, y feature flags con phased rollout para que pueda
        distribuir de forma segura y apagar algo sin un nuevo build.</p>`,
    tipsHtml: `<span class="lbl">Consejos de entrega</span> Empiece con &quot;depende del equipo y el
      producto&quot; — eso es la señal de senior. Luego dé la respuesta de modularización como su punto más
      fuerte. Pronuncie <i>TCA</i> como las letras, y no exagere — encuadre los patrones como
      compromisos.`,
  },
  {
    id: "p5",
    num: "Pitch 05",
    title: "¿Cómo aborda el rendimiento?",
    metaHtml: `<span class="pill">Una pantalla tiene tirones — ¿qué hace?</span><span class="pill accent">~60 seg</span>`,
    scriptHtml: `<p>Regla uno: mida antes de optimizar, porque el cuello de botella generalmente no está donde yo
        supondría. Recurro a Instruments — Time Profiler para CPU, Allocations y Leaks para memoria, el
        instrumento SwiftUI para conteo de view-body, y Hangs para bloqueos del hilo principal.</p>
      <p>En SwiftUI la mayoría de las ganancias vienen de hacer menos: mantener el body de la vista ligero y puro,
        dar a las vistas identidad estable para que se reutilicen, usar stacks perezosos y List para contenido
        largo, y dejar que el framework de Observación re-renderice solo las vistas que leen una propiedad
        modificada. Para un feed de imágenes específicamente, reduzco la resolución fuera del hilo principal y
        cachéo miniaturas descodificadas — descodificar imágenes de resolución completa en una celda pequeña es la
        causa clásica de frames perdidos y picos de memoria.</p>`,
    tipsHtml: `<span class="lbl">Consejos de entrega</span> Abra con &quot;primero mida, con Instruments&quot; —
      suena instantáneamente como senior. Luego dé un ejemplo concreto (el feed de imágenes). Diga
      <i>Instruments</i> como la herramienta, no &quot;instrumentos&quot; la palabra genérica — enfatícelo.`,
  },
  {
    id: "p6",
    num: "Pitch 06",
    title: "Explíqueme su proceso de lanzamiento",
    metaHtml: `<span class="pill">¿Cómo distribuye a App Store?</span><span class="pill accent">~75 seg</span>`,
    scriptHtml: `<p>Quiero que distribuir sea aburrido y repetible. En cada pull request, CI construye la app y
        ejecuta pruebas unitarias y de UI más lint. Cuando algo hace merge a main, CI archive, firma y carga un
        build de TestFlight automáticamente, autoincrementando el número de build.</p>
      <p>Para un lanzamiento promuevo un build de TestFlight a App Store y uso un phased rollout, para que la
        actualización llegue a un porcentaje creciente de usuarios durante aproximadamente una semana — si las
        tasas de crash aumentan, puedo pausarlo. Uso ya sea Xcode Cloud para integración estrecha con App Store
        Connect, o lanes de Fastlane en un CI como GitHub Actions cuando quiero más control, y gestiono el firma
        de código de forma reproducible para que no dependa del portátil de una persona.</p>
      <p>La red de seguridad es monitoreo de crashes más una bandera de apagado de funcionalidad, para que un
        lanzamiento defectuoso pueda desactivarse sin esperar a que un nuevo build pase la revisión.</p>`,
    tipsHtml: `<span class="lbl">Consejos de entrega</span> Beats: &quot;PR ejecuta pruebas → main envía
      TestFlight → lanzamiento es un phased rollout con plan de rollback&quot;. Distinga versión de número de
      build si preguntan. Diga <i>TestFlight</i>, <i>Xcode Cloud</i> y <i>Fastlane</i> como nombres de
      producto.`,
  },
  {
    id: "p7",
    num: "Pitch 07",
    title: "¿Cómo mantiene una app segura y privada?",
    metaHtml: `<span class="pill">¿Cómo maneja datos sensibles?</span><span class="pill accent">~60 seg</span>`,
    scriptHtml: `<p>Los secretos como tokens y contraseñas van en el Keychain, que está cifrado y respaldado por
        hardware — nunca en UserDefaults, que es solo un plist sin cifrar. Los flujos sensibles se protegen con
        biometría a través del framework LocalAuthentication, siempre con un respaldo de código de acceso.</p>
      <p>Del lado de la red mantengo App Transport Security activado, para que las conexiones sean HTTPS con TLS
        moderno por defecto. Y en privacidad, declaro un privacy manifest con los datos que la app y sus SDK
        recopilan y las APIs de razón requerida que usa, y solicito permiso de rastreo antes de tocar el
        identificador de publicidad. La mentalidad es minimización de datos — los datos más seguros son los que
        nunca recopila, lo cual también es un argumento para hacer el procesamiento en el dispositivo.</p>`,
    tipsHtml: `<span class="lbl">Consejos de entrega</span> Una regla clara y directa para cada uno: Keychain
      para secretos, biometría para flujos sensibles, ATS para la red, privacy manifest para la tienda. Diga
      <i>Keychain</i> y <i>biometría</i> con claridad, y cierre con &quot;minimización de datos&quot; — suena
      con principios.`,
  },
  {
    id: "p8",
    num: "Pitch 08",
    title: "¿Por qué IA en el dispositivo?",
    metaHtml: `<span class="pill">¿Por qué ejecutar ML en el dispositivo?</span><span class="pill accent">~60 seg</span>`,
    scriptHtml: `<p>La inferencia en el dispositivo gana en cuatro cosas: privacidad, porque los datos nunca salen
        del dispositivo; latencia, porque no hay ida y vuelta de red; soporte sin conexión; y costo, porque no
        hay factura por llamada. Apple lo acelera con el Neural Engine.</p>
      <p>La caja de herramientas es Core ML para ejecutar modelos entrenados, Create ML para entrenarlos, y
        frameworks de tareas como Vision para imágenes, Natural Language para texto y Speech para transcripción —
        y Apple Intelligence está llevando las funciones generativas en el dispositivo más lejos. Mi regla es
        ejecutar en el dispositivo siempre que la tarea quepa, y volver a un modelo de servidor solo cuando el
        trabajo genuinamente exceda lo que el dispositivo puede hacer. Un ejemplo concreto es la búsqueda
        semántica: incrustar contenido con un modelo pequeño, almacenar los vectores localmente y clasificar por
        similitud — completamente privado y sin conexión.</p>`,
    tipsHtml: `<span class="lbl">Consejos de entrega</span> Empiece con la lista de cuatro palabras —
      &quot;privacidad, latencia, sin conexión, costo&quot;. Luego nombre los frameworks. Diga <i>Core ML</i>
      como &quot;core M-L&quot; y <i>Neural Engine</i> como nombre propio. Cierre con el ejemplo de búsqueda
      semántica para demostrar que realmente ha construido con ello.`,
  },
];
