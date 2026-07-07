// Next.js (App Router) flashcards — español
// Shapes mirror @gerardocordero/prep-kit's Flashcard type (structural typing).
import type { Level } from "@/lib/levels";

export type Flashcard = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  answerHtml: string;
  level?: Level;
};

export const FLASHCARDS: Flashcard[] = [
  // ---------------- CORE (APP ROUTER) ----------------
  {
    id: "c1",
    category: "core",
    categoryLabel: "Core (App Router)",
    level: "junior",
    question: "¿Cómo convierte el App Router archivos en rutas?",
    answerHtml:
      "<p>El enrutamiento se basa en el <b>sistema de archivos</b> bajo <code>app/</code>: cada <b>carpeta</b> es un segmento de URL, y una carpeta se convierte en una ruta navegable solo cuando contiene un <code>page.tsx</code>. Los archivos especiales superpuestos a esa estructura de carpetas — <code>layout.tsx</code>, <code>loading.tsx</code>, <code>error.tsx</code>, <code>not-found.tsx</code>, <code>route.ts</code> — cada uno tiene un rol específico y reservado.</p><div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Una carpeta es solo un segmento de URL — solo se convierte en una página cuando agregas un <code>page.tsx</code> en ella. Todo lo demás en la carpeta es infraestructura UI optativa.\"</div>",
  },
  {
    id: "c2",
    category: "core",
    categoryLabel: "Core (App Router)",
    level: "junior",
    question: "Layout vs Page vs Template — ¿cuál es la diferencia real?",
    answerHtml:
      "<ul><li><b><code>page.tsx</code></b> — la UI única para un segmento de ruta; necesario para hacer un segmento públicamente accesible.</li><li><b><code>layout.tsx</code></b> — envuelve un segmento <i>y sus hijos</i>; <b>persiste entre navegaciones</i> — no se re-renderiza ni resetea el estado cuando cambia una página hija, y recibe una prop <code>children</code> que debe renderizar.</li><li><b><code>template.tsx</code></b> — misma posición de anidado que un layout, pero crea una <b>nueva instancia en cada navegación</b>, así que el estado local se resetea y los efectos se re-ejecutan. Raro; útil para animaciones de entrada/salida o logging por navegación.</li></ul><div class=\"callout warn\"><span class=\"lbl\">Trampa</span> Usar <code>template.tsx</code> para \"arreglar\" un layout que no se actualiza generalmente es el movimiento incorrecto — el problema real casi siempre son keys faltantes o estado que debería vivir más abajo en el árbol.</div>",
  },
  {
    id: "c3",
    category: "core",
    categoryLabel: "Core (App Router)",
    level: "junior",
    question: "¿Por qué los Server Components son el defecto, y qué te compra eso?",
    answerHtml:
      "<p>Cada componente bajo <code>app/</code> es un <b>Server Component</b> a menos que el archivo (o algo que importe) opte por <code>\"use client\"</code>. Los Server Components se renderizan en el servidor — <b>cero JS enviado al cliente</b> para ese componente, acceso directo a recursos del backend (DB, sistema de archivos, secretos) sin una capa de API, y nunca se re-renderizan en el cliente.</p><div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Los Server Components no son un truco de performance añadido a React — son el nuevo objetivo de renderizado por defecto. Los Client Components son la opción optativa, para la parte del árbol que realmente necesita interactividad.\"</div>",
  },
  {
    id: "c4",
    category: "core",
    categoryLabel: "Core (App Router)",
    question: "¿Qué es el payload RSC y cómo difiere del HTML renderizado en servidor?",
    answerHtml:
      "<p>El <b>payload RSC</b> es una descripción compacta y serializada del árbol de Server Components renderizado — no es HTML. Codifica la salida de componentes, referencias a límites de Client Components (diciéndole al cliente qué bundle JS montar ahí y con qué props), y cualquier dato de Suspense en streaming.</p><p>En la primera carga, Next.js también produce <b>HTML</b> estático para una pintura rápida, pero el payload RSC es lo que hace rápidas las navegaciones posteriores del lado del cliente: el router obtiene un payload actualizado en lugar de un documento HTML nuevo completo y lo reconcilia en el árbol existente.</p>",
  },
  {
    id: "c5",
    category: "core",
    categoryLabel: "Core (App Router)",
    question: "¿Qué sucede realmente durante la hidratación en el App Router?",
    answerHtml:
      "<p>La hidratación solo concierne a las partes de <b>Client Components</b> del árbol. El servidor envía HTML estático más el payload RSC; el navegador descarga el JS para cada límite de Client Component y <b>adjunta manejadores de eventos y estado interno de React</b> a los nodos DOM existentes en lugar de re-renderizarlos desde cero. La salida de Server Components nunca se hidrata — no tiene representación del lado del cliente contra la cual reconciliar.</p><div class=\"callout warn\"><span class=\"lbl\">Trampa</span> Un error de desajuste de hidratación casi siempre significa que el servidor y el cliente produjeron markup diferente para un <i>Client</i> Component (por ejemplo, leyendo <code>window</code> o <code>Date.now()</code> durante el renderizado) — no es un problema de Server Component.</div>",
  },
  {
    id: "c6",
    category: "core",
    categoryLabel: "Core (App Router)",
    question: "¿Cómo se establecen los metadatos y cuál es la diferencia entre estático y generateMetadata?",
    answerHtml:
      "<p>Exporta un objeto <code>metadata</code> estático desde <code>layout.tsx</code>/<code>page.tsx</code> para títulos/descripciones/etiquetas OG fijas. Para metadatos que dependen de datos — el título de una publicación de blog, la og:image de un producto — exporta una función asíncrona <b><code>generateMetadata({ params, searchParams })</code></b> en su lugar; se ejecuta antes de que la página se renderice y su resultado se combina con los layouts padres (el hijo sobreescribe al padre, los arrays como <code>openGraph.images</code> se fusionan).</p><div class=\"callout\"><span class=\"lbl\">Detalle senior</span> Next automáticamente <b>deduplica</b> una llamada fetch que tanto <code>generateMetadata</code> como el componente de página hacen para los mismos datos vía la memorización de solicitudes de React, así que no pagas por ello dos veces.</div>",
  },
  {
    id: "c7",
    category: "core",
    categoryLabel: "Core (App Router)",
    question: "¿Qué optimiza next/font y por qué no simplemente enlazar una etiqueta <link> de Google Fonts?",
    answerHtml:
      "<p><code>next/font</code> descarga archivos de fuente <b>durante la compilación</b> y los auto-hospeda junto a tus otros archivos estáticos — sin solicitud en tiempo de ejecución a los servidores de Google, sin hoja de estilo externa que bloquee el renderizado, y sin cambio de diseño por fuentes que llegan tarde (calcula automáticamente las métricas de fuente de respaldo para igualar el tamaño).</p><div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Un <code>&lt;link&gt;</code> de Google Fonts te cuesta una ida y vuelta de terceros y riesgo de CLS. <code>next/font</code> convierte las fuentes en un asset de compilación, lo cual es estrictamente mejor tanto para la privacidad como para las Core Web Vitals.\"</div>",
  },
  {
    id: "c8",
    category: "core",
    categoryLabel: "Core (App Router)",
    question: "¿Cuál es una estructura de proyecto sensata para el App Router y qué te dan los grupos de rutas?",
    answerHtml:
      "<p>Coloca las piezas específicas de la ruta junto al segmento (<code>_components/</code>, <code>_lib/</code> — el guion bajo al inicio saca una carpeta <b>del</b> enrutamiento) y mantén el código transversal en un <code>src/</code> de nivel superior fuera de <code>app/</code>. Los <b>grupos de rutas</b> — una carpeta envuelta en paréntesis, por ejemplo <code>(marketing)/</code> — te permiten organizar rutas o aplicar un layout raíz distinto <i>sin</i> agregar un segmento de URL.</p><ul><li><code>(marketing)/about/page.tsx</code> → <code>/about</code>, no <code>/marketing/about</code>.</li><li>Uso común: layouts separados para secciones <code>(marketing)</code> vs <code>(app)</code> que comparten un dominio pero no la interfaz.</li></ul>",
  },
  {
    id: "c9",
    category: "core",
    categoryLabel: "Core (App Router)",
    question: "loading.tsx y error.tsx — ¿qué mecanismo impulsa a cada uno?",
    answerHtml:
      "<p>Ambos son envoltorios basados en convenciones que Next.js genera por ti:</p><ul><li><b><code>loading.tsx</code></b> envuelve automáticamente el <code>page.tsx</code> del segmento (y sus hijos) en un límite de <b><code>&lt;Suspense&gt;</code></b>, mostrando la UI de carga mientras el trabajo dependiente de datos del segmento se resuelve.</li><li><b><code>error.tsx</code></b> envuelve automáticamente el segmento en un <b>límite de errores de React</b> (debe ser un Client Component, ya que los límites de errores son de clase/solo cliente) y recibe <code>error</code> + una función <code>reset()</code> para reintentar.</li></ul><div class=\"callout warn\"><span class=\"lbl\">Trampa</span> <code>error.tsx</code> no atrapa errores lanzados en el layout <i>padre</i> del mismo segmento — solo en la página y abajo. Los errores de nivel raíz necesitan <code>global-error.tsx</code>.</div>",
  },
  {
    id: "c10",
    category: "core",
    categoryLabel: "Core (App Router)",
    level: "junior",
    question: "¿Puede un Server Component importar y renderizar un Client Component, y viceversa?",
    answerHtml:
      "<p>Un Server Component <b>puede</b> importar y renderizar un Client Component — esa es la forma normal de introducir interactividad. Un Client Component <b>no puede</b> importar directamente un Server Component (una vez que cruzas a <code>\"use client\"</code>, cada módulo alcanzable por importación en ese subárbol se convierte en código cliente, y los Server Components no pueden ser empaquetados para el cliente ya que pueden usar APIs solo-servidor).</p><div class=\"callout tip\"><span class=\"lbl\">Solución</span> Pasa el Server Component como <code>children</code> u otra prop desde un Server Component padre al Client Component — este es el patrón de interpolación, cubierto en Rendering.</div>",
  },
  {
    id: "c11",
    category: "core",
    categoryLabel: "Core (App Router)",
    level: "architect",
    question: "¿Por qué el modelo de convención de archivos del App Router reduce el área de superficie para decisiones de arquitectura en un equipo grande?",
    answerHtml:
      "<p>El Pages Router dejaba el enrutamiento, la obtención de datos y la composición de layouts como preguntas de diseño abiertas por equipo; el App Router codifica opiniones fuertes como <b>convenciones del sistema de archivos</b> — anidado de layouts, límites loading/error, y la división server/client son estructurales, no una elección de biblioteca que alguien tiene que recordar aplicar consistentemente. Eso convierte una clase de detalles de revisión de código (\"dónde debería vivir este fetch\", \"debería ser un layout o un componente wrapper\") en algo que el compilador y el árbol de archivos aplican por ti.</p><div class=\"callout\"><span class=\"lbl\">Encuadre senior</span> El compromiso es la rigidez: heredas las opiniones de Next sobre dónde van los límites, lo cual es una ganancia neta para la consistencia de un equipo grande pero una restricción real si la estructura de tu aplicación no se mapea limpiamente a segmentos anidados.</div>",
  },

  // ---------------- RENDERING & CACHING ----------------
  {
    id: "c12",
    category: "rendering",
    categoryLabel: "Rendering y Caché",
    question: "SSR vs SSG vs ISR — ¿cuál es el modelo mental para cada uno?",
    answerHtml:
      "<table><tr><th>Estrategia</th><th>Cuándo se renderiza</th></tr><tr><td><b>SSG</b></td><td>En el <b>tiempo de compilación</b>. La salida es HTML estático servido desde caché/CDN — el más rápido, pero los datos pueden quedar obsoletos hasta la siguiente implementación.</td></tr><tr><td><b>SSR</b></td><td>En <b>cada solicitud</b>. Siempre fresco, pero paga latencia de renderizado por solicitud.</td></tr><tr><td><b>ISR</b></td><td>Estático como SSG, pero revalida <b>en segundo plano</b> después de una ventana de tiempo o bajo demanda — stale-while-revalidate para páginas completas.</td></tr></table><p>El App Router expresa estas como comportamiento (opciones de caché de fetch, configuración de segmentos de ruta, o Cache Components) en lugar de APIs de nivel superior separadas como <code>getStaticProps</code>/<code>getServerSideProps</code>.</p>",
  },
  {
    id: "c13",
    category: "rendering",
    categoryLabel: "Rendering y Caché",
    level: "architect",
    question: "¿Qué son los Cache Components y cómo se relaciona con el Prerenderizado Parcial?",
    answerHtml:
      "<p><b>Cache Components</b> es el nuevo modelo de caché, habilitado con <code>cacheComponents: true</code> en <code>next.config.ts</code>. <b>Completa el Prerenderizado Parcial (PPR)</b>: en lugar de que una página sea totalmente estática o totalmente dinámica, Next prerenderiza un shell estático en tiempo de compilación y deja \"agujeros\" explícitos para lo dinámico, transmitiéndolos en el tiempo de solicitud.</p><p>Bajo este modelo, el caché se vuelve <b>explícito</b>: el trabajo está envuelto en <code>\"use cache\"</code> (cacheable, se convierte en parte del shell estático) o no lo está — y cualquier cosa no cacheada que toque una API de runtime debe estar dentro de un límite <code>&lt;Suspense&gt;</code>, o el servidor de compilación/dev lanza un error.</p><div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"PPR es la técnica de renderizado — un shell estático con agujeros dinámicos. Cache Components es el modelo de programación que hace esos agujeros explícitos y forzados, en lugar de inferidos de las APIs que sucediste a llamar.\"</div>",
  },
  {
    id: "c14",
    category: "rendering",
    categoryLabel: "Rendering y Caché",
    question: "¿Cómo funciona la directiva \"use cache\" y qué forma la clave de caché?",
    answerHtml:
      "<p><code>\"use cache\"</code> va al inicio del cuerpo de una función asíncrona o componente (o al inicio de un archivo, para cubrir cada exportación en él) y cachea el <b>valor de retorno</b> de esa función. No creas manualmente una clave de caché: <b>los argumentos y cualquier valor cerrado</b> que la función lee se convierten automáticamente en parte de la clave, así que llamarla con diferentes props produce naturalmente diferentes entradas de caché.</p><div class=\"code\">async function Products({ category }: { category: string }) {\n  'use cache'\n  const items = await db.products.findByCategory(category)\n  return &lt;ProductList items={items} /&gt;\n}</div><p>Configúralo con <code>cacheLife(profile)</code> y <code>cacheTag(tag)</code>, ambos importados de <code>next/cache</code> y ahora <b>estables</b> (sin más prefijo <code>unstable_</code>).</p>",
  },
  {
    id: "c15",
    category: "rendering",
    categoryLabel: "Rendering y Caché",
    question: "¿Qué activa el error \"Uncached data was accessed outside of <Suspense>\"?",
    answerHtml:
      "<p>Bajo Cache Components, cualquier componente que lee una <b>API de runtime</b> — <code>cookies()</code>, <code>headers()</code>, <code>searchParams</code>, <code>params</code> — sin estar envuelto en <code>\"use cache\"</code> es inherentemente dinámico: su output solo se conoce en el tiempo de solicitud. Si ese componente (o cualquiera que espere a él) no está envuelto en un límite <code>&lt;Suspense&gt;</code>, Next no puede construir un shell estático alrededor y lanza un error en tiempo de compilación/dev en lugar de silenciosamente hacer toda la página dinámica.</p><div class=\"callout warn\"><span class=\"lbl\">Trampa</span> La solución casi siempre es empujar el límite <code>&lt;Suspense&gt;</code> <i>hacia abajo</i>, alrededor solo de la pieza dinámica, para que el resto de la página permanezca como parte del shell estático.</div>",
  },
  {
    id: "c16",
    category: "rendering",
    categoryLabel: "Rendering y Caché",
    question: "¿Qué hace connection() y cuándo la necesitas?",
    answerHtml:
      "<p><code>connection()</code>, importado de <code>next/server</code>, es una señal esperable que difiere la ejecución hasta el tiempo de solicitud. Úsala alrededor de <b>trabajo no determinístico que no llama a una API de runtime directamente</b> — <code>Math.random()</code>, <code>Date.now()</code>, un bucket A/B aleatorio — para que Next aún trate ese código como dinámico y lo excluya del shell estático, en lugar de hornear un valor aleatorio en el tiempo de compilación.</p><div class=\"code\">async function Experiment() {\n  await connection()\n  const bucket = Math.random() &lt; 0.5 ? 'a' : 'b'\n  return &lt;Variant bucket={bucket} /&gt;\n}</div>",
  },
  {
    id: "c17",
    category: "rendering",
    categoryLabel: "Rendering y Caché",
    question: "¿Cómo actúa Suspense como \"el agujero dinámico\" en el Prerenderizado Parcial?",
    answerHtml:
      "<p>Durante el paso de prerenderizado, Next camina el árbol y, al encontrar un límite <code>&lt;Suspense&gt;</code> envolviendo contenido dinámico, <b>renderiza el fallback en el shell estático</b> y difiere el contenido real al tiempo de solicitud. En runtime, el shell se sirve instantáneamente (desde caché/CDN) y el contenido dinámico real se transmite y reemplaza el fallback en su lugar — el mismo mecanismo que React Suspense ya usa para estados de carga, reutilizado como la costura entre estático y dinámico.</p><div class=\"callout tip\"><span class=\"lbl\">Modelo mental</span> Cada límite <code>&lt;Suspense&gt;</code> es una promesa al prerenderizador: \"esta parte se permite que no exista aún.\"</div>",
  },
  {
    id: "c18",
    category: "rendering",
    categoryLabel: "Rendering y Caché",
    question: "¿Cómo se componen los Server y Client Components — qué cruza realmente el límite?",
    answerHtml:
      "<p>Puedes intercalarlos: un <b>Server Component puede pasarse como <code>children</code> u otra prop a un Client Component</b>, aunque un Client Component no puede importar uno directamente. El Server Component se renderiza en el servidor, y su output ya renderizado se entrega al Client Component a través del payload RSC — el Client Component nunca lo re-ejecuta.</p><div class=\"code\">// Server Component\nimport ClientModal from './client-modal'\nimport ServerCart from './server-cart'\n\nexport default function Page() {\n  return (\n    &lt;ClientModal&gt;\n      &lt;ServerCart /&gt;\n    &lt;/ClientModal&gt;\n  )\n}</div><p>Solo valores <b>serializables</b> (no funciones, instancias de clase, etc.) pueden cruzar de Server a Client como props — el payload RSC tiene que poder codificarlos.</p>",
  },
  {
    id: "c19",
    category: "rendering",
    categoryLabel: "Rendering y Caché",
    question: "¿Qué son los perfiles de cacheLife y cómo eliges uno?",
    answerHtml:
      "<p><code>cacheLife(profile)</code> adjunta una política TTL/obsolescencia nombrada a una función <code>\"use cache\"</code> — los perfiles incluidos incluyen cosas como <code>seconds</code>, <code>minutes</code>, <code>hours</code>, <code>days</code>, y <code>max</code>, o puedes definir perfiles personalizados en <code>next.config.ts</code> con ventanas <code>stale</code>/<code>revalidate</code>/<code>expire</code>. Elige basado en qué tan tolerante sea la obsolescencia de los datos: una página de marketing podría usar <code>days</code>, una estadística de dashboard podría usar <code>minutes</code>.</p><div class=\"callout warn\"><span class=\"lbl\">Trampa</span> Olvidar <code>cacheLife</code> completamente no significa \"nunca cachear\" — <code>\"use cache\"</code> sin un perfil aún cachea, solo con la política por defecto, lo cual sorprende a la gente que espera output siempre fresco.</div>",
  },

  // ---------------- DATA & SERVER ACTIONS ----------------
  {
    id: "c20",
    category: "data",
    categoryLabel: "Datos y Server Actions",
    question: "¿Cuáles son las capas de caché que una solicitud fetch() puede atravesar en el modelo legacy (sin Cache Components)?",
    answerHtml:
      "<ul><li><b>Memorización de Solicitudes</b> — el <code>cache()</code> de React (y la auto-memorización incorporada de fetch) deduplica solicitudes idénticas <i>dentro de un solo paso de renderizado</b>, así que llamar al mismo fetch desde un layout, una página, y <code>generateMetadata</code> solo golpea la red una vez.</li><li><b>Data Cache</b> — un caché persistente entre solicitudes e implementaciones para resultados de <code>fetch()</code> (o <code>unstable_cache()</code> para llamadas no-fetch), controlado vía <code>{ cache: 'force-cache' }</code> o <code>{ next: { revalidate, tags } }</code>.</li><li><b>Full Route Cache</b> — el HTML/payload RSC renderizado para una ruta estática completa, producido en tiempo de compilación.</li><li><b>Client Router Cache</b> — un caché en el navegador de payloads RSC para segmentos visitados/prefetch recientes, evitando una ida y vuelta al servidor en navegación hacia atrás/adelante.</li></ul>",
  },
  {
    id: "c21",
    category: "data",
    categoryLabel: "Datos y Server Actions",
    question: "¿Cuáles son los defectos de fetch() y las dos formas de optar por el caché en el modelo legacy?",
    answerHtml:
      "<p>El <code>fetch()</code> simple en el App Router es <b>sin caché por defecto</b> — cada llamada golpea la red fresca a menos que optes por ello:</p><ul><li><code>fetch(url, { cache: 'force-cache' })</code> — cachea indefinidamente (hasta que se revalide manualmente), el viejo comportamiento SSG.</li><li><code>fetch(url, { next: { revalidate: 60, tags: ['posts'] } })</code> — cachea con un TTL basado en tiempo y/o una etiqueta que puedes invalidar bajo demanda — el comportamiento ISR para fetch.</li></ul><p>Para cualquier cosa que no sea <code>fetch</code> (un cliente de BD, una llamada ORM), envuélvelo en <code>unstable_cache(fn, keyParts, { tags, revalidate })</code> para obtener la misma semántica de Data Cache.</p>",
  },
  {
    id: "c22",
    category: "data",
    categoryLabel: "Datos y Server Actions",
    level: "architect",
    question: "¿Qué son las Server Functions y cómo las invocas?",
    answerHtml:
      "<p>Una Server Function es cualquier función asíncrona marcada con <code>\"use server\"</code> (al inicio de la función, o al inicio de un archivo para cubrir todas sus exportaciones) — siempre se ejecuta en el servidor incluso cuando se llama desde código cliente. Hay dos rutas de invocación:</p><ul><li><b><code>&lt;form action={fn}&gt;</code></b> / <code>&lt;button formAction={fn}&gt;</code> — usable directamente desde un <i>Server</i> Component, sin JS cliente requerido para enviar; React envuelve el despacho en <code>startTransition</code> automáticamente y funciona con mejora progresiva (el formulario aún envía si el JS no se ha cargado).</li><li><b>Manejadores de eventos</b> en un Client Component — por ejemplo <code>onClick={() =&gt; myAction(id)}</code>.</li></ul><div class=\"callout warn\"><span class=\"lbl\">Trampa</span> \"Server Action\" y \"Server Function\" son el mismo mecanismo subyacente; la documentación más reciente favorece \"Server Function\" como término general y reserva \"Server Action\" para el uso vinculado a formulario/transición.</div>",
  },
  {
    id: "c23",
    category: "data",
    categoryLabel: "Datos y Server Actions",
    question: "¿Qué te da useActionState y cuál es su firma exacta?",
    answerHtml:
      "<p><code>useActionState(action, initialState)</code> retorna un 3-tupla: <b><code>[state, formAction, pending]</code></b>.</p><ul><li><b><code>state</code></b> — el último valor retornado por la acción (comienza en <code>initialState</code>).</li><li><b><code>formAction</code></b> — una versión envuelta de tu acción para pasar a <code>&lt;form action={...}&gt;</code>; hila el estado anterior automáticamente como el primer argumento de la acción.</li><li><b><code>pending</code></b> — un booleano, verdadero mientras la acción está en vuelo, para deshabilitar el botón de envío/mostrar un spinner sin estado extra.</li></ul><div class=\"code\">const [state, formAction, pending] = useActionState(updateName, { error: null })</div>",
  },
  {
    id: "c24",
    category: "data",
    categoryLabel: "Datos y Server Actions",
    question: "¿Qué problema resuelve useOptimistic y cómo revierte?",
    answerHtml:
      "<p><code>useOptimistic(state, updateFn)</code> te permite renderizar un estado UI <b>predicho</b> inmediatamente después de una acción del usuario, antes de que la respuesta de la Server Function regrese — por ejemplo, mostrar un corazón \"gustado\" instantáneamente en lugar de esperar la ida y vuelta. Retorna <code>[optimisticState, addOptimistic]</code>; llamar a <code>addOptimistic</code> dentro de una transición muestra el valor optimista solo por la duración de esa transición.</p><div class=\"callout warn\"><span class=\"lbl\">Trampa</span> Si la acción falla o el estado final del servidor difiere, React revierte automáticamente al <code>state</code> real una vez que la transición se asienta — no reviertes manualmente, pero sí necesitas manejar/mostrar el error tú mismo.</div>",
  },
  {
    id: "c25",
    category: "data",
    categoryLabel: "Datos y Server Actions",
    question: "revalidatePath vs revalidateTag vs updateTag vs refresh — ¿qué invalida realmente cada uno?",
    answerHtml:
      "<table><tr><th>API</th><th>Invalida</th><th>Dónde se puede llamar</th></tr><tr><td><code>revalidatePath(path)</code></td><td>Datos cacheados + Full Route Cache para una ruta específica</td><td>Server Function / Route Handler</td></tr><tr><td><code>revalidateTag(tag, profile)</code></td><td>Todas las entradas de caché etiquetadas con <code>tag</code>, stale-while-revalidate</td><td>Server Function / Route Handler</td></tr><tr><td><code>updateTag(tag)</code></td><td>Lo mismo pero con <b>read-your-writes</b> — expira y refresca dentro de la misma solicitud</td><td>Solo Server Function</td></tr><tr><td><code>refresh()</code></td><td>Solo las partes sin caché/dinámicas del router del cliente — no toca el caché en absoluto</td><td>Solo Server Function</td></tr></table>",
  },
  {
    id: "c26",
    category: "data",
    categoryLabel: "Datos y Server Actions",
    question: "¿Qué cambió en Next 16 sobre la firma de revalidateTag?",
    answerHtml:
      "<p><code>revalidateTag(tag)</code> — la vieja forma de un solo argumento — está <b>obsoleta</b>. Next 16 requiere un <b>segundo argumento</b>: ya sea un perfil de <code>cacheLife</code> nombrado (<code>'max'</code> es el comúnmente recomendado) u un objeto <code>{ expire: seconds }</code> explícito.</p><div class=\"code\">revalidateTag('posts', 'max')\no\nrevalidateTag('posts', { expire: 3600 })</div><div class=\"callout warn\"><span class=\"lbl\">Trampa</span> Esto te da semántica <b>stale-while-revalidate</b> por diseño — la etiqueta no desaparece instantáneamente, los datos obsoletos aún pueden servirse brevemente mientras los datos frescos se obtienen en segundo plano. Si necesitas consistencia inmediata <i>dentro de la misma solicitud</i>, usa <code>updateTag</code> en su lugar.</div>",
  },
  {
    id: "c27",
    category: "data",
    categoryLabel: "Datos y Server Actions",
    question: "¿Cómo difiere cache() de React del Data Cache de Next?",
    answerHtml:
      "<p><b>El <code>cache()</code> de React</b> (Memorización de Solicitudes) es <b>por renderizado, en memoria, y con alcance a una sola solicitud</b> — deduplica llamar a la misma función con los mismos argumentos múltiples veces mientras renderiza una página, luego descarta el caché. Funciona para cualquier función asíncrona, no solo <code>fetch</code>.</p><p>El <b>Data Cache</b> es <b>persistente</b> — sobrevive entre solicitudes e implementaciones, respaldado por la infraestructura de Next, y es lo que realmente te ahorra idas y vueltas de red/BD con el tiempo. Confundir los dos es un error clásico: envolver una llamada a BD solo en el <code>cache()</code> de React te da cero caché entre solicitudes.</p>",
  },
  {
    id: "c28",
    category: "data",
    categoryLabel: "Datos y Server Actions",
    question: "¿Despacha el cliente múltiples llamadas a Server Functions en paralelo?",
    answerHtml:
      "<p><b>No</b> — el cliente despacha Server Functions <b>una a la vez, secuencialmente</b>, incluso si activas varias en rápida sucesión (por ejemplo, clics dobles rápidos, o varias acciones independientes encoladas en la misma transición). Cada una espera a que la anterior se resuelva antes de enviar la siguiente.</p><div class=\"callout tip\"><span class=\"lbl\">Por qué importa</span> Esta es una protección incorporada contra carreras y envíos duplicados — no necesitas crear manualmente un mutex alrededor de un botón de envío, aunque aún deberías deshabilitarlo a través del flag <code>pending</code> de <code>useActionState</code> para claridad de UX.</div>",
  },

  // ---------------- ROUTING ----------------
  {
    id: "c29",
    category: "routing",
    categoryLabel: "Enrutamiento",
    level: "junior",
    question: "¿Segmentos dinámicos vs rutas catch-all — sintaxis y cuándo se activa cada una?",
    answerHtml:
      "<ul><li><b><code>[slug]</code></b> — segmento dinámico, coincide exactamente con una parte de la ruta: <code>/blog/[slug]</code> coincide con <code>/blog/hello</code>.</li><li><b><code>[...slug]</code></b> — catch-all, coincide con uno <i>o más</i> segmentos como un array: <code>/shop/[...slug]</code> coincide con <code>/shop/a</code> y <code>/shop/a/b/c</code>.</li><li><b><code>[[...slug]]</code></b> — catch-all opcional, además coincide con la ruta base con cero segmentos: <code>/shop</code> también coincide.</li></ul><p>Los tres se leen a través de la prop <code>params</code>, que — como cada API de runtime en Next 16 — es una <b>Promise</b>: <code>const { slug } = await params</code>.</p>",
  },
  {
    id: "c30",
    category: "routing",
    categoryLabel: "Enrutamiento",
    question: "¿Qué son las rutas paralelas y por qué Next 16 requiere un default.js por slot?",
    answerHtml:
      "<p>Las <b>rutas paralelas</b> (carpetas <code>@slot</code>) permiten que un layout renderice <b>múltiples páginas independientes en la misma vista simultáneamente</b> — por ejemplo, un dashboard renderizando <code>@analytics</code> y <code>@team</code> lado a lado, cada uno con su propio estado de carga/error y navegación independiente.</p><div class=\"callout warn\"><span class=\"lbl\">Cambio en Next 16</span> Cada slot ahora <b>requiere un <code>default.js</code> explícito</b> — el fallback renderizado cuando Next no puede recuperar el estado activo de un slot en una navegación dura/actualización (por ejemplo, la URL no coincide con ninguna de las rutas de ese slot). Sin él, la <b>compilación falla</b>; anteriormente caía silenciosamente al output 404 de la página.</div>",
  },
  {
    id: "c31",
    category: "routing",
    categoryLabel: "Enrutamiento",
    question: "¿Para qué sirven las rutas interceptadas y qué significa la sintaxis (..)?",
    answerHtml:
      "<p>Las rutas interceptadas te permiten mostrar una ruta <b>dentro del contexto de layout actual</b> (típicamente un modal) cuando se navega del lado del cliente, mientras aún la renderiza como su propia página completa en una carga directa/actualización — el clásico patrón de foto-de-Instagram-en-un-modal.</p><ul><li><code>(.)</code> — coincide con un segmento en el <b>mismo</b> nivel</li><li><code>(..)</code> — coincide con un nivel <b>arriba</b></li><li><code>(..)(..)</code> — dos niveles arriba</li><li><code>(...)</code> — coincide desde el directorio <b>raíz</b> app</li></ul><p>Combínalo con un slot de ruta paralela (usualmente <code>@modal</code>) para que la vista interceptada se renderice junto a la página subyacente en lugar de reemplazarla.</p>",
  },
  {
    id: "c32",
    category: "routing",
    categoryLabel: "Enrutamiento",
    question: "proxy.ts vs middleware.ts — ¿qué cambió en Next 16?",
    answerHtml:
      "<p><code>proxy.ts</code> <b>reemplaza</b> a <code>middleware.ts</code> a partir de Next 16 — mismo concepto de convención de archivo, pero la función exportada se renombra <code>middleware</code> → <code>proxy</code>, y se ejecuta <b>solo en el runtime de Node.js</b> (la opción edge-runtime ya no existe). <code>middleware.ts</code> aún funciona por ahora pero está <b>obsoleto</b>, mantenido para casos de uso de edge-runtime, y eventualmente será removido.</p><div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Mismo trabajo — interceptar solicitudes antes de que golpeen una ruta — nuevo nombre y un historial de runtime más acotado. Si estás empezando desde cero en Next 16, usa <code>proxy.ts</code>.\"</div>",
  },
  {
    id: "c33",
    category: "routing",
    categoryLabel: "Enrutamiento",
    question: "redirect() vs notFound() — ¿comportamiento y desde dónde se pueden llamar?",
    answerHtml:
      "<p>Ambos se importan de <code>next/navigation</code> y funcionan <b>lanzando</b> un error interno especial que el motor de renderizado de Next atrapa — por eso no deben estar envueltos en un <code>try/catch</code> que lo trague.</p><ul><li><b><code>redirect(path)</code></b> — emite una redirección (por defecto 307 en una Server Function, 303 después de una mutación completada); se puede llamar en Server Components, Server Functions, y Route Handlers.</li><li><b><code>notFound()</code></b> — renderiza el límite <code>not-found.tsx</code> más cercano con un estado <b>404</b>; mismos contextos de llamada.</li></ul><div class=\"callout warn\"><span class=\"lbl\">Trampa</span> Llamar a cualquiera dentro de un bloque <code>try { ... } catch { ... }</code> sin re-lanzarlo lo atrapará como un error genérico en lugar de dejar que Next maneje la navegación/404.</div>",
  },
  {
    id: "c34",
    category: "routing",
    categoryLabel: "Enrutamiento",
    question: "¿Para qué se usan los grupos de rutas más allá de solo organizar carpetas?",
    answerHtml:
      "<p>Envolver un nombre de carpeta en paréntesis — <code>(group)</code> — lo elimina de la URL mientras aún le permite participar en la jerarquía del sistema de archivos. Dos grandes usos más allá de la limpieza:</p><ul><li><b>Múltiples layouts raíz</b> — diferentes grupos pueden definir cada uno su propio <code>layout.tsx</code> de nivel superior (incluyendo <code>&lt;html&gt;</code>/<code>&lt;body&gt;</code> separados), útil para por ejemplo un sitio de marketing vs. una aplicación autenticada compartiendo una implementación.</li><li><b>Escalar un layout a un subconjunto de rutas</b> sin anidarlas bajo un segmento de URL extra.</li></ul>",
  },
  {
    id: "c35",
    category: "routing",
    categoryLabel: "Enrutamiento",
    question: "¿Cómo proteges un conjunto de rutas con proxy.ts?",
    answerHtml:
      "<p><code>proxy.ts</code> exporta una función <code>proxy(request)</code> más un <code>config.matcher</code> para definir el alcance de qué rutas ejecuta. Lee la sesión (típicamente desde una cookie) y redirige solicitudes no autenticadas antes de que la ruta siquiera se renderice:</p><div class=\"code\">export function proxy(request: NextRequest) {\n  const session = request.cookies.get('session')\n  if (!session) {\n    return NextResponse.redirect(new URL('/login', request.url))\n  }\n}\n\nexport const config = { matcher: ['/dashboard/:path*'] }</div><div class=\"callout warn\"><span class=\"lbl\">Trampa</span> Esta es una puerta de UX, no un sustituto para verificaciones de auth dentro de Server Functions — ver Autenticación.</div>",
  },

  // ---------------- PERFORMANCE ----------------
  {
    id: "c36",
    category: "perf",
    categoryLabel: "Rendimiento",
    question: "¿Qué hace next/image por ti más allá de una etiqueta <img> simple?",
    answerHtml:
      "<p><code>next/image</code> automáticamente: <b>redimensiona y sirve formatos modernos</b> (AVIF/WebP) dimensionados al viewport a través de <code>srcset</code>, <b>carga diferida</b> de imágenes fuera de pantalla por defecto, previene <b>cambios de diseño</b> reservando espacio desde el <code>width</code>/<code>height</code> requerido (o <code>fill</code>), y puede marcarse con <code>priority</code> para imágenes LCP above-the-fold para saltar la carga diferida.</p><div class=\"callout warn\"><span class=\"lbl\">Defectos de Next 16</span> <code>minimumCacheTTL</code> pasó de 60s → <b>4h</b>; <code>qualities</code> se redujo a solo <code>[75]</code> por defecto; <code>images.domains</code> está obsoleto en favor del más preciso <code>images.remotePatterns</code>.</div>",
  },
  {
    id: "c37",
    category: "perf",
    categoryLabel: "Rendimiento",
    question: "¿Cómo cambia la división de código con next/dynamic lo que se envía al cliente?",
    answerHtml:
      "<p><code>next/dynamic(() =&gt; import('./Heavy'))</code> difiere la carga del bundle JS de un Client Component hasta que realmente se necesita — por ejemplo, un editor de texto enriquecido, biblioteca de gráficos, o contenido de modal — en lugar de que sea parte del bundle inicial de la página. Combínalo con <code>{ ssr: false }</code> para componentes que solo tienen sentido en el navegador (dependiendo de <code>window</code>, bibliotecas solo-navegador).</p><div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Los Server Components ya te dan una forma de división de código gratis — su código nunca se envía en absoluto. <code>next/dynamic</code> es para dividir más la porción de Client Component, difiriendo las partes que no se necesitan inmediatamente.\"</div>",
  },
  {
    id: "c38",
    category: "perf",
    categoryLabel: "Rendimiento",
    question: "¿A qué Core Web Vitals ayuda más directamente Next.js y cómo?",
    answerHtml:
      "<table><tr><th>Métrica</th><th>Palanca de Next.js</th></tr><tr><td><b>LCP</b> (Largest Contentful Paint)</td><td><code>next/image priority</code>, renderizado/streaming en servidor para que el contenido llegue más pronto, evitandoobtención de datos solo-cliente para contenido above-the-fold</td></tr><tr><td><b>CLS</b> (Cumulative Layout Shift)</td><td>Dimensiones reservadas de <code>next/image</code>, fuentes de respaldo dimensionadas de <code>next/font</code></td></tr><tr><td><b>INP</b> (Interaction to Next Paint)</td><td>Bundles del cliente más pequeños vía Server Components + división de código, para que el hilo principal esté menos bloqueado cuando un usuario interactúa</td></tr></table>",
  },
  {
    id: "c39",
    category: "perf",
    categoryLabel: "Rendimiento",
    question: "¿Qué es realmente diferente de Turbopack en Next 16 vs versiones anteriores?",
    answerHtml:
      "<p>Turbopack ahora es <b>estable</b> y el <b>empaquetador por defecto</b> tanto para <code>next dev</code> como <code>next build</code> en Next 16 (anteriormente opt-in vía <code>--turbo</code>, y solo para dev). Basado en Rust, incremental, con caché a nivel de función da aproximadamente <b>2-5x compilaciones de producción más rápidas</b> y hasta <b>10x Fast Refresh más rápido</b> versus webpack en aplicaciones grandes.</p><div class=\"callout warn\"><span class=\"lbl\">Trampa</span> Un puñado de configuraciones avanzadas personalizadas de webpack (ciertos loaders/plugins) aún no tienen un equivalente en Turbopack — verifica la compatibilidad antes de asumir un reemplazo directo en una configuración pesada de webpack.</div>",
  },
  {
    id: "c40",
    category: "perf",
    categoryLabel: "Rendimiento",
    question: "¿Qué es el React Compiler y por qué es opt-in en lugar de defecto en Next 16?",
    answerHtml:
      "<p>El React Compiler memoriza automáticamente componentes y valores en tiempo de compilación — infiere el equivalente a <code>useMemo</code>/<code>useCallback</code>/<code>React.memo</code> para que no los escribas manualmente, reduciendo re-renderizados innecesarios. Es <b>estable</b> desde Next 16 pero <b>opt-in</b> vía <code>reactCompiler: true</code> en <code>next.config.ts</code>, porque cambia el output de compilación y las características de performance de toda la aplicación — un cambio de comportamiento lo suficientemente grande para que los equipos lo adopten deliberadamente en lugar de que se active silenciosamente.</p>",
  },
  {
    id: "c41",
    category: "perf",
    categoryLabel: "Rendimiento",
    question: "¿Cómo funciona el streaming con Suspense como técnica de rendimiento percibido — cómo cambia TTFB vs LCP?",
    answerHtml:
      "<p>En lugar de esperar al dato más lento antes de enviar <i>cualquier</i> HTML, Next puede enviar el shell inmediatamente (TTFB rápido) y transmitir secciones más lentas a medida que sus límites <code>&lt;Suspense&gt;</code> se resuelven, cada una reemplazando su fallback en su lugar. La página se vuelve interactiva y muestra contenido significativo más pronto, aunque el dato más lento tarda exactamente lo mismo en llegar realmente — estás mejorando el rendimiento <i>percibido</i> y frecuentemente <b>LCP</b>, no el tiempo total de obtención de datos.</p><div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"El streaming no hace tu base de datos más rápida — impide que tus datos más rápidos esperen a tus más lentos.\"</div>",
  },
  {
    id: "c42",
    category: "perf",
    categoryLabel: "Rendimiento",
    level: "architect",
    question: "¿Cómo diagnosticarías un bundle del cliente inesperadamente grande en una aplicación del App Router?",
    answerHtml:
      "<p>Comienza con <code>@next/bundle-analyzer</code> para visualizar qué realmente se envía. Los culpables comunes, en orden de frecuencia: una biblioteca grande importada en un archivo que es transitivamente parte de un límite <code>\"use client\"</code> (cuando solo se necesita del lado del servidor); un archivo barrel (<code>index.ts</code> re-exportando todo) que arrastra código que no se tree-shakea; un Client Component sentado demasiado alto en el árbol, arrastrando hijos que podrían haber quedado solo-servidor al bundle del cliente.</p><div class=\"callout warn\"><span class=\"lbl\">Patrón de solución</span> Empuja los límites de <code>\"use client\"</code> tan <b>abajo</b> como sea posible en el árbol — envuelve solo la hoja interactiva, no todo su contenedor — para que más de la UI circundante permanezca renderizada en servidor y fuera del bundle.</div>",
  },

  // ---------------- AUTH ----------------
  {
    id: "c43",
    category: "auth",
    categoryLabel: "Autenticación",
    question: "¿Cuál es el patrón de sesión estándar en el App Router y dónde se lee?",
    answerHtml:
      "<p>La mayoría de configuraciones de auth en el App Router usan una <b>cookie de sesión firmada, httpOnly</b> emitida en el login. Se lee a través de la API asíncrona <code>cookies()</code> — <code>await cookies()</code> — dentro de Server Components (para renderizado condicional), Server Functions (para autorizar una mutación), y Route Handlers (para endpoints estilo API). Dado que los Server Components se renderizan en el servidor, el token de sesión en sí nunca necesita exponerse al JS del cliente — una mejora de seguridad significativa sobre patrones que almacenan tokens en <code>localStorage</code>.</p>",
  },
  {
    id: "c44",
    category: "auth",
    categoryLabel: "Autenticación",
    question: "¿Por qué cada Server Function debe verificar la auth independientemente, aunque un proxy ya haya protegido la página?",
    answerHtml:
      "<p>Las Server Functions se compilan en un endpoint <b>POST</b> plano con un id de acción estable — son <b>directamente alcanzables</b> por cualquiera que pueda construir esa solicitud POST, evadiendo completamente tu interfaz de React y, críticamente, <b>evadiendo <code>proxy.ts</code> si solo coincide con rutas de página</a> (o incluso si coincide, una verificación de proxy no es el mismo límite de confianza que la acción misma validando al llamador y el recurso específico).</p><div class=\"callout warn\"><span class=\"lbl\">Trampa</span> \"El botón solo se renderiza para administradores\" no es una verificación de auth — la acción que respalda ese botón necesita su propio <code>if (!session.isAdmin) throw ...</code> al inicio, cada vez, porque la puerta a nivel de UI no es un límite de seguridad.</div>",
  },
  {
    id: "c45",
    category: "auth",
    categoryLabel: "Autenticación",
    question: "¿Puerta a nivel de ruta vía proxy.ts vs verificaciones a nivel de Server Function — para qué sirve cada una realmente?",
    answerHtml:
      "<table><tr><th>Capa</th><th>Bueno para</th><th>No suficiente para</th></tr><tr><td><code>proxy.ts</code></td><td>Redirecciones <b>UX</b> rápidas, centralizadas (no autenticado → <code>/login</code>) antes de que una página siquiera se renderice</td><td>Autorizar mutaciones individuales o acceso a nivel de recurso (\"puede este usuario editar <i>esta</i> publicación\")</td></tr><tr><td>Verificación de Server Function</td><td>El real <b>límite de autorización</b> — verificando identidad y propiedad del recurso para esa escritura específica</td><td>Ser la única línea de defensa para UX a nivel de página (mostrarías contenido no autenticado brevemente)</td></tr></table><p>Usa ambos — proxy para UX, verificaciones internas para el verdadero límite de seguridad.</p>",
  },
  {
    id: "c46",
    category: "auth",
    categoryLabel: "Autenticación",
    question: "¿Cómo luce típicamente una integración de Auth.js (NextAuth) en el App Router?",
    answerHtml:
      "<p>Un <code>auth.ts</code> central configura proveedores (OAuth, credenciales) y exporta <code>{ auth, signIn, signOut, handlers }</code>. <code>handlers</code> se monta como un Route Handler catch-all en <code>app/api/auth/[...nextauth]/route.ts</code> para manejar el baile de callback OAuth. En Server Components/Functions llamas a <code>const session = await auth()</code> directamente — no se necesita fetch del lado del cliente para saber quién está logueado, ya que se ejecuta del lado del servidor.</p><div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"Auth.js te da la tubería de proveedores y manejo de cookie de sesión; tú aún eres responsable de llamar a <code>auth()</code> dentro de cada Server Function que lo necesite.\"</div>",
  },
  {
    id: "c47",
    category: "auth",
    categoryLabel: "Autenticación",
    question: "¿Cómo mantienes un Client Component consciente del estado de sesión sin exponer secretos?",
    answerHtml:
      "<p>Obtén la sesión del lado del servidor (en un Server Component o layout) y pasa hacia abajo solo la <b>forma mínima, no sensible</b> (id de usuario, nombre, avatar — nunca tokens crudos) como props, o envuelve el árbol en un proveedor de sesión del lado del cliente (por ejemplo, <code>SessionProvider</code> de Auth.js) que se siembra desde esa sesión obtenida del servidor y revalida vía un ligero fetch del cliente cuando sea necesario. La cookie de sesión real permanece httpOnly y nunca es legible por el JS del cliente de cualquier manera.</p>",
  },
  {
    id: "c58",
    category: "auth",
    categoryLabel: "Autenticación",
    question: "¿Cómo debería manejar una Server Function la autorización para un recurso específico, no solo \"está logueado\"?",
    answerHtml:
      "<p>Autenticación (\"quién es este\") y autorización (\"puede hacer esta cosa específica\") son verificaciones separadas — un usuario logueado no está automáticamente autorizado para editar <i>cualquier</i> publicación. Dentro de la acción, después de confirmar que existe una sesión, re-obtén el recurso destino y compara propiedad/rol <b>del lado del servidor</b>, nunca confiando en un id o rol pasado desde el cliente como verdad:</p><div class=\"code\">'use server'\nasync function deletePost(postId: string) {\n  const session = await auth()\n  if (!session) throw new Error('Unauthorized')\n  const post = await db.post.findUnique({ where: { id: postId } })\n  if (post?.authorId !== session.userId) throw new Error('Forbidden')\n  await db.post.delete({ where: { id: postId } })\n}</div>",
  },

  // ---------------- TESTING ----------------
  {
    id: "c48",
    category: "testing",
    categoryLabel: "Testing",
    question: "¿Por qué los Server Components son difíciles de testear unitariamente y cuál es la alternativa práctica?",
    answerHtml:
      "<p>Los Server Components son <b>funciones asíncronas que retornan una descripción de UI</b>, no un árbol DOM renderizado — el renderizado estilo RTL tradicional asume renderizado síncrono, del lado del cliente, hacia jsdom, lo cual no modela streaming, límites de Suspense, o APIs solo-servidor correctamente. La mayoría de equipos terminan testeando Server Components indirectamente: extraen la lógica real (formateo de datos, reglas de negocio) en funciones simples y testeamos <i>esas</i>, luego dependen de <b>tests e2e</b> (Playwright) para verificar el comportamiento de la página renderizada de punta a punta.</p><div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"No lucho para testear unitariamente el markup de un Server Component — extraigo la lógica a una función testeable y dejo que Playwright verifique que la página realmente renderiza correctamente.\"</div>",
  },
  {
    id: "c49",
    category: "testing",
    categoryLabel: "Testing",
    level: "junior",
    question: "¿Cómo testea unitariamente un Client Component con Jest/Vitest + React Testing Library?",
    answerHtml:
      "<p>Lo mismo que cualquier aplicación React: renderiza con RTL, consulta por role/texto, dispara eventos, aserta sobre el DOM.</p><div class=\"code\">test('increments on click', async () =&gt; {\n  render(&lt;Counter /&gt;)\n  await userEvent.click(screen.getByRole('button', { name: /increment/i }))\n  expect(screen.getByText('1')).toBeInTheDocument()\n})</div><p>Si el componente llama a una Server Function, <b>mockea la importación</b> (<code>jest.mock('./actions')</code> / <code>vi.mock</code> de Vitest) para que el test no haga una real ida y vuelta al servidor.</p>",
  },
  {
    id: "c50",
    category: "testing",
    categoryLabel: "Testing",
    question: "¿Qué te compra un test e2e con Playwright que los tests unitarios estructuralmente no pueden, en una aplicación del App Router?",
    answerHtml:
      "<p>Playwright maneja un <b>navegador real contra un servidor Next real ejecutándose</b>, así que es la única capa que realmente ejercita el stack completo junto: Server Components renderizándose, límites de streaming/Suspense resolviéndose, una ida y vuelta de Server Function realmente golpeando tu backend, cookies/sesión fluyendo correctamente, y navegación del lado del cliente intercambiando payloads RSC. Los tests unitarios necesariamente mockean a través de esas costuras; e2e es lo que prueba que las costuras mismas funcionan.</p><div class=\"callout warn\"><span class=\"lbl\">Trampa</span> No intentes reemplazar tests unitarios con e2e completamente — e2e es más lento y mejor adecuado para un conjunto más pequeño de flujos críticos de usuario, no para cobertura exhaustiva de casos borde.</div>",
  },
  {
    id: "c51",
    category: "testing",
    categoryLabel: "Testing",
    question: "¿Cómo mockeas fetch() o una Server Function en tests sin golpear la red?",
    answerHtml:
      "<p>Dos enfoques comunes: <b>mockeo a nivel de módulo</b> — <code>jest.mock('@/app/actions', () =&gt; ({ createPost: jest.fn() }))</code> — reemplaza la Server Function completamente para un test de componente; o <b>mockeo a nivel de red</b> con MSW (Mock Service Worker), que intercepta llamadas <code>fetch</code> reales, útil cuando quieres testear más cerca de la forma real de solicitud/respuesta (códigos de estado, cuerpos de error) sin mockear los internos de tu propio código.</p>",
  },
  {
    id: "c59",
    category: "testing",
    categoryLabel: "Testing",
    question: "¿Cómo abordas testear una ruta que depende de cookies() o searchParams?",
    answerHtml:
      "<p>Para un test <b>unitario</b>, extrae la lógica que lee/deriva de esos valores a una función simple que los tome como argumentos, para que el test pueda llamarla con datos de prueba en lugar de levantar todo el contexto de solicitud. Para comportamiento que realmente depende del ciclo de vida de la solicitud — una redirección basada en una cookie de sesión faltante, una lista filtrada basada en un parámetro de consulta — eso pertenece a un test <b>Playwright</b>, que puede configurar cookies reales (<code>context.addCookies</code>) y navegar a una URL real con parámetros de consulta, ejercitando la API de runtime real en lugar de un mock de ella.</p>",
  },

  // ---------------- SECURITY ----------------
  {
    id: "c52",
    category: "security",
    categoryLabel: "Seguridad",
    question: "¿Cómo defienden las Server Actions contra CSRF por defecto?",
    answerHtml:
      "<p>Cada invocación de Server Function lleva una <b>verificación automática del encabezado Origin</b>: Next compara el <code>Origin</code> de la solicitud contra el <code>Host</code> (y cualquier origen permitido configurado) y <b>rechaza la llamada</b> si no coinciden. Dado que un formulario en sitio cruzado en el dominio de un atacante produciría un Origin desajustado, esto cierra el vector CSRF clásico <b>sin que escribas un token tú mismo</b>.</p><div class=\"callout warn\"><span class=\"lbl\">Trampa</span> Esta protección es específica para Server Functions. Los Route Handlers simples (<code>route.ts</code>) no reciben tal verificación automática — si construyes una API POST tradicional allí, vuelves a necesitar tu propia estrategia CSRF.</div>",
  },
  {
    id: "c53",
    category: "security",
    categoryLabel: "Seguridad",
    question: "¿Cuándo es realmente necesario dangerouslySetInnerHTML y cómo lo haces seguro?",
    answerHtml:
      "<p>React escapa contenido de texto por defecto, así que XSS vía interpolación JSX normal no es un riesgo — <code>dangerouslySetInnerHTML</code> es el escape deliberado para renderizar cadenas HTML reales (texto enriquecido de un CMS, salida markdown-a-HTML). Casos de uso necesarios: renderizar contenido rico sanitizado, no cadenas de texto que el usuario tipeó.</p><div class=\"callout warn\"><span class=\"lbl\">Trampa</span> Nunca pases entrada de usuario sin sanitizar. Pásala por un sanitizador (por ejemplo <code>DOMPurify</code>) <b>del lado del servidor</b> antes de que llegue al cliente, y trata cualquier fuente HTML de CMS/terceros como entrada no confiable también.</div>",
  },
  {
    id: "c54",
    category: "security",
    categoryLabel: "Seguridad",
    question: "¿Qué hace realmente el prefijo NEXT_PUBLIC_ y cuál es el riesgo de mal usarlo?",
    answerHtml:
      "<p>Solo las variables de entorno con prefijo <code>NEXT_PUBLIC_</code> se <b>inlinean en el bundle del cliente</b> en tiempo de compilación — todo lo demás permanece solo-servidor por defecto. Esto es una opt-in deliberada, explícita, específicamente para que un <code>API_KEY</code> accidental en <code>.env</code> no se envíe al navegador de cada visitante.</p><div class=\"callout warn\"><span class=\"lbl\">Trampa</span> Una vez que un valor tiene prefijo <code>NEXT_PUBLIC_</code>, trátalo como <b>público, legible por cualquiera</b> — está hornearlo en el bundle JS estático, no se obtiene de forma segura por usuario. Nunca pongas ese prefijo a un secreto real (credenciales de BD, API keys privadas), ni siquiera temporalmente \"solo para probar.\"</div>",
  },
  {
    id: "c55",
    category: "security",
    categoryLabel: "Seguridad",
    question: "¿Qué hace el paquete server-only y por qué \"solo no lo importes en un archivo cliente\" no es suficiente?",
    answerHtml:
      "<p><code>import 'server-only'</code> al inicio de un módulo lo convierte en un <b>error de compilación</b> importar ese módulo desde cualquier código alcanzable por el bundle del cliente — por ejemplo, un archivo con credenciales de BD o un constructor de consultas SQL crudo. La disciplina manual (\"solo recuerdo no importar esto desde un archivo cliente\") no escala: un compañero tres archivos haciendo una importación que parece inofensiva puede filtrar código solo-servidor al bundle del cliente sin advertencia de runtime, solo un aumento de tamaño de bundle posiblemente no notado.</p><div class=\"callout tip\"><span class=\"lbl\">Cómo decirlo</span> \"<code>server-only</code> convierte un error invisible en un fallo de compilación ruidoso — ese es todo el valor.\"</div>",
  },
  {
    id: "c56",
    category: "security",
    categoryLabel: "Seguridad",
    question: "serverRuntimeConfig / publicRuntimeConfig fueron eliminados — ¿qué los reemplaza y por qué?",
    answerHtml:
      "<p>Ambas opciones de configuración están <b>eliminadas</b> en Next.js moderno (App Router no las soporta en absoluto). El reemplazo son simples <b>variables de entorno</b> — variables solo-servidor leídas directamente vía <code>process.env.X</code> en código servidor, y variables con prefijo <code>NEXT_PUBLIC_</code> para lo que el cliente realmente necesita. Esto se alinea con configuración de 12 factores (basada en entorno, no un objeto de configuración personalizado específico de Next) y elimina un peligro donde los valores de <code>publicRuntimeConfig</code> eran legibles por <i>cualquier</i> página, sin control por valor sobre exposición servidor vs cliente.</p>",
  },
  {
    id: "c57",
    category: "security",
    categoryLabel: "Seguridad",
    question: "¿Qué encabezados de seguridad debería configurar una aplicación de producción de Next.js y dónde los configuras?",
    answerHtml:
      "<p>Línea base común: <b>Content-Security-Policy</b> (mitiga XSS restringiendo fuentes de script/estilo), <b>Strict-Transport-Security</b> (fuerza HTTPS), <b><code>X-Content-Type-Options: nosniff</code></b>, y <b><code>X-Frame-Options</code></b>/<code>frame-ancestors</code> (clickjacking). Configúralos declarativamente a través de la función <code>headers()</code> en <code>next.config.ts</code> (estático, aplica en la capa edge/CDN) o dinámicamente en <code>proxy.ts</code> si un encabezado necesita variar por solicitud (por ejemplo, un nonce CSP por solicitud).</p><div class=\"callout warn\"><span class=\"lbl\">Trampa</span> Un CSP con <code>script-src 'unsafe-inline'</code> derrota la mayoría de su propia protección XSS — usa nonces o hashes para scripts inline en su lugar si no puedes evitarlos completamente.</div>",
  },
];

/** Category filters contributed by this file (the aggregator adds "All"). */
export const FLASHCARD_FILTERS = [
  { value: "core", label: "Core (App Router)" },
  { value: "rendering", label: "Rendering y Caché" },
  { value: "data", label: "Datos y Server Actions" },
  { value: "routing", label: "Enrutamiento" },
  { value: "perf", label: "Rendimiento" },
  { value: "auth", label: "Autenticación" },
  { value: "testing", label: "Testing" },
  { value: "security", label: "Seguridad" },
];
