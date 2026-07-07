// Architecture guide — frontend/full-stack system design mapped onto Next.js 16 / React 19 — español
export type ArchSection = { id: string; num: string; title: string; html: string };
export type DeepDive = { id: string; pill: string; title: string; html: string };

export const ARCH_INTRO =
  "Un recorrido a nivel senior de diseño de sistemas frontend y full-stack, mapeado a Next.js 16.2 y React 19.2. Este es el material de \"cómo piensas sobre construir un frontend de producto a escala\" — estrategia de renderizado, caché, flujo de datos, y estructura organizacional, con los compromisos nombrados en voz alta.";

export const ARCH_SECTIONS: ArchSection[] = [
  {
    id: "arch-1",
    num: "01",
    title: "01 · Pensar en sistemas para una entrevista de frontend",
    html:
      "<p>El diseño de sistemas frontend se juzga de la misma manera que el diseño de backend: <b>toma de decisiones antes del código</b>, narrada. Un flujo estructurado te impide asociar libremente sobre nombres de componentes:</p>" +
      "<table><tr><th>Paso</th><th>Qué haces</th><th>Tiempo</th></tr>" +
      "<tr><td><b>Aclara</b></td><td>Quién es el usuario, qué dispositivos/redes, cuántas páginas, personalizada o no, requisito de SEO, tráfico esperado/proporción lectura-escritura. La mayoría de candidatos saltan directamente a árboles de componentes.</td><td>~15%</td></tr>" +
      "<tr><td><b>Arquitectura aproximada</b></td><td>Inventario de páginas → modo de renderizado por página → fuentes de datos → dónde vive el estado. Un mapa del sitio, no un diagrama de componentes.</td><td>~20%</td></tr>" +
      "<tr><td><b>Profundización</b></td><td>Amplía en una pieza — la historia de caché/invalidación, o la arquitectura de estado, o el plan de implementación.</td><td>~35%</td></tr>" +
      "<tr><td><b>Compromisos</b></td><td>Nombra alternativas y por qué no las elegiste. La señal senior.</td><td>~20%</td></tr>" +
      "<tr><td><b>Resume</b></td><td>Resume, señala riesgos (caché obsoleto, inflación de bundles, TTFB), acepta seguimientos.</td><td>~10%</td></tr></table>" +
      "<div class=\"callout\"><span class=\"lbl\">Señal senior</span> Di el compromiso en voz alta: \"Cachearé esta página con revalidación etiquetada — estoy intercambiando unos segundos de obsolescencia después de una escritura por un TTFB casi cero en cada lectura.\"</div>",
  },
  {
    id: "arch-2",
    num: "02",
    title: "02 · Estrategia de renderizado como la primera decisión de arquitectura",
    html:
      "<p>Antes de que cualquier componente se diseñe, decide <b>cómo cada página del inventario obtiene su HTML</b> — esta elección única impulsa la capacidad de caché del CDN, TTFB, costo de infraestructura, y personalización para todo lo que sigue.</p>" +
      "<table><tr><th>Tipo de página</th><th>Estrategia</th><th>Por qué</th></tr>" +
      "<tr><td>Marketing / aterrizaje</td><td>Estático (tiempo de compilación)</td><td>Igual para todos, cachear en el borde indefinidamente, TTFB casi cero</td></tr>" +
      "<tr><td>Producto / páginas de categoría</td><td>ISR o Cache Components (<code>\"use cache\"</code>)</td><td>Contenido mayormente estático que cambia por calendario o en una escritura — revalidación basada en etiquetas en lugar de una reconstrucción completa</td></tr>" +
      "<tr><td>Dashboards</td><td>Dinámico + con streaming de Suspense</td><td>Datos por usuario, pero un shell cacheado (navegación/layout) aún puede enviarse instantáneamente mientras los widgets se transmiten</td></tr>" +
      "<tr><td>Checkout</td><td>Completamente dinámico</td><td>La corrección (inventario, precio, impuesto) supera la latencia; nada aquí puede cachearse</td></tr></table>" +
      "<p>_equivocarse en cualquiera de las direcciones es el error clásico: sobre-cachear una página de checkout sirve precios obsoletos; hacer una página de marketing completamente dinámica quema TTFB y computación de origen para contenido que nunca cambia.</p>",
  },
  {
    id: "arch-3",
    num: "03",
    title: "03 · La pila de caché — CDN, framework, navegador",
    html:
      "<p>Una respuesta de Next.js pasa a través de <b>tres cachés independientes</b>, cada uno con su propio mecanismo de invalidación — y una respuesta senior los trata como un sistema coordinado, no tres preocupaciones separadas.</p>" +
      "<table><tr><th>Capa</th><th>Qué cachea</th><th>Invalidación</th></tr>" +
      "<tr><td>CDN / edge</td><td>Respuestas HTML completas para rutas estáticas/ISR</td><td>Limpiar en despliegue, o limpieza basada en etiquetas desde <code>revalidateTag</code></td></tr>" +
      "<tr><td>Servidor Next.js</td><td>Output renderizado + fetches, por <b>Cache Components</b> (<code>\"use cache\"</code>, <code>cacheLife</code>, <code>cacheTag</code>)</td><td><code>revalidateTag(tag, profile)</code>, <code>updateTag()</code>, perfiles <code>cacheLife</code> basados en tiempo</td></tr>" +
      "<tr><td>Navegador</td><td>Assets estáticos, y el Router Cache para navegaciones del cliente</td><td>Encabezados <code>Cache-Control</code>, nombres de archivo hash inmutables</td></tr></table>" +
      "<p>El modelo de <b>Cache Components</b> de Next 16 (opt-in vía <code>cacheComponents: true</code>) invierte el defecto: nada se cachea a menos que un segmento o función esté explícitamente envuelto en <code>\"use cache\"</code>, con un perfil <code>cacheLife</code> controlando obsolescencia y <code>cacheTag</code> dándole una clave de invalidación. Esto reemplaza el caché implícito de fetch/ruta-segmento anterior, donde un <code>fetch</code> desnudo podía cachearse silenciosamente y sorprenderte. Coordinar invalidación significa que un webhook o Server Action que llama <code>revalidateTag</code> debe considerar la limpieza del CDN que lo sigue — una entrada CDN obsoleta sobrevive a un caché del servidor fresco si la olvidas.</p>",
  },
  {
    id: "arch-4",
    num: "04",
    title: "04 · Capa de datos y el patrón BFF",
    html:
      "<p>Los Server Components y Route Handlers de Next.js naturalmente se sientan como un <b>backend-para-frontend</b>: agregan, reestructuran, y proveen llamadas a servicios de backend reales (REST, GraphQL, gRPC-vía-gateway) para que el cliente nunca hable con cinco orígenes directamente.</p>" +
      "<p>Coloca una <b>capa de anticorrupción</b> en el límite BFF — mapea DTOs de servicios externos a los tipos de tu propia aplicación en un solo lugar, para que un cambio de esquema upstream no se propague a través de cada componente que lee esos datos. Obten <b>en paralelo</b>, no en secuencia: inicia solicitudes independientes antes de esperar cualquiera de ellas (o usa <code>Promise.all</code>), porque un Server Component que espera fetch A luego fetch B serialmente reproduce la cascada de solicitudes clásica que el cliente solía tener, solo movida al servidor.</p>" +
      "<div class=\"callout\"><span class=\"lbl\">Consideraciones del cliente</b> Un cliente GraphQL usado desde Server Components no necesita normalización de caché del lado del cliente (no hay cliente) — mantenlo como una capa de solicitudes delgada y deja que Cache Components sea dueño del caché. Reserva un caché completo de GraphQL/TanStack Query del lado del cliente para datos que se obtienen desde Client Components después de la carga inicial.</div>",
  },
  {
    id: "arch-5",
    num: "05",
    title: "05 · Arquitectura de gestión de estado",
    html:
      "<p>La primera decisión de diseño no es <i>qué biblioteca</i> — es <b>a qué categoría pertenece una pieza de estado</b>, porque cada categoría tiene un hogar natural en Next.js:</p>" +
      "<table><tr><th>Tipo de estado</th><th>Vive en</th><th>Ejemplo</th></tr>" +
      "<tr><td>Estado del servidor</td><td>Obtenido en un Server Component, cacheado vía Cache Components</td><td>Catálogo de productos, perfil de usuario</td></tr>" +
      "<tr><td>Estado de URL</td><td><code>searchParams</code> / segmentos de ruta</td><td>Filtros, paginación, pestaña seleccionada — compartible, amigable con botón atrás</td></tr>" +
      "<tr><td>Estado UI del cliente</td><td><code>useState</code> local, o un almacén del cliente para estado transversal</td><td>Modal abierto/cerrado, borrador de formulario, UI optimista</td></tr></table>" +
      "<p>Recurrir a una biblioteca de estado del cliente (Zustand, Jotai, TanStack Query) solo cuando el estado es genuinamente <b>propiedad del cliente y transversal</b> — un carrito de compras abierto entre rutas, o caché del lado del cliente de datos obtenidos después de la hidratación. Los Server Components + Server Actions manejan mucho más de lo que los equipos esperan sin uno: envío de formulario, revalidación, y redirecciones pueden todos ocurrir del lado del servidor sin ningún almacén del cliente en absoluto. Cuando el estado necesita alcanzar hijos profundos, prefiere el <b>patrón de intercalación/children</b> (pasar output pre-renderizado de Server Component hacia abajo como <code>children</code>/props) sobre recurrir a Context — Context re-renderiza a cada consumidor en cada cambio y fuerza al subárbol del proveedor a ser un Client Component.</p>",
  },
  {
    id: "arch-6",
    num: "06",
    title: "06 · Monorepo y escalando la organización de frontend",
    html:
      "<p>Estructura por <b>funcionalidad</b>, no por tipo de archivo — una carpeta <code>features/checkout/</code> con sus propios componentes, hooks, y acciones colocados supera una división de nivel superior <code>components/</code>, <code>hooks/</code>, <code>actions/</code> que te fuerza a abrir cinco carpetas para cambiar un flujo.</p>" +
      "<p>Un <b>paquete de sistema de diseño</b> compartido (tokens, primitivas, un puñado de componentes compuestos) es la inversión de mayor apalancamiento para una organización multi-equipo — es lo que mantiene las UIs de diez equipos viéndose como un solo producto. Dibuja <b>límites de propiedad</b> a lo largo de funcionalidades/dominios, forzados por estructura de carpetas y code-owners, no por en qué archivo de framework suceda a vivir una pieza de código.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Ruta de escape, no un defecto</b> Micro-frontends (Module Federation, o múltiples aplicaciones Next.js unidas vía enrutamiento <b>multi-zone</b>) compran despliegues independientes y elecciones tecnológicas independientes a costa de framework runtime duplicado, complejidad de navegación entre aplicaciones, y un problema más difícil de consistencia de diseño. Gánalos con una necesidad concreta (un equipo que debe enviar en su propio ritmo) — no recurras a ellos porque el organigrama tiene múltiples equipos.</div>",
  },
  {
    id: "arch-7",
    num: "07",
    title: "07 · Edge, CDN y entrega global",
    html:
      "<p>Los assets estáticos (bundles JS/CSS, imágenes, fuentes) pertenecen a un <b>CDN</b> con nombres de archivo hash inmutables — cachear para siempre, invalidar cambiando la URL, no limpiando. Las imágenes se optimizan en edge (redimensionado/formato/calidad negociados por solicitud, típicamente vía <code>next/image</code>) para que un teléfono en una red lenta no descargue un asset del tamaño de escritorio.</p>" +
      "<p>Next 16 cambió la historia de edge: <code>proxy.ts</code> (runtime Node.js) reemplaza al obsoleto <code>middleware.ts</code> solo-edge. Eso es un compromiso real, no un renombrado — un runtime de Node.js tiene la superficie completa de API de Node (útil para cualquier cosa más allá de inspección de encabezados/cookies y redirecciones) pero pierde las características de arranque casi-cero, ejecutar-en-cada-PoP del viejo runtime edge. Diseña la lógica de proxy asumiendo que se ejecuta cerca de, pero no literalmente en, cada ubicación de edge.</p>" +
      "<p>Para <b>streaming SSR</b> a través de regiones, el shell puede servirse desde el borde del CDN mientras las partes dinámicas/transmitidas aún hacen ida y vuelta a una región de origen — así que el despliegue multi-región del origen (o elegir una región cerca de la mayoría de usuarios) importa más de lo que lo hacía para sitios puramente estáticos. La métrica que realmente te dice si esta arquitectura está funcionando es la <b>relación de golpe de caché</b> en el CDN: una relación baja en páginas que creías estáticas significa que tu decisión de estrategia de renderizado (Sección 02) o tus etiquetas de caché (Sección 03) están mal en algún lugar.</p>",
  },
  {
    id: "arch-8",
    num: "08",
    title: "08 · Observabilidad y enviando de forma segura",
    html:
      "<p>Envía cambios de frontend con el mismo rigor que los de backend. Los <b>Core Web Vitals</b> (LCP, INP, CLS) necesitan monitoreo de usuarios reales (RUM), no solo puntuaciones de laboratorio/Lighthouse — una ejecución sintética en una laptop rápida oculta lo que un teléfono de gama media en 4G realmente experimenta. Combina RUM con <b>rastreo de errores</b> en ambos lados: del lado del cliente (excepciones no manejadas, hidratación fallida) y del lado del servidor (errores de Server Component/Route Handler/Server Action), porque un error de caché puede silenciosamente servir HTML roto que ningún error del lado del cliente nunca dispara.</p>" +
      "<p>Los <b>feature flags</b> son la válvula de seguridad para un cambio de arquitectura riesgoso — implementar gradualmente una <b>migración a Cache Components</b> ruta por ruta detrás de un flag te permite comparar la relación de golpe de caché y la tasa de errores para la cohorte con el flag antes de activarlo globalmente (ver Profundización 4).</p>" +
      "<table><tr><th>Modelo de despliegue</th><th>Adecuado para</th><th>Costo</th></tr>" +
      "<tr><td><code>output: \"export\"</code> (completamente estático)</td><td>Sin Server Components/Actions, sin ISR/Cache Components — hosting puramente estático (S3/CDN)</td><td>Más barato, más limitado</td></tr>" +
      "<tr><td>Plataforma de servidor Node/Edge</td><td>Conjunto completo de características: streaming, Server Actions, Cache Components, <code>proxy.ts</code></td><td>Mayor superficie de ops, pero la única opción una vez que necesitas cualquiera de lo anterior</td></tr></table>" +
      "<p>Note que Next 16 eliminó la métrica de compilación <b>\"First Load JS\"</b> del output del CLI — las regresiones de tamaño de bundle ahora deben detectarse vía Lighthouse CI o un dashboard RUM/analytics en lugar de un número de log de compilación, lo cual es una razón más por la que RUM no es opcional.</p>",
  },
];

