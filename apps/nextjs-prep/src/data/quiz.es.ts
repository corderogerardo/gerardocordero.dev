// Multiple-choice quiz — Next.js App Router fundamentals (Next 16.2 / React 19.2):
// core, rendering & caching, data & Server Actions, routing, performance, auth,
// testing, security — español
import type { Level } from "@/lib/levels";

export type QuizQuestion = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  options: string[];
  answer: number;
  explanationHtml: string;
  level?: Level;
};

export const QUIZ: QuizQuestion[] = [
  {
    id: "qz1",
    category: "core",
    categoryLabel: "Core (App Router)",
    question: "En `app/`, ¿por qué agregar un `loading.tsx` junto a un `page.tsx` cambia lo que se transmite?",
    options: [
      "No lo hace — loading.tsx solo afecta navegaciones del lado del cliente",
      "Next envuelve la página (y sus hijos) en un límite <Suspense> con loading.tsx como fallback",
      "Deshabilita el renderizado en servidor para esa ruta",
      "Fuerza a que la página se convierta en un Client Component",
    ],
    answer: 1,
    explanationHtml:
      "<p>Un <code>loading.tsx</code> hermano es azúcar para envolver el contenido del segmento en <code>&lt;Suspense fallback={&lt;Loading /&gt;}&gt;</code>, para que el shell pueda transmitirse inmediatamente mientras el trabajo asíncrono de la página se resuelve.</p>",
  },
  {
    id: "qz2",
    category: "core",
    categoryLabel: "Core (App Router)",
    question: "Un Server Component importa un componente de un archivo marcado con `\"use client\"` y lo renderiza como un elemento hijo normal. ¿Qué se envía al navegador?",
    options: [
      "Nada del componente cliente — se inlinea del lado del servidor",
      "Todo el árbol padre se vuelve renderizado por cliente",
      "Solo el módulo de ese componente cliente (y sus propias importaciones) cruza el límite; el padre del servidor aún se renderiza en el servidor",
      "Lanza un error de compilación porque los Server Components no pueden importar Client Components",
    ],
    answer: 2,
    explanationHtml:
      "<p><code>\"use client\"</code> marca un <b>límite del grafo de módulos</b>, no un límite de subárbol. Importar y renderizar directamente un módulo cliente envía ese módulo al cliente, pero el componente servidor a su alrededor aún se renderiza del lado del servidor y puede pasar props/hijos calculados por el servidor.</p>",
  },
  {
    id: "qz3",
    category: "core",
    categoryLabel: "Core (App Router)",
    question: "Tienes slots de ruta paralela `@team` y `@analytics` bajo un layout en Next 16. La compilación falla con un error de fallback faltante. ¿Qué falta?",
    options: [
      "Un `loading.tsx` en el layout padre",
      "Un `default.js` en cada slot que carezca de uno",
      "Una exportación `generateStaticParams`",
      "Un `not-found.tsx` en la raíz de la aplicación",
    ],
    answer: 1,
    explanationHtml:
      "<p>Next 16 <b>requiere un <code>default.js</code> explícito por slot de ruta paralela</code> — Next ya no puede inferir un fallback cuando un slot no tiene un segmento coincidente para la URL actual, así que la compilación falla sin uno.</p>",
  },
  {
    id: "qz4",
    category: "rendering",
    categoryLabel: "Rendering y Caché",
    question: "Con `cacheComponents: true` en `next.config.ts`, un componente llama `headers()` directamente y NO está envuelto en `<Suspense>`. ¿Qué sucede?",
    options: [
      "Cae silenciosamente al renderizado estático",
      "Next lanza un error: se accedió a datos sin caché fuera de un límite de Suspense",
      "Se renderiza bien pero cachea los encabezados de solicitud para siempre",
      "Nada — Suspense solo se necesita para funciones con `\"use cache\"`",
    ],
    answer: 1,
    explanationHtml:
      "<p>Bajo Cache Components, cualquier componente que lea una API de runtime/solicitud (<code>headers()</code>, <code>cookies()</code>, <code>fetch</code> sin caché, etc.) debe estar dentro de un límite <code>&lt;Suspense&gt;</code> para que Next pueda prerenderizar un shell estático y transmitir la parte dinámica. Sin uno, es un error de compilación/runtime, no un fallback silencioso.</p>",
  },
  {
    id: "qz5",
    category: "rendering",
    categoryLabel: "Rendering y Caché",
    question: "¿Qué determina la clave de caché para una función marcada con `\"use cache\"`?",
    options: [
      "Solo los argumentos de la función",
      "Un `cacheTag` suministrado manualmente — nada más",
      "Los argumentos de la función más cualquier valor cerrado del alcance que la rodea",
      "Solo la URL de la ruta",
    ],
    answer: 2,
    explanationHtml:
      "<p>Next deriva la clave de caché automáticamente de los <b>argumentos y valores cerrados</b> de la función — sin construcción manual de clave. <code>cacheLife()</code>/<code>cacheTag()</code> de <code>next/cache</code> ajustan expiración e invalidación sobre eso, no definen la clave.</p>",
  },
  {
    id: "qz6",
    category: "rendering",
    categoryLabel: "Rendering y Caché",
    question: "Sin `cacheComponents` habilitado (el modelo de defecto anterior), ¿cuál es el comportamiento de caché por defecto de `fetch()` en un Server Component?",
    options: [
      "Cacheado para siempre a menos que se revalide",
      "Sin caché por defecto — opta por ello vía `cache: 'force-cache'` o `next: { revalidate, tags }`",
      "Cacheado por 60 segundos por defecto",
      "Cacheado solo en compilaciones de producción",
    ],
    answer: 1,
    explanationHtml:
      "<p>Fuera de Cache Components, <code>fetch()</code> simple es <b>sin caché por defecto</b> en el App Router — optas por el caché por llamada con <code>cache: 'force-cache'</code> o <code>next: { revalidate, tags }</code>. Esto es fácil de confundir con el modelo mental del Pages Router / pre-13.</p>",
  },
  {
    id: "qz7",
    category: "data",
    categoryLabel: "Datos y Server Actions",
    question: "Una Server Function (`\"use server\"`) solo se llama desde un `<form action={...}>` en la UI. ¿Es seguro omitir una verificación de auth dentro?",
    options: [
      "Sí, el formulario solo se renderiza para usuarios autorizados",
      "No — las Server Functions se compilan en un endpoint POST que es directamente alcanzable, así que la auth debe verificarse dentro de la función misma",
      "Sí, siempre que el formulario tenga un token CSRF oculto",
      "No, pero solo porque el middleware no puede proteger Server Actions",
    ],
    answer: 1,
    explanationHtml:
      "<p>Cada Server Function está expuesta como un endpoint POST internamente y puede ser golpeada directamente, evadiendo tu UI completamente. Auth/autorización debe re-verificarse <b>dentro de cada acción</b> — nunca confíes en que la UI que llama controló el acceso.</p>",
  },
  {
    id: "qz8",
    category: "data",
    categoryLabel: "Datos y Server Actions",
    question: "En Next 16, ¿qué es nuevo sobre `revalidateTag()` comparado con versiones anteriores?",
    options: [
      "Ahora requiere un segundo argumento de perfil `cacheLife` (por ejemplo `revalidateTag(tag, 'max')`) para comportamiento stale-while-revalidate",
      "Fue renombrado a `updateTag()`",
      "Ahora solo se puede llamar desde Route Handlers",
      "Ya no acepta un array de etiquetas",
    ],
    answer: 0,
    explanationHtml:
      "<p>Next 16 hace que el segundo argumento — un perfil <code>cacheLife</code> que controla stale-while-revalidate — sea efectivamente requerido; la vieja forma de un solo argumento está obsoleta. <code>updateTag()</code> es una API separada y nueva para read-your-writes dentro de Server Actions.</p>",
  },
  {
    id: "qz9",
    category: "data",
    categoryLabel: "Datos y Server Actions",
    question: "Dentro de una Server Action, quieres que la solicitud actual vea inmediatamente el efecto de una invalidación de caché (read-your-writes), no solo eventualmente. ¿Qué API está diseñada para eso?",
    options: [
      "`revalidatePath()`",
      "`refresh()`",
      "`updateTag(tag)` — expira y refresca la etiqueta dentro de la misma solicitud",
      "`cacheTag(tag)`",
    ],
    answer: 2,
    explanationHtml:
      "<p><code>updateTag()</code> es nuevo en Next 16, solo para Server Actions, y da semántica <b>read-your-writes</b>: expira la etiqueta y refresca los datos afectados en el mismo ciclo de solicitud/respuesta. <code>refresh()</code> en su lugar re-renderiza UI sin caché/dinámica sin tocar el caché en absoluto.</p>",
  },
  {
    id: "qz10",
    category: "routing",
    categoryLabel: "Enrutamiento",
    question: "Envías dos `<form action={fnA}>` y `<form action={fnB}>` en rápida sucesión desde el cliente. ¿Cómo despacha Next 16 estas Server Functions?",
    options: [
      "En paralelo, siempre",
      "Una a la vez, secuencialmente, en el orden en que fueron activadas",
      "Aleatoriamente, la que se resuelva primero",
      "Las agrupa en una sola solicitud",
    ],
    answer: 1,
    explanationHtml:
      "<p>Las llamadas a Server Functions desde el cliente se despachan <b>secuencialmente, una a la vez</b> — la segunda llamada espera a que la primera se asiente. Esto evita que mutaciones compitan entre sí pero significa que no debes asumir concurrencia real para acciones independientes.</p>",
  },
  {
    id: "qz11",
    category: "routing",
    categoryLabel: "Enrutamiento",
    question: "Renombras `middleware.ts` a `proxy.ts` y renombras la función exportada a `proxy` para una actualización a Next 16. ¿Qué más cambia en el comportamiento?",
    options: [
      "Nada — es un renombrado puro",
      "Ahora se ejecuta solo en el runtime de Node.js; no hay opción de edge runtime como tenía el viejo middleware",
      "Ahora solo se ejecuta para rutas API, no para páginas",
      "Se vuelve opt-in vía un flag de configuración",
    ],
    answer: 1,
    explanationHtml:
      "<p>Más allá del renombrado, <code>proxy.ts</code> se ejecuta <b>exclusivamente en el runtime de Node.js</code> en Next 16 — la vieja opción de edge-runtime para middleware ya no existe (la ruta obsoleta <code>middleware.ts</code> aún funciona pero está en camino de salida).</p>",
  },
  {
    id: "qz12",
    category: "routing",
    categoryLabel: "Enrutamiento",
    question: "Una página lee `params` y `searchParams` de sus props. En Next 16, ¿qué tipo son?",
    options: [
      "Objetos síncronos simples, como en Next 12",
      "Promises — debes `await`las (o usar `use()` en un Client Component)",
      "Síncronos en Server Components, Promises solo en Client Components",
      "Streams que deben leerse con un reader",
    ],
    answer: 1,
    explanationHtml:
      "<p><code>params</code>, <code>searchParams</code>, <code>cookies()</code>, <code>headers()</code>, y <code>draftMode()</code> son todos <b>basados en Promise</b> — el acceso síncrono fue completamente removido en Next 16, no solo obsoleto.</p>",
  },
  {
    id: "qz13",
    category: "perf",
    categoryLabel: "Rendimiento",
    question: "¿Cuál es el empaquetador por defecto y estable tanto para `next dev` como `next build` en Next 16?",
    options: [
      "Webpack, con Turbopack como flag opt-in",
      "Turbopack — estable y el defecto para dev y build",
      "esbuild",
      "Vite, vía un shim de compatibilidad",
    ],
    answer: 1,
    explanationHtml:
      "<p>Turbopack se graduó a <b>estable y defecto</b> tanto para dev como build en Next 16. Webpack aún es seleccionable, pero ahora optas por salir en lugar de optar por entrar.</p>",
  },
  {
    id: "qz14",
    category: "perf",
    categoryLabel: "Rendimiento",
    question: "Envuelves una operación lenta, no determinística (por ejemplo, leer `Math.random()` o una marca de tiempo) en `connection()` de `next/server` dentro de un componente cacheado. ¿Qué logra eso?",
    options: [
      "Cachea el valor aleatorio para que cada solicitud vea el mismo",
      "Difiere esa operación no determinística al tiempo de solicitud, manteniendo el output circundante cacheable hasta ese punto",
      "Deshabilita el caché para toda la ruta",
      "Fuerza a que la operación se ejecute solo en tiempo de compilación",
    ],
    answer: 1,
    explanationHtml:
      "<p><code>connection()</code> es una señal que <b>difierre</b> el código después de ella a ejecución por solicitud, permitiendo que Next prerenderice todo antes de la llamada como un shell estático/cacheado mientras la parte no determinística se ejecuta fresca por solicitud — clave para combinar Cache Components con partes dinámicas.</p>",
  },
  {
    id: "qz15",
    category: "perf",
    categoryLabel: "Rendimiento",
    question: "¿Por qué intercambiar un `<img>` grande por `next/image` típicamente mejora LCP y CLS juntos?",
    options: [
      "Solo mejora LCP; CLS necesita una solución separada",
      "Sirve automáticamente formatos modernos/tamaños responsivos Y reserva espacio de layout desde width/height, previniendo tanto pinturas lentas como cambios de diseño",
      "Carga diferida cada imagen, incluida la imagen hero, por defecto",
      "Convierte todas las imágenes a SVGs inline",
    ],
    answer: 1,
    explanationHtml:
      "<p><code>next/image</code> genera fuentes responsivas de formato moderno (payload más pequeño → mejor LCP) y enforce <code>width</code>/<code>height</code> intrínsecos para que el navegador reserve espacio antes de que la imagen cargue (sin CLS). Nota: la imagen LCP en sí debería usar <code>priority</code> para evitar ser cargada diferidamente.</p>",
  },
  {
    id: "qz16",
    category: "auth",
    categoryLabel: "Autenticación",
    question: "¿Cuál es el lugar más confiable para forzar que un usuario esté autenticado antes de renderizar los datos de un Server Component protegido?",
    options: [
      "Solo en `proxy.ts`, redirigiendo solicitudes no autenticadas",
      "Solo en `useEffect` del lado del cliente, redirigiendo si no existe cookie de sesión",
      "Una verificación de capa de acceso a datos (por ejemplo, dentro de las funciones de consulta/fetch mismas), además de cualquier verificación a nivel de proxy",
      "Ocultar la UI con CSS hasta que la sesión cargue",
    ],
    answer: 2,
    explanationHtml:
      "<p>Las verificaciones a nivel de proxy son una ruta rápida/redirección útil, pero pueden ser evadidas o mal configuradas para segmentos específicos. La garantía duradera es una <b>capa de acceso a datos</b> que re-verifica auth justo antes de tocar datos sensibles — defensa en profundidad, no ocultamiento de UI.</p>",
  },
  {
    id: "qz17",
    category: "auth",
    categoryLabel: "Autenticación",
    question: "Una Server Action elimina un recurso por `id` pasado desde un campo de formulario oculto. ¿Cuál es la verificación crítica que falta si el código solo verifica que el usuario esté logueado?",
    options: [
      "Nada — estar logueado es suficiente",
      "Verificar que el usuario logueado realmente posee/puede actuar sobre ese `id` específico (autorización, no solo autenticación)",
      "Limitar la velocidad de la acción",
      "Validar que el `id` es una cadena",
    ],
    answer: 1,
    explanationHtml:
      "<p>Autenticación (quién eres) no es autorización (qué te está permitido tocar). Cualquier identificador suministrado por el cliente — especialmente de un campo oculto — debe verificarse contra la propiedad/permisos del usuario que actúa dentro de la acción, ya que el POST crudo es directamente invocable.</p>",
  },
  {
    id: "qz18",
    category: "testing",
    categoryLabel: "Testing",
    question: "Quieres testear unitariamente un Server Component que es una función `async` esperando una llamada de datos. ¿Cuál es el enfoque práctico?",
    options: [
      "Los Server Components no pueden testearse unitariamente en absoluto — solo e2e",
      "Espera directamente la función del componente para obtener su JSX resuelto, mockeando la llamada de datos, luego aserte sobre el árbol (o teste vía un arnés de renderizado que soporte componentes asíncronos)",
      "Conviértelo a un Client Component primero",
      "Captura el Promise crudo que retorna",
    ],
    answer: 1,
    explanationHtml:
      "<p>Los Server Components asíncronos son solo funciones que retornan un Promise de JSX — mockea la dependencia de datos y <code>await</code> el componente para obtener el output resuelto, o usa una configuración/arnés de testing con soporte de componentes asíncronos, luego aserte sobre el resultado.</p>",
  },
  {
    id: "qz19",
    category: "testing",
    categoryLabel: "Testing",
    question: "Actualizas a Next 16 y tu paso de CI `next lint` empieza a fallar con 'command not found'. ¿Por qué?",
    options: [
      "`next lint` fue renombrado a `next check`",
      "`next lint` fue removido en Next 16 — haz lint directamente con tu propia configuración/script de ESLint en su lugar",
      "Solo falla en compilaciones de Turbopack",
      "Ahora requiere un flag `--legacy`",
    ],
    answer: 1,
    explanationHtml:
      "<p><code>next lint</code> fue <b>removido en Next 16</b>. Los proyectos necesitan ejecutar ESLint (u otro linter) directamente vía su propio script/configuración en lugar de a través del wrapper del CLI de Next.</p>",
  },
  {
    id: "qz20",
    category: "security",
    categoryLabel: "Seguridad",
    question: "Un compañero lee un secreto con `process.env.STRIPE_SECRET_KEY` dentro de un archivo que tiene `\"use client\"` al inicio. ¿Qué sucede?",
    options: [
      "Next automáticamente lo elimina y el valor es `undefined` en el bundle del navegador",
      "Se inlinea en el bundle JS del cliente en tiempo de compilación, filtrando el secreto a cualquiera que vea el código fuente",
      "Lanza un error de compilación, rehusándose a empaquetar",
      "Funciona bien porque las variables de entorno siempre son solo-servidor",
    ],
    answer: 1,
    explanationHtml:
      "<p>Solo las variables con prefijo <code>NEXT_PUBLIC_</code> están destinadas al cliente; cualquier otra lectura de <code>process.env.*</code> dentro de código empaquetado para el cliente aún se <b>inlinea en tiempo de compilación</b> ya que los empaquetadores no pueden distinguir la intención — no hay guardia de runtime. Este es un vector de filtración accidental común, distinto de las APIs eliminadas <code>serverRuntimeConfig</code>/<code>publicRuntimeConfig</code>.</p>",
  },
  {
    id: "qz21",
    category: "security",
    categoryLabel: "Seguridad",
    question: "¿Por qué un nonce de Content-Security-Policy se genera por solicitud (por ejemplo en `proxy.ts`) en lugar de estar hardcodeado, cuando se usa CSP estricto con scripts inline?",
    options: [
      "Los nonces por solicitud solo se necesitan para imágenes",
      "Un nonce estático/hardcodeado podría leerse de cualquier respuesta anterior y ser reutilizado por un atacante para contrabandear su propio script inline más allá de la política",
      "Next requiere que los nonces roten por razones de caché, no de seguridad",
      "Los nonces son decorativos y no afectan la aplicación de CSP",
    ],
    answer: 1,
    explanationHtml:
      "<p>Un nonce de CSP solo bloquea scripts inline no autorizados si es <b>adivinable y de uso único</b>. Un valor hardcodeado derrota el propósito — un atacante que lo observe una vez (ver código fuente) puede inyectar un atributo <code>nonce</code> coincidente en su propio script y hacerlo ejecutar.</p>",
  },
];

export const QUIZ_FILTERS = [
  { value: "core", label: "Core (App Router)" },
  { value: "rendering", label: "Rendering y Caché" },
  { value: "data", label: "Datos y Server Actions" },
  { value: "routing", label: "Enrutamiento" },
  { value: "perf", label: "Rendimiento" },
  { value: "auth", label: "Autenticación" },
  { value: "testing", label: "Testing" },
  { value: "security", label: "Seguridad" },
];
