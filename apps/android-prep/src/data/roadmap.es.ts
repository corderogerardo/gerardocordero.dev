import type { Level } from "@/lib/levels";

export type RoadmapStage = {
  level: Level;
  summary: string;
  /** Lo que ya puedes hacer en este nivel. */
  can: string[];
  /** Qué aprender para alcanzar el siguiente nivel. */
  next: string[];
  /** Dónde practicar en esta app (renderizado como HTML rico con enlaces). */
  drillHtml: string;
};

export const ROADMAP: RoadmapStage[] = [
  {
    level: "junior",
    summary:
      "Construyes pantallas y distribuyes features con guía. El objetivo es fluidez en los fundamentos — basics de Kotlin, composables, estado simple, listas, y navegación — para que puedas entregar una pantalla funcional de principio a fin.",
    can: [
      "Escribir Kotlin idiomático: val/var, seguridad de nulos (?., ?:), data classes, y expresiones when.",
      "Construir UI con Compose: Column/Row/Box, componentes de Material 3, y Modifiers.",
      "Mantener estado simple de UI con remember / mutableStateOf y elevarlo a un composable sin estado.",
      "Mostrar una lista con LazyColumn y navegar entre pantallas con Navigation-Compose.",
      "Obtener datos con una función suspend y renderizar estados de carga / error / vacío.",
    ],
    next: [
      "Fundamentos de coroutines: viewModelScope, Dispatchers, y seguridad del principal con withContext.",
      "ViewModel + StateFlow, y collectAsStateWithLifecycle para recolección segura.",
      "El ciclo de vida de Activity y por qué los cambios de configuración recrean la pantalla.",
      "Tu primer test unitario con JUnit + MockK, y un test de UI Compose.",
    ],
    drillHtml:
      'Practica las <a href="/flashcards">flashcards</a> filtradas a <b>Junior</b>, más las categorías <b>Kotlin</b> y <b>Estado y Flow</b>. Lee los temas de estudio <a href="/study#st-1">01</a>, <a href="/study#st-4">04</a>, <a href="/study#st-6">06</a>, y <a href="/study#st-7">07</a>.',
  },
  {
    level: "mid",
    summary:
      "Eres dueño de features de principio a fin — datos, estado, tests, y pulido — con poca supervisión. El objetivo es profundidad en el toolkit cotidiano de Android y el inicio de la conciencia arquitectónica y de rendimiento.",
    can: [
      "Usar coroutines y Flow bien: concurrencia estructurada, StateFlow/SharedFlow, combine, flatMapLatest.",
      "Aplicar MVVM con un UiState inmutable único y un repository como fuente de verdad.",
      "Persistir con Room y DataStore, y construir una capa de red Retrofit/OkHttp tipada.",
      "Conectar inyección de dependencias con Hilt y mantener clases inyectadas por constructor.",
      "Escribir tests unitarios + de integración y algunos tests de UI Compose; sobrevivir muerte del proceso con SavedStateHandle.",
    ],
    next: [
      "Rendimiento de Compose: estabilidad, ámbito de recomposición, derivedStateOf, lecturas diferidas.",
      "Clean Architecture / MVI, modularización, y la capa de dominio.",
      "Paging 3, WorkManager, deep links, y sincronización offline-first.",
    ],
    drillHtml:
      'Filtra flashcards a <b>Mid</b> y las categorías <b>Compose</b>, <b>Framework</b>, y <b>Estado y Flow</b>. Trabaja los temas de estudio <a href="/study#st-2">02</a>, <a href="/study#st-3">03</a>, <a href="/study#st-5">05</a>, y <a href="/study#st-8">08</a>–<a href="/study#st-13">13</a>.',
  },
  {
    level: "senior",
    summary:
      "Traes profundidad en arquitectura, rendimiento, concurrencia, y testing, y elevas al equipo a tu alrededor. El objetivo es ser la persona que perfila en lugar de adivinar y que razona sobre hilos, leaks, y estabilidad al dedillo.",
    can: [
      "Explicar el modelo de hilos, concurrencia estructurada, y cancelación con precisión.",
      "Perfilar y arreglar jank, memory leaks, y arranque en frío lento con Perfetto / Macrobenchmark / LeakCanary.",
      "Diseñar Compose para estabilidad y añadir Baseline Profiles para proteger rutas calientes.",
      "Razonar sobre seguridad en categorías de modelo de amenaza (Keystore, EncryptedSharedPreferences, pinning, Play Integrity, MASVS).",
      "Ser dueño de un release: CI, tests instrumentados, lanzamiento escalonado, tasa de crash-free, y un kill switch.",
    ],
    next: [
      "Diseño de sistemas a escala: offline-first, sincronización y resolución de conflictos, tiempo real, paginación.",
      "Estrategia de modularización, convention plugins, y presupuestos de tiempo de build/observabilidad.",
      "Mentorear a través de revisiones y multiplicar un equipo vía módulos compartidos.",
    ],
    drillHtml:
      'Filtra flashcards a <b>Senior</b> y las categorías <b>Rendimiento</b>, <b>Coroutines</b>, <b>DI</b>, y <b>Seguridad</b>. Lee los temas de estudio <a href="/study#st-14">14</a>–<a href="/study#st-19">19</a> y la <a href="/architecture">guía completa de Arquitectura</a>.',
  },
  {
    level: "architect",
    summary:
      "Diseñas sistemas Android de principio a fin y tomas decisiones de plataforma que mueven a todo un equipo. El objetivo es la toma de decisiones antes del código — para el peor dispositivo, peor red, y peor momento (muerte del proceso bajo presión de memoria).",
    can: [
      "Diseñar una feature de principio a fin y justificar arquitectura, estado, navegación, y estrategia de datos.",
      "Planificar modularización, el grafo de dependencias, y migraciones incrementales con riesgo acotado.",
      "Configurar CI/CD, infraestructura de build, generación de baseline profiles, y observabilidad en producción.",
      "Definir la postura de seguridad y la estrategia de testing en toda la organización.",
      "Multiplicar un equipo vía módulos compartidos, convention plugins, y revisión de código.",
    ],
    next: [
      "Estrategia de plataforma a nivel de organización: alcance de Kotlin Multiplatform, delivery dinámico, y tiempo de build a escala.",
      "Presupuestos de costo/rendimiento, SLOs, y evaluación de tecnología emergente (AI en el dispositivo).",
    ],
    drillHtml:
      'Filtra flashcards a <b>Architect</b> y la categoría <b>Arquitectura</b>. Trabaja la <a href="/architecture">guía de Arquitectura + Inmersiones profundas</a> y los temas de estudio <a href="/study#st-8">08</a>, <a href="/study#st-12">12</a>, <a href="/study#st-18">18</a>.',
  },
  {
    level: "beyond",
    summary:
      "La frontera — donde empujas lo que una app Android puede hacer. El objetivo es traer capacidad genuinamente nueva en el dispositivo y ser pionero en patrones que el resto del equipo adoptará.",
    can: [
      "Ejecutar modelos generativos en el dispositivo con Gemini Nano (AICore / APIs ML Kit GenAI) y MediaPipe LLM Inference, razonando sobre la compensación de privacidad/costo/latencia.",
      "Usar TensorFlow Lite / LiteRT para visión y audio con delegados GPU y cuantización.",
      "Empujar la plataforma: Kotlin Multiplatform, Compose Multiplatform, e interop profundo del sistema.",
    ],
    next: [
      "Contribuir upstream, prototipar con nuevos internos de Jetpack/Compose, y establecer la dirección del equipo en tecnología emergente.",
    ],
    drillHtml:
      'Filtra flashcards a <b>Beyond</b> y la categoría <b>AI en el dispositivo</b>, y lee el tema de estudio <a href="/study#st-20">20</a>.',
  },
];
