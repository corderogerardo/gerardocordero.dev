// Batch 1 — Guards (CanActivate, ExecutionContext), Interceptors (NestInterceptor, RxJS pipe for response transform), Pipes (custom ParseX pipes), Filters (ExceptionFilter, @Catch), and the exact execution order with async providers.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";

export const ADVANCED1_FLASHCARDS: Flashcard[] = [
  {
    id: "a1-request-lifecycle-1",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `In the request lifecycle, what is the exact ordering of guards, interceptors (before), pipes, the route handler, interceptors (after), and exception filters?`,
    answerHtml: `<p>Order is: <b>middleware</b> &rarr; <b>guards</b> &rarr; <b>interceptors (pre-controller)</b> &rarr; <b>pipes</b> &rarr; <b>route handler</b> &rarr; <b>interceptors (post-controller, response stream)</b> &rarr; <b>exception filters</b> (only on throw, can fire at any stage after guards).</p><p>Pipes run <i>after</i> guards and <i>inside</i> the interceptor's pre-handler phase &mdash; an interceptor's code before <code>next.handle()</code> runs before the pipe transforms params, but the pipe runs before the controller method body executes. Filters sit outside everything as a catch-all, including catching errors thrown by guards, pipes, interceptors, or the handler itself.</p>`,
  },
  {
    id: "a1-request-lifecycle-2",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `Why do pipes run after guards rather than before, and what design implication does that have for input validation that should gate authorization?`,
    answerHtml: `<p>Guards answer <i>"should this handler run at all"</i> using minimal context (route metadata, headers, raw params) &mdash; Nest deliberately keeps this cheap and runs it first so unauthorized requests are rejected before any transformation cost is paid. Pipes answer <i>"is this input shaped correctly,"</i> which is a handler-level concern.</p><p>Implication: a guard cannot rely on a pipe having already coerced <code>request.params.id</code> from string to number &mdash; it must read the raw value. If authorization logic needs a parsed/validated value (e.g. checking a numeric role ID against ownership), that check has to be duplicated or moved into the handler/interceptor, since guards run too early to see pipe output.</p>`,
  },
  {
    id: "a1-request-lifecycle-3",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `What does ExecutionContext add on top of ArgumentsHost, and why do guards and interceptors receive the richer type while exception filters only get ArgumentsHost?`,
    answerHtml: `<p><code>ArgumentsHost</code> only exposes the raw arguments array for the current context (HTTP req/res/next, RPC data, or WS client/data) via <code>switchToHttp()</code> etc. <code>ExecutionContext extends ArgumentsHost</code> and adds <code>getClass()</code> and <code>getHandler()</code>, which return the controller class and the handler method reference.</p><p>Guards and interceptors need <code>getHandler()</code>/<code>getClass()</code> because that's how they read decorator metadata via <code>Reflector</code> (e.g. <code>@Roles()</code>, <code>@SetMetadata()</code>) to make a decision. Filters only need to inspect the error and respond, not introspect which handler-level decorators were applied, so the leaner <code>ArgumentsHost</code> is sufficient.</p>`,
  },
  {
    id: "a1-request-lifecycle-4",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `Write the minimal CanActivate implementation for a guard that reads roles via Reflector and denies access if the user lacks any required role.`,
    answerHtml: `<pre><code>@Injectable()
class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride&lt;string[]&gt;('roles', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required) return true;
    const { user } = ctx.switchToHttp().getRequest();
    return required.some(r =&gt; user?.roles?.includes(r));
  }
}</code></pre><p>Key detail: <code>getAllAndOverride</code> checks the handler first, falling back to the class &mdash; this is how a method-level <code>@Roles()</code> overrides a controller-level one rather than merging with it.</p>`,
  },
  {
    id: "a1-request-lifecycle-5",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `A guard's canActivate() returns a Promise<boolean> that never resolves. What happens to the request, and how does this differ from returning false synchronously?`,
    answerHtml: `<p>Nest's guard composition awaits each guard's return value (it accepts <code>boolean | Promise&lt;boolean&gt; | Observable&lt;boolean&gt;</code>). If the promise never resolves, the request <b>hangs indefinitely</b> &mdash; no response is sent, no timeout fires by default, and the connection stays open until the client or a reverse proxy times out.</p><p>Returning <code>false</code> synchronously immediately short-circuits the pipeline and Nest throws a <code>ForbiddenException</code> (403) on your behalf, which a filter can catch. A stuck promise is a silent failure mode, not an HTTP error &mdash; this is why guards doing async I/O (DB lookups, remote auth checks) need their own timeout/circuit-breaker logic rather than trusting Nest to bound the wait.</p>`,
  },
  {
    id: "a1-request-lifecycle-6",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `How do multiple guards on the same route combine — is it AND or OR logic, and can you mix global, controller, and method-level guards?`,
    answerHtml: `<p>It's <b>AND</b> logic: every applicable guard (global &rarr; controller &rarr; method, in that order) must return <code>true</code>, otherwise the request is denied as soon as one guard rejects (short-circuit, no point asking the rest).</p><p>There's no built-in OR composition. To express "allow if guard A OR guard B passes," you write a single guard that internally tries both conditions and combines them with <code>||</code> &mdash; Nest gives you composition of guards as a chain, not a boolean expression tree.</p>`,
  },
  {
    id: "a1-request-lifecycle-7",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `What's the difference between binding a guard with @UseGuards(AuthGuard) versus providing it via APP_GUARD in a module, beyond global vs. scoped application?`,
    answerHtml: `<p><code>@UseGuards()</code> instantiates the guard via the DI context of whichever module owns the controller it's applied to (or creates it directly if you pass a class and DI isn't needed) &mdash; it only runs for that route/controller.</p><p><code>APP_GUARD</code> registers the guard as a provider token in a module, making it apply <b>globally to every route in the application</b>, but critically it still participates in that module's DI graph &mdash; so it can inject other providers (e.g. a <code>JwtService</code> or <code>Reflector</code>) just like a normal provider, unlike <code>app.useGlobalGuards()</code> in <code>main.ts</code>, which runs outside the Nest DI container and can't easily inject scoped/request-scoped dependencies.</p>`,
  },
  {
    id: "a1-request-lifecycle-8",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `In NestInterceptor, what is the contract of the intercept(context, next) method, and what does next.handle() actually return?`,
    answerHtml: `<p><code>intercept(context: ExecutionContext, next: CallHandler)</code> must return an <code>Observable</code> (or a Promise resolving to one). Code written before calling <code>next.handle()</code> runs on the way <b>in</b> (before the route handler executes); <code>next.handle()</code> invokes the rest of the pipeline (remaining interceptors, then the handler) and returns an <code>Observable</code> that emits the handler's return value as its single emission.</p><p>Anything you <code>.pipe()</code> onto that Observable (<code>map</code>, <code>tap</code>, <code>catchError</code>, etc.) runs on the way <b>out</b>, after the handler resolves but before the response is serialized and sent.</p>`,
  },
  {
    id: "a1-request-lifecycle-9",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `Write an interceptor that wraps every successful response in { data, timestamp } using RxJS, and explain why map (not tap) is the right operator.`,
    answerHtml: `<pre><code>@Injectable()
class TransformInterceptor&lt;T&gt; implements NestInterceptor&lt;T, Wrapped&lt;T&gt;&gt; {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable&lt;Wrapped&lt;T&gt;&gt; {
    return next.handle().pipe(
      map(data =&gt; ({ data, timestamp: Date.now() })),
    );
  }
}</code></pre><p><code>map</code> transforms the emitted value and that transformed value becomes the new stream output sent to the client. <code>tap</code> only performs a side effect (logging, metrics) and passes the original value through unchanged &mdash; using <code>tap</code> here would log/observe the wrapping object but still send the raw handler result to the client, since <code>tap</code>'s callback return value is discarded.</p>`,
  },
  {
    id: "a1-request-lifecycle-10",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `How would an interceptor implement a response-level timeout that turns a slow handler into a 504, and what RxJS operator is essential?`,
    answerHtml: `<pre><code>intercept(ctx: ExecutionContext, next: CallHandler) {
  return next.handle().pipe(
    timeout(5000),
    catchError(err =&gt;
      err instanceof TimeoutError
        ? throwError(() =&gt; new RequestTimeoutException())
        : throwError(() =&gt; err),
    ),
  );
}</code></pre><p><code>timeout(5000)</code> unsubscribes from the source Observable and errors with RxJS's <code>TimeoutError</code> if no emission occurs in 5s. <code>catchError</code> is essential to translate that into a Nest-recognized exception &mdash; otherwise the raw <code>TimeoutError</code> propagates to the default exception filter as an unhandled 500 instead of a meaningful 504/408. Note this only bounds the <i>Observable</i> wait; it does not cancel an in-flight Promise-returning handler or its underlying DB call unless that work itself respects cancellation.</p>`,
  },
  {
    id: "a1-request-lifecycle-11",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `Why does a logging interceptor measuring request duration need to put its 'after' logic inside the RxJS pipe rather than after the synchronous call to next.handle()?`,
    answerHtml: `<p><code>next.handle()</code> returns immediately with a cold Observable &mdash; it does not block until the handler finishes. Code written synchronously right after the <code>next.handle()</code> call executes before the handler has actually run (often before it's even subscribed). To run logic when the handler genuinely completes, you must chain it onto the Observable itself, e.g. <code>next.handle().pipe(tap(() =&gt; logger.log(Date.now() - start)))</code>, so it executes when the stream emits/completes, not when the function call returns.</p>`,
  },
  {
    id: "a1-request-lifecycle-12",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `What happens if an interceptor's intercept() method throws synchronously before calling next.handle(), versus if the Observable returned by next.handle() errors?`,
    answerHtml: `<p>Both cases are caught by Nest's exception-handling layer and routed to the applicable exception filter &mdash; Nest wraps interceptor execution so a synchronous throw is converted into an errored Observable internally. The practical difference is timing: a synchronous throw before <code>next.handle()</code> means the route handler and any deeper interceptors/pipes never execute at all (similar to a guard rejecting). An error from the Observable itself means the handler (and inner interceptors) already ran; the error surfaced afterward, e.g. from a downstream interceptor's <code>map</code> callback throwing, or an upstream interceptor's <code>catchError</code> re-throwing.</p>`,
  },
  {
    id: "a1-request-lifecycle-13",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `Explain the transform(value, metadata) signature of PipeTransform and what ArgumentMetadata.type tells you that the value itself doesn't.`,
    answerHtml: `<p><code>transform(value: any, metadata: ArgumentMetadata)</code> must return the (possibly transformed) value or throw. <code>ArgumentMetadata</code> has <code>{ type, metatype, data }</code> where <code>type</code> is <code>'body' | 'query' | 'param' | 'custom'</code> &mdash; it tells the pipe <i>which part of the request</i> this value came from, which the raw value alone can't reveal (a string <code>"5"</code> looks the same whether it's a query param or a body field).</p><p><code>metatype</code> is the declared TypeScript type of the parameter (e.g. the DTO class), and <code>data</code> is the string passed to the decorator (e.g. <code>@Param('id')</code> &mdash; <code>data</code> would be <code>'id'</code>). A pipe can use <code>type</code> to behave differently for query vs. body validation, or skip transformation entirely for types it doesn't recognize.</p>`,
  },
  {
    id: "a1-request-lifecycle-14",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `Write a custom ParseIntPipe-equivalent from scratch, and explain why it must throw BadRequestException rather than returning NaN.`,
    answerHtml: `<pre><code>@Injectable()
class ParsePositiveIntPipe implements PipeTransform&lt;string, number&gt; {
  transform(value: string, metadata: ArgumentMetadata): number {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed &lt;= 0) {
      throw new BadRequestException(
        \\\`Validation failed: "\\\${value}" is not a positive integer\\\`,
      );
    }
    return parsed;
  }
}</code></pre><p>If it returned <code>NaN</code> instead, the handler would receive a value that's not a number in any usable sense, but no error would surface at the boundary &mdash; the bug would manifest deeper in business logic (e.g. a Prisma query with <code>where: { id: NaN }</code>), as a confusing downstream 500 or silent empty result, rather than a clear 400 at the edge where the actual input problem occurred. Pipes exist specifically to fail fast at the trust boundary.</p>`,
  },
  {
    id: "a1-request-lifecycle-15",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `When using ValidationPipe globally with a DTO class, why does the metatype check matter, and what happens for primitive parameter types like @Param('id') string?`,
    answerHtml: `<p><code>ValidationPipe</code> inspects <code>metadata.metatype</code> and skips validation (returns the value unchanged) for native JS types &mdash; <code>String</code>, <code>Boolean</code>, <code>Number</code>, <code>Array</code>, <code>Object</code> &mdash; because class-validator has no decorators to read off those constructors. This is why <code>@Param('id') id: string</code> passes through <code>ValidationPipe</code> untouched even with global validation enabled; you still need a <code>ParseIntPipe</code>/custom pipe for that param specifically.</p><p>The check exists so that plain primitives and DTOs without decorators don't cause the pipe to throw on an empty/no-op validation result &mdash; it explicitly looks up the constructor against a small set of built-ins rather than trying to validate everything.</p>`,
  },
  {
    id: "a1-request-lifecycle-16",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `Where does a parameter-scoped pipe (@Param('id', ParseIntPipe)) run relative to a method-scoped pipe (@UsePipes(ValidationPipe)) on the same handler?`,
    answerHtml: `<p>Pipes execute in this nesting order: <b>global</b> &rarr; <b>controller-scoped</b> (<code>@UsePipes</code> on the class) &rarr; <b>method-scoped</b> (<code>@UsePipes</code> on the handler) &rarr; <b>parameter-scoped</b> (inline in the decorator, e.g. <code>@Param('id', ParseIntPipe)</code>). Each pipe in the chain receives the output of the previous one for that same argument.</p><p>In practice this means a global <code>ValidationPipe</code> transforms/validates the whole body DTO first, while a parameter-scoped <code>ParseIntPipe</code> only ever touches its own single param value &mdash; they don't compete for the same argument unless explicitly stacked on it.</p>`,
  },
  {
    id: "a1-request-lifecycle-17",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `What's the difference between @Catch() with no arguments, @Catch(HttpException), and @Catch(HttpException, MyCustomException) on an exception filter?`,
    answerHtml: `<p><code>@Catch()</code> with no arguments catches <b>everything</b> &mdash; any thrown value, including non-Error objects and exceptions outside the <code>HttpException</code> hierarchy (e.g. a raw driver error from TypeORM/Prisma). This is the shape of Nest's own built-in global filter.</p><p><code>@Catch(HttpException)</code> scopes the filter to only exceptions that are instances of (or subclass) <code>HttpException</code>; anything else (a thrown plain <code>Error</code>, a database error) falls through to the next applicable filter or, if none, to Nest's default handler. <code>@Catch(A, B)</code> takes a variadic list and catches anything matching either type &mdash; useful for one filter handling a family of related custom exceptions without a shared base class.</p>`,
  },
  {
    id: "a1-request-lifecycle-18",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `Inside an ExceptionFilter's catch(exception, host) method, why must you call host.switchToHttp() instead of accessing request/response directly, and what would break under a different transport?`,
    answerHtml: `<p><code>ArgumentsHost</code> is transport-agnostic by design &mdash; the same filter class signature is used whether the app is HTTP, a microservice (RPC), or WebSockets. <code>switchToHttp()</code>/<code>switchToRpc()</code>/<code>switchToWs()</code> are the explicit "I know which transport this is" assertion that gives you the correctly-typed context object (<code>{ getRequest, getResponse }</code> for HTTP).</p><p>If you tried to read <code>host.getArgByIndex(0)</code> and assume it's an Express <code>Request</code>, the filter would break the moment it's reused on a hybrid app's microservice transport, where argument 0 might be the RPC payload, not a request object. The <code>switchToX()</code> calls keep filters portable and make the transport assumption explicit and type-checked.</p>`,
  },
  {
    id: "a1-request-lifecycle-19",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `If both a method-level exception filter and a global filter (registered via APP_FILTER) are bound, which one handles a thrown exception, and does the global one still run afterward?`,
    answerHtml: `<p>Nest resolves filters from most specific to least specific: <b>method-level &rarr; controller-level &rarr; global</b>. The first filter in that order whose <code>@Catch()</code> type matches the thrown exception handles it, and processing <b>stops there</b> &mdash; filters do not chain or fall through to broader-scoped filters once one has matched and run. (This is the opposite of how guards, pipes, and interceptors are resolved, where global runs first.)</p><p>So a method-level filter scoped to <code>@Catch(NotFoundException)</code> intercepts only <code>NotFoundException</code>s on that route; everything else (different exception types on that same route) skips it and falls to the next-broader filter that matches, which could be the <code>APP_FILTER</code>-registered global one. The global filter never runs <i>in addition to</i> a more specific filter that already handled the same exception.</p>`,
  },
  {
    id: "a1-request-lifecycle-20",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `Why does APP_FILTER (provided in a module) behave differently from app.useGlobalFilters() called in main.ts regarding dependency injection?`,
    answerHtml: `<p><code>app.useGlobalFilters(new MyFilter())</code> instantiates the filter manually, <b>outside</b> the Nest DI container &mdash; if the filter's constructor needs an injected provider (a logger service, a Sentry client wrapper, <code>ConfigService</code>), you must construct and wire those dependencies by hand.</p><p><code>APP_FILTER</code> registers the filter as a provider token within a module's providers array, so Nest instantiates it through normal DI, letting it declare constructor dependencies that resolve from that module's container like any other injectable. This is the same global-vs-DI tradeoff that applies to <code>APP_GUARD</code>/<code>APP_INTERCEPTOR</code>/<code>APP_PIPE</code> as well.</p>`,
  },
  {
    id: "a1-request-lifecycle-21",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `An async provider (useFactory returning a Promise, e.g. a database connection pool) is injected into a controller. At what point in the request lifecycle does Nest guarantee that async factory has resolved?`,
    answerHtml: `<p>Async providers resolve during <b>application bootstrap</b>, before <code>app.listen()</code> completes (or before the serverless handler is ready to accept its first invocation) &mdash; Nest awaits every async <code>useFactory</code> while building the dependency graph at startup, not per-request. By the time any HTTP request reaches a guard, interceptor, pipe, or handler, every injected provider (async or not) is fully resolved to its concrete instance.</p><p>The exception is <b>request-scoped</b> providers (<code>{ scope: Scope.REQUEST }</code>): those are instantiated fresh per request, and if their factory is async, that resolution happens during request handling, which can add latency to every request using that provider's subtree &mdash; this is the main place "async provider timing" actually matters operationally.</p>`,
  },
  {
    id: "a1-request-lifecycle-22",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `How does a request-scoped guard or interceptor (one injecting a REQUEST-scoped provider) change the performance characteristics compared to the default singleton scope?`,
    answerHtml: `<p>By default, guards/interceptors/pipes/filters are <b>singletons</b> &mdash; instantiated once at bootstrap and reused across all requests, so their constructor logic and any DI resolution happens exactly once. If one injects a request-scoped provider (directly, or transitively through another provider), Nest must mark that guard/interceptor itself request-scoped too (scope bubbles up the dependency graph), meaning it's <b>re-instantiated on every single request</b>.</p><p>This has a measurable cost under load: DI resolution, constructor execution, and any setup logic in that guard/interceptor now runs per-request instead of once. It's a common, easy-to-miss performance regression: injecting one request-scoped logger or tenant-context provider into a widely-used guard silently makes that guard request-scoped everywhere it's used.</p>`,
  },
  {
    id: "a1-request-lifecycle-23",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `Why is it a mistake to put response-shaping logic (e.g. stripping a password field) inside a Pipe instead of an Interceptor?`,
    answerHtml: `<p>Pipes operate on <b>incoming arguments</b> only &mdash; <code>PipeTransform.transform()</code> runs before the handler and has no access to what the handler eventually returns. There is no pipe phase that runs after the handler at all.</p><p>Interceptors are the only construct with a post-handler hook (via the Observable returned from <code>next.handle()</code>), which is why response serialization concerns &mdash; stripping fields, wrapping in an envelope, renaming keys &mdash; belong in an interceptor's <code>map()</code>, not a pipe. Trying to do it in a pipe is a category error: the pipe would need a return value to transform, but it only ever sees request input.</p>`,
  },
  {
    id: "a1-request-lifecycle-24",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `Describe a scenario where catchError inside an interceptor's pipe could accidentally suppress an exception filter from ever running for that route.`,
    answerHtml: `<pre><code>next.handle().pipe(
  catchError(err =&gt; of({ ok: false, error: err.message })), // bug
)</code></pre><p>If <code>catchError</code>'s callback returns a new Observable (via <code>of(...)</code>) instead of re-throwing (<code>throwError(() =&gt; err)</code>), the error is fully <b>swallowed</b> &mdash; the stream completes successfully with the fallback value as its emission. From Nest's perspective this looks like a normal 200 response, so no exception filter ever runs, status codes set by <code>HttpException</code>s are lost, and the client gets a 200 with an error-shaped body instead of the intended 4xx/5xx. The fix is always to re-throw (or selectively re-throw for error types you don't want to handle) inside <code>catchError</code> unless suppression is genuinely the intent.</p>`,
  },
];

