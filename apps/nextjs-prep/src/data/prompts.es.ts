// Practice prompts — Next.js App Router / React coding tasks and
// frontend/full-stack system-design prompts — español
import type { Level } from "@/lib/levels";

export type PromptKind = "coding" | "design";
export type Prompt = {
  id: string;
  kind: PromptKind;
  title: string;
  level: Level;
  tags: string[];
  promptHtml: string;
  reveal: { label: string; html: string }[];
};

export const PROMPTS: Prompt[] = [
  // ---------------- CODING ----------------
  {
    id: "pr-cache-components",
    kind: "coding",
    title: "Cachear un Server Component de datos con Cache Components",
    level: "senior",
    tags: ["Next.js", "caching", "Cache Components"],
    promptHtml:
      "<p>Un Server Component de página de producto llama <code>getProduct(id)</code> (una lectura lenta de DB) en cada solicitud. Usando el modelo <b>Cache Components</b> (<code>cacheComponents: true</code>), cachea los datos obtenidos por hasta una hora, etiquétalos para que una actualización de precio pueda invalidarlos inmediatamente, y asegúrate de que la compilación no falle en un componente que también lee <code>cookies()</code> para una tira de \"visto recientemente\".</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<ul><li>Marca la función de obtención de datos con <code>\"use cache\"</code> (a nivel de función, no de componente) para que la unidad cacheada sea solo la lectura de DB.</li><li>Llama <code>cacheLife('hours')</code> (o un perfil personalizado) y <code>cacheTag('product:' + id)</code> dentro de esa función.</li><li>El componente de página permanece como un Server Component normal; espera la función cacheada directamente — sin ceremonia extra en el sitio de llamada.</li><li>Cualquier cosa que lea una API en tiempo de solicitud (<code>cookies()</code>, <code>headers()</code>) dentro de un alcance cacheado, o se renderice junto a un shell cacheado, debe ser envuelta en <code>&lt;Suspense&gt;</code> — Cache Components lanza un error de compilación de lo contrario, ya que PPR necesita un fallback para el hueco dinámico.</li></ul>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">// next.config.ts\nconst nextConfig = {\n  cacheComponents: true,\n};\nexport default nextConfig;\n\n// lib/products.ts\nimport { cacheLife, cacheTag } from 'next/cache';\n\nexport async function getProduct(id: string) {\n  'use cache';\n  cacheLife('hours');       // ~1hr profile\n  cacheTag(`product:${id}`);\n  const res = await db.query('SELECT * FROM products WHERE id = $1', [id]);\n  return res.rows[0];\n}\n\n// app/products/[id]/page.tsx\nimport { Suspense } from 'react';\nimport { getProduct } from '@/lib/products';\nimport { RecentlyViewed } from './recently-viewed'; // reads cookies()\n\nexport default async function ProductPage({\n  params,\n}: {\n  params: Promise&lt;{ id: string }&gt;;\n}) {\n  const { id } = await params;\n  const product = await getProduct(id);\n  return (\n    &lt;div&gt;\n      &lt;h1&gt;{product.name}&lt;/h1&gt;\n      &lt;p&gt;${product.price}&lt;/p&gt;\n      &lt;Suspense fallback={&lt;p&gt;Cargando vistos recientemente…&lt;/p&gt;}&gt;\n        &lt;RecentlyViewed /&gt;\n      &lt;/Suspense&gt;\n    &lt;/div&gt;\n  );\n}\n\n// on a price update (Server Action / webhook handler):\n// import { revalidateTag } from 'next/cache';\n// revalidateTag(`product:${id}`, 'max'); // SWR: serve stale once, revalidate now</div><p><b>Compromiso:</b> cachear a nivel de función de obtención de datos mantiene el shell estático maximal (mejor PPR) versus cachear todo el componente, lo que también congelaría la tira dependiente de cookies a menos que se separe en su propio límite de Suspense.</p>",
      },
    ],
  },
  {
    id: "pr-server-action-form",
    kind: "coding",
    title: "Formulario con Server Action usando useActionState + revalidatePath",
    level: "mid",
    tags: ["Next.js", "Server Actions", "forms"],
    promptHtml:
      "<p>Construye un formulario de \"renombrar proyecto\": una Server Action muta la BD, el formulario muestra un spinner pendiente mientras se ejecuta, muestra un error de validación en línea sin recarga completa de página, y la página de lista de proyectos refleja el nuevo nombre inmediatamente después del éxito.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<ul><li>La Server Function (<code>\"use server\"</code>) toma <code>(prevState, formData)</code>, valida, muta y retorna un objeto de estado — nunca asumas que el llamador es el formulario; re-verifica autenticación/propietario dentro de la función ya que las Server Actions son accesibles directamente por POST.</li><li>El Client Component llama <code>useActionState(action, initialState)</code> → <code>[state, formAction, pending]</code>; conecta <code>&lt;form action={formAction}&gt;</code> y deshabilita el botón mientras <code>pending</code> esté activo.</li><li>En éxito, llama <code>revalidatePath('/projects')</code> dentro de la acción para que la ruta de lista se re-renderice con datos frescos en la próxima visita.</li></ul>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">// app/projects/actions.ts\n'use server';\nimport { revalidatePath } from 'next/cache';\nimport { auth } from '@/lib/auth';\n\ntype State = { error?: string; ok?: boolean };\n\nexport async function renameProject(\n  prevState: State,\n  formData: FormData,\n): Promise&lt;State&gt; {\n  const session = await auth();\n  if (!session) return { error: 'No autenticado' };\n\n  const id = String(formData.get('id'));\n  const name = String(formData.get('name') ?? '').trim();\n  if (name.length &lt; 3) return { error: 'El nombre debe tener al menos 3 caracteres' };\n\n  const project = await db.project.findUnique({ where: { id } });\n  if (project?.ownerId !== session.userId) return { error: 'Prohibido' };\n\n  await db.project.update({ where: { id }, data: { name } });\n  revalidatePath('/projects');\n  return { ok: true };\n}\n\n// app/projects/rename-form.tsx\n'use client';\nimport { useActionState } from 'react';\nimport { renameProject } from './actions';\n\nexport function RenameForm({ id }: { id: string }) {\n  const [state, formAction, pending] = useActionState(renameProject, {});\n  return (\n    &lt;form action={formAction}&gt;\n      &lt;input type=\"hidden\" name=\"id\" value={id} /&gt;\n      &lt;input name=\"name\" required minLength={3} /&gt;\n      &lt;button type=\"submit\" disabled={pending}&gt;\n        {pending ? 'Guardando…' : 'Renombrar'}\n      &lt;/button&gt;\n      {state.error &amp;&amp; &lt;p role=\"alert\"&gt;{state.error}&lt;/p&gt;}\n    &lt;/form&gt;\n  );\n}</div><p><b>Trampa:</b> los atributos <code>required</code>/<code>minLength</code> del lado del cliente son solo UX — un POST con curl los omite completamente, así que la verificación de longitud del lado del servidor y la verificación de propietario son lo que realmente protege los datos.</p>",
      },
    ],
  },
  {
    id: "pr-optimistic-like",
    kind: "coding",
    title: "Botón de \"me gusta\" optimista con useOptimistic",
    level: "mid",
    tags: ["Next.js", "useOptimistic", "Server Actions"],
    promptHtml:
      "<p>El botón de \"me gusta\" de una publicación actualmente espera una ida y vuelta completa antes de que el conteo se actualice, lo que se siente lento. Haz que el conteo de \"me gusta\" y el estado de \"gustado\" se actualicen instantáneamente al tocar, se reviertan automáticamente si la Server Action falla, y nunca permitas que el botón se toque dos veces mientras una solicitud está en vuelo.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p>Envuelve el estado confirmado por el servidor en <code>useOptimistic(state, reducer)</code>. Al hacer clic, llama al reducer para renderizar el nuevo valor inmediatamente, luego <code>await</code> la Server Action dentro de una transición (<code>useOptimistic</code> las actualizaciones deben ocurrir durante una transición — <code>startTransition</code> o una acción). Si la acción lanza un error, React descarta el valor optimista y re-renderiza desde el último estado real, así que no se necesita código de reversión manual — solo no tragues el error.</p>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">// app/posts/actions.ts\n'use server';\nexport async function toggleLike(postId: string, liked: boolean) {\n  const session = await auth();\n  if (!session) throw new Error('No autenticado');\n  if (liked) await db.like.create({ data: { postId, userId: session.userId } });\n  else await db.like.deleteMany({ where: { postId, userId: session.userId } });\n  return db.post.count({ where: { id: postId } }); // fresh count\n}\n\n// app/posts/like-button.tsx\n'use client';\nimport { useOptimistic, useTransition } from 'react';\nimport { toggleLike } from './actions';\n\ntype LikeState = { count: number; liked: boolean };\n\nexport function LikeButton({ postId, initial }: { postId: string; initial: LikeState }) {\n  const [pending, startTransition] = useTransition();\n  const [optimistic, setOptimistic] = useOptimistic(\n    initial,\n    (state, liked: boolean): LikeState =&gt; ({\n      liked,\n      count: state.count + (liked ? 1 : -1),\n    }),\n  );\n\n  function onToggle() {\n    const next = !optimistic.liked;\n    startTransition(async () =&gt; {\n      setOptimistic(next);\n      await toggleLike(postId, next); // throws → React reverts optimistic state\n    });\n  }\n\n  return (\n    &lt;button onClick={onToggle} disabled={pending} aria-pressed={optimistic.liked}&gt;\n      {optimistic.liked ? '♥' : '♡'} {optimistic.count}\n    &lt;/button&gt;\n  );\n}</div><p><b>Compromiso:</b> la aritmética de conteo optimista es aritmética del lado del cliente, no el conteo real del servidor — está bien para un botón de \"me gusta\" (se autorrepra en el próximo renderizado real), pero es riesgoso para cualquier cosa donde el conteo exacto de usuarios concurrentes importe (usa el valor retornado por el servidor para reconciliar, no solo confíes en el +1/-1).</p>",
      },
    ],
  },
  {
    id: "pr-boundary-bug",
    kind: "coding",
    title: "Encuentra el error: Límite Server/Client Component",
    level: "mid",
    tags: ["Next.js", "Server Components", "debugging"],
    promptHtml:
      "<p>El PR de un compañero falla al compilar con <i>\"You're importing a component that needs `useState`. This React hook only works in a client component.\"</i> Aquí está el árbol — encuentra el error y arréglalo con el cambio más pequeño posible (no simplemente pegues <code>\"use client\"</code> en todo).</p><div class=\"code\">// app/dashboard/layout.tsx\n'use client';\nimport { Sidebar } from './sidebar';       // has useState (a collapse toggle)\nimport { DashboardStats } from './stats';  // async Server Component, awaits db\n\nexport default function DashboardLayout({ children }) {\n  return (\n    &lt;div className=\"layout\"&gt;\n      &lt;Sidebar /&gt;\n      &lt;DashboardStats /&gt;\n      &lt;main&gt;{children}&lt;/main&gt;\n    &lt;/div&gt;\n  );\n}</div>",
      reveal: [
      {
        label: "Enfoque",
        html:
          "<p>La directiva <code>\"use client\"</code> se puso en el <b>layout</b>, lo que arrastra todo el grafo de módulos que importa — incluyendo <code>DashboardStats</code>, un Server Component <code>async</code> — al bundle del cliente. Los Client Components no pueden ser funciones <code>async</code> y no pueden hacer acceso a datos solo-servidor, así que la compilación falla después del error real. La solución es bajar el límite solo a la pieza que realmente necesita interactividad (el estado de colapso del <code>Sidebar</code>), no subirlo al layout.</p>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">// app/dashboard/layout.tsx  (Server Component again — no directive)\nimport { Sidebar } from './sidebar';\nimport { DashboardStats } from './stats';\n\nexport default function DashboardLayout({ children }) {\n  return (\n    &lt;div className=\"layout\"&gt;\n      &lt;Sidebar /&gt;          {/* Sidebar itself owns 'use client' */}\n      &lt;DashboardStats /&gt;   {/* stays a Server Component, never bundled to client */}\n      &lt;main&gt;{children}&lt;/main&gt;\n    &lt;/div&gt;\n  );\n}\n\n// app/dashboard/sidebar.tsx\n'use client';\nimport { useState } from 'react';\n\nexport function Sidebar() {\n  const [collapsed, setCollapsed] = useState(false);\n  return (\n    &lt;aside className={collapsed ? 'collapsed' : ''}&gt;\n      &lt;button onClick={() =&gt; setCollapsed((c) =&gt; !c)}&gt;Toggle&lt;/button&gt;\n      {/* nav links */}\n    &lt;/aside&gt;\n  );\n}</div><p><b>Regla general:</b> <code>\"use client\"</code> marca un límite del grafo de módulos, no solo \"este archivo\". Ponlo en la hoja que necesita el navegador (estado, efectos, manejadores de eventos), y pasa Server Components como children/props a Client Components cuando necesites intercalarlos — se renderizan en el servidor y nunca se arrastran al bundle del cliente solo porque un padre cliente los renderiza.</p>",
      },
    ],
  },
  {
    id: "pr-debounced-search",
    kind: "coding",
    title: "Búsqueda con debounce que conduce un Server Component vía la URL",
    level: "senior",
    tags: ["Next.js", "useSearchParams", "streaming"],
    promptHtml:
      "<p>Construye un cuadro de búsqueda de productos: escribir actualiza un parámetro de URL <code>?q=</code> (con debounce, para que no estés navegando en cada pulsación de tecla), y un Server Component lee <code>searchParams</code> para obtener + renderizar resultados coincidentes, mostrando un fallback de streaming mientras una nueva consulta está en vuelo.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<ul><li>El input es un Client Component usando <code>useSearchParams()</code> para leer el valor actual y <code>useRouter().replace()</code> para escribirlo de vuelta, con debounce usando un hook personalizado pequeño (o un timer en un efecto) para que la navegación solo se dispare ~300ms después de que el usuario deje de escribir.</li><li>Los resultados en sí son un Server Component <code>async</code> separado que espera <code>searchParams.q</code> y consulta la BD — <code>searchParams</code> es una Promise en Next 16, así que debe esperarse.</li><li>Envuelve los resultados en <code>&lt;Suspense key={query}&gt;</code> para que cada nueva consulta obtenga su propio fallback en lugar de que toda la página se suspenda o muestre resultados obsoletos mientras carga.</li></ul>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">// app/search/search-box.tsx\n'use client';\nimport { useRouter, usePathname, useSearchParams } from 'next/navigation';\nimport { useState, useEffect } from 'react';\n\nexport function SearchBox() {\n  const router = useRouter();\n  const pathname = usePathname();\n  const searchParams = useSearchParams();\n  const [value, setValue] = useState(searchParams.get('q') ?? '');\n\n  useEffect(() =&gt; {\n    const handle = setTimeout(() =&gt; {\n      const params = new URLSearchParams(searchParams);\n      value ? params.set('q', value) : params.delete('q');\n      router.replace(`${pathname}?${params.toString()}`);\n    }, 300);\n    return () =&gt; clearTimeout(handle);\n  }, [value, pathname, router, searchParams]);\n\n  return &lt;input value={value} onChange={(e) =&gt; setValue(e.target.value)} placeholder=\"Buscar…\" /&gt;;\n}\n\n// app/search/page.tsx\nimport { Suspense } from 'react';\nimport { SearchBox } from './search-box';\nimport { Results } from './results';\n\nexport default async function SearchPage({\n  searchParams,\n}: {\n  searchParams: Promise&lt;{ q?: string }&gt;;\n}) {\n  const { q = '' } = await searchParams;\n  return (\n    &lt;div&gt;\n      &lt;SearchBox /&gt;\n      &lt;Suspense key={q} fallback={&lt;p&gt;Buscando…&lt;/p&gt;}&gt;\n        &lt;Results query={q} /&gt;\n      &lt;/Suspense&gt;\n    &lt;/div&gt;\n  );\n}\n\n// app/search/results.tsx (Server Component)\nexport async function Results({ query }: { query: string }) {\n  const items = await db.product.search(query);\n  return &lt;ul&gt;{items.map((p) =&gt; &lt;li key={p.id}&gt;{p.name}&lt;/li&gt;)}&lt;/ul&gt;;\n}</div><p><b>Compromiso:</b> la búsqueda impulsada por URL es compartible/marcable y permite que el Server Component haga la obtención (sin cascada del lado del cliente), a costa de una navegación por cada pulsación con debounce — para un filtro puramente local del lado del cliente (sin ida y vuelta al servidor necesaria), un simple hook <code>useDebounce</code> alimentando estado del cliente sería más simple y evitaría la navegación.</p>",
      },
    ],
  },
  {
    id: "pr-proxy-auth",
    kind: "coding",
    title: "Protección de rutas con proxy.ts",
    level: "mid",
    tags: ["Next.js", "proxy.ts", "auth"],
    promptHtml:
      "<p>Protege cada ruta bajo <code>/dashboard</code>: los visitantes no autenticados deben ser redirigidos a <code>/login?next=&lt;ruta original&gt;</code>, mientras las rutas públicas (marketing, <code>/login</code> en sí) permanecen intactas. Implementa esto en el borde de la aplicación, no verificando auth en cada página.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p>Next 16 renombró <code>middleware.ts</code> a <code>proxy.ts</code> (la función exportada ahora es <code>proxy</code>, no <code>middleware</code>), y se ejecuta solo en el runtime de Node.js. Lee la cookie de sesión, limita la verificación con un <code>matcher</code> (o una verificación de ruta dentro de la función) a solo <code>/dashboard/*</code>, y redirige preservando la ruta original para que el login pueda redirigir al usuario de vuelta. Trata esto como un atajo de UX, no la única verificación de auth — aún verifica autenticación/propietario dentro de cualquier Server Action o route handler que el dashboard llame, ya que esos son directamente alcanzables.</p>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">// proxy.ts (project root)\nimport { NextResponse, type NextRequest } from 'next/server';\n\nexport function proxy(request: NextRequest) {\n  const session = request.cookies.get('session')?.value;\n  if (!session) {\n    const loginUrl = new URL('/login', request.url);\n    loginUrl.searchParams.set('next', request.nextUrl.pathname);\n    return NextResponse.redirect(loginUrl);\n  }\n  return NextResponse.next();\n}\n\nexport const config = {\n  matcher: ['/dashboard/:path*'],\n};</div><p><b>Trampa:</b> un <code>matcher</code> solo filtra qué solicitudes <i>ejecutan</i> el proxy — es barato, pero no es autorización. Una Server Action olvidada aún se ejecuta si se envía directamente por POST, así que la protección a nivel de ruta aquí es una optimización UX/perf (redirigir antes de renderizar cualquier cosa) superpuesta, no en lugar de, verificaciones por acción.</p>",
      },
    ],
  },
  {
    id: "pr-streaming-list",
    kind: "coding",
    title: "Lista paginada con streaming usando Suspense",
    level: "senior",
    tags: ["Next.js", "Suspense", "streaming"],
    promptHtml:
      "<p>Una sección de comentarios puede tener cientos de entradas. Renderiza el shell de la página (publicación + conteo de comentarios) instantáneamente, luego transmite una primera página de 20 comentarios, con un control \"Cargar más\" que obtiene la siguiente página sin una navegación completa de página.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p>Divide la página en un shell rápido que no se suspende y un Server Component <code>CommentsPage</code> lento envuelto en <code>&lt;Suspense&gt;</code> para que el shell se transmita al cliente inmediatamente mientras los comentarios cargan en segundo plano. \"Cargar más\" es un pequeño Client Component que llama a una Server Function retornando la siguiente porción y la añade al estado local — sin recarga completa de página, sin biblioteca de obtención de datos del lado del cliente necesaria para algo tan simple.</p>",
      },
      {
        label: "Solución",
        html:
          "<div class=\"code\">// app/posts/[id]/page.tsx\nimport { Suspense } from 'react';\nimport { CommentsList } from './comments-list';\nimport { CommentsSkeleton } from './comments-skeleton';\n\nexport default async function PostPage({ params }: { params: Promise&lt;{ id: string }&gt; }) {\n  const { id } = await params;\n  const post = await getPost(id); // fast — indexed lookup\n  return (\n    &lt;article&gt;\n      &lt;h1&gt;{post.title}&lt;/h1&gt;\n      &lt;Suspense fallback={&lt;CommentsSkeleton /&gt;}&gt;\n        &lt;CommentsList postId={id} page={0} /&gt;\n      &lt;/Suspense&gt;\n    &lt;/article&gt;\n  );\n}\n\n// app/posts/[id]/comments-list.tsx (Server Component, first page)\nimport { LoadMore } from './load-more';\n\nexport async function CommentsList({ postId, page }: { postId: string; page: number }) {\n  const comments = await db.comment.findMany({\n    where: { postId }, skip: page * 20, take: 20, orderBy: { createdAt: 'desc' },\n  });\n  return (\n    &lt;ul&gt;\n      {comments.map((c) =&gt; &lt;li key={c.id}&gt;{c.body}&lt;/li&gt;)}\n      &lt;LoadMore postId={postId} nextPage={page + 1} hasMore={comments.length === 20} /&gt;\n    &lt;/ul&gt;\n  );\n}\n\n// app/posts/[id]/load-more.tsx\n'use client';\nimport { useState, useTransition } from 'react';\nimport { fetchCommentsPage } from './actions'; // 'use server' function\n\nexport function LoadMore({ postId, nextPage, hasMore }: { postId: string; nextPage: number; hasMore: boolean }) {\n  const [items, setItems] = useState&lt;{ id: string; body: string }[]&gt;([]);\n  const [more, setMore] = useState(hasMore);\n  const [pending, startTransition] = useTransition();\n  if (!more &amp;&amp; items.length === 0) return null;\n  return (\n    &lt;&gt;\n      {items.map((c) =&gt; &lt;li key={c.id}&gt;{c.body}&lt;/li&gt;)}\n      {more &amp;&amp; (\n        &lt;button\n          disabled={pending}\n          onClick={() =&gt; startTransition(async () =&gt; {\n            const { comments, hasMore: h } = await fetchCommentsPage(postId, nextPage);\n            setItems((prev) =&gt; [...prev, ...comments]);\n            setMore(h);\n          })}\n        &gt;\n          {pending ? 'Cargando…' : 'Cargar más'}\n        &lt;/button&gt;\n      )}\n    &lt;/&gt;\n  );\n}</div><p><b>Compromiso:</b> el \"cargar más\" del lado del cliente apendia al estado local, lo que significa que la lista combinada no está en el DOM del servidor (mal para SEO, no responde a crawlers) — si eso importa, una alternativa es usar parámetros de URL para la paginación y que cada página sea su propia ruta server-rendered.</p>",
      },
    ],
  },

  // ---------------- SYSTEM DESIGN ----------------
  {
    id: "pr-catalog-rendering",
    kind: "design",
    title: "Diseña la estrategia de renderizado para un catálogo grande de e-commerce",
    level: "architect",
    tags: ["architecture", "rendering", "ISR"],
    promptHtml:
      "<p>Un catálogo tiene 500k páginas de productos, un puñado de páginas de aterrizaje de categorías, y un flujo de carrito/checkout. Diseña qué páginas son estáticas, cuáles se revalidan incrementalmente, y cuáles deben ser completamente dinámicas — y por qué.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p>Segmenta por qué tan frecuentemente cambia el contenido y qué tan personalizado es, no por \"¿es una página de producto?\" como un solo grupo. Empareja cada segmento con el modo de renderizado más barato que aún cumpla con sus requisitos de frescura y personalización.</p>",
      },
      {
        label: "Solución",
        html:
          "<ul><li><b>Páginas de categoría/aterrizaje:</b> estáticas en compilación para las N superiores por tráfico; la cola larga generada bajo demanda y cacheada (<code>dynamicParams: true</code>) para que un catálogo de 500k productos no necesite una compilación de 500k páginas.</li><li><b>Páginas de detalle de producto:</b> cacheadas con un TTL moderado (<code>\"use cache\"</code> + <code>cacheLife</code>) con clave por id de producto, invalidadas en escritura vía <code>cacheTag</code>/<code>revalidateTag</code> — precios y stock cambian ocasionalmente, no en cada solicitud, así que el renderizado completamente dinámico desperdicia computación a esta escala.</li><li><b>Resultados de búsqueda/filtros:</b> dinámicos — demasiadas combinaciones de parámetros para cachear de manera útil por URL; confía en un índice de búsqueda rápido (no el caché de página) para latencia.</li><li><b>Carrito/checkout:</b> completamente dinámicos, por usuario, sin caché — la corrección (inventario, precio, datos personales) importa más que la latencia aquí, y cachear estado de checkout específico de usuario es un riesgo de fuga de datos.</li><li><b>Tiras personalizadas</b> (recomendaciones, visto recientemente) dentro de una página de producto de otro modo cacheada: separadas en su propio límite <code>&lt;Suspense&gt;</code> que lee <code>cookies()</code>, para que el shell estático permanezca cacheable vía Prerenderizado Parcial mientras la porción personalizada se transmite dinámicamente.</li></ul><div class=\"callout\"><span class=\"lbl\">Compromiso</span> Cachear páginas de producto significa que una actualización de precio no es instantánea en todas partes — limita esa obsolescencia con un perfil <code>cacheLife</code> corto más una llamada <code>revalidateTag</code> explícita desde la ruta de actualización de precio, en lugar de cachear para siempre o ir completamente dinámico \"por seguridad.\"</div>",
      },
    ],
  },
  {
    id: "pr-multitenant-dashboard",
    kind: "design",
    title: "Diseña la obtención de datos y caché de un dashboard SaaS multi-tenant",
    level: "architect",
    tags: ["architecture", "multi-tenancy", "caching"],
    promptHtml:
      "<p>Diseña la estrategia de obtención de datos y caché del App Router para un dashboard B2B donde los datos de cada tenant nunca deben filtrarse al caché de otro tenant, pero los widgets del dashboard son costosos de computar y vale la pena cachearlos por tenant.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p>Trata el id del tenant como parte de la clave de caché en todas partes, resuélvelo una vez en el borde de la solicitud, y prefiere una barrera que haga la fuga entre tenants estructuralmente difícil en lugar de confiar en que cada sitio de llamada recuerde limitar las cosas correctamente.</p>",
      },
      {
        label: "Solución",
        html:
          "<ul><li><b>Resolución de tenant:</b> subdominio o cookie firmada/afirmación JWT, leído en <code>proxy.ts</code>, reenviado como encabezado para que los Server Components y Server Functions puedan leerlo sin re-parsear auth en todas partes.</li><li><b>Claves de caché:</b> cualquier función <code>\"use cache\"</code> con alcance de tenant debe tomar el id del tenant como argumento explícito (Cache Components usa la clave de los argumentos de la función) — por ejemplo <code>getDashboardStats(tenantId)</code>, nunca un <code>getDashboardStats()</code> desnudo que lee implícitamente un tenant con alcance de solicitud del contexto, lo que arriesgaría que el resultado cacheado de un tenant se sirva a otro.</li><li><b>Etiquetado:</b> etiqueta widgets cacheados con una etiqueta con alcance de tenant (<code>tenant:{id}:stats</code>) para que un cambio de datos para un tenant invalide solo las entradas de caché de ese tenant vía <code>revalidateTag</code>, no todo el caché.</li><li><b>Personalización vs compartición:</b> widgets idénticos para todos los usuarios de un tenant (por ejemplo \"actividad del equipo esta semana\") se cachean bien; widgets por usuario (\"tus tareas\") o bien saltan el caché o se clavan en <code>tenantId:userId</code>.</li><li><b>Defensa en profundidad:</b> seguridad a nivel de fila o un filtro de tenant equivalente a nivel de BD respalda la disciplina de clave de caché, para que un error en la construcción de la clave de caché no pueda realmente retornar filas de otro tenant.</li></ul><div class=\"callout warn\"><span class=\"lbl\">Pecado cardinal</span> Una función cacheada que lee el \"tenant actual\" del contexto de solicitud ambiental en lugar de tomarlo como argumento — el caché no sabe sobre ese contexto, así que un golpe de caché puede silenciosamente servir los datos del tenant A al tenant B.</div>",
      },
    ],
  },
  {
    id: "pr-cache-migration-rollout",
    kind: "design",
    title: "Implementa una migración a Cache Components de forma segura",
    level: "architect",
    tags: ["architecture", "caching", "migrations"],
    promptHtml:
      "<p>Estás migrando una aplicación de tamaño medio de Next.js del modelo anterior de fetch-cache/<code>revalidate</code> al nuevo modelo Cache Components (<code>cacheComponents: true</code>, <code>\"use cache\"</code> + <code>cacheLife</code>/<code>cacheTag</code>). Diseña cómo validarías e implementarías esto sin un incidente en producción.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p>Trátalo como cualquier cambio de comportamiento de caché: escenalo, haz que el radio de explosión sea pequeño y reversible, y observa los modos de fallo específicos que esta migración introduce (datos obsoletos, sobre-cachear contenido específico de solicitud, fallos de compilación por límites de Suspense faltantes) antes de confiar ampliamente en él.</p>",
      },
      {
        label: "Solución",
        html:
          "<ul><li><b>Inventario primero:</b> enumera cada función de obtención de datos y página, clasifica cada una como estática/cacheable, con alcance de tenant/usuario, o debe-ser-dinámica — esto se convierte en la lista de verificación de lo que debería obtener <code>\"use cache\"</code> versus lo que debería permanecer explícitamente dinámico.</li><li><b>Implementación gradual:</b> habilita <code>cacheComponents: true</code> detrás de un despliegue de previsualización/staging primero; la compilación en sí es una señal fuerte — falla ruidosamente en componentes que necesitan <code>&lt;Suspense&gt;</code> y no lo tienen, surfacing errores de límite antes que los usuarios.</li><li><b>Migra incrementalmente:</b> convierte un segmento de ruta o una página de alto tráfico, bajo riesgo a la vez en lugar de cambiar cada llamada fetch de una vez; cada función migrada obtiene un perfil <code>cacheLife</code> explícito elegido de su frecuencia de cambio real, no un defecto copiado-pegado.</li><li><b>Verifica etiquetas:</b> para cada ruta de mutación (Server Action, webhook, cron job) que solía depender de <code>revalidatePath</code>/revalidación basada en tiempo, confirma que ahora llama <code>revalidateTag</code>/<code>updateTag</code> con la etiqueta correcta — una llamada de etiqueta perdida es el clásico error de \"la página nunca se actualiza de nuevo\".</li><li><b>Canary + monitoreo:</b> implementa a un porcentaje del tráfico de producción si la plataforma lo soporta; observa la tasa de golpe de caché, quejas de obsolescencia, y tasa de errores en rutas previamente dinámicas que ahora están cacheadas.</li><li><b>Plan de reversión:</b> mantén el cambio detrás del flag de configuración único <code>cacheComponents</code> para que revertir sea un cambio de configuración de una línea más redespliegue, no una reversión de múltiples archivos.</li></ul><div class=\"callout\"><span class=\"lbl\">Compromiso</b> La migración incremental es más lenta y significa ejecutar dos modelos mentales de caché lado a lado por un tiempo, pero un cambio de golpe en una aplicación de tamaño medio hace mucho más difícil atribuir un error de obsolescencia en producción a la función que obtuvo el perfil <code>cacheLife</code> incorrecto.</div>",
      },
    ],
  },
  {
    id: "pr-observability-nextjs",
    kind: "design",
    title: "Diseña observabilidad para una aplicación de Next.js en producción",
    level: "senior",
    tags: ["architecture", "observability"],
    promptHtml:
      "<p>Los usuarios están reportando que el sitio \"se siente lento\" pero nada se ve obviamente roto en una verificación rápida. Diseña la observabilidad que ya querrías tener implementada para que puedas diagnosticar esto con precisión en lugar de adivinar.</p>",
    reveal: [
      {
        label: "Enfoque",
        html:
          "<p>Cubre ambos extremos del stack — la experiencia real del usuario en el navegador y lo que está sucediendo en el servidor/borde — y asegúrate de que los dos puedan correlacionarse de vuelta a la misma solicitud, no solo monitorearse como dashboards separados.</p>",
      },
      {
        label: "Solución",
        html:
          "<ul><li><b>Core Web Vitals (datos de campo):</b> captura LCP, INP, y CLS de usuarios reales vía <code>next/web-vitals</code> reportando o un proveedor RUM — datos de laboratorio (Lighthouse) por sí solos pierden la varianza de dispositivo/red que frecuentemente es la causa real de \"se siente lento.\"</li><li><b>Rastreo de errores del cliente:</b> un SDK cliente de Sentry/equivalente con source maps subidos, para que un crash de límite de errores de React se resuelva en un stack trace real, no en ruido minificado.</li><li><b>Logs y trazas del servidor/borde:</b> logs estructurados de route handlers, Server Actions, y <code>proxy.ts</code> correlacionados por un id de solicitud; spans de traza alrededor de operaciones lentas (llamadas a BD, APIs externas) para que un pico de latencia apunte a un span específico, no \"el servidor.\"</li><li><b>Visibilidad de caché:</b> log o métrica de golpe/fallo de caché para funciones clave cacheadas — un pico repentino de tasa de fallo (por ejemplo después de una implementación que invalidó etiquetas inesperadamente) es una causa común, de otro modo invisible, de \"se siente lento.\"</li><li><b>Señales de compilación/despliegue:</b> rastrea el tamaño del bundle y JS a nivel de ruta con el tiempo (por ejemplo en CI) ya que una interacción lenta del cliente frecuentemente es una regresión de demasiado-JS-enviado, no un problema del servidor en absoluto.</li><li><b>Alertas:</b> vincula las alertas a SLOs visibles por el usuario (p75 LCP/INP, tasa de errores) en lugar de métricas de infraestructura crudas, para que una alerta que se dispare realmente signifique que los usuarios están afectados.</li></ul><div class=\"callout\"><span class=\"lbl\">Compromiso</span> RUM completo + trazas tiene un costo real (precios de proveedor, JS cliente agregado para el beacon de reporte) — para una aplicación pequeña, comienza con reporte de Web Vitals + rastreo de errores, y agrega trazas una vez que tengas una clase específica de incidente que no puedas diagnosticar de otra manera.</div>",
      },
    ],
  },
];
