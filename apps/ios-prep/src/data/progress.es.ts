export type ChecklistItem = { id: string; label: string };
export type ChecklistGroup = { title: string; items: ChecklistItem[] };

export const PROGRESS_INTRO =
  "Una lista de verificación de preparación para toda la pila de iOS — lenguaje, frameworks, distribución y preparación para entrevistas. Marque los ítems cuando se sienta sólido en ellos; el progreso se guarda en este navegador.";

export const CHECKLIST_GROUPS: ChecklistGroup[] = [
  {
    title: "🧱 Swift y fundamentos del lenguaje",
    items: [
      { id: "c-sw-1", label: "Tipos por valor vs por referencia, y cuándo usar cada uno" },
      { id: "c-sw-2", label: "Optionals, desenvoltura segura, sin desenvolturas forzadas innecesarias" },
      { id: "c-sw-3", label: "Enums con valores asociados para modelar estado" },
      { id: "c-sw-4", label: "Diseño orientado a protocolos y genéricos" },
      { id: "c-sw-5", label: "ARC: strong/weak/unowned y romper retain cycles" },
    ],
  },
  {
    title: "🎨 SwiftUI y UIKit",
    items: [
      { id: "c-ui-1", label: "Construir pantallas con vistas, modificadores, stacks y List" },
      { id: "c-ui-2", label: "Posesión de estado: @State, @Binding, @Observable, @Environment" },
      { id: "c-ui-3", label: "Identidad estable en ForEach; stacks perezosos para contenido largo" },
      { id: "c-ui-4", label: "Ciclo de vida de UIViewController y fundamentos de Auto Layout" },
      { id: "c-ui-5", label: "Puente SwiftUI ↔ UIKit (representable / hosting controller)" },
    ],
  },
  {
    title: "⚙️ Concurrencia, datos y pruebas",
    items: [
      { id: "c-co-1", label: "async/await y concurrencia estructurada (async let, task groups)" },
      { id: "c-co-2", label: "Actors, @MainActor, Sendable y aislamiento de Swift 6" },
      { id: "c-co-3", label: "URLSession + Codable; mapear JSON desordenado limpiamente" },
      { id: "c-co-4", label: "Persistencia: SwiftData / Core Data; Keychain para secretos" },
      { id: "c-co-5", label: "Pruebas unitarias + de UI; diseñar para testeabilidad mediante inyección" },
    ],
  },
  {
    title: "🏛 Arquitectura y rendimiento",
    items: [
      { id: "c-ar-1", label: "MVVM en SwiftUI; saber cuándo encaja unidireccional/TCA" },
      { id: "c-ar-2", label: "Modularizar con paquetes Swift locales" },
      { id: "c-ar-3", label: "Patrón repository y una capa de datos limpia" },
      { id: "c-ar-4", label: "Perfile con Instruments; corrija un punto caliente real" },
      { id: "c-ar-5", label: "Sincronización offline-first y resolución de conflictos" },
    ],
  },
  {
    title: "🚢 Distribución: CI/CD, App Store, seguridad",
    items: [
      { id: "c-sh-1", label: "CI ejecuta pruebas; entender el firma de código" },
      { id: "c-sh-2", label: "TestFlight, versión vs número de build, phased release" },
      { id: "c-sh-3", label: "Evitar rechazos comunes en la revisión de App Store" },
      { id: "c-sh-4", label: "ATS, privacy manifest, App Tracking Transparency" },
    ],
  },
  {
    title: "🎯 Preparación para entrevistas",
    items: [
      { id: "c-iv-1", label: "Ha practicado las flashcards hasta tener un montón pequeño de Pendientes" },
      { id: "c-iv-2", label: "Aprobó el quiz con las explicaciones entendidas" },
      { id: "c-iv-3", label: "Resolvió varias prompts de codificación sin mirar" },
      { id: "c-iv-4", label: "Ensayó cada pitch en voz alta frente a la cámara" },
      { id: "c-iv-5", label: "Puede ubicarse en la hoja de ruta y nombrar su próximo nivel" },
    ],
  },
];
