// Spoken pitches — intros, "why Next.js", a technical deep-dive, STAR stories — español
// Generic senior-candidate framing: fill the [bracketed] placeholders with your own detail.
export type Pitch = {
  id: string;
  num: string;
  title: string;
  metaHtml: string;
  scriptHtml: string;
  tipsHtml: string;
};

export const PITCHES_INTRO_HTML =
  "<span class=\"lbl\">Cómo practicar</span> No memorices palabra por palabra — suena robótico. Aprende la <b>forma</b> de cada respuesta (los tiempos), luego dilo en tus propias palabras y reemplaza los [corchetes] con tu detalle real. Graba, mira una vez, arregla una cosa, graba de nuevo. Tomas vencen a treinta re-lecturas.";

export const PITCHES: Pitch[] = [
  {
    id: "p1",
    num: "Pitch 01",
    title: "La intro de 30 segundos",
    metaHtml:
      "<span class=\"pill\">\"Cuéntame sobre ti\" — corta</span><span class=\"pill accent\">~30 seg</span>",
    scriptHtml:
      "<p>Hola, soy [nombre] — un ingeniero frontend / full-stack con [X] años construyendo con React, y los últimos [Y] enfocado en Next.js y el App Router. Construyo aplicaciones web que se sienten rápidas y resisten tráfico real.</p>" +
      "<p>Más recientemente [entregué / fui dueño de] [un producto o superficie] — [una cosa concreta: por ejemplo, un flujo de checkout, un sitio de marketing, un dashboard] — usado por [escala: por ejemplo, decenas de miles de visitantes al día], con enfoque en estrategia de renderizado, rendimiento, y límites limpios de componentes.</p>" +
      "<p>Me atrae este rol porque es senior, enfocado en frontend, y Next.js en su núcleo.</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega y pronunciación</span> Mantenlo como un apretón de manos, no una biografía. Llega a tres sustantivos concretos (el producto, la escala, el stack). Pronuncia <i>Next.js</i> como \"next-punto-J-S\" (o solo \"Next\"), <i>Vercel</i> como \"ver-SELL\", <i>Turbopack</i> como \"TUR-bo-pack\", <i>hydration</i> normalmente, no \"hi-DRAY-shun\" apresurado. Sonríe en la última línea — señala interés genuino.",
  },
  {
    id: "p2",
    num: "Pitch 02",
    title: "La intro de 60 segundos",
    metaHtml:
      "<span class=\"pill\">\"Cuéntame sobre ti\" — completa</span><span class=\"pill accent\">~60 seg</span>",
    scriptHtml:
      "<p>Soy [nombre], un ingeniero frontend / full-stack con [X] años en JavaScript y TypeScript, los últimos [Y] construyendo productos en Next.js y React.</p>" +
      "<p>Lo que hago bien: diseño <b>arquitectura de componentes que escala</b> — límites claros entre Server y Client Components, patrones sensatos de obtención de datos, y layouts que no fuerzan una recarga completa de página para un cambio pequeño. Toma decisiones deliberadas de renderizado y caché en lugar de caer en \"solo hacerlo un Client Component\", y me importa lo que el usuario realmente siente: tiempo de carga, interactividad, estabilidad de diseño.</p>" +
      "<p>Un resalte reciente: [un proyecto específico — qué hizo, tu rol, y un resultado medible, por ejemplo, reduje LCP en 1.2s, reduje el bundle del cliente en 40%, o moví una página de renderizado por cliente a transmitida y los usuarios se dieron cuenta].</p>" +
      "<p>Busco un rol senior de frontend donde pueda ser dueño de decisiones de renderizado y rendimiento y elevar el estándar del equipo — que es exactamente lo que esto parece.</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> Tres tiempos: quién eres → en qué eres bueno → un punto de prueba. Haz una pausa después del punto de prueba. No listes cada tecnología — nombra las que están en <i>su</i> descripción de trabajo.",
  },
  {
    id: "p3",
    num: "Pitch 03",
    title: "La historia de carrera de 2 minutos",
    metaHtml:
      "<span class=\"pill\">\"Recorre tu trayectoria\"</span><span class=\"pill accent\">~2 min</span>",
    scriptHtml:
      "<p>Empieza en el arco, no en el CV. [Empecé construyendo sitios estáticos / SPAs simples de React, y me moví hacia frameworks porque me cansé de resolver enrutamiento y obtención de datos desde cero en cada proyecto.]</p>" +
      "<p>Luego 2–3 capítulos, cada uno con una oración de contexto + una cosa de la que estés orgulloso: <i>\"En [empresa] [construí X], que me enseñó [Y].\"</i> Muestra una progresión — más propiedad, superficies más grandes, más opinión sobre cómo se renderiza.</p>" +
      "<p>Llega al presente: <i>\"Ahora soy más fuerte en [estrategia de renderizado/caché / rendimiento / arquitectura de componentes], y quiero un rol donde [sea dueño de la plataforma de frontend / mentoree / escale un sistema de diseño].\"</i> Conectalo con este trabajo.</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> Esto es una <b>historia con un hilo conductor</b>, no un volcado cronológico. Elige el hilo (por ejemplo, \"propiedad creciente de sistemas de frontend\") y haz que cada capítulo lo avance. Practica la última oración hasta que sea concisa — es lo que recuerdan.",
  },
  {
    id: "p4",
    num: "Pitch 04",
    title: "Por qué Next.js (y este stack)",
    metaHtml:
      "<span class=\"pill\">\"Por qué te gusta Next.js?\"</span><span class=\"pill accent\">~45 seg</span>",
    scriptHtml:
      "<p>React simple (o CRA) te da componentes pero deja el enrutamiento, obtención de datos, y estrategia de renderizado completamente en tus manos — cada equipo los reinventa un poco diferente. Next.js me da <b>enrutamiento por sistema de archivos y un modelo de renderizado real</b> listo para usar, para que esas decisiones sean consistentes en lugar de ad-hoc.</p>" +
      "<p>Concretamente: los Server Components significan que gran parte de mi UI nunca se envía como JavaScript en absoluto — el bundle solo lleva lo que realmente es interactivo. La historia de caché y revalidación incorporada me permite elegir estático, dinámico, o en algún lugar intermedio por ruta, deliberadamente. Y es un framework que lleva un proyecto desde un prototipo de fin de semana hasta una aplicación de producción sin una reescritura.</p>" +
      "<p>Escala desde una página de marketing hasta una aplicación completa sin cambiar el modelo mental — eso es raro y valioso.</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> El contraste (React simple → Next.js) es persuasivo. No Critiques a React — encuadra Next como \"React con una historia de renderizado y enrutamiento\". Si usan Remix u otro meta-framework, menciona que lo evaluarías en los mismos ejes: control de renderizado, caché, y experiencia de desarrollador.",
  },
  {
    id: "p5",
    num: "Pitch 05",
    title: "Por qué esta empresa / rol",
    metaHtml:
      "<span class=\"pill\">\"Por qué nosotros?\"</span><span class=\"pill accent\">~45 seg</span>",
    scriptHtml:
      "<p>Tres razones honestas, personalizadas: <b>(1) el problema</b> — [qué están construyendo y por qué te interesa]; <b>(2) el ajuste técnico</b> — [su stack/escala coincide con lo que hago: Next.js, [su enfoque de renderizado], [su escala]]; <b>(3) el rol</b> — [propiedad senior / el equipo / remoto / la superficie del producto].</p>" +
      "<p>Cierra con una línea con visión de futuro: <i>\"Quisiera pasar mis primeras semanas entendiendo [su flujo de usuario principal] y encontrando dónde el trabajo de renderizado o rendimiento tiene más apalancamiento.\"</i></p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> La especificidad lo es todo — nombra su producto, un lanzamiento reciente, o algo de la descripción del trabajo. \"Son una gran empresa\" genérico se lee como sin tarea. Ten una observación concreta e informada lista — idealmente algo que notaste cargando realmente su sitio y revisando la pestaña de red.",
  },
  {
    id: "p6",
    num: "Pitch 06",
    title: "Profundización técnica: RSC + el modelo mental del App Router",
    metaHtml:
      "<span class=\"pill\">\"Explica cómo funciona el App Router\"</span><span class=\"pill accent\">~90 seg</span>",
    scriptHtml:
      "<p>Dos cosas definen el App Router: la <b>división Server/Client Component</b> y el <b>payload RSC</b>.</p>" +
      "<p>Por defecto cada componente es un Server Component — se renderiza en el servidor (o en tiempo de compilación) y nunca envía su JavaScript al navegador. Agrega \"use client\" y un componente opta por el bundle del cliente, que es lo que le permite usar estado, efectos, y APIs del navegador. La regla general: empuja la interactividad a las hojas y manten todo lo demás en el servidor.</p>" +
      "<p>El payload RSC es la descripción serializada del árbol renderizado por servidor — no es HTML, un formato compacto que el cliente usa para reconciliar. Así es como un Server Component puede renderizar profundo en el árbol de un Client Component vía children sin convertirse en código cliente él mismo. Saber exactamente qué partes de una página envían JS, y por qué, es lo que separa \"funciona\" de \"diseñé esto deliberadamente\".</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> Esta es la respuesta que demuestra senioridad. Di la regla del límite Server/Client sin dudar — ensáyala. Si quieren profundidad, ramifica en cómo los Server Components pueden pasarse como children a Client Components sin una violación del límite cliente/servidor. Dibuja el árbol con tus manos mientras hablas; te ayuda a ti y a ellos.",
  },
  {
    id: "p7",
    num: "Pitch 07",
    title: "STAR: un problema de rendimiento que arreglaste",
    metaHtml:
      "<span class=\"pill\">\"Cuéntame de un bug difícil\"</span><span class=\"pill accent\">~90 seg</span>",
    scriptHtml:
      "<p><b>Situación:</b> [una página / flujo] era [lenta en cargar / con jank en interacción] — [LCP estaba en X segundos / el bundle era Y KB / los usuarios rebotaban antes de que terminara de cargar].</p>" +
      "<p><b>Tarea:</b> Fui dueño de encontrar y arreglar la causa raíz sin una reescritura.</p>" +
      "<p><b>Acción:</b> Perfilé en lugar de adivinar — [ejecuté Lighthouse / abrí el panel de rendimiento de Chrome DevTools / revisé Vercel Analytics] y encontré [la causa: un componente cliente que no necesitaba serlo / una imagen no optimizada / una cascada de fetches secuenciales / una dependencia enorme no usada]. [Lo convertí en Server Component / usé next/image / paralelicé los fetches / eliminé la dependencia], y agregué [una verificación de tamaño de bundle / un presupuesto de Lighthouse en CI] para que no pueda regresar silenciosamente.</p>" +
      "<p><b>Resultado:</b> [LCP bajó de X a Y / el bundle se redujo en Z%], y la verificación de regresión significa que la ganancia persiste.</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> La línea de firma es <i>\"Perfilar en lugar de adivinar.\"</i> Empieza con la métrica y termina con la métrica. Mantén Acción como la parte más larga. Si no tienes una historia dramática, una real pequeña contada con precisión vence a una grande inventada.",
  },
  {
    id: "p8",
    num: "Pitch 08",
    title: "STAR: un compromiso técnico difícil",
    metaHtml:
      "<span class=\"pill\">\"Una decisión que defenderías\"</span><span class=\"pill accent\">~90 seg</span>",
    scriptHtml:
      "<p><b>Situación:</b> tuvimos que [elegir entre X y Y — por ejemplo, SSR vs. generación estática, una biblioteca de estado del cliente vs. apoyarse en Server Components, una aplicación Next.js vs. dividir en micro-frontends].</p>" +
      "<p><b>Tarea:</b> Tuve que tomar la decisión y alinear al equipo.</p>" +
      "<p><b>Acción:</b> Lo encuadre por las restricciones que realmente importaban — [frescura del contenido, tamaño del equipo, cadencia de despliegue, requisitos de SEO] — y nombré el compromiso explícitamente: <i>\"[opción A] nos compra [beneficio] a costa de [desventaja].\"</i> [Prototipé ambos / hice benchmark del costo de renderizado / escribí un documento corto] y recomendé [la elección], con un fallback si [la suposición] resultaba ser incorrecta.</p>" +
      "<p><b>Resultado:</b> [resultado], y porque había escrito el compromiso por escrito, no lo re-litigamos cada sprint.</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> Los seniors se contratan por juicio bajo incertidumbre. Muestra que elegiste <i>deliberadamente</i> y nombraste el costo — no que elegiste la opción de moda. \"Haría la misma llamada de nuevo, y aquí es lo que vigilaría\" es un cierre fuerte.",
  },
  {
    id: "p9",
    num: "Pitch 09",
    title: "Explícalo simple: Server Components vs. Client Components",
    metaHtml:
      "<span class=\"pill\">\"Explica X a un junior\"</span><span class=\"pill accent\">~60 seg</span>",
    scriptHtml:
      "<p>Piensa en un restaurante. Un <b>Server Component</b> es comida que la cocina prepara antes de que las puertas siquiera se abran — está listo, no necesita al cliente ahí, y nada de ensamblarlo tiene que ocurrir en la mesa. Un <b>Client Component</b> es un plato hecho a pedido en una estación en vivo — tiene que ocurrir frente al cliente porque reacciona a lo que eligen en ese momento.</p>" +
      "<p>La mayor parte del menú puede prepararse de antemano. Solo las partes que realmente dependen de las elecciones en vivo del cliente — hacer clic, escribir, alternar — necesitan esa estación en vivo. Por eso predeterminamos Server Components y solo recurrimos a \"use client\" cuando algo realmente necesita ejecutarse en el navegador.</p>" +
      "<p>La recompensa: cuanto más prepares de antemano, menos espera el cliente en la mesa — que, traducido de vuelta, significa menos JavaScript que el navegador tiene que descargar y ejecutar.</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> La habilidad de enseñar simple <i>es</i> la señal senior (la prueba de Feynman). Una analogía, llevada de principio a fin, vence a cinco términos técnicos. Observa al entrevistador asintiendo antes de agregar detalle.",
  },
  {
    id: "p10",
    num: "Pitch 10",
    title: "Preguntas para hacerles",
    metaHtml:
      "<span class=\"pill\">\"Alguna pregunta para nosotros?\"</span><span class=\"pill accent\">~siempre</span>",
    scriptHtml:
      "<p>Siempre ten 3–4 listas. Las buenas señalan senioridad:</p>" +
      "<p>\"Cuál es la estrategia de renderizado en su producto principal hoy — mayormente estático, dinámico, transmitido — y cuál es el mayor punto de dolor con ella?\"</p>" +
      "<p>Cómo rastrean Core Web Vitals y presupuestos de rendimiento, y qué sucede cuando un PR regresa uno?\"</p>" +
      "<p>\"Cómo luce el testing y CI para el frontend — unitario, e2e, regresión visual?\"</p>" +
      "<p>\"Dónde está el frontend pagando deuda técnica ahora, y dónde tendría más apalancamiento temprano?\"</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> Preguntar sobre estrategia de renderizado, presupuestos de rendimiento, y testing muestra que piensas como dueño. Evita preguntar solo sobre beneficios. Escucha la respuesta y sigue arriba — debería sentirse como una conversación, no una lista de verificación.",
  },
];
