// Pitches de entrevista hablada para roles Android en español. Los módulos tipados son la fuente de verdad — editar directamente.
export type Pitch = {
  id: string;
  num: string;
  title: string;
  metaHtml: string;
  scriptHtml: string;
  tipsHtml: string;
};

export const PITCHES_INTRO_HTML = "<span class=\"lbl\">Cómo practicar</span>\n      No memorices palabra por palabra — suena robótico. Aprende la <b>estructura</b> de cada respuesta (los beats), luego dila\n      con tus propias palabras y sustituye por tus proyectos reales. Graba, mira una vez, corrige una cosa, graba de nuevo. Tres tomas vencen treinta relecturas.";

export const PITCHES: Pitch[] = [
  {
    "id": "p1",
    "num": "Pitch 01",
    "title": "La introducción de 30 segundos",
    "metaHtml": "<span class=\"pill\">&quot;Cuéntame de ti&quot; — corta</span><span class=\"pill accent\">~30 seg</span>",
    "scriptHtml": "<p>Hola, soy ingeniero Android con varios años creando apps de producción en Kotlin. Mi enfoque es Android moderno — Jetpack Compose, coroutines y Flow, y una arquitectura MVVM limpia respaldada por Hilt y Room.</p>\n        <p>Más recientemente lideré una migración a Compose y una reconstrucción offline-first: fui dueño de la arquitectura, el trabajo de rendimiento, y la pipeline de releases.</p>\n        <p>Me atrae este rol porque es senior, Kotlin-first, y el tipo de producto maduro donde la arquitectura y el rendimiento realmente importan.</p>",
    "tipsHtml": "<span class=\"lbl\">Consejos de entrega e inglés</span>\n        Manténlo ligero y seguro — esto es un apretón de manos, no la historia de tu vida. Termina en tres sustantivos: <b>Compose, coroutines, arquitectura</b>.\n        Pronuncia <i>Kotlin</i> como &quot;COT-lin&quot;, <i>coroutines</i> como &quot;co-ROO-teens&quot;, y <i>Hilt</i> claramente. Sonríe en la última línea — señala interés genuino."
  },
  {
    "id": "p2",
    "num": "Pitch 02",
    "title": "La introducción de 60 segundos",
    "metaHtml": "<span class=\"pill\">&quot;Cuéntame de ti&quot; — estándar</span><span class=\"pill accent\">~60–75 seg</span>",
    "scriptHtml": "<p>Claro. Soy ingeniero senior de Android. He pasado los últimos años distribuyendo apps Kotlin en Google Play, y me especializo en Android moderno: Jetpack Compose para UI, coroutines y Flow para asíncrono y estado, y MVVM con una capa de datos limpia.</p>\n        <p>En mi último equipo fui el líder técnico para una app de consumo pesada en pantallas. Lideré la migración del sistema de vistas a Compose, reconstruí la capa de datos para ser offline-first con Room como la fuente única de verdad y Retrofit sincronizando en segundo plano, y conecté todo el grafo con Hilt.</p>\n        <p>Gran parte de mi trabajo fue rendimiento: rastreé problemas de recomposición y jank con Perfetto y Macrobenchmark, añadí Baseline Profiles, y reduje el arranque en frío mediblemente. También fui dueño de releases — CI con tests instrumentados, lanzamientos escalonados, y monitoreo de la tasa de crash-free.</p>\n        <p>Busco un rol senior, Kotlin-first en un producto maduro donde pueda profundizar en arquitectura y rendimiento — que es exactamente lo que esto parece.</p>",
    "tipsHtml": "<span class=\"lbl\">Consejos de entrega e inglés</span>\n        Estructura = <b>quién soy → qué distribuí → mi mejor historia → qué quiero</b>. Pausa brevemente entre párrafos; esas pausas se leen como confianza.\n        Cuida <i>Macrobenchmark</i> (&quot;MACRO-bench-mark&quot;), <i>Retrofit</i> (&quot;RETRO-fit&quot;), y <i>Gradle</i> (&quot;GRAY-dul&quot;). No apresures la última frase — es tu línea de &quot;quiero este trabajo&quot;."
  },
  {
    "id": "p3",
    "num": "Pitch 03",
    "title": "La historia de carrera de 2 minutos",
    "metaHtml": "<span class=\"pill\">&quot;Recórreme tu trayectoria&quot;</span><span class=\"pill accent\">~2 min</span>",
    "scriptHtml": "<p>Te daré el arco corto. Empecé en Android en la época de Java y XML — Activities, Fragments, RxJava — construyendo features y aprendiendo la plataforma a la fuerza: bugs de ciclo de vida, cambios de configuración, y memory leaks.</p>\n        <p>Cuando Kotlin se convirtió en primera clase migré completamente, y eso cambió cómo escribo código: seguridad de nulos, clases sealed para estado, y coroutines en lugar de cadenas de callbacks. Reconstruí flujos asíncronos alrededor de concurrencia estructurada y Flow, lo que hizo la cancelación y testing genuinamente simple por primera vez.</p>\n        <p>Los últimos años fueron mi capítulo más profundo. Lideré una adopción de Compose en una app grande — no un rewrite, una migración incremental pantalla por pantalla — y re-arquitecté la capa de datos para ser offline-first: Room como fuente de verdad, un repository poseyendo la sincronización, y la UI solo observando estado. Introduje Hilt, modularicé la codebase por feature para compilaciones más rápidas, y configuré Baseline Profiles y Macrobenchmark para proteger el rendimiento de arranque y scroll.</p>\n        <p>Lo que une esto es que me importan los fundamentos aburridos — ciclo de vida, hilos, y estado — porque eso es lo que hace que una app se sienta rápida y no crashee. Un rol senior, Kotlin-first en un producto maduro es exactamente el siguiente paso que quiero.</p>",
    "tipsHtml": "<span class=\"lbl\">Consejos de entrega e inglés</span>\n        Cuéntalo como un <b>viaje con un punto de inflexión</b> (&quot;cando Kotlin se convirtió en primera clase migré completamente&quot;). Esa sola línea hace que la historia se sienta intencional.\n        Palabras difíciles: <i>coroutines</i>, <i>concurrencia estructurada</i>, <i>modularicé</i> (&quot;MOD-yoo-ler-ized&quot;). Termina con las palabras <b>&quot;siguiente paso&quot;</b> — te enmarca moviéndote hacia ellos."
  },
  {
    "id": "p4",
    "num": "Pitch 04",
    "title": "Por qué Android / Kotlin",
    "metaHtml": "<span class=\"pill\">&quot;Por qué este stack?&quot;</span><span class=\"pill accent\">~45 seg</span>",
    "scriptHtml": "<p>Dos razones. Primero, el oficio: Android te obliga a respetar restricciones — el ciclo de vida, memoria limitada, un solo hilo principal, variabilidad real de red. Hacer que una app se sienta instantánea en un teléfono de gama media con una conexión inestable es un problema genuinamente difícil y satisfactorio.</p>\n        <p>Segundo, Kotlin y Jetpack hicieron la plataforma un placer. Las coroutines convirtieron el asíncrono en algo que puedes leer de arriba a abajo; Compose hizo la UI declarativa e impulsada por estado; y el sistema de tipos atrapa una clase entera de bugs antes de que se distribuyan. Me gusta que Android moderno recompensa a ingenieros que piensan sobre estado e hilos con claridad.</p>",
    "tipsHtml": "<span class=\"lbl\">Consejos de entrega e inglés</span>\n        Las respuestas de dos partes (&quot;Primero… Segundo…&quot;) suenan organizadas y seguras. Termina en <b>restricciones</b> y <b>estado e hilos</b> — señalan senioridad.\n        Evita criticar otras plataformas; habla de lo que amas. Manténlo bajo un minuto."
  },
  {
    "id": "p5",
    "num": "Pitch 05",
    "title": "Por qué esta empresa",
    "metaHtml": "<span class=\"pill\">&quot;Por qué nosotros?&quot;</span><span class=\"pill accent\">~45 seg</span>",
    "scriptHtml": "<p>Este es para personalizar — así que aquí está la estructura. Abre con algo específico sobre su producto o cultura de ingeniería (una feature que admiras, su escala, su adopción de Compose, un post de blog de ingeniería). Luego conéctalo contigo: &quot;Ese es exactamente el tipo de problema en el que quiero trabajar, y se alinea con mi profundidad en X.&quot;</p>\n        <p>Cierra con el equipo y el nivel: &quot;Un rol senior, Kotlin-first en un producto tan maduro es donde hago mi mejor trabajo — quiero ser dueño de arquitectura y rendimiento, mentorear a través de revisiones, y distribuir cosas que se sostengan.&quot;</p>",
    "tipsHtml": "<span class=\"lbl\">Consejos de entrega e inglés</span>\n        Siempre investiga una cosa concreta: la feature destacada de su app, un post de blog técnico, o un lanzamiento reciente. La generalidad aquí es el error más común.\n        Nombra el <b>nivel</b> y <b>qué serás dueño</b> — muestra que piensas como una contratación, no un candidato."
  },
  {
    "id": "p6",
    "num": "Pitch 06",
    "title": "Proyecto técnico más difícil — inmersión profunda",
    "metaHtml": "<span class=\"pill\">&quot;Recórreme un proyecto difícil&quot;</span><span class=\"pill accent\">~2 min</span>",
    "scriptHtml": "<p>La estructura: elige un proyecto y cuéntalo como un problema, un diseño, y un resultado. Mi favorito es la reconstrucción offline-first.</p>\n        <p><b>Problema:</b> la app mostraba spinners constantemente y perdía el trabajo del usuario en una conexión caída, porque cada pantalla obtenía directamente de la red y mantenía su propia copia de los datos.</p>\n        <p><b>Diseño:</b> Hice la base de datos local de Room la fuente única de verdad. La UI observa <code>Flow</code> del DAO, así que siempre renderiza datos locales instantáneamente. Un repository posee la sincronización — escribe actualizaciones optimistas localmente, encola mutaciones, y reconcilia con el servidor vía WorkManager cuando la conectividad regresa, con una política de última escritura gana por tipo de registro. Todo está conectado a través de Hilt y se ejecuta en <code>viewModelScope</code> para que se cancele limpiamente.</p>\n        <p><b>Resultado:</b> la app funcionó completamente offline, el problema de spinner-en-cada-pantalla desapareció por las lecturas stale-while-revalidate, y nuestra tasa de crash-free subió porque dejamos de hacer trabajo de red frágil en el hilo principal. Añadí tests de Turbine alrededor de la lógica de sincronización para que no pudiera haber regresión.</p>",
    "tipsHtml": "<span class=\"lbl\">Consejos de entrega e inglés</span>\n        Usa la columna vertebral <b>Problema → Diseño → Resultado</b> y pausa entre ellos. Suelta dos o tres sustantivos precisos (<i>fuente única de verdad</i>, <i>WorkManager</i>, <i>stale-while-revalidate</i>) — la especificidad es lo que se lee como senior.\n        Ten un diagrama en tu cabeza que podrías bosquejar si comparten una pizarra."
  },
  {
    "id": "p7",
    "num": "Pitch 07",
    "title": "STAR · el bug de rendimiento / jank",
    "metaHtml": "<span class=\"pill\">&quot;Bug más difícil / victoria de rendimiento&quot;</span><span class=\"pill accent\">~90 seg</span>",
    "scriptHtml": "<p><b>Situación:</b> nuestro feed principal tartamudeaba al hacer scroll en dispositivos de gama media, y los usuarios lo notaban.</p>\n        <p><b>Tarea:</b> Fui dueño de hacerlo fluido sin un rewrite.</p>\n        <p><b>Acción:</b> Perfilar en lugar de adivinar — un test de scroll de Macrobenchmark más trazas de Perfetto y los contadores de recomposición del Layout Inspector. Dos culpables: un elemento de lista tomaba un parámetro <code>List</code> inestable, así que cada elemento se recomponía en cualquier cambio; y decodificábamos una imagen de tamaño completo en el hilo principal. Hice el modelo un tipo inmutable, añadí <code>key</code>s estables, moví la carga de imágenes fuera del hilo principal con un cargador adecuado, y generé un Baseline Profile para el feed.</p>\n        <p><b>Resultado:</b> el jank bajó a casi cero en el benchmark, el arranque-en-frío-a-primer-scroll mejoró, y dejé un test de Macrobenchmark en CI para que no pueda haber regresión. El equipo adoptó &quot;perfilar primero, luego arreglar el punto crítico demostrado&quot; como hábito.</p>",
    "tipsHtml": "<span class=\"lbl\">Consejos de entrega e inglés</span>\n        Di las cuatro palabras STAR en voz baja como señaladores. La línea memorable es <b>&quot;Perfilar en lugar de adivinar.&quot;</b> Termina con la <b>lección y el test de regresión</b>, no solo la corrección.\n        Practica <i>recomposición</i> (&quot;re-com-po-ZISH-un&quot;) y <i>Baseline Profile</i> hasta que fluyan."
  },
  {
    "id": "p8",
    "num": "Pitch 08",
    "title": "STAR · ownership de un release",
    "metaHtml": "<span class=\"pill\">&quot;Una vez que fuiste dueño de algo&quot;</span><span class=\"pill accent\">~90 seg</span>",
    "scriptHtml": "<p><b>Situación:</b> estábamos distribuyendo una feature significativa y nuestro proceso de release era ad-hoc y riesgoso.</p>\n        <p><b>Tarea:</b> Tomé ownership de la ruta del release de principio a fin.</p>\n        <p><b>Acción:</b> Configuré CI para ejecutar tests unitarios e instrumentados en cada PR, automatice la firma y la subida a Play Console, y nos movimos a un <b>lanzamiento escalonado</b> — 5% a 20% a 100% — con control de la tasa de crash-free. Puse la parte riesgosa de la feature detrás de un feature flag con kill switch, y escribí un runbook corto para rollback.</p>\n        <p><b>Resultado:</b> al 5% atrapamos un crash en un OEM específico, detuvimos, encontramos la causa raíz, distribuimos la corrección con un test de regresión, y relanzamos limpiamente. La feature alcanzó el 100% con una tasa de crash-free saludable, y el proceso de lanzamiento escalonado se convirtió en nuestro predeterminado.</p>",
    "tipsHtml": "<span class=\"lbl\">Consejos de entrega e inglés</span>\n        Enfatiza la palabra <b>&quot;yo fui dueño.&quot;</b> Nombra la métrica de guardia — <i>tasa de crash-free</i> — y las redes de seguridad (<i>kill switch</i>, <i>lanzamiento escalonado</i>). Esas son señales senior.\n        Mantén el compás de fallo corto y termina en &quot;el proceso se convirtió en nuestro predeterminado.&quot;"
  },
  {
    "id": "p9",
    "num": "Pitch 09",
    "title": "STAR · adaptabilidad / aprendizaje rápido",
    "metaHtml": "<span class=\"pill\">&quot;Aprendizaje rápido de algo nuevo&quot;</span><span class=\"pill accent\">~75 seg</span>",
    "scriptHtml": "<p><b>Situación:</b> Me uní a un equipo a mitad de camino en una codebase grande, desconocida y modularizada usando patrones que no había usado antes.</p>\n        <p><b>Tarea:</b> Ser productivo rápidamente sin romper nada.</p>\n        <p><b>Acción:</b> Leí el <b>flujo de datos antes de los archivos</b> — el grafo DI, el grafo de navegación, y los repositorios — para construir un modelo mental. Luego distribuí el cambio seguro más pequeño con un test para aprender el bucle de retroalimentación, y seguí las convenciones existentes en lugar de importar las mías. Hice algunas preguntas específicas temprano en lugar de adivinar.</p>\n        <p><b>Resultado:</b> Tuve un PR significativo fusionado en mi primera semana y era dueño de una feature dentro de un mes. La frase que vivo es &quot;el cambio seguro más pequeño que desbloquea la siguiente feature.&quot;</p>",
    "tipsHtml": "<span class=\"lbl\">Consejos de entrega e inglés</span>\n        &quot;Flujo de datos antes de archivos&quot; y &quot;cambio seguro más pequeño&quot; son frases limpias y memorables — usa las textualmente.\n        Muestra humildad más velocidad: hacer buenas preguntas temprano es una fortaleza, no una debilidad."
  },
  {
    "id": "p10",
    "num": "Pitch 10",
    "title": "Cierre + preguntas para hacerles",
    "metaHtml": "<span class=\"pill\">&quot;Alguna pregunta que quieras hacernos?&quot;</span><span class=\"pill accent\">~60 seg</span>",
    "scriptHtml": "<p>Siempre ten tres o cuatro preguntas agudas listas — eso señala que tú también los estás evaluando. Buenas para un rol Android:</p>\n        <ul>\n          <li>Qué tan avanzada está su adopción de Compose, y qué aún está en el sistema de vistas?</li>\n          <li>Cómo está modularizada la codebase, y cómo es el tiempo de compilación día a día?</li>\n          <li>Cómo es su proceso de release — lanzamientos escalonados, y qué tasa de crash-free manejan?</li>\n          <li>Cómo balancean trabajo de features contra rendimiento y pago de deuda técnica?</li>\n        </ul>\n        <p>Cierra con calidez: &quot;Esto ha sido genial — el trabajo se alinea exactamente con lo que quiero profundizar, y me emocionaría unirme.&quot;</p>",
    "tipsHtml": "<span class=\"lbl\">Consejos de entrega e inglés</span>\n        Elige preguntas cuyas respuestas realmente te importen — tus seguimientos sonarán genuinos. Evita preguntar algo respondido en su página de careers.\n        Termina con una oración segura y cálida. No te desvanezcas — termina en &quot;emocionaría unirme.&quot;"
  }
];