export const DEEPDIVES_INTRO =
  "Cinco prompts clásicos de diseño de sistemas frontend/full-stack, cada uno como Concepto → Ejemplo → Trampa → Respuesta senior. Estos son los que los entrevistadores usan cuando contratan para un rol de Next.js — ensaya los compromisos en voz alta.";

export const DEEP_DIVES: DeepDive[] = [
  {
    id: "dd-ecommerce-rendering",
    pill: "Diseño de sistemas",
    title: "Diseña la estrategia de renderizado para un sitio grande de e-commerce",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concepto</span> No todas las páginas en el mismo sitio reciben el mismo modo de renderizado. Las páginas de producto/categoría son pesadas en lectura y mayormente estáticas; las páginas de búsqueda/personalización son por usuario; el checkout es crítico en corrección. Elige por tipo de página, no por sitio.</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Ejemplo</span> Páginas de producto: ISR o Cache Components con <code>cacheTag(`product:${id}`)</code>, revalidado en escrituras de precio/inventario. Resultados de búsqueda/personalización: dinámicos, con streaming de Suspense para que el shell (navegación, esqueleto de filtros) se pinte inmediatamente mientras los resultados se transmiten. Checkout: completamente dinámico, sin <code>\"use cache\"</code> en ningún lugar del árbol.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Trampa</span> Un caché demasiado entusiasta muestra inventario o precio obsoleto — un cliente agrega un artículo agotado al carrito, o hace checkout al precio de ayer. Este es el error de arquitectura de e-commerce más común, y viene de etiquetar demasiado grueso (una etiqueta para todo el catálogo) o establecer <code>cacheLife</code> demasiado largo en fragmentos sensibles a inventario.</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Respuesta senior</span> Etiqueta revalidación <b>por producto</b>, no por catálogo, para que un solo cambio de precio solo rompa una entrada. Cuando un administrador edita un precio, llama <code>updateTag</code> en esa misma Server Action para que la próxima lectura del administrador sea fresca (read-your-writes) sin esperar revalidación en segundo plano. Dale a fragmentos sensibles a inventario (conteo de stock, \"3 restantes\") un perfil <code>cacheLife</code> corto independiente del resto de la página de producto, que puede permanecer cacheado mucho más tiempo. Compromiso nombrado en voz alta: granularidad de etiqueta más fina cuesta más tubería de invalidación de caché a cambio de menos lecturas obsoletas.</div>" +
      "</div>",
  },
  {
    id: "dd-realtime-dashboard",
    pill: "Diseño de sistemas",
    title: "Diseña un dashboard con sensación de tiempo real usando Next.js",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concepto</span> Un dashboard en realidad son dos páginas diferentes compartiendo un layout: un shell mayormente estático (navegación, filtros, chrome de layout) y un conjunto de widgets volátiles (contadores en vivo, gráficos) que necesitan sentirse actuales. Trátalos de manera diferente en lugar de hacer toda la ruta dinámica.</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Ejemplo</span> Cachea el shell con Cache Components. Envuelve cada widget en vivo en su propio límite <code>&lt;Suspense&gt;</code> para que se transmita independientemente; encuesta en un intervalo para widgets donde el casi-tiempo-real está bien, o una conexión WebSocket/SSE para datos genuinamente en vivo (precio de trading, conteo de espectadores en vivo). Para una actualización ocasional después de una acción del usuario (botón \"Actualizar\", o después de enviar un filtro), llama a la API <code>refresh()</code> de Server Actions para re-ejecutar trabajo del servidor sin caché sin una recarga completa de página.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Trampa</span> Dos modos de fallo en direcciones opuestas: sobre-obtención (re-ejecutar la consulta de cada widget en cada tick de renderizado/encuesta, incluso las que el usuario no está mirando) quema carga del servidor; y hacer <b>toda la página</b> dinámica para obtener datos en vivo en cualquier lugar mata el TTFB para el 90% del dashboard que realmente es estático (navegación, layout, gráficos históricos).</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Respuesta senior</span> Cachea el shell, transmite o encuesta <b>solo</b> los widgets volátiles, y limita el propio caché/obsolescencia de cada widget independientemente — un contador en vivo y un gráfico de tendencia de 24 horas en la misma pantalla no necesitan la misma frescura. Usa <code>refresh()</code> para actualizaciones desencadenadas por el usuario en lugar de <code>location.reload()</code>, que descarta el shell cacheado que acabas de pagar por mantener rápido. Compromiso: streaming por widget es más límites de Suspense para gestionar que una página dinámica, a cambio de un shell que carga instantáneamente sin importar qué tan lentos sean los datos en vivo.</div>" +
      "</div>",
  },
  {
    id: "dd-cms-blog",
    pill: "Diseño de sistemas",
    title: "Diseña la estrategia de caché/invalidación para un blog respaldado por CMS multi-autor",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concepto</span> Las páginas de contenido son caché-aside: renderiza una vez, cachea con una etiqueta que identifica ese contenido, y deja que un webhook del CMS impulse la invalidación en lugar de encuestar o un TTL fijo que es demasiado corto (caché desperdiciado) o demasiado largo (obsoleto después de publicar).</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Ejemplo</span> Cada página de publicación usa <code>cacheTag(`post:${slug}`)</code> y <code>cacheTag(`author:${authorId}`)</code>. El CMS dispara un webhook en publicar/editar → un Route Handler lo valida y llama <code>revalidateTag('post:my-slug', 'max')</code>, limpiando solo esa entrada (y el CDN frente a ella) en lugar de reconstruir todo el sitio.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Trampa</span> Dos autores publicando casi simultáneamente pueden competir: el webhook del autor A revalida, luego el webhook más lento del autor B llega y momentáneamente sirve un caché medio-actualizado durante la ventana de superposición. Separadamente, etiquetar demasiado fino (una etiqueta por párrafo o por relación de publicación-relacionada) causa <b>explosión de cardinalidad de etiquetas</b> — miles de etiquetas para rastrear para precisión de invalidación marginal.</div>" +
      "<div class=\"dd-block ddSolution\"><span class=\"lbl\">Respuesta senior</span> Elige la granularidad de etiqueta deliberadamente: por-publicación es casi siempre la unidad correcta; etiquetas por-categoría son útiles para páginas de lista pero deberían permanecer gruesas. Usa el perfil <code>cacheLife</code> <code>'max'</code> con stale-while-revalidate en segundo plano para el grueso del tráfico de lectura — la mayoría de lectores pueden tolerar unos segundos de obsolescencia después de una publicación. Reserva <code>updateTag</code> para la <b>sesión del autor que publica</b>, para que vean su edición inmediatamente (read-your-writes) sin forzar esa misma frescura agresiva en cada otro lector. Compromiso: etiquetas más gruesas significan invalidar ocasionalmente de más (limpiar más de lo estrictamente cambiado) a cambio de un grafo de invalidación que un humano puede realmente razonar.</div>" +
      "</div>",
  },
  {
    id: "dd-cache-components-migration",
    pill: "Diseño de sistemas",
    title: "Diseña una implementación segura de una migración a Cache Components en una aplicación existente",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concepto</span> Activar <code>cacheComponents: true</code> invierte el defecto de caché para toda la aplicación a la vez: fetches y segmentos de ruta que estaban implícitamente cacheados bajo el viejo modelo se vuelven <b>sin caché por defecto</b> a menos que estén explícitamente envueltos en <code>\"use cache\"</code>. Eso no es un ajuste de configuración — es una migración de comportamiento que necesita una ruta de implementación incremental, no un solo cambio de flag en producción.</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Ejemplo</span> Adopta ruta por ruta: ejecuta el flag detrás de un feature flag que solo afecte un subconjunto de rutas (por ejemplo, vía múltiples layouts raíz, uno opt-in y uno no, seleccionado por grupo de ruta), o migra un segmento de ruta a la vez en PRs separados, auditando cada uso de API de runtime (<code>cookies()</code>, <code>headers()</code>, <code>searchParams</code>) en ese segmento para un límite de Suspense necesario antes de activarlo.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Trampa</span> Activar el flag globalmente sin una implementación por ruta cambia silenciosamente el comportamiento de caché para <b>toda la aplicación</b> a la vez — páginas que eran rápidas debido al caché implícito pueden de repente golpear el origen en cada solicitud (peor: algunas pueden volverse completamente dinámicas sin un límite de Suspense en su lugar, rompiendo la compilación o la página).</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Respuesta senior</span> Implementa canary una sola ruta de bajo riesgo primero (algo pesado en lectura pero no crítico para ingresos), y usa el output de compilación más herramientas como <code>next-devtools-mcp</code> para verificar qué realmente se shell-estático vs. transmitió vs. completamente dinámico antes de confiar en tu modelo mental del cambio. Implementa gradualmente grupo de ruta por grupo de ruta, observando la relación de golpe de caché y TTFB por ruta a medida que progresa la migración, con el comportamiento pre-migración como reversión instantánea (revertir el flag para ese grupo de ruta). Compromiso: una implementación por ruta toma más tiempo que un solo cambio de flag, a cambio de nunca enterarse de una regresión por un incidente en producción.</div>" +
      "</div>",
  },
  {
    id: "dd-multi-team-architecture",
    pill: "Diseño de frontend",
    title: "Diseña la arquitectura de componentes/estado para una aplicación grande de Next.js multi-equipo",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concepto</span> A escala multi-equipo, la pregunta de arquitectura deja de ser \"cómo estructuro una funcionalidad\" y se convierte en \"cómo trabajan los equipos en esta aplicación sin pisarse mutuamente\" — la estructura de carpetas, UI compartida, y dónde vive la lógica del lado del servidor todos deben codificar límites de equipo.</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Ejemplo</span> Carpetas de funcionalidad (<code>features/checkout/</code>, <code>features/search/</code>) cada una dueña de sus componentes, Server Actions, y pruebas. Los Server Actions viven <b>colocados</b> con la funcionalidad que los usa por defecto; solo las acciones genuinamente transversales (auth, analytics) van en un módulo <code>actions/</code> compartido. Un paquete de UI compartida contiene solo primitivas genuinamente reutilizables (Button, Input, tokens de layout) — los compuestos específicos de funcionalidad permanecen en la carpeta de funcionalidad aunque parezcan reutilizables al principio.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Trampa</span> Un Client Component compartido que envuelve demasiado del árbol (un wrapper cliente <code>&lt;Providers&gt;</code> de nivel superior que contiene todo desde tema hasta analytics hasta una biblioteca de estado) arrastra el bundle de cada página consigo y fuerza a subárboles renderizados por servidor debajo de él a hidratar como código cliente incluso cuando no lo necesitaban. Esta es la versión multi-equipo de un Context Dios — todos lo importan, nadie puede cambiar de forma segura lo que hay dentro.</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Respuesta senior</span> Empuja <code>\"use client\"</code> a las <b>hojas</b> — el componente más pequeño que realmente necesita interactividad, no la parte superior del árbol — para que los Server Components permanezcan el defecto y el crecimiento del bundle del cliente sea atribuible a una funcionalidad específica, no a una raíz compartida. Desde que Next 16 eliminó la métrica \"First Load JS\" de la compilación, mide el impacto del bundle con conciencia a nivel de ruta vía Lighthouse CI o Vercel Analytics en su lugar, y bloquea PRs por una regresión ahí en lugar de mirar un log de compilación. Dale a cada equipo propiedad a nivel de carpeta (forzada vía code-owners) para que el límite sea estructural, no solo una convención que la gente olvida. Compromiso: colocar Server Actions por funcionalidad significa algo de duplicación entre funcionalidades versus un módulo compartido, a cambio de que los equipos puedan cambiar sus propias acciones sin una revisión entre equipos.</div>" +
      "</div>",
  },
];
