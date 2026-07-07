// Lista de verificación de preparación Android en español. Los módulos tipados son la fuente de verdad — editar directamente.
export type ChecklistItem = { id: string; label: string };
export type ChecklistGroup = { title: string; items: ChecklistItem[] };

export const PROGRESS_INTRO = "Una lista de verificación que cubre todas las áreas que una entrevista senior/staff de Android abarca, más tus temas de estudio. Marca los ítems cuando te sientas sólido en ellos — el progreso se guarda en este navegador.";

export const CHECKLIST_GROUPS: ChecklistGroup[] = [
  {
    "title": "🎥 Pitches grabados y revisados",
    "items": [
      { "id": "p-01", "label": "01 · Introducción de 30 segundos" },
      { "id": "p-02", "label": "02 · Introducción de 60 segundos" },
      { "id": "p-03", "label": "03 · Historia de carrera de 2 minutos" },
      { "id": "p-04", "label": "04 · Por qué Android / Kotlin" },
      { "id": "p-05", "label": "05 · Por qué esta empresa" },
      { "id": "p-06", "label": "06 · Inmersión profunda en el proyecto técnico más difícil" },
      { "id": "p-07", "label": "07 · STAR · bug de rendimiento/jank" },
      { "id": "p-08", "label": "08 · STAR · ownership de un release" },
      { "id": "p-09", "label": "09 · STAR · adaptabilidad / aprendizaje rápido" },
      { "id": "p-10", "label": "10 · Cierre + preguntas para hacer" }
    ]
  },
  {
    "title": "⚙️ Dominio de Kotlin y coroutines",
    "items": [
      { "id": "t-kotlin", "label": "Kotlin idiomático: seguridad de nulos, data/sealed classes, funciones de ámbito" },
      { "id": "t-generics", "label": "Genéricos y varianza (in/out), inline + reified" },
      { "id": "t-coroutines", "label": "Concurrencia estructurada, scopes, cancelación, seguridad del principal" },
      { "id": "t-dispatchers", "label": "Dispatchers (Main/IO/Default) e inyección para tests" },
      { "id": "t-flow", "label": "Operadores de Flow, StateFlow vs SharedFlow, stateIn(WhileSubscribed)" },
      { "id": "t-collect", "label": "Recolección segura del ciclo de vida (repeatOnLifecycle / collectAsStateWithLifecycle)" }
    ]
  },
  {
    "title": "🎨 Dominio de Jetpack Compose",
    "items": [
      { "id": "c-recompose", "label": "Composición, ámbito de recomposición y las 3 fases" },
      { "id": "c-state", "label": "State hoisting, remember vs rememberSaveable" },
      { "id": "c-effects", "label": "Efectos secundarios: LaunchedEffect, DisposableEffect, derivedStateOf, produceState" },
      { "id": "c-stability", "label": "Estabilidad / skippability y colecciones inmutables" },
      { "id": "c-perf", "label": "Rendimiento de Compose: lecturas diferidas, keys, métricas del compilador" },
      { "id": "c-test", "label": "Testing de UI Compose vía el árbol de semántica" }
    ]
  },
  {
    "title": "🏛 Arquitectura y Jetpack",
    "items": [
      { "id": "a-mvvm", "label": "MVVM / MVI y flujo de datos unidireccional" },
      { "id": "a-clean", "label": "Capas de Clean Architecture y fuente única de verdad" },
      { "id": "a-repo", "label": "Patrón repository y mapeo DTO→dominio" },
      { "id": "a-di", "label": "Hilt/Dagger: módulos, scopes, @Binds vs @Provides, qualifiers" },
      { "id": "a-room", "label": "Room (Flow DAOs, migraciones) y DataStore vs SharedPreferences" },
      { "id": "a-net", "label": "Retrofit/OkHttp, interceptores, Authenticator, offline-first" },
      { "id": "a-nav", "label": "Navigation-Compose, rutas tipadas y deep links" },
      { "id": "a-work", "label": "WorkManager vs Service vs coroutine para trabajo en segundo plano" },
      { "id": "a-modular", "label": "Estrategia de modularización y límites de build" }
    ]
  },
  {
    "title": "🚀 Rendimiento, testing y releases",
    "items": [
      { "id": "r-jank", "label": "Jank y timing de frames (JankStats, Macrobenchmark, Perfetto)" },
      { "id": "r-baseline", "label": "Baseline Profiles y optimización de arranque en frío" },
      { "id": "r-leak", "label": "Memory leaks (LeakCanary) y ANRs (disciplina del hilo principal)" },
      { "id": "r-r8", "label": "R8/ProGuard, App Bundle, App Startup" },
      { "id": "r-pyramid", "label": "Pirámide de testing: JUnit, MockK, Turbine, Robolectric, Espresso" },
      { "id": "r-gradle", "label": "Variantes/flavors de Gradle, catálogos de versiones, KSP vs kapt" },
      { "id": "r-cicd", "label": "CI/CD, firma, lanzamiento escalonado, tasa de crash-free" }
    ]
  },
  {
    "title": "🔐 Seguridad y frontera",
    "items": [
      { "id": "s-keystore", "label": "Keystore, EncryptedSharedPreferences, BiometricPrompt" },
      { "id": "s-net", "label": "Network Security Config, certificate pinning, Play Integrity" },
      { "id": "s-masvs", "label": "Vocabulario OWASP MASVS / Mobile Top 10" },
      { "id": "s-ai", "label": "AI en el dispositivo: Gemini Nano (AICore), MediaPipe LLM, compensaciones de TFLite" }
    ]
  },
  {
    "title": "✅ Verificaciones finales antes de la llamada",
    "items": [
      { "id": "f-company", "label": "Investigaste la app, stack y equipo de la empresa" },
      { "id": "f-quiz", "label": "Puntuación 90%+ en la pestaña Quiz" },
      { "id": "f-star", "label": "3 historias STAR ensayadas en voz alta (rendimiento, ownership, adaptabilidad)" },
      { "id": "f-qa", "label": "Todas las flashcards de Q&A clasificadas como 'Conocido'" },
      { "id": "f-setup", "label": "Cámara, micrófono, iluminación y espacio tranquilo probados; CV revisado" }
    ]
  }
];
