// ============================================================================
// CHALLENGES DATA
// ----------------------------------------------------------------------------
// Reemplaza el contenido de estos challenges con el tuyo.
// Cada challenge tiene: enunciado, código inicial, pistas desbloqueables
// paso a paso y la solución final con explicación.
// ============================================================================

export type Difficulty = 'Fácil' | 'Intermedio' | 'Avanzado'

export type Challenge = {
  id: number
  slug: string
  title: string
  summary: string
  difficulty: Difficulty
  /** Minutos estimados */
  estimatedMinutes: number
  tags: string[]
  /** Enunciado detallado del problema (admite \n para párrafos) */
  prompt: string
  /** Lista de objetivos/requisitos a cumplir */
  objectives: string[]
  /** Código de partida que ve el usuario */
  starterCode: string
  /** Pistas que el usuario desbloquea una a una */
  hints: string[]
  /** Código de la solución */
  solutionCode: string
  /** Explicación de la solución */
  solutionExplanation: string
}

export const challenges: Challenge[] = [
  {
    id: 1,
    slug: 'contador-simple',
    title: 'Contador con useState',
    summary:
      'Construye un contador con botones de incrementar y decrementar usando estado.',
    difficulty: 'Fácil',
    estimatedMinutes: 10,
    tags: ['Hooks', 'useState', 'UI'],
    prompt:
      'Crea un componente Counter que muestre un número y dos botones: uno para sumar y otro para restar.\n\nEl valor debe empezar en 0 y actualizarse en pantalla cada vez que el usuario pulse un botón.',
    objectives: [
      'Usar useState para guardar el valor del contador',
      'Mostrar el valor actual dentro de un componente <Text>',
      'Incrementar y decrementar al pulsar cada botón',
    ],
    starterCode: `import { View, Text, Button } from 'react-native'
import { useState } from 'react'

export default function Counter() {
  // 1. Declara el estado del contador

  return (
    <View style={{ padding: 24, gap: 12 }}>
      {/* 2. Muestra el valor */}
      {/* 3. Agrega los botones */}
    </View>
  )
}`,
    hints: [
      'Declara el estado con: const [count, setCount] = useState(0)',
      'Para actualizar usa la forma funcional: setCount((c) => c + 1) para evitar problemas de sincronización.',
      'El componente <Button> de RN usa la prop onPress (no onClick) y title para el texto.',
    ],
    solutionCode: `import { View, Text, Button } from 'react-native'
import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 32, textAlign: 'center' }}>{count}</Text>
      <Button title="Incrementar" onPress={() => setCount((c) => c + 1)} />
      <Button title="Decrementar" onPress={() => setCount((c) => c - 1)} />
    </View>
  )
}`,
    solutionExplanation:
      'useState(0) inicializa el contador en 0. Usamos la forma funcional setCount((c) => c + 1) porque garantiza que trabajamos con el valor más reciente del estado. En React Native los botones responden a onPress en lugar de onClick.',
  },
  {
    id: 2,
    slug: 'lista-con-flatlist',
    title: 'Renderizar una lista con FlatList',
    summary:
      'Muestra una lista de elementos de forma eficiente con FlatList y keyExtractor.',
    difficulty: 'Intermedio',
    estimatedMinutes: 15,
    tags: ['Listas', 'FlatList', 'Performance'],
    prompt:
      'Dado un array de tareas, renderízalas usando FlatList. Cada tarea debe mostrar su título.\n\nEvita usar map dentro de un ScrollView: FlatList solo renderiza lo visible y es mucho más eficiente para listas largas.',
    objectives: [
      'Pasar el array a la prop data de FlatList',
      'Definir renderItem para mostrar cada tarea',
      'Usar keyExtractor con un id único',
    ],
    starterCode: `import { FlatList, View, Text } from 'react-native'

const tareas = [
  { id: '1', titulo: 'Aprender FlatList' },
  { id: '2', titulo: 'Practicar hooks' },
  { id: '3', titulo: 'Construir una app' },
]

export default function ListaTareas() {
  return (
    <View style={{ flex: 1 }}>
      {/* Renderiza la lista aquí */}
    </View>
  )
}`,
    hints: [
      'FlatList recibe data={tareas} con el array de datos.',
      'renderItem recibe un objeto { item }; retorna el JSX de cada fila.',
      'keyExtractor={(item) => item.id} le da a React una key estable por fila.',
    ],
    solutionCode: `import { FlatList, View, Text } from 'react-native'

const tareas = [
  { id: '1', titulo: 'Aprender FlatList' },
  { id: '2', titulo: 'Practicar hooks' },
  { id: '3', titulo: 'Construir una app' },
]

export default function ListaTareas() {
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={tareas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={{ padding: 16 }}>{item.titulo}</Text>
        )}
      />
    </View>
  )
}`,
    solutionExplanation:
      'FlatList virtualiza la lista: solo monta las filas visibles. data recibe el array, renderItem describe cómo dibujar cada elemento y keyExtractor asigna una key única para optimizar los re-renders.',
  },
]

export function getChallenge(id: number): Challenge | undefined {
  return challenges.find((c) => c.id === id)
}