export const ADVANCED1_QUIZ: QuizQuestion[] = [
  {
    id: "a1q-request-lifecycle-1",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `Given a route with one guard, one interceptor, and one pipe (on a single param), in what order do they first touch the request on the way in?`,
    options: [`Pipe, then guard, then interceptor's pre-handler code`, `Guard, then interceptor's pre-handler code, then pipe`, `Interceptor's pre-handler code, then guard, then pipe`, `Guard and interceptor run concurrently, then pipe`],
    answer: 1,
    explanationHtml: `<p>The inbound order is <b>guard &rarr; interceptor (code before <code>next.handle()</code>) &rarr; pipe &rarr; handler</b>. Guards gate access first using cheap, minimal context; only once a guard passes does Nest enter the interceptor's pre-handler phase, and the pipe transforms the specific argument right before the handler body actually executes.</p>`,
  },
  {
    id: "a1q-request-lifecycle-2",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `A guard injects a request-scoped provider. What is the direct consequence for that guard's instantiation behavior?`,
    options: [`Nothing changes — guards are always singletons regardless of their dependencies`, `The guard itself becomes request-scoped and is re-instantiated on every request`, `Nest throws a startup error because guards cannot depend on request-scoped providers`, `The guard is cached per-user instead of per-request`],
    answer: 1,
    explanationHtml: `<p>Scope bubbles up the dependency graph: any provider (including a guard, interceptor, or pipe) that directly or transitively depends on a request-scoped provider is itself promoted to request scope, meaning Nest constructs a new instance for every incoming request rather than reusing a singleton from bootstrap.</p>`,
  },
  {
    id: "a1q-request-lifecycle-3",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `Inside an interceptor, why does logic placed immediately after the synchronous call to next.handle() (but not inside a .pipe() operator) fail to run 'after the handler completes' as intended?`,
    options: [`next.handle() blocks synchronously, so the placement is actually correct`, `next.handle() returns an Observable immediately without waiting for the handler to finish, so code after the call runs before completion`, `Interceptors cannot access next.handle()'s return value at all`, `next.handle() always throws if called outside a pipe operator`],
    answer: 1,
    explanationHtml: `<p><code>next.handle()</code> returns a cold <code>Observable</code> right away; it doesn't block. Code that should run once the handler resolves must be chained via <code>.pipe(tap(...))</code> or similar so it executes on emission/completion of the stream, not immediately after the synchronous function call returns.</p>`,
  },
  {
    id: "a1q-request-lifecycle-4",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `Why does ValidationPipe skip validation for a handler parameter typed as a plain string (e.g. @Param('id') id: string)?`,
    options: [`Strings are exempt from class-validator by a special decorator Nest adds automatically`, `The metatype for native JS types like String has no class-validator decorators to read, so the pipe treats it as a no-op`, `ValidationPipe only runs on @Body(), never on @Param()`, `It's a known bug that Nest has not fixed`],
    answer: 1,
    explanationHtml: `<p><code>ValidationPipe</code> checks <code>ArgumentMetadata.metatype</code> against a small set of native constructors (<code>String</code>, <code>Boolean</code>, <code>Number</code>, <code>Array</code>, <code>Object</code>) and passes the value through unchanged for those, since there are no class-validator decorators to inspect on a primitive. It applies equally to params, query, and body — the skip is about the type, not the decorator used.</p>`,
  },
  {
    id: "a1q-request-lifecycle-5",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `An exception filter is declared with @Catch(HttpException) and registered globally via APP_FILTER. A service throws a raw \`new Error('db down')\` that is not wrapped in an HttpException. What happens?`,
    options: [`The filter catches it because @Catch() always catches everything regardless of its argument`, `The error bypasses this filter (type doesn't match) and falls through to Nest's built-in default exception handler, which returns a generic 500`, `Nest throws a compile-time error because the thrown type doesn't match @Catch's generic`, `The request hangs because no filter matches`],
    answer: 1,
    explanationHtml: `<p><code>@Catch(HttpException)</code> only intercepts exceptions that are instances of <code>HttpException</code> (or its subclasses). A raw <code>Error</code> doesn't match, so it's not handled by this filter; it falls through to whatever broader filter exists, or to Nest's built-in default exception filter, which logs it and responds with a generic <code>500 Internal Server Error</code>.</p>`,
  },
  {
    id: "a1q-request-lifecycle-6",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `Which statement correctly distinguishes how multiple guards versus multiple exception filters are evaluated for a single request?`,
    options: [`Both guards and filters run all matching instances and merge their results`, `Guards all run and must all return true (AND logic); filters stop at the first matching one in most-to-least-specific order`, `Filters all run and must all return true; guards stop at the first matching one`, `Both guards and filters stop at the first one registered, regardless of specificity`],
    answer: 1,
    explanationHtml: `<p>Guards compose with AND semantics — global, then controller, then method-level guards all must pass (short-circuiting on the first <code>false</code>). Exception filters are resolved by specificity — method-level, then controller-level, then global — and the search stops at the first filter whose <code>@Catch()</code> type matches the thrown exception; it does not also run broader-scoped filters afterward.</p>`,
  },
  {
    id: "a1q-request-lifecycle-7",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: `Why is \`catchError(err => of(fallbackValue))\` inside an interceptor's RxJS pipe potentially dangerous for error handling?`,
    options: [`It causes a memory leak by keeping the Observable subscription open forever`, `It silently converts the error into a successful emission, so the request returns 200 with no exception filter ever invoked`, `RxJS does not allow catchError inside Nest interceptors`, `It causes the interceptor to run twice`],
    answer: 1,
    explanationHtml: `<p>Returning a new Observable (instead of re-throwing with <code>throwError(() => err)</code>) from <code>catchError</code> makes the stream complete normally with that fallback value as the result. Nest sees a successful completion, not an error, so it serializes a 200 response and no exception filter — and none of the status-code/error-shape semantics from the original exception — ever come into play.</p>`,
  },
];
