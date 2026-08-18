// ============================================================================
// FLASHCARDS DATA
// ----------------------------------------------------------------------------
// Una sola lista de tarjetas. Cada tarjeta pertenece a una categoría y tiene
// un nivel de dificultad. La UI arma la sesión de estudio, los filtros y el
// progreso por categoría automáticamente a partir de esta lista.
//
// Reemplaza estas tarjetas por las tuyas. El reverso (`back`) admite saltos de
// línea con \n y un bloque de código opcional con `code`.
// ============================================================================

export type Level = 'easy' | 'medium' | 'hard'

export type Flashcard = {
  id: string
  /** Categoría / tema. Se usa para filtrar y para el progreso por categoría. */
  category: string
  level: Level
  /** Pregunta (cara frontal) */
  front: string
  /** Respuesta (reverso) */
  back: string
  /** Bloque de código opcional que se muestra en el reverso */
  code?: string
}

/** Título y subtítulo que se muestran en la cabecera de la sección. */
export const flashcardsMeta = {
  title: 'React Native — Senior Practice',
  subtitle:
    'Repasa conceptos clave con tarjetas interactivas. Voltea, marca lo que dominas y sigue tu progreso por categoría.',
}

export const flashcards: Flashcard[] = [
  {
    id: 'env-1',
    category: 'Environment & Expo',
    level: 'hard',
    front:
      "¿Cómo pruebas deep links en ambas plataformas y qué configuras en la pestaña Signing de Xcode?",
    back: "En iOS usas `xcrun simctl openurl booted <url>` y en Android `adb shell am start -W -a android.intent.action.VIEW -d \"<url>\"`. En la pestaña Signing & Capabilities de Xcode configuras el Team, el Bundle Identifier y activas 'Automatically manage signing' para que genere el provisioning profile.",
    code: `# iOS (simulador)\nxcrun simctl openurl booted myapp://profile/42\n\n# Android\nadb shell am start -W -a android.intent.action.VIEW \\\n  -d "myapp://profile/42" com.miapp`,
  },
  {
    id: 'core-1',
    category: 'Fundamentos',
    level: 'easy',
    front: '¿Cuál es el equivalente de <div> en React Native?',
    back: 'El componente <View>. Es el bloque de construcción fundamental para la UI y soporta flexbox, estilos y manejo de toques.',
    code: `import { View } from 'react-native'\n\n<View style={{ flex: 1 }}>\n  {/* contenido */}\n</View>`,
  },
  {
    id: 'core-2',
    category: 'Fundamentos',
    level: 'easy',
    front: '¿Cómo se muestra texto en React Native?',
    back: 'Con el componente <Text>. A diferencia de la web, TODO el texto debe estar dentro de un <Text>; no puedes poner strings sueltos dentro de una <View>.',
    code: `import { Text } from 'react-native'\n\n<Text>Hola mundo</Text>`,
  },
  {
    id: 'core-3',
    category: 'Fundamentos',
    level: 'medium',
    front: '¿Qué dirección tiene flexDirection por defecto en RN?',
    back: 'En React Native el valor por defecto de flexDirection es "column" (en la web es "row"). Esto ordena los hijos de arriba hacia abajo.',
  },
  {
    id: 'hooks-1',
    category: 'Hooks & Estado',
    level: 'easy',
    front: '¿Para qué sirve useState?',
    back: 'Permite agregar estado local a un componente funcional. Devuelve el valor actual y una función para actualizarlo, provocando un re-render.',
    code: `const [count, setCount] = useState(0)`,
  },
  {
    id: 'hooks-2',
    category: 'Hooks & Estado',
    level: 'medium',
    front: '¿Cuándo se ejecuta useEffect con array de dependencias vacío?',
    back: 'Se ejecuta una sola vez, después del primer render (montaje). Es ideal para suscripciones o llamadas iniciales.',
    code: `useEffect(() => {\n  // se ejecuta al montar\n}, [])`,
  },
  {
    id: 'hooks-3',
    category: 'Hooks & Estado',
    level: 'hard',
    front: '¿Por qué preferir la forma funcional de setState en actualizaciones consecutivas?',
    back: 'Porque garantiza que trabajas con el valor más reciente del estado. Si haces varias actualizaciones en el mismo ciclo, la forma directa puede usar un valor obsoleto (stale) por el batching de React.',
    code: `// ✅ correcto\nsetCount((c) => c + 1)\nsetCount((c) => c + 1) // suma 2\n\n// ⚠️ puede fallar\nsetCount(count + 1)\nsetCount(count + 1) // suma 1`,
  },
  {
    id: 'nav-1',
    category: 'Navegación',
    level: 'easy',
    front: '¿Cómo navegas a otra pantalla con React Navigation?',
    back: 'Usando el objeto navigation que recibe cada pantalla, con el método navigate y el nombre de la ruta.',
    code: `navigation.navigate('Detalle', { id: 42 })`,
  },
  {
    id: 'perf-1',
    category: 'Performance',
    level: 'medium',
    front: '¿Por qué usar FlatList en vez de map dentro de un ScrollView?',
    back: 'FlatList virtualiza la lista: solo monta las filas visibles y recicla las que salen de pantalla. Un map dentro de ScrollView renderiza TODOS los elementos a la vez, lo que consume memoria y ralentiza listas largas.',
    code: `<FlatList\n  data={items}\n  keyExtractor={(i) => i.id}\n  renderItem={({ item }) => <Row item={item} />}\n/>`,
  },
]

// --- Derivados (no editar) -------------------------------------------------

export const totalCards = flashcards.length

export const levelLabels: Record<Level, string> = {
  easy: 'Fácil',
  medium: 'Intermedio',
  hard: 'Avanzado',
}

export function getCategories(): string[] {
  return Array.from(new Set(flashcards.map((c) => c.category)))
}
