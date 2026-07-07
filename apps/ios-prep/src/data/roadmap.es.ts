import type { Level } from "@/lib/levels";

export type RoadmapStage = {
  level: Level;
  summary: string;
  /** What you can already do at this level. */
  can: string[];
  /** What to learn to reach the next level. */
  next: string[];
  /** Where to drill in this app (rendered as rich HTML with links). */
  drillHtml: string;
};

export const ROADMAP: RoadmapStage[] = [
  {
    level: "junior",
    summary:
      "Construye pantallas y distribuye funcionalidades con orientación. El objetivo aquí es fluidez en los fundamentos — sintaxis de Swift, vistas SwiftUI, estado, listas, navegación y obtención de datos — para que pueda entregar una pantalla funcional de principio a fin en Xcode.",
    can: [
      "Escribir Swift con comodidad: optionals, structs vs classes, enums, closures y semántica de valor.",
      "Construir pantallas SwiftUI con vistas, modificadores, stacks y List, y dirigirlas con @State y @Binding.",
      "Navegar con NavigationStack y presentar sheets; pasar datos entre pantallas.",
      "Llamar a una API REST con URLSession y async/await, descodificar JSON con Codable, y manejar estados de carga / error / vacío.",
      "Ejecutar y depurar una app en el simulador y un dispositivo desde Xcode.",
    ],
    next: [
      "Modelos observables: @Observable / ObservableObject y dónde debe vivir el estado (vista vs modelo).",
      "Fundamentos de Concurrencia de Swift — async/await, Task, y no bloquear el actor principal.",
      "MVVM: extraer lógica de las vistas hacia view models testeables.",
      "Escribir sus primeras pruebas unitarias con XCTest (o Swift Testing) y una prueba de UI.",
    ],
    drillHtml:
      'Practique las <a href="/flashcards">flashcards</a> filtradas por <b>Junior</b>, más las categorías de <b>Swift</b> y <b>SwiftUI</b>. Lea los temas de estudio <a href="/study#st-1">01</a>, <a href="/study#st-2">02</a>, <a href="/study#st-3">03</a> y <a href="/study#st-6">06</a>.',
  },
  {
    level: "mid",
    summary:
      "Posee funcionalidades de principio a fin — estado, datos, persistencia y pruebas — con poca orientación. El objetivo es profundidad en el kit de herramientas cotidiano de iOS y el inicio de la conciencia de rendimiento y concurrencia.",
    can: [
      "Modelar estado limpiamente con el framework de Observación (@Observable), @Environment y flujo de datos claro.",
      "Separar UI de lógica con MVVM; inyectar dependencias en lugar de codificar singletons.",
      "Persistir datos con SwiftData o Core Data, y cachear respuestas de red.",
      "Usar concurrencia estructurada: async let, task groups y @MainActor para actualizaciones de UI.",
      "Escribir pruebas unitarias significativas y algunas pruebas de UI; leer un reporte de crash y un trace básico de Instruments.",
    ],
    next: [
      "Concurrencia estricta de Swift 6: actors, Sendable, aislamiento y corrección de carreras de datos en tiempo de compilación.",
      "Rendimiento: diffing en SwiftUI, identidad, stacks perezosos, presupuestos de imagen/memoria y exploraciones profundas de Instruments.",
      "Interoperabilidad con UIKit — UIViewRepresentable, hosting controllers — y cuándo recurrir a UIKit.",
      "Patrones de arquitectura más allá de MVVM (unidireccional / estilo TCA) y modularización con SPM.",
    ],
    drillHtml:
      'Practique flashcards de <b>Intermedio</b> + <b>Senior</b> en <b>Concurrencia</b>, <b>Datos y Red</b> y <b>Pruebas</b>. Lea los temas de estudio <a href="/study#st-5">05</a>, <a href="/study#st-7">07</a>, <a href="/study#st-8">08</a> y <a href="/study#st-10">10</a>, luego intente una <a href="/practice">prompt de codificación</a>.',
  },
  {
    level: "senior",
    summary:
      "Es la persona que toma las decisiones difíciles: corrección de concurrencia, rendimiento bajo carga, profundidad nativa y seguridad. Puede justificar compromisos y mentorear a otros, y posee la calidad desde el simulador hasta la App Store.",
    can: [
      "Razonar sobre la seguridad contra carreras de datos de Swift 6: aislamiento de actors, Sendable, @MainActor y límites asíncronos.",
      "Diagnosticar y corregir problemas de rendimiento con Instruments (Time Profiler, Allocations, SwiftUI, Hangs).",
      "Conectar SwiftUI y UIKit en ambas direcciones, e integrar frameworks nativos con confianza.",
      "Configurar CI/CD (Xcode Cloud o Fastlane), firma, TestFlight y un proceso de lanzamiento repetible.",
      "Manejar seguridad y privacidad: Keychain, biometría, App Transport Security y privacy manifests.",
    ],
    next: [
      "Diseño de sistemas para móvil: arquitectura modular, sincronización offline-first y lanzamientos con feature flags.",
      "Aprovechamiento de la plataforma: construcción de herramientas, SwiftLint/format, sistemas de diseño compartidos y paquetes Swift reutilizables.",
      "Ingeniería de lanzamiento profunda: phased releases, implementaciones escalonadas y pipelines de crash/observabilidad.",
      "Liderar decisiones técnicas y escribir los ADRs que el equipo seguirá.",
    ],
    drillHtml:
      'Practique flashcards de <b>Senior</b> en <b>Rendimiento</b>, <b>Seguridad</b> y <b>CI/CD y Herramientas</b>. Lea los temas de estudio <a href="/study#st-9">09</a>, <a href="/study#st-12">12</a>, <a href="/study#st-13">13</a> y <a href="/study#st-14">14</a>, más las <a href="/architecture">exploraciones profundas de Arquitectura</a>, luego intente una <a href="/practice">prompt de diseño de sistemas</a>.',
  },
  {
    level: "architect",
    summary:
      "Diseña sistemas, no solo funcionalidades. Establece la arquitectura, los límites de módulos y las decisiones de plataforma que dan ventaja a todo un equipo — y mantiene una app distribuible mientras escala a muchos ingenieros y millones de usuarios.",
    can: [
      "Diseñar una app modular multi-paquete: límites claros, dirección de dependencias y aislamiento de funcionalidades.",
      "Elegir arquitectura (MVVM, unidireccional/TCA, Clean) según el equipo y producto, y defender los compromisos.",
      "Poseer build y lanzamiento a escala: caché, CI paralelo, estrategia de firma y phased rollouts.",
      "Establecer estándares transversales: observabilidad, accesibilidad, localización y postura de seguridad.",
      "Tomar decisiones de plataforma — adoptar nuevas APIs deliberadamente manteniendo un objetivo de despliegue mínimo razonable.",
    ],
    next: [
      "Avanzar hacia la inteligencia en el dispositivo: pipelines de Core ML e integración de Apple Intelligence.",
      "Influencia más allá de la base de código: estándares de contratación, estrategia técnica y experiencia de desarrollador.",
      "Contribuir al ecosistema — código abierto, discusiones de Swift Evolution y charlas en conferencias.",
    ],
    drillHtml:
      'Viva en las <a href="/architecture">exploraciones profundas de Arquitectura</a> y las flashcards de <b>Arquitecto</b>. Lea los temas de estudio <a href="/study#st-11">11</a> y <a href="/study#st-12">12</a>, y ensaye las <a href="/practice">prompts</a> y <a href="/pitches">pitches</a> de diseño de sistemas en voz alta.',
  },
  {
    level: "beyond",
    summary:
      "La frontera: empujar la plataforma misma. IA en el dispositivo, nuevas modalidades, y estar temprano — y ser creíble — en lo que Apple lance a continuación, desde Apple Intelligence hasta computación espacial.",
    can: [
      "Integrar Core ML, Vision, Natural Language y Speech para inferencia en el dispositivo y privada.",
      "Adoptar Apple Intelligence y modelos fundamentales en el dispositivo de forma reflexiva, con respaldos elegantes.",
      "Perfilar y reducir modelos, y razonar sobre latencia, memoria y batería para ML en el dispositivo.",
      "Prototipar con nuevas plataformas y APIs tempranamente, y distribuir detrás de banderas.",
    ],
    next: [
      "Mantenerse actualizado con cada WWDC y convertir nuevas APIs en funcionalidades diferenciadas distribuidas.",
      "Compartir lo que aprenda — escribir, hablar y open-source de las partes difíciles.",
    ],
    drillHtml:
      'Practique las flashcards de <b>Beyond</b> y <b>IA en el Dispositivo</b>, lea el tema de estudio <a href="/study#st-15">15</a>, y estudie la <a href="/architecture">exploración profunda</a> de IA en el dispositivo. La propia búsqueda de esta guía ejecuta un pequeño modelo completamente en su navegador — un ejemplo funcional de la idea.',
  },
];
