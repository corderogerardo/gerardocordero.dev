// Pitches hablados — intros, "por qué NestJS", inmersión técnica, historias STAR.
// Enmarcado genérico para candidato senior: rellena los marcadores [corchetes] con tu propio detalle.
export type Pitch = {
  id: string;
  num: string;
  title: string;
  metaHtml: string;
  scriptHtml: string;
  tipsHtml: string;
};

export const PITCHES_INTRO_HTML =
  "<span class=\"lbl\">Cómo practicar</span> No memorices palabra por palabra — suena robótico. Aprende la <b>estructura</b> de cada respuesta (los tiempos), luego dilo con tus propias palabras y reemplaza los [corchetes] con tu detalle real. Graba, mira una vez, corrige una cosa, graba de nuevo. Tres tomas vencen treinta relecturas.";

export const PITCHES: Pitch[] = [
  {
    id: "p1",
    num: "Pitch 01",
    title: "La intro de 30 segundos",
    metaHtml:
      "<span class=\"pill\">&quot;Cuéntame de ti&quot; — corta</span><span class=\"pill accent\">~30 seg</span>",
    scriptHtml:
      "<p>Hola, soy [nombre] — un ingeniero backend con [X] años en Node.js y los últimos [Y] enfocados en NestJS y TypeScript. Construyo y escalo APIs y servicios.</p>" +
      "<p>Más recientemente [entregué / fui dueño de] [un servicio o dominio] — [una cosa concreta: por ejemplo, un servicio de auth, un pipeline de pagos, una API GraphQL] — manejando [escala: por ejemplo, unos pocos miles de RPS], con enfoque en límites de módulos limpios, testing y observabilidad.</p>" +
      "<p>Me atrae este rol porque es senior, enfocado en backend y tiene NestJS como núcleo.</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega y pronunciación</span> Manténlo como un apretón de manos, no una biografía. Aterriza en tres sustantivos concretos (el dominio, la escala, el stack). Pronuncia <i>Nest</i> como &quot;nest&quot;, <i>NestJS</i> como &quot;nest-J-S&quot;, <i>Fastify</i> como &quot;FAST-ify&quot;, <i>Prisma</i> como &quot;PRIZ-ma&quot;. Sonríe en la última línea — señala interés genuino.",
  },
  {
    id: "p2",
    num: "Pitch 02",
    title: "La intro de 60 segundos",
    metaHtml:
      "<span class=\"pill\">&quot;Cuéntame de ti&quot; — completa</span><span class=\"pill accent\">~60 seg</span>",
    scriptHtml:
      "<p>Soy [nombre], un ingeniero backend / full-stack con [X] años en JavaScript y TypeScript, los últimos [Y] construyendo servicios en NestJS sobre Node.</p>" +
      "<p>Lo que hago bien: diseño servicios <b>modulares, probables</b> — límites de módulos claros, inyección de dependencias, DTOs validados — y me importa lo que sucede después del despliegue: logging estructurado, tracing, apagado graceful y no bloquear el event loop. Soy cómodo en la capa de datos (Postgres con TypeORM/Prisma, Redis), auth (JWT + RBAC) y trabajo asíncrono (colas, eventos).</p>" +
      "<p>Un hito reciente: [un proyecto específico — qué hacía, tu rol y un resultado medible, por ejemplo, reduje la latencia p99 en 40% o entregué un microservicio que maneja N eventos/día].</p>" +
      "<p>Busco un rol senior de backend donde pueda ser dueño de la arquitectura y elevar el estándar del equipo — que es exactamente lo que esto parece.</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> Tres tiempos: quién eres → en qué eres bueno → un punto de prueba. Haz una pausa después del punto de prueba. No enumeres cada tecnología — nombra las de <i>su</i> descripción de puesto.",
  },
  {
    id: "p3",
    num: "Pitch 03",
    title: "La historia de carrera de 2 minutos",
    metaHtml:
      "<span class=\"pill\">&quot;Recorre tu trayectoria&quot;</span><span class=\"pill accent\">~2 min</span>",
    scriptHtml:
      "<p>Empieza en el arco, no en el CV. [Empecé en [frontend/full-stack], me moví a backend porque me gustaba ser dueño de los datos y los contratos.]</p>" +
      "<p>Luego 2–3 capítulos, cada uno con una oración de contexto + una cosa de la que estás orgulloso: <i>&quot;En [empresa] [construí X], lo que me enseñó [Y].&quot;</i> Muestra una progresión — más propiedad, sistemas más grandes, más impacto.</p>" +
      "<p>Aterriza en el presente: <i>&quot;Ahora soy más fuerte en [diseño de servicios con DI / rendimiento / sistemas distribuidos], y quiero un rol donde [sea dueño de la arquitectura / mentoree / escale una plataforma].&quot;</i> Conecta con este empleo.</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> Esto es una <b>historia con un hilo conductor</b>, no un listado cronológico. Elige el hilo (por ejemplo, &quot;mayor propiedad de sistemas backend&quot;) y haz que cada capítulo lo avance. Practica la última oración hasta que sea precisa — es lo que recuerdan.",
  },
  {
    id: "p4",
    num: "Pitch 04",
    title: "Por qué NestJS (y este stack)",
    metaHtml:
      "<span class=\"pill\">&quot;¿Por qué te gusta NestJS?&quot;</span><span class=\"pill accent\">~45 seg</span>",
    scriptHtml:
      "<p>Express es genial pero no tiene opiniones — las aplicaciones grandes se desordenan. NestJS me da <b>estructura e inyección de dependencias</b> sobre la capa HTTP de Node, para que la arquitectura sea consistente y probable desde el primer día.</p>" +
      "<p>Concretamente: el sistema de módulos impone límites, DI hace que todo sea mockeable, y el pipeline de requests — guards, interceptores, pipes, filtros — me da lugares limpios para auth, validación y preocupaciones transversales. Y porque es TypeScript de extremo a extremo, el compilador atrapa clases enteras de bugs.</p>" +
      "<p>Escala de un monolito modular a microservicios sin cambiar el modelo de programación — eso es raro y valioso.</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> El contraste (Express → Nest) es persuasivo. No critiques Express — presenta Nest como &quot;Express con una arquitectura&quot;. Si usan Fastify, menciona que Nest es agnóstico de adaptador y usarías Fastify en servicios críticos de rendimiento.",
  },
  {
    id: "p5",
    num: "Pitch 05",
    title: "Por qué esta empresa / rol",
    metaHtml:
      "<span class=\"pill\">&quot;¿Por qué nosotros?&quot;</span><span class=\"pill accent\">~45 seg</span>",
    scriptHtml:
      "<p>Tres razones honestas, personalizadas: <b>(1) el problema</b> — [qué están construyendo y por qué te interesa]; <b>(2) el ajuste técnico</b> — [su stack/escala coincide con lo que hago: NestJS, [su stack de datos], [su escala]]; <b>(3) el rol</b> — [propiedad senior / el equipo / remoto / el dominio].</p>" +
      "<p>Cierra con una línea con visión de futuro: <i>&quot;Quisiera pasar mis primeras semanas entendiendo [su servicio principal] y encontrando dónde puedo añadir más palanca más rápido.&quot;</i></p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> La especificidad lo es todo — nombra su producto, un lanzamiento reciente o algo de la descripción del puesto. Un genérico &quot;son una gran empresa&quot; se lee como falta de investigación. Ten una observación concreta e informada lista.",
  },
  {
    id: "p6",
    num: "Pitch 06",
    title: "Inmersión técnica: DI + el ciclo de vida de requests",
    metaHtml:
      "<span class=\"pill\">&quot;Explica cómo funciona NestJS&quot;</span><span class=\"pill accent\">~90 seg</span>",
    scriptHtml:
      "<p>Dos cosas definen a Nest: <b>inyección de dependencias</b> y el <b>ciclo de vida de requests</b>.</p>" +
      "<p>DI: las clases declaran lo que necesitan en el constructor, y el contenedor IoC lo provee. El tipo es el token; durante el arranque Nest construye el grafo de dependencias e instancia de abajo hacia arriba, cacheando singletons. Por eso todo está desacoplado y trivialmente mockeable en tests.</p>" +
      "<p>El ciclo de vida: una request fluye a través de <b>middleware → guards → interceptores → pipes → el manejador → interceptores de nuevo → filtros de excepción</b>. Cada uno tiene una función — guards hacen autorización, pipes validan y transforman, interceptores envuelven el manejador para cosas como caché y timeouts, filtros dan forma a los errores. Conocer ese orden me permite poner cada preocupación exactamente en el lugar correcto.</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> Esta es la respuesta que demuestra senioridad. Di el orden del ciclo de vida sin dudar — ensáyalo. Si quieren profundidad, ramifica al bubbling de REQUEST scope o al Reflector para RBAC. Mantén tus manos moviéndose de izquierda a derecha mientras enumeras el pipeline; te ayuda a ti y a ellos.",
  },
  {
    id: "p7",
    num: "Pitch 07",
    title: "STAR: un problema de rendimiento que corregiste",
    metaHtml:
      "<span class=\"pill\">&quot;Cuéntame de un bug difícil&quot;</span><span class=\"pill accent\">~90 seg</span>",
    scriptHtml:
      "<p><b>Situación:</b> [un endpoint / servicio] estaba [lento / con timeout] bajo carga — [p99 saltó a X / colapsó en Y RPS].</p>" +
      "<p><b>Tarea:</b> Fui dueño de encontrar y corregir la causa raíz sin reescribir.</p>" +
      "<p><b>Acción:</b> Medí en lugar de adivinar — [revisé el event-loop lag / leí traces / capturé un flamegraph] y encontré [la causa: una consulta N+1 / trabajo de CPU bloqueante / un índice faltante / concurrencia sin límite]. [Agrupé la consulta con un DataLoader / moví el trabajo a un worker thread / añadí el índice / acoté la concurrencia] y añadí [una caché / una prueba de regresión].</p>" +
      "<p><b>Resultado:</b> [p99 bajó de X a Y / throughput Nx], y añadí una alerta en [loop lag / p99] para que no pueda retroceder silenciosamente.</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> La línea clave es <i>&quot;Perfalicé en lugar de adivinar.&quot;</i> Empieza con la métrica y termina con la métrica. Mantén Acción como la parte más larga. Si no tienes una historia dramática, una pequeña real contada con precisión vence a una grande inventada.",
  },
  {
    id: "p8",
    num: "Pitch 08",
    title: "STAR: una decisión técnica difícil",
    metaHtml:
      "<span class=\"pill\">&quot;Una decisión que defenderías&quot;</span><span class=\"pill accent\">~90 seg</span>",
    scriptHtml:
      "<p><b>Situación:</b> tuvimos que [elegir entre X y Y — por ejemplo, monolito vs microservicio, SQL vs NoSQL, síncrono vs cola].</p>" +
      "<p><b>Tarea:</b> Tenía que tomar la decisión y alinear al equipo.</p>" +
      "<p><b>Acción:</b> La enmarqué por las restricciones que realmente importaban — [escala, consistencia, tamaño del equipo, fecha límite] — y nombré el compromiso explícitamente: <i>&quot;[Opción A] nos da [beneficio] al costo de [desventaja].&quot;</i> [Prototipeé / hice benchmarks / escribí un ADR corto] y recomendé [la elección], con un fallback si [la suposición] resultaba incorrecta.</p>" +
      "<p><b>Resultado:</b> [resultado], y porque había documentado el compromiso, no lo volvimos a discutir después.</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> Los seniors se contratan por su juicio bajo incertidumbre. Muestra que elegiste <i>deliberadamente</i> y nombraste el costo — no que elegiste la opción de moda. &quot;Volvería a hacer la misma decisión, y aquí está lo que vigilaría&quot; es un cierre fuerte.",
  },
  {
    id: "p9",
    num: "Pitch 09",
    title: "Explícalo simplemente: el event loop",
    metaHtml:
      "<span class=\"pill\">&quot;Explica X a un junior&quot;</span><span class=\"pill accent\">~60 seg</span>",
    scriptHtml:
      "<p>Node ejecuta tu JavaScript en un <b>solo hilo</b> Piensa en un chef en una cocina: puede empezar muchos platos (llamadas de red, lecturas de archivos) y dejar que los hornos (el OS y un pequeño pool de hilos) cocinen en background, revisando cuando algo está listo. Por eso Node maneja miles de operaciones de E/O lentas a la vez.</p>" +
      "<p>La trampa: si el chef se detiene a picar una montaña de verduras a mano — una tarea de CPU pesada — cada otro plato espera. Eso es <b>bloquear el event loop</b>. Por eso mantenemos el trabajo pesado de CPU fuera de ese hilo: worker threads o una cola.</p>" +
      "<p>Ese modelo mental — excelente esperando, malo moliendo — explica la mayoría de consejos de rendimiento de Node.</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> La capacidad de enseñar simplemente <i>es</i> la señal senior (la prueba de Feynman). Una analogía, llevada hasta el final, vence a cinco términos técnicos. Mira al entrevistador asentir antes de añadir detalle.",
  },
  {
    id: "p10",
    num: "Pitch 10",
    title: "Preguntas para hacerles",
    metaHtml:
      "<span class=\"pill\">&quot;¿Alguna pregunta para nosotros?&quot;</span><span class=\"pill accent\">~siempre</span>",
    scriptHtml:
      "<p>Siempre ten 3–4 listas. Las buenas señalan senioridad:</p>" +
      "<p>&quot;¿Cómo se ve la arquitectura de servicios hoy — monolito modular, microservicios, algo intermedio — y cuál es el mayor punto de dolor?&quot;</p>" +
      "<p>&quot;¿Cómo manejan el testing, CI/CD y observabilidad? ¿Cómo es el story de on-call?&quot;</p>" +
      "<p>&quot;¿Cómo sería el éxito en este rol en los primeros 90 días?&quot;</p>" +
      "<p>&quot;¿Dónde está la base de código pagando deuda técnica y dónde tendría más palanca al inicio?&quot;</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> Preguntar sobre arquitectura, testing y on-call muestra que piensas como dueño. Evita preguntar solo sobre beneficios. Escucha la respuesta y haz seguimiento — debe sentirse como una conversación, no una lista de verificación.",
  },
  {
    id: "p11",
    num: "Pitch 11",
    title: "Express vs Fastify vs NestJS",
    metaHtml:
      "<span class=\"pill\">&quot;¿Cuál framework, y por qué?&quot;</span><span class=\"pill accent\">~75 seg</span>",
    scriptHtml:
      "<p>Se mapean a diferentes necesidades. <b>Express</b> es la capa middleware universal, no opinada — excelente para BFFs, webhooks y proxies delgados. <b>Fastify</b> es la jugada de rendimiento: serialización basada en esquema y encapsulación de plugins. <b>NestJS</b> es la jugada de estructura: módulos, DI y un pipeline de requests que escala con el equipo y la base de código.</p>" +
      "<p>Sobre velocidad — cito los números, pero honestamente. La ejecución oficial de fastify/benchmarks hello-world tiene Fastify alrededor de <b>45,140 req/s</b> vs Express alrededor de <b>10,702</b> — unas 4.5× en <i>esa</i> ejecución; otros benchmarks llegan más cerca de 2–3×. Pero el repo en sí dice que esos números &quot;no pretenden representar un escenario del mundo real&quot;, y se ejecutan en hardware CI compartido ruidoso, así que los resultados varían. Los trato como <b>direccionales</b>, nunca como titular.</p>" +
      "<p>Porque en una carga real el framework raramente es el cuello de botella — la base de datos, las llamadas posteriores y la lógica comercial dominan. Así que elijo por <b>ajuste de equipo y estructura</b>, y llego a NestJS. Y si un servicio específico es genuinamente crítico en rendimiento, Nest se ejecuta en el <b>adaptador Fastify</b> y recupera la mayoría de esa velocidad — no tengo que elegir.</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> Di los números de benchmark, luego inmediatamente socávalos con el propio descargo de responsabilidad del repo — esa autocorrección es la señal senior; un candidato que cita &quot;4.5× más rápido&quot; como hecho se ve junior. <span class=\"lbl\">Red flag</span> Nunca dejes que el pitch aterrice en req/s bruto. Aterrizalo en &quot;la BD domina cargas reales&quot; y &quot;Nest-en-Fastify significa que no tengo que comerciar estructura por velocidad&quot;. Pronuncia <i>Fastify</i> &quot;FAST-ify&quot;.",
  },
  {
    id: "p12",
    num: "Pitch 12",
    title: "La fórmula del trade-off",
    metaHtml:
      "<span class=\"pill\">Meta-habilidad: cómo enmarcar cualquier respuesta</span><span class=\"pill accent\">reutilizable</span>",
    scriptHtml:
      "<p>La meta-habilidad senior no es conocer la respuesta — es <b>enmarcar la decisión</b>. Una oración, cada vez: <i>&quot;La Opción A optimiza X al costo de Y; dadas las restricciones Z, elegiría ___ y revisaría si [umbral].&quot;</i></p>" +
      "<p>Concretamente, digamos que preguntan si ejecutar una exportación pesada inline o en una cola: <i>&quot;Hacerlo sincrónicamente optimiza la simpleza y la retroalimentación inmediata, al costo de mantener una request abierta y riesgo de timeouts bajo carga. Encolarlo optimiza la resiliencia y el rendimiento, al costo de complejidad de consistencia eventual y una UX de estado de trabajo. Dada que nuestra exportación toma unos pocos segundos y el tráfico es irregular, la encolaría — y revisaría el camino síncrono solo si la latencia p95 del trabajo cae bajo un segundo y el volumen sigue bajo.&quot;</i></p>" +
      "<p>Mira lo que eso hace: nombra ambos costos, ata la elección a una restricción real, y da un disparador medible para reabrirla — latencia p95/p99, tasa de error, costo por request. Esa es la diferencia entre &quot;Elegí la cola&quot; y &quot;Tomé una decisión que puedo defender y deshacer.&quot;</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> Practica la fórmula hasta que sea refleja — funciona para cualquier pregunta, no solo esta. Siempre añade un <b>umbral numérico</b> a la cláusula &quot;revisaría si&quot;; un vago &quot;reconsideraríamos después&quot; desperdicia todo el movimiento. <span class=\"lbl\">Red flag</span> Elegir la opción de moda y defenderla después. Los seniors se contratan por su juicio bajo incertidumbre — muestra que pesaste el costo <i>antes</i> de elegir.",
  },
  {
    id: "p13",
    num: "Pitch 13",
    title: "Un esqueleto de historia CARL",
    metaHtml:
      "<span class=\"pill\">Conductual: estructura cualquier historia</span><span class=\"pill accent\">≤3 min</span>",
    scriptHtml:
      "<p>Usa <b>CARL — Contexto, Acciones, Resultados, Aprendizajes</b>. El tiempo de Aprendizajes es lo que STAR pierde, y es lo que señala madurez: muestra que reflexionas, no solo ejecutas. Lidera con tu historia de <b>alcance más grande</b> incluso si no es una coincidencia literal, y cuantifica el impacto.</p>" +
      "<p><b>Contexto:</b> [el sistema + las apuestas — por ejemplo [servicio] estaba [fallando / en un punto de decisión] afectando [X usuarios / $Y / una fecha límite]; fui dueño de [alcance].]</p>" +
      "<p><b>Acciones:</b> [lo que <i>tú</i> hiciste — el marco que usaste, las alternativas que rechazaste y por qué, a quién alineaste. &quot;[Medí / hice benchmarks / escribí un ADR], elegí [X] sobre [Y] porque [restricción].&quot;]</p>" +
      "<p><b>Resultados:</b> [el resultado medible — &quot;[métrica] se movió de [A] a [B]&quot; / &quot;[incidente] resuelto en [N] con una post-mortem sin culpa y propietarios asignados.&quot;]</p>" +
      "<p><b>Aprendizajes:</b> [qué harías diferente y qué llevaste adelante — &quot;Habría [cambiado] antes; desde entonces [nueva práctica].&quot;]</p>",
    tipsHtml:
      "<span class=\"lbl\">Entrega</span> Mantenlo bajo 3 minutos — Acciones es el tiempo más largo, Contexto el más corto. Lidera con alcance y el marco, cierra en la métrica. <span class=\"lbl\">Red flag</span> Describir <i>lo que el equipo</i> hizo en lugar de qué <b>tú</b> hiciste, y saltar Aprendizajes — esa omisión es lo que hace que una historia de acciones fuerte todavía se vea como nivel medio. Una pequeña historia real contada con precisión vence a una inflada.",
  },
];
