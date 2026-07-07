// Flashcards de entrevistas Android en español. Los módulos tipados son la fuente de verdad — editar directamente.
import type { Level } from "@/lib/levels";

export type Flashcard = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  answerHtml: string;
  /** Nivel de antigüedad opcional; los predeterminados se derivan por categoría en lib/levels. */
  level?: Level;
};

// Lista maestra de filtros — cada categoría utilizada en todos los archivos de flashcards aparece
// exactamente una vez en estos arrays (los archivos avanzados añaden coroutines, di, data,
// gradle, security). Mantiene los chips de filtro deduplicados.
export const FLASHCARD_FILTERS: { value: string; label: string }[] = [
  { "value": "all", "label": "Todos" },
  { "value": "kotlin", "label": "Kotlin" },
  { "value": "compose", "label": "Compose" },
  { "value": "framework", "label": "Framework" },
  { "value": "arch", "label": "Arquitectura" },
  { "value": "state", "label": "Estado y Flow" },
  { "value": "perf", "label": "Rendimiento" },
  { "value": "test", "label": "Testing" },
  { "value": "behavior", "label": "Comportamental" },
  { "value": "opt", "label": "Optimización" },
  { "value": "ai", "label": "AI en el dispositivo" }
];

export const FLASHCARDS: Flashcard[] = [
  {
    "id": "k1",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "val vs var — ¿y por qué Kotlin promueve la inmutabilidad?",
    "answerHtml": "<code>val</code> es una referencia de solo lectura (se asigna una vez); <code>var</code> es reasignable. La inmutabilidad por defecto hace que el estado sea más fácil de razonar y es esencial para la seguridad de hilos y la estabilidad de Compose. Ten en cuenta que <code>val</code> solo congela la <i>referencia</i>, no el objeto — un <code>val list: MutableList</code> aún puede ser modificado; prefiere tipos inmutables como <code>List</code> para bloquearlo realmente."
  },
  {
    "id": "k2",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "¿Cómo funciona la seguridad de nulos en Kotlin y por qué !! es una mala práctica?",
    "answerHtml": "Los tipos son no nulos por defecto; <code>String?</code> opta por la anulabilidad. Accedes de forma segura con <code>?.</code>, estableces un valor por defecto con Elvis <code>?:</code>, y haces un smart-cast después de una verificación de nulidad. <code>!!</code> asume no nulidad y lanza <code>NullPointerException</code> si es incorrecto — convierte una garantía en tiempo de compilación en un error en tiempo de ejecución. Empuja la anulabilidad al límite (parsing, tipos de plataforma Java) para que el resto del código sea no nulo por construcción."
  },
  {
    "id": "k3",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "¿Qué ofrecen las data classes y cuál es el problema con copy()?",
    "answerHtml": "<code>data class</code> genera automáticamente <code>equals</code>/<code>hashCode</code>/<code>toString</code>/<code>componentN</code>/<code>copy</code> a partir de las propiedades del constructor primario. Úsalas para modelos inmutables y actualiza con <code>copy(field = new)</code>. Cuidado: <code>equals</code> generado solo considera las propiedades del <i>constructor</i> (no los <code>val</code> del cuerpo), y <code>copy</code> realiza una copia <b>superficial</b> — los objetos mutables anidados se comparten."
  },
  {
    "id": "k4",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "¿Cuándo usar una sealed interface/class?",
    "answerHtml": "Para modelar un conjunto cerrado de tipos — una máquina de estados o un resultado. Como el compilador conoce todos los subtipos, un <code>when</code> exhaustivo no necesita <code>else</code>, así que añadir un nuevo caso se convierte en un error de compilación que debes manejar. Usos clásicos: <code>sealed interface UiState { object Loading; data class Success(...); data class Error(...) }</code> y un tipo <code>Result</code> de éxito/fallo."
  },
  {
    "id": "k5",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "Explica las funciones de ámbito: let, run, with, apply, also.",
    "answerHtml": "Se diferencian por el <b>receptor</b> y el <b>retorno</b>. <code>let</code> (it → resultado) para transformaciones protegidas contra nulos; <code>run</code> (this → resultado) para calcular y retornar; <code>with</code> (this → resultado) como run pero no es una extensión; <code>apply</code> (this → receptor) para configurar un objeto; <code>also</code> (it → receptor) para efectos secundarios como logging. Regla general: <code>apply</code>/<code>also</code> retornan el objeto; <code>let</code>/<code>run</code>/<code>with</code> retornan el resultado del lambda."
  },
  {
    "id": "k6",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "¿Qué benefician inline + reified?",
    "answerHtml": "<code>inline</code> copia el cuerpo de una función (y sus lambdas) en el sitio de llamada, eliminando la sobrecarga de asignación de lambdas y permitiendo retornos no locales. Esa inlining es lo que hace posible <code>reified</code>: un <code>reified T</code> conserva el tipo concreto en tiempo de ejecución, así que puedes escribir <code>inline fun &lt;reified T&gt; Gson.fromJson(s) = fromJson(s, T::class.java)</code> sin pasar un <code>Class</code>. Costo: inlinear funciones grandes infla el bytecode."
  },
  {
    "id": "k7",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "Explica la varianza de genéricos: out vs in (covarianza/contravarianza).",
    "answerHtml": "<code>out T</code> (covariante) significa que T solo se <i>produce</i> — un <code>List&lt;Cat&gt;</code> es un <code>List&lt;out Animal&gt;</code>. <code>in T</code> (contravariante) significa que T solo se <i>consume</i> — un <code>Comparator&lt;Animal&gt;</code> funciona como un <code>Comparator&lt;Cat&gt;</code>. Esta es varianza en sitio de declaración; en sitios de uso también puedes escribir <code>List&lt;out Animal&gt;</code>. <code>*</code> es la proyección estrella cuando no te importa el argumento."
  },
  {
    "id": "k8",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "Extension functions vs member functions — ¿y una advertencia?",
    "answerHtml": "Las extensiones añaden funciones a un tipo sin subclasear — genial para utilidades y mantener las clases enfocadas. Se resuelven <b>estáticamente</b> en el tipo declarado (en tiempo de compilación), así que no sobreescriben polimórficamente a los miembros y un miembro real siempre gana sobre una extensión con la misma firma. Se compilan a métodos estáticos que toman el receptor como el primer parámetro."
  },
  {
    "id": "comp1",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "¿Qué es Jetpack Compose y cómo difiere de Views?",
    "answerHtml": "Compose es un toolkit UI <b>declarativo</b>: escribes funciones <code>@Composable</code> que describen la UI como una función del estado, y el framework las reinvoca (recompone) cuando el estado cambia. No hay un árbol de vistas imperativo para <code>findViewById</code> y mutar. Comparado con XML/Views: menos boilerplate, actualizaciones impulsadas por estado, y composición poderosa sobre herencia."
  },
  {
    "id": "comp2",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "¿Qué es la recomposición y cuándo ocurre?",
    "answerHtml": "La recomposición reinvoca composables cuyas <b>entradas cambiaron</b> para actualizar la UI. Compose rastrea las lecturas de objetos <code>State</code>; cuando un estado que lees cambia, el ámbito de recomposición contenedor se reejecuta. Es inteligente (omite composables estables sin cambios) y puede ejecutarse fuera de orden o en paralelo — así que los composables deben estar libres de efectos secundarios e idempotentes."
  },
  {
    "id": "comp3",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "¿Qué es el state hoisting?",
    "answerHtml": "Mover el estado hacia arriba fuera de un composable para que el composable se vuelva <b>sin estado</b> — recibe <code>value</code> y emite cambios a través de <code>onValueChange</code>. Esto hace que la UI sea reutilizable, testeable, y proporciona una única fuente de verdad (generalmente el ViewModel). El patrón: el estado fluye hacia abajo, los eventos fluyen hacia arriba (flujo de datos unidireccional)."
  },
  {
    "id": "comp4",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "¿remember vs rememberSaveable?",
    "answerHtml": "<code>remember</code> cachea un valor entre <b>recomposiciones</b> pero se pierde en cambios de configuración o muerte del proceso. <code>rememberSaveable</code> además persiste a través de esos eventos mediante el bundle de saved-instance-state (el valor debe ser Parcelable / estar en el Saver). Usa <code>remember</code> para estado derivado/transitorio, <code>rememberSaveable</code> para estado de UI que el usuario espera que sobreviva rotación (posición de scroll, entrada)."
  },
  {
    "id": "comp5",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "¿Por qué se prefiere LaunchedEffect sobre lanzar una coroutine en el cuerpo?",
    "answerHtml": "El cuerpo de un composable se ejecuta en cada recomposición, así que lanzar una coroutine ahí se dispara repetidamente. <code>LaunchedEffect(key)</code> lanza una vez cuando entra en composición, se cancela cuando sale, y solo se reinicia cuando <code>key</code> cambia — exactamente el ciclo de vida que quieres para efectos secundarios únicos como cargar datos o mostrar un snackbar."
  },
  {
    "id": "comp6",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "¿Qué hace que un Composable sea 'skippable' y por qué importa la estabilidad?",
    "answerHtml": "Compose omite reejecutar un composable si todos sus parámetros son <b>estables</b> e inmutables. Estable = el compilador puede confiar en la igualdad y notificación de cambios (primitivos, tipos <code>@Immutable</code>/<code>@Stable</code>, tipos funcionales). Un parámetro inestable (ej. un <code>List</code> plano o una clase de otro módulo sin info de estabilidad) fuerza recomposición cada vez. Corrige con colecciones inmutables o anotaciones de estabilidad."
  },
  {
    "id": "fw1",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "Describe el ciclo de vida de la Activity.",
    "answerHtml": "<code>onCreate</code> (crear UI) → <code>onStart</code> (visible) → <code>onResume</code> (primer plano, interactivo). Al salir: <code>onPause</code> (perdiendo foco) → <code>onStop</code> (oculta) → <code>onDestroy</code> (finalizando o cambio de configuración). Al regresar reentra en <code>onStart</code>/<code>onRestart</code>. Realiza trabajo ligero en <code>onPause</code> (bloquea la siguiente activity); libera recursos en <code>onStop</code>."
  },
  {
    "id": "fw2",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "¿Qué sucede en un cambio de configuración como rotación?",
    "answerHtml": "Por defecto el sistema destruye y recrea la Activity para poder cargar recursos específicos de la configuración. El estado transitorio de la vista se guarda/restaura mediante <code>onSaveInstanceState</code>; el estado duradero pertenece a un <code>ViewModel</code> (sobrevive la recreación) o almacenamiento persistente. Manejarlo tú mismo con <code>android:configChanges</code> es un escape hatch que raramente deberías usar."
  },
  {
    "id": "fw3",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "¿Por qué usar viewLifecycleOwner en un Fragment?",
    "answerHtml": "La vista de un Fragment puede ser creada y destruida múltiples veces mientras la instancia del Fragment vive (ej. en el back stack). Observar LiveData/Flow con el <i>fragment</i> como propietario filtra la vista anterior y se suscribe dos veces. <code>viewLifecycleOwner</code> está vinculado al ciclo de vida de la vista, así que los observadores se eliminan cuando la vista se destruye."
  },
  {
    "id": "fw4",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "¿Intents explícitos vs implícitos?",
    "answerHtml": "Un Intent <b>explícito</b> nombra el componente exacto (<code>Intent(this, DetailActivity::class.java)</code>) — se usa dentro de tu app. Un Intent <b>implícito</b> declara una acción/datos (<code>ACTION_VIEW</code> una URL) y el sistema resuelve un manejador mediante intent filters. En Android moderno, la visibilidad del paquete y las limitaciones de lanzamiento en segundo plano restringen los intents implícitos, así que verifica la resolución y maneja el caso sin manejador."
  },
  {
    "id": "fw5",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "¿Qué es la muerte del proceso y cómo sobrevivirla?",
    "answerHtml": "Cuando tu app pasa a segundo plano, el OS puede matar su proceso para recuperar memoria. Al regresar el usuario espera recuperar su lugar, pero tu estado en memoria (incluyendo el ViewModel) ha desaparecido. Sobrevive persistiendo el estado de UI en <code>SavedStateHandle</code>/<code>onSaveInstanceState</code> para valores transitorios y una base de datos/DataStore para datos duraderos. Prueba con la opción de desarrollador &quot;No conservar actividades.&quot;"
  },
  {
    "id": "fw6",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "WorkManager vs un Service de primer plano vs coroutines — ¿cuándo usar cada uno?",
    "answerHtml": "<b>WorkManager</b> para trabajo diferido garantizado en segundo plano que debe sobrevivir muerte del proceso/reinicio (sincronización, subida) con restricciones. <b>Service de primer plano</b> para trabajo visible por el usuario que debe ejecutarse ahora (reproducción multimedia, navegación), con una notificación. <b>coroutines en un scope de ciclo de vida</b> para asíncrono de la app vinculado a una pantalla. No uses un Service para una sincronización puntual, y no uses WorkManager para trabajo inmediato con scope de UI."
  },
  {
    "id": "arch1",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "Describe una arquitectura moderna de app Android en capas.",
    "answerHtml": "<b>Capa de UI</b> (Compose + ViewModel exponiendo estado inmutable) → <b>Capa de dominio</b> (casos de uso opcionales, puro Kotlin) → <b>Capa de datos</b> (repositorios que poseen una única fuente de verdad, más fuentes de datos remotas + locales). Las dependencias apuntan hacia adentro; la UI nunca toca la red directamente. El estado fluye hacia arriba desde la capa de datos como Flows; los eventos fluyen hacia abajo como llamadas a funciones."
  },
  {
    "id": "arch2",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "¿Qué es el patrón repository y por qué usarlo?",
    "answerHtml": "Un repository es el único punto de entrada para un tipo de datos. Oculta si los datos vinieron de red, caché o DB; posee la lógica stale-while-revalidate; y mapea DTOs a modelos de dominio limpios. Beneficios: la UI está desacoplada de las fuentes de datos, la lógica de caché/offline vive en un solo lugar, y puedes intercambiar un repository falso en tests trivialmente."
  },
  {
    "id": "arch3",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "¿MVVM vs MVI — cuál es la diferencia?",
    "answerHtml": "MVVM: el ViewModel expone estado observable y la Vista se vincula a él; las actualizaciones pueden venir de múltiples métodos. MVI condensa esto en un <b>único UiState inmutable</b> más un único stream de intents/acciones reducido a nuevo estado — flujo unidireccional estricto. La predecibilidad de un solo objeto de estado de MVI brilla en pantallas complejas y con muchos experimentos; MVVM es más ligero para las simples."
  },
  {
    "id": "arch4",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "¿Qué significa 'fuente única de verdad' en la práctica?",
    "answerHtml": "Cada dato tiene exactamente un propietario autoritativo; todos los demás lo observan. Para offline-first, <b>la base de datos local es la fuente de verdad</b> — la UI siempre lee de Room, y la única función de la capa de red es actualizar la DB, que luego emite a la UI a través de Flow. Esto previene los errores que obtienes cuando la caché y la pantalla mantienen copias divergentes."
  },
  {
    "id": "arch5",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "¿Por qué modelar el estado de UI como una data class inmutable?",
    "answerHtml": "Un único <code>data class UiState(val items: List, val isLoading: Boolean, val error: String?)</code> hace las combinaciones inválidas visibles y se renderiza atómicamente — sin parpadeo por actualizar tres <code>LiveData</code> separados fuera de sincronía. El ViewModel emite una nueva copia inmutable mediante <code>copy()</code>; la UI renderiza exactamente lo que se le da. También es trivialmente testeable: asertar sobre un solo objeto."
  },
  {
    "id": "arch6",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "¿Por qué modularizar una codebase de Android?",
    "answerHtml": "Dividir en módulos Gradle <code>:feature:*</code> y <code>:core:*</code> ofrece <b>compilaciones más rápidas</b> (paralelas + incrementales; solo los módulos modificados se recompilan), <b>límites forzados</b> (una feature físicamente no puede importar los internos de otra feature), y propiedad más clara. También permite delivery de features dinámicas. El costo es la conexión/navegación entre módulos, generalmente manejada por un patrón de módulo API."
  },
  {
    "id": "stt1",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "¿StateFlow vs LiveData — por qué los equipos migran a StateFlow?",
    "answerHtml": "Ambos son portadores observables, pero <code>StateFlow</code> es un Flow de Kotlin, siempre-con-valor, conflado que se compone con operadores y funciona en código puro Kotlin (testeable, multiplataforma). LiveData es solo Android y consciente del ciclo de vida por defecto. Con <code>collectAsStateWithLifecycle()</code> / <code>repeatOnLifecycle</code>, StateFlow obtiene la misma seguridad de ciclo de vida — así que la mayoría de apps modernas se estandarizan en StateFlow."
  },
  {
    "id": "stt2",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "¿StateFlow vs SharedFlow — cuándo usar cada uno?",
    "answerHtml": "<code>StateFlow</code> mantiene un único valor de <b>estado</b> actual (requiere inicial, conflado, distinto-hasta-que-cambie) — perfecto para estado de UI. <code>SharedFlow</code> es un stream caliente configurable bueno para <b>eventos únicos</b> (navegar, mostrar toast) donde no quieres un 'valor actual' retransmitido en cada nuevo collector. Modelar eventos como estado causa que se re-disparen en rotación — un error común."
  },
  {
    "id": "stt3",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "¿Qué hace stateIn(WhileSubscribed) y por qué usar 5000ms?",
    "answerHtml": "<code>stateIn</code> convierte un Flow frío en un <code>StateFlow</code> caliente compartido entre collectors. <code>SharingStarted.WhileSubscribed(5000)</code> mantiene el upstream activo mientras haya suscriptores y por 5 segundos después de que el último se vaya. Esa ventana de 5 segundos significa que un cambio de configuración (que brevemente pierde el suscriptor) no desmonta y re-ejecuta el upstream — conservas el valor cacheado y evitas una re-obtención."
  },
  {
    "id": "stt4",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "¿Cómo recolectar un Flow de forma segura desde la UI?",
    "answerHtml": "En Compose usa <code>collectAsStateWithLifecycle()</code>; en Views usa <code>repeatOnLifecycle(Lifecycle.State.STARTED) { flow.collect { } }</code>. Ambos dejan de recolectar cuando la UI baja de STARTED, así que no desperdicias trabajo ni actualizas UI invisible en segundo plano. Evita el <code>launchWhenStarted</code> obsoleto — suspende pero mantiene el upstream caliente."
  },
  {
    "id": "stt5",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "¿Cómo combinar múltiples fuentes de datos en un solo estado de UI?",
    "answerHtml": "Usa <code>combine(flowA, flowB) { a, b -> UiState(a, b) }</code> en el ViewModel, y luego <code>stateIn</code>. <code>combine</code> emite cuando cualquier fuente emite, dando un único stream de estado reactivo. Para 'cancelar el anterior cuando cambia la entrada' (ej. búsqueda → resultados) usa <code>flatMapLatest</code>, que cancela el flow interno en vuelo cuando llega una nueva consulta."
  },
  {
    "id": "pf1",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "¿Qué causa el jank y cómo medirlo?",
    "answerHtml": "El jank es un frame que pierde el presupuesto de ~16.6ms (60fps), usualmente por trabajo en el hilo principal: I/O, parsing de JSON grande, decodificación de bitmap, o recomposición excesiva. Mide con <b>JankStats</b> en producción, la librería <b>Macrobenchmark</b> + trazas de Perfetto en laboratorio, y los contadores de recomposición del Layout Inspector para Compose. Perfila en un build de <i>producción</i>."
  },
  {
    "id": "pf2",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "¿Qué son los Baseline Profiles y por qué ayudan?",
    "answerHtml": "Un Baseline Profile entrega una lista de rutas de código calientes para que ART pueda <b>compilarlos AOT</b> al momento de instalación en lugar de interpretarlos/JIT en la primera ejecución. El resultado es un arranque en frío más rápido y scroll/animación más fluidos la primera vez — frecuentemente 20–30%+ en recorridos clave. Los generas con un test de Macrobenchmark que ejecuta los flujos críticos del usuario."
  },
  {
    "id": "pf3",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "¿Cómo mantener un LazyColumn fluido?",
    "answerHtml": "Proporciona <code>key</code>s estables en <code>items(list, key = { it.id })</code> para que los elementos no sean recomposados/movidos innecesariamente; mantén el contenido del elemento estable (evita parámetros inestables); eleva el trabajo costoso fuera del elemento; usa <code>contentType</code> para listas heterogéneas; y evita anidar scrollables. Luego verifica que los contadores de recomposición disminuyeron en lugar de adivinar."
  },
  {
    "id": "pf4",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "Tu pantalla se recomposición demasiado a menudo. ¿Cómo lo arreglas?",
    "answerHtml": "Encuentra la entrada inestable con Layout Inspector / métricas del compilador, luego: haz los modelos <code>@Immutable</code> o usa <code>kotlinx.collections.immutable</code>; pasa lambdas de forma estable (Compose auto-recuerda la mayoría); difiere las lecturas de cambio frecuente a la fase de layout/draw (ej. <code>Modifier.offset { }</code>) o envuelve con <code>derivedStateOf</code>; y lee el estado lo más abajo posible en el árbol. Mide antes y después."
  },
  {
    "id": "pf5",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "La regla más importante antes de optimizar?",
    "answerHtml": "Perfila primero. Mide con Perfetto / Macrobenchmark / los profilers de Studio para encontrar el cuello de botella real, arregla ese problema específico, y luego vuelve a medir. La optimización a ciegas (esparcir <code>remember</code>, añadir hilos) agrega complejidad y frecuentemente no arregla nada — y puede ocultar el costo real."
  },
  {
    "id": "tst1",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "¿Cómo se ve la pirámide de testing de Android?",
    "answerHtml": "Muchos tests <b>unitarios</b> rápidos (JUnit + MockK) sobre ViewModels, casos de uso, mappers y lógica pura; una capa intermedia de tests de <b>integración</b> (Room con DB en memoria, repositorios con API fake); y algunos tests <b>UI/E2E</b> (Compose UI test o Espresso) en flujos que no deben romperse como auth y checkout. Robolectric ejecuta tests dependientes del framework en la JVM para velocidad."
  },
  {
    "id": "tst2",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "¿Cómo probar coroutines y Flows?",
    "answerHtml": "Usa <code>runTest</code> de kotlinx-coroutines-test, que proporciona un <code>TestScope</code> de tiempo virtual para que los delays se omitan determinísticamente. <b>Inyecta</b> dispatchers (nunca hardcode <code>Dispatchers.IO</code>) y pasa un <code>StandardTestDispatcher</code>/<code>UnconfinedTestDispatcher</code>. Aserta emisiones de Flow con <b>Turbine</b>: <code>flow.test { assertEquals(x, awaitItem()) }</code>."
  },
  {
    "id": "tst3",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "¿Fakes vs mocks — cuál prefieres?",
    "answerHtml": "Prefiere un <b>fake</b> escrito a mano (ej. un repository en memoria implementando la misma interfaz) para tests basados en estado — es reutilizable y no se acopla a secuencias de llamadas. Usa <b>mocks</b> (MockK) para verificación de interacciones cuando el comportamiento bajo prueba <i>es</i> '¿llamamos a X?'. El exceso de mocking hace que los tests asertan detalles de implementación y se rompen en cada refactor."
  },
  {
    "id": "tst4",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "¿Cómo probar un Composable?",
    "answerHtml": "Con <code>createComposeRule()</code> / <code>createAndroidComposeRule()</code>. Estableces contenido, luego consultas el árbol de <b>semántica</b>: <code>composeTestRule.onNodeWithText(&quot;Submit&quot;).performClick()</code> y asertas con <code>assertIsDisplayed()</code>/<code>assertIsEnabled()</code>. Prueba comportamiento a través de semántica, no estado interno, y añade <code>testTag</code>/descripciones de contenido para nodos que necesitan referencias estables."
  },
  {
    "id": "beh1",
    "category": "behavior",
    "categoryLabel": "STAR",
    "question": "Cuéntame sobre el problema de rendimiento más difícil que resolviste.",
    "answerHtml": "Usa STAR. Formato: una pantalla de lista perdia frames en dispositivos de gama media. <i>Perfilar en lugar de adivinar</i> (Perfetto + contadores de recomposición), encontré un parámetro inestable de lista forzando recomposición completa y una decodificación síncrona de imagen en el hilo principal. Hice el modelo inmutable, añadí keys estables, moví la decodificación fuera del hilo, y añadí un baseline profile + Macrobenchmark para protegerlo. Resultado: scroll fluido y un test de regresión.\n        <div class=\"hint\">Consejo: termina con la lección — &quot;Perfilo, arreglo el punto crítico demostrado, luego añado un benchmark para que no haya regresión.&quot;</div>"
  },
  {
    "id": "beh2",
    "category": "behavior",
    "categoryLabel": "STAR",
    "question": "Describe un desacuerdo con producto o diseño.",
    "answerHtml": "Enmarcalo con calma: disiento con <b>datos y opciones</b>, no con ego. Formato: producto quería una feature que arriesgaba una ruta principal propensa a ANR; expuse la compensación (costo, riesgo, una alternativa más ligera), pregunté a qué objetivo del usuario realmente estábamos sirviendo, y lanzamos una versión escalonada. Punto que hago: levanto preocupaciones temprano y por escrito, luego me comprometo totalmente una vez decidimos.\n        <div class=\"hint\">Consejo: usa &quot;alinear&quot; y &quot;compensación&quot;, no &quot;luchar&quot;.</div>"
  },
  {
    "id": "beh3",
    "category": "behavior",
    "categoryLabel": "STAR",
    "question": "¿Cómo aprendes sobre una codebase grande y desconocida?",
    "answerHtml": "Leo el <b>flujo de datos antes de los archivos</b> — puntos de entrada, grafo DI, grafo de navegación, los repositorios — luego hago el cambio seguro más pequeño para aprender el bucle de retroalimentación, apoyándome en tipos y tests. Sigo patrones existentes en lugar de importar los míos, y hago preguntas específicas temprano. La frase que uso: &quot;el cambio seguro más pequeño que desbloquea la siguiente feature.&quot;\n        <div class=\"hint\">Consejo: nombra un PR concreto primero que harías — una corrección de bug pequeña con un test.</div>"
  },
  {
    "id": "beh4",
    "category": "behavior",
    "categoryLabel": "STAR",
    "question": "Cuéntame sobre ownsership de un release de principio a fin.",
    "answerHtml": "Formato: fui dueño de un release en un equipo pequeño — conectando CI para ejecutar tests unitarios + instrumentados, gestionando firma y pistas de Play Console, un lanzamiento escalonado (5% → 100%) con control de tasa de crash-free, y un flag de kill-switch para la feature riesgosa. Cuando apareció una regresión al 5%, detuve, encontré la causa raíz, arreglé, añadí un test de regresión, y relancé limpiamente. Ownership de QA a producción, con monitoreo como parte de 'terminado'.\n        <div class=\"hint\">Consejo: enfatiza &quot;yo fui dueño&quot; y &quot;tasa de crash-free como barra de seguridad.&quot;</div>"
  },
  {
    "id": "opt1",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "Nombra tres fuentes comunes de memory leaks en Android.",
    "answerHtml": "Mantener un <code>Context</code>/View/Activity más allá de su ciclo de vida (refs estáticos, singletons de larga duración); inner classes / callbacks / Handlers que capturan la Activity exterior; y listeners/observers/coroutines no cancelados (ej. <code>GlobalScope</code> o un flow recolectado sin conciencia del ciclo de vida). LeakCanary muestra la cadena de referencias retenedoras."
  },
  {
    "id": "opt2",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "¿Por qué es importante una key estable en una lista?",
    "answerHtml": "Sin keys estables, una lista reciclada/lazy vincula la identidad del elemento a la posición, así que al insertar/reordenar/eliminar reutiliza la ranura equivocada — causando errores visuales y recomposición innecesaria. Proporciona un ID único estable (<code>key = { it.id }</code>) para que Compose/RecyclerView pueda rastrear elementos a través de cambios y animar correctamente."
  },
  {
    "id": "opt3",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "¿Dos palancas para reducir una app Android y acelerarla?",
    "answerHtml": "Habilita <b>R8</b> (reducción + eliminación de recursos + ofuscación) para cortar código muerto y tamaño, y entrega la app como un <b>Android App Bundle</b> para que Play proporcione splits por dispositivo (densidad, ABI, idioma). Añade un <b>baseline profile</b> para el arranque. Audita dependencias y usa el APK Analyzer para encontrar inflación."
  },
  {
    "id": "opt4",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "¿Cómo evitar que el trabajo pesado bloquee el arranque de la app?",
    "answerHtml": "Recorta <code>Application.onCreate</code>; usa la librería <b>App Startup</b> para ordenar/inicializar lazy los componentes; difiere la inicialización de SDKs no críticos fuera de la ruta de lanzamiento (o a un dispatcher en segundo plano); muestra el primer contenido rápido y hidrata el resto. Mide el arranque en frío en un build de producción con Macrobenchmark y trátalo como un presupuesto."
  },
  {
    "id": "ai1",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "¿Por qué ejecutar un modelo de AI en el dispositivo en lugar de en servidor?",
    "answerHtml": "Tres beneficios: <b>privacidad</b> (los datos nunca salen del dispositivo), operación <b>offline</b>, y <b>sin costo de servidor por llamada</b> — además de baja latencia para modelos pequeños. Las compensaciones son tamaño del modelo, RAM/térmicas, y fragmentación de dispositivos, así que detectas capacidades y recurrres a un modelo de servidor cuando sea necesario."
  },
  {
    "id": "ai2",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "¿Qué es Gemini Nano y cómo acceder a él en Android?",
    "answerHtml": "Gemini Nano es el modelo más pequeño de Google que ejecuta <b>en el dispositivo</b> a través del servicio de sistema <b>AICore</b>. Accedes a él a través de las <b>APIs ML Kit GenAI</b> de alto nivel (resumen, corrección, reescritura, descripción de imágenes) o el SDK AICore/Edge. Está limitado a dispositivos capaces (ej. Pixel 8+/banderas selectas), así que debes verificar la disponibilidad y puede que necesites activar una descarga del modelo."
  },
  {
    "id": "ai3",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "¿Para qué sirve la MediaPipe LLM Inference API?",
    "answerHtml": "Ejecuta LLMs abiertos (Gemma y otros) completamente en el dispositivo en una gama más amplia de teléfonos que Nano, con backends GPU/CPU. Empaquetas o descargas un modelo cuantizado <code>.task</code>/<code>.bin</code>, creas una sesión de inferencia, y transmites tokens. Úsala cuando necesitas un modelo abierto específico o alcance de dispositivo más amplio del que proporciona Gemini Nano de AICore."
  },
  {
    "id": "ai4",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "¿Cómo dimensionar un LLM en el dispositivo a un dispositivo?",
    "answerHtml": "Presupuesta RAM y almacenamiento: un modelo cuantizado de ~1–2B necesita aproximadamente 1–2GB de RAM en tiempo de ejecución. Usa <b>cuantización</b> (int4/int8) para reducir tamaño y acelerar inferencia con pérdida mínima de calidad. Verifica la memoria disponible y el nivel del dispositivo, prefiere delegados GPU donde se soporte, limita la longitud de contexto/generación, y descarga modelos grandes bajo demanda con una UI de progreso en lugar de inflar el APK."
  },
  {
    "id": "k9",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "¿== vs === en Kotlin?",
    "answerHtml": "<code>==</code> es igualdad <b>estructural</b> — llama a <code>equals()</code> (y es seguro con nulos: <code>a == b</code> se traduce a <code>a?.equals(b) ?: (b === null)</code>). <code>===</code> es igualdad <b>referencial</b> — la misma instancia de objeto. Para data classes, <code>==</code> compara campos; <code>===</code> verifica identidad. Viniendo de Java, <code>==</code> en Kotlin es el <code>.equals()</code> de Java, no <code>==</code>."
  },
  {
    "id": "k10",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "¿map vs flatMap vs associateBy en colecciones?",
    "answerHtml": "<code>map</code> transforma cada elemento 1:1. <code>flatMap</code> mapea cada elemento a una colección y aplana los resultados en una lista (ej. todas las etiquetas de publicaciones). <code>associateBy { it.id }</code> construye un <code>Map</code> claveado por un selector — útil para indexar una lista para búsqueda O(1). Las variantes de secuencia de Kotlin (<code>asSequence()</code>) hacen las cadenas de operadores largas lazy para evitar listas intermedias."
  },
  {
    "id": "k11",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "¿Qué es una value class (inline class) y por qué usar una?",
    "answerHtml": "Una <code>@JvmInline value class UserId(val raw: String)</code> envuelve un valor único con <b>sin asignación en tiempo de ejecución</b> en la mayoría de casos — el compilador inlinea el tipo subyacente. Te da seguridad de tipo (un <code>UserId</code> no puede pasarse donde se espera un <code>OrgId</code>) sin el costo de boxing de un wrapper normal. Úsala para primitivos con tipos de dominio (IDs, dinero) para prevenir confusiones."
  },
  {
    "id": "stt6",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "¿Por qué emitir a MutableStateFlow a veces 'pierde' un valor?",
    "answerHtml": "<code>StateFlow</code> es <b>conflado</b> y usa igualdad: si estableces el mismo valor (por <code>equals</code>) no emitirá, y actualizaciones sucesivas rápidas pueden saltar intermedias porque los collectors solo ven el más reciente. Eso es correcto para <i>estado</i> (solo te importa el actual). Si necesitas cada evento discreto (incluyendo duplicados), usa un <code>SharedFlow</code>/<code>Channel</code> — modelar eventos como StateFlow es el error."
  },
  {
    "id": "pf6",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "¿Qué es el overdraw y cómo reducirlo?",
    "answerHtml": "El overdraw es el GPU pintando el mismo pixel múltiples veces por frame (fondos opacos apilados, capas de pantalla completa). Redúcelo eliminando fondos redundantes, no estableciendo un color de ventana/fondo que cubrirás completamente, y aplanando jerarquías de vistas. En Compose, evita apilar fondos opacos de <code>Box</code>. Diagnostica con la opción de desarrollador 'Debug GPU overdraw' — demasiado rojo significa tasa de relleno desperdiciada."
  },
  {
    "id": "fw7",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "Edge-to-edge y WindowInsets — ¿qué cambió recientemente?",
    "answerHtml": "Las apps modernas dibujan <b>edge-to-edge</b> (contenido detrás de las barras de estado/navegación) y usan <b>WindowInsets</b> para añadir espacio alrededor de las barras del sistema, el IME (teclado), y muescas. Android 15 impone edge-to-edge para apps que lo tienen como objetivo. En Compose consumes los insets con modificadores como <code>Modifier.safeDrawingPadding()</code> o <code>imePadding()</code> en lugar de hardcodear alturas de barra — así los layouts se adaptan a navegación por gestos, teclados y muescas."
  },
  {
    "id": "arch7",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "¿Qué es el flujo de datos unidireccional (UDF) y por qué reduce bugs?",
    "answerHtml": "UDF significa que el <b>estado fluye hacia abajo</b> (del holder de estado/ViewModel a la UI) y los <b>eventos fluyen hacia arriba</b> (la UI llama funciones que producen nuevo estado). Hay una dirección y un propietario de la verdad, así que no puedes obtener bucles de binding bidireccional o widgets que muten estado compartido a espaldas de los otros. Hace que la UI sea una función pura del estado — predecible, reproducible, y fácil de testear asertando sobre el estado emitido."
  },
  {
    "id": "comp7",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "Desarrollo guiado por Preview: ¿por qué diseñar composables para que sean previsualizables?",
    "answerHtml": "<code>@Preview</code> renderiza un composable en el IDE sin ejecutar la app — iteración rápida sobre estados (cargando/vacío/error), temas, y tamaños de pantalla. Para usarlo bien, mantén los composables <b>sin estado</b> (toman datos + lambdas, no un ViewModel), para que un preview pueda pasar datos fake directamente. La previsualizabilidad y testeabilidad son la misma propiedad: un composable fácil de previsualizar es fácil de testear."
  }
];
