// Quiz de Android en español. Los módulos tipados son la fuente de verdad — editar directamente.
export type QuizQuestion = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  options: string[];
  answer: number;
  explanationHtml: string;
};

// Chips de filtro base del quiz. Los archivos avanzados añaden coroutines, compose, framework,
// di, data, arch, test — &quot;all&quot; se declara solo aquí para que aparezca una vez.
export const QUIZ_FILTERS: { value: string; label: string }[] = [
  { "value": "all", "label": "Todos" },
  { "value": "kotlin", "label": "Kotlin" },
  { "value": "opt", "label": "Optimización" },
  { "value": "ai", "label": "AI en el dispositivo" }
];

export const QUIZ: QuizQuestion[] = [
  {
    "id": "z1",
    "category": "kotlin",
    "categoryLabel": "Kotlin",
    "question": "¿Qué hace el operador Elvis ?:?",
    "options": [
      "Lanza una excepción si el lado izquierdo es nulo",
      "Retorna el lado derecho cuando el lado izquierdo es nulo",
      "Convierte un tipo nullable a no nulo",
      "Llama a un método solo si no es nulo"
    ],
    "answer": 1,
    "explanationHtml": "<code>a ?: b</code> evalúa a <code>a</code> si no es nulo, de lo contrario <code>b</code>. <code>!!</code> lanza en nulo; <code>?.</code> es la llamada segura."
  },
  {
    "id": "z2",
    "category": "kotlin",
    "categoryLabel": "Kotlin",
    "question": "¿Qué función de ámbito retorna el objeto receptor (no el resultado del lambda)?",
    "options": [
      "let",
      "run",
      "apply",
      "with"
    ],
    "answer": 2,
    "explanationHtml": "<code>apply</code> (y <code>also</code>) retorna el receptor, ideal para configurar un objeto. <code>let</code>/<code>run</code>/<code>with</code> retornan el resultado del lambda."
  },
  {
    "id": "z3",
    "category": "kotlin",
    "categoryLabel": "Kotlin",
    "question": "¿Por qué un `when` exhaustivo sobre un tipo sealed no necesita `else`?",
    "options": [
      "Kotlin siempre requiere una rama else",
      "El compilador conoce todos los subtipos, así que puede verificar completitud",
      "Los tipos sealed no pueden usarse en when",
      "else se añade automáticamente en tiempo de ejecución"
    ],
    "answer": 1,
    "explanationHtml": "Porque una jerarquía sealed está cerrada en tiempo de compilación, el compilador verifica que cada caso esté manejado — añadir un nuevo subtipo convierte el caso faltante en un error de compilación."
  },
  {
    "id": "z4",
    "category": "kotlin",
    "categoryLabel": "Kotlin",
    "question": "¿Qué requiere `reified` para funcionar?",
    "options": [
      "Un companion object",
      "Que la función sea `inline`",
      "Reflexión habilitada en tiempo de ejecución",
      "Una clase sealed"
    ],
    "answer": 1,
    "explanationHtml": "Los parámetros de tipo normalmente se borran. Marcar una función <code>inline</code> permite que el tipo sea <code>reified</code> — su tipo concreto está disponible en el sitio de llamada, ej. <code>T::class.java</code>."
  },
  {
    "id": "z5",
    "category": "kotlin",
    "categoryLabel": "Kotlin",
    "question": "`List<out T>` expresa ¿qué tipo de varianza?",
    "options": [
      "Contravarianza (consumidor)",
      "Invarianza",
      "Covarianza (productor)",
      "Bivarianza"
    ],
    "answer": 2,
    "explanationHtml": "<code>out</code> es covarianza: T solo se produce, así que <code>List&lt;Cat&gt;</code> se puede usar como <code>List&lt;out Animal&gt;</code>. <code>in</code> es contravarianza (consumidor)."
  },
  {
    "id": "z6",
    "category": "opt",
    "categoryLabel": "Optimización",
    "question": "¿Qué mejora un Baseline Profile?",
    "options": [
      "Latencia de red",
      "Arranque en frío y jank de primera ejecución vía compilación AOT de rutas calientes",
      "Velocidad de firma del APK",
      "Solo la batería"
    ],
    "answer": 1,
    "explanationHtml": "Los Baseline Profiles permiten a ART precompilar código caliente listado al momento de instalación, así que las primeras ejecuciones no se interpretan — mejorando el arranque en frío y la fluidez del scroll inicial."
  },
  {
    "id": "z7",
    "category": "opt",
    "categoryLabel": "Optimización",
    "question": "Un Composable se re-ejecuta en cada recomposición aunque sus datos parezcan inmutables. ¿Causa más probable?",
    "options": [
      "Está escrito en Kotlin",
      "Un parámetro inestable (ej. un List plano) impide el skip",
      "Usa muy pocos Modifiers",
      "Hermes está deshabilitado"
    ],
    "answer": 1,
    "explanationHtml": "Compose solo omite composables cuyos parámetros son estables e inmutables. Un tipo inestable fuerza recomposición — corrige con colecciones inmutables o <code>@Immutable</code>."
  },
  {
    "id": "z8",
    "category": "opt",
    "categoryLabel": "Optimización",
    "question": "¿Mejor key para un LazyColumn cuyos elementos pueden reordenarse o eliminarse?",
    "options": [
      "El índice de la lista",
      "Un ID único estable del elemento",
      "Math.random() en cada composición",
      "El título visible del elemento"
    ],
    "answer": 1,
    "explanationHtml": "Las keys de índice vinculan la identidad a la posición y fallan al reordenar/eliminar; las keys aleatorias rompen la identidad en cada pasada. Usa un ID único estable mediante <code>key = { it.id }</code>."
  },
  {
    "id": "z9",
    "category": "opt",
    "categoryLabel": "Optimización",
    "question": "¿Cuál es el primer paso correcto antes de optimizar el rendimiento?",
    "options": [
      "Añadir remember en todas partes",
      "Perfilar para encontrar el cuello de botella real en un build de producción",
      "Reescribir la pantalla en XML Views",
      "Aumentar el tamaño del heap"
    ],
    "answer": 1,
    "explanationHtml": "Mide primero (Perfetto / Macrobenchmark / profilers) en un build de producción, arregla el punto crítico demostrado, y luego vuelve a medir. La memoización a ciegas añade sobrecarga y frecuentemente no arregla nada."
  },
  {
    "id": "z10",
    "category": "opt",
    "categoryLabel": "Optimización",
    "question": "¿Un ANR es causado más frecuentemente por qué?",
    "options": [
      "Demasiados Composables",
      "Bloquear el hilo principal (I/O, locks) por varios segundos",
      "Usar StateFlow",
      "Habilitar R8"
    ],
    "answer": 1,
    "explanationHtml": "Los ANR se disparan cuando el hilo principal no puede procesar entrada (~5s). La solución es mover I/O y trabajo pesado fuera del hilo principal con coroutines + el dispatcher correcto."
  },
  {
    "id": "z11",
    "category": "opt",
    "categoryLabel": "Optimización",
    "question": "¿Qué herramienta detecta automáticamente objetos retenidos y muestra la cadena de referencias en builds de debug?",
    "options": [
      "LeakCanary",
      "Retrofit",
      "WorkManager",
      "Espresso"
    ],
    "answer": 0,
    "explanationHtml": "LeakCanary vigila objetos destruidos, dispara un heap dump al retenerlos, y reporta el camino más corto que los mantiene vivos — tu primera herramienta para cazar leaks."
  },
  {
    "id": "z12",
    "category": "opt",
    "categoryLabel": "Optimización",
    "question": "¿Por qué preferir un Android App Bundle (AAB) sobre un APK universal?",
    "options": [
      "Deshabilita R8",
      "Play genera splits optimizados por dispositivo (densidad, ABI, idioma), reduciendo el tamaño de descarga",
      "Cifra la app",
      "Elimina la necesidad de firma"
    ],
    "answer": 1,
    "explanationHtml": "Desde un AAB, Play entrega solo el código/recursos que cada dispositivo necesita, reduciendo el tamaño de instalación comparado con entregar cada densidad y ABI en un solo APK."
  },
  {
    "id": "z13",
    "category": "ai",
    "categoryLabel": "AI en el dispositivo",
    "question": "¿Qué beneficia principalmente la inferencia en el dispositivo?",
    "options": [
      "Tamaño de modelo ilimitado",
      "Privacidad, operación offline, y sin costo de servidor por llamada",
      "Mayor precisión garantizada que cualquier modelo de servidor",
      "No necesidad de manejar diferencias de dispositivos"
    ],
    "answer": 1,
    "explanationHtml": "Pesos locales + computación local mantienen los datos en el dispositivo, funcionan offline, y evitan costo de servidor — al precio del tamaño del modelo, RAM y fragmentación de dispositivos."
  },
  {
    "id": "z14",
    "category": "ai",
    "categoryLabel": "AI en el dispositivo",
    "question": "¿Cómo acceden las apps típicamente a Gemini Nano en Android?",
    "options": [
      "Empaquetando los pesos en el APK",
      "A través del servicio AICore del sistema / APIs ML Kit GenAI",
      "Mediante un WebView",
      "Solo a través de un endpoint en la nube"
    ],
    "answer": 1,
    "explanationHtml": "Gemini Nano se ejecuta en el servicio de sistema AICore en el dispositivo; las apps lo llaman a través de las APIs ML Kit GenAI (resumen, reescritura, etc.). Está limitado a dispositivos capaces."
  },
  {
    "id": "z15",
    "category": "ai",
    "categoryLabel": "AI en el dispositivo",
    "question": "¿Por qué cuantizar un modelo en el dispositivo (ej. int4/int8)?",
    "options": [
      "Para aumentar la precisión numérica",
      "Tamaño más pequeño e inferencia más rápida con pérdida mínima de calidad",
      "Para eliminar el requisito de RAM por completo",
      "Para requerir una conexión de red"
    ],
    "answer": 1,
    "explanationHtml": "La cuantización reduce la precisión de los pesos, cortando memoria y acelerando inferencia con un costo pequeño de calidad — esencial para adaptarse a dispositivos de gama media."
  },
  {
    "id": "z16",
    "category": "ai",
    "categoryLabel": "AI en el dispositivo",
    "question": "¿Mejor forma de entregar un modelo en el dispositivo de cientos de MB?",
    "options": [
      "Empaquetarlo en el APK con el resto de assets",
      "Hardcodearlo como una cadena base64",
      "Descargarlo bajo demanda con una UI de progreso y cachearlo",
      "Enviarlo por email a los usuarios"
    ],
    "answer": 2,
    "explanationHtml": "Empaquetar modelos enormes infla el binario y alcanza límites de entrega. Descarga en el primer uso con progreso + opt-in y almacena en el storage de la app; primero detecta la capacidad del dispositivo."
  },
  {
    "id": "z17",
    "category": "kotlin",
    "categoryLabel": "Kotlin",
    "question": "En Kotlin, `a == b` en dos instancias de data class compara...",
    "options": [
      "Identidad de objeto (misma instancia)",
      "Igualdad estructural vía equals() (campo por campo)",
      "Direcciones de memoria",
      "Siempre falso a menos que sean referencias idénticas"
    ],
    "answer": 1,
    "explanationHtml": "<code>==</code> es estructural (llama <code>equals()</code>, seguro con nulos); <code>===</code> es identidad referencial. Las data classes generan <code>equals</code> basado en campos."
  },
  {
    "id": "z18",
    "category": "kotlin",
    "categoryLabel": "Kotlin",
    "question": "¿Qué proporciona principalmente una @JvmInline value class?",
    "options": [
      "Reflexión más rápida",
      "Seguridad de tipo para un valor envuelto único sin asignación en la mayoría de casos",
      "Serialización automática",
      "Seguridad de hilos"
    ],
    "answer": 1,
    "explanationHtml": "Envuelve un valor (ej. <code>UserId(String)</code>) para seguridad de tipo sin el costo de boxing de una clase wrapper normal."
  },
  {
    "id": "z19",
    "category": "opt",
    "categoryLabel": "Optimización",
    "question": "Los layouts edge-to-edge deben añadir espacio alrededor de las barras del sistema usando...",
    "options": [
      "Altura de barra de estado hardcodeada",
      "WindowInsets (ej. safeDrawingPadding / imePadding)",
      "Un padding superior fijo de 24dp",
      "Deshabilitar la barra de navegación"
    ],
    "answer": 1,
    "explanationHtml": "WindowInsets se adaptan a las barras de estado/navegación, el IME y las muescas en todos los dispositivos; hardcodear alturas falla en navegación por gestos, teclados y muescas."
  },
  {
    "id": "z20",
    "category": "opt",
    "categoryLabel": "Optimización",
    "question": "El exceso de 'rojo' en la herramienta Debug GPU Overdraw indica...",
    "options": [
      "Memory leaks",
      "Los mismos pixeles se pintan muchas veces por frame (tasa de relleno desperdiciada)",
      "Errores de red",
      "Demasiadas coroutines"
    ],
    "answer": 1,
    "explanationHtml": "El overdraw significa que capas opacas apiladas repintan pixeles. Elimina fondos redundantes y aplanar jerarquías para reducirlo."
  },
  {
    "id": "z21",
    "category": "ai",
    "categoryLabel": "AI en el dispositivo",
    "question": "¿Por qué agrupar emisiones de tokens al transmitir un LLM en el dispositivo hacia Compose?",
    "options": [
      "Para ralentizar la generación deliberadamente",
      "Para evitar una tormenta de recomposiciones por actualizaciones de tokens muy rápidas",
      "Para ahorrar ancho de banda de red",
      "Para aumentar la precisión del modelo"
    ],
    "answer": 1,
    "explanationHtml": "La generación puede superar 60 tokens/segundo; emitir por token dispararía una inundación de recomposiciones. Consolida ~10 tokens/frame para proteger el hilo de la UI."
  },
  {
    "id": "z22",
    "category": "ai",
    "categoryLabel": "AI en el dispositivo",
    "question": "¿Gemini Nano está alojado por qué componente del sistema Android?",
    "options": [
      "WorkManager",
      "AICore",
      "La app de Play Store",
      "Un archivo .task empaquetado en tu APK"
    ],
    "answer": 1,
    "explanationHtml": "Gemini Nano se ejecuta dentro del servicio de sistema AICore (compartido entre apps), accedido a través de las APIs ML Kit GenAI — tu app no distribuye pesos de modelo."
  }
];
