window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "auth-jwt",
  title: "Authentication with JWT",
  emoji: "🔐",
  lang: "ts",
  lessons: [
    {
      id: "password-hashing",
      title: "Password hashing: never store the plaintext",
      steps: [
        {
          type: "text",
          md: [
            "## PawWalk needs accounts — and one rule dominates",
            "A walker signs up with an email and a password, then logs back in later. The tempting shortcut is to save that password in the `User` row exactly as typed. **Never do this.** The moment your database leaks — a stray backup, a logged query, a bad `SELECT` — every plaintext password is out, and people reuse passwords across every site they touch.",
            "The rule every backend obeys: **you never store the password, you store a one-way hash of it.** A hash is a fingerprint you can compute forwards but never run backwards to recover the input. At login you hash what the user typed and compare fingerprints. Even you, running the server, must be unable to read a user's password back.",
            "> The senior pitch: `Plaintext passwords aren't a bug you fix later — they're a breach you already shipped. The database is assumed hostile; hashing is what makes a leak survivable.`",
          ],
        },
        {
          type: "text",
          md: [
            "## Why not SHA-256? Because it's fast",
            "General-purpose hashes like SHA-256 are the *wrong* tool for passwords, for one reason: they're **fast**. An attacker who steals your hashes runs billions of guesses a second on a GPU, hashing each and checking for a match. You want the opposite — a function that is **deliberately slow** and **salted** so two users with the same password get different hashes.",
            "Two things a password hash must have:",
            "- **A salt** — random bytes mixed in per password, so identical passwords never share a hash and precomputed 'rainbow table' attacks die. Modern algorithms generate and embed the salt for you.\n- **A work factor** — a tunable cost that makes each hash take a measurable fraction of a second. Trivial for one honest login; ruinous across millions of guesses. OWASP's floor is a work factor of at least 10; raise it as your hardware allows.",
            "The 2026 pecking order: OWASP now lists **Argon2id as the first choice** for new apps (it resists GPU *and* memory-hard attacks), with **bcrypt acceptable** for existing systems (cost 12 is a common default now). One bcrypt gotcha to name in an interview: it silently truncates input at **72 bytes**, so a very long passphrase past that adds no security. Argon2id has no such limit — another reason it leads.",
            "> Guidance evolves. This is the 2026 recommendation; at interview time, confirm the current OWASP Password Storage Cheat Sheet rather than quoting a number from memory. `Knowing the guidance can change is itself a senior signal.`",
          ],
        },
        {
          type: "code",
          title: "src/auth/password.service.ts",
          source: String.raw`import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";

@Injectable()
export class PasswordService {
  // argon2's default type is already argon2id; we pass it explicitly
  // so the choice is visible in code review.
  hash(plain: string): Promise<string> {
    return argon2.hash(plain, { type: argon2.argon2id });
  }

  verify(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }
}`,
          caption: "argon2.hash generates a salt, applies argon2id, and returns a self-describing string (algorithm, parameters, salt, and hash all encoded in it) — you store that one column. argon2.verify re-derives everything from the stored string and compares in constant time. You never compare hashes yourself with ===.",
        },
        {
          type: "text",
          md: [
            "## Read the two calls closely",
            "- **`argon2.hash(plain, { type: argon2.argon2id })`** — returns a `Promise<string>`. The result already contains the algorithm, work factors, and the salt, so a single database column holds everything `verify` will need later. No separate salt column.\n- **`argon2.verify(storedHash, plain)`** — returns a `Promise<boolean>`. It reads the parameters out of the stored hash, re-hashes the candidate, and compares. `true` means the password matched.",
            "Both are `async` — hashing is *meant* to take time, so it must never block Node's event loop (module 02). `await` them. And notice `verify` does the comparison for you: never pull the hash apart and compare with `===`, that leaks timing and misses the salt.",
          ],
        },
        {
          type: "quiz",
          q: "Why is Argon2id (or bcrypt) preferred over a fast hash like SHA-256 for storing passwords?",
          choices: [
            "It is deliberately slow and salted, which cripples brute-force guessing against a stolen database",
            "It produces shorter hashes that save database space",
            "It can be reversed to recover the original password when support needs it",
            "It is the only hash function available in Node",
          ],
          answer: 0,
          explain: "The slowness is the feature: one honest login barely notices, but an attacker testing billions of guesses against leaked hashes is throttled to a crawl. The built-in per-user salt means identical passwords never share a hash, killing rainbow-table attacks. A hash you could reverse would defeat the entire purpose.",
          nudge: "Think about what an attacker with your leaked hashes wants to do, and which two properties get in their way.",
        },
        {
          type: "exercise",
          title: "Hash a signup password",
          prompt: [
            "A new walker is registering. Inside `hash`, return `argon2.hash(plain, { type: argon2.argon2id })`. The method is already `async` and typed to return `Promise<string>`; the argon2 import is in place.",
          ],
          starter: String.raw`import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";

@Injectable()
export class PasswordService {
  async hash(plain: string): Promise<string> {
    // your code here
  }
}`,
          solution: String.raw`import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";

@Injectable()
export class PasswordService {
  async hash(plain: string): Promise<string> {
    return await argon2.hash(plain, { type: argon2.argon2id });
  }
}`,
          checks: [
            { re: /return await argon2\.hash\(plain,/, hint: "Await the async hash and return it: `return await argon2.hash(plain, ...)`." },
            { re: /argon2\.hash\(plain,\{type:argon2\.argon2id\}\)/, hint: "Pass the plaintext and pin the variant: `argon2.hash(plain, { type: argon2.argon2id })`." },
          ],
          mustNot: [
            { re: /return plain/, hint: "Never store or return the raw password — hash it first." },
            { re: /sha256/, hint: "Use Argon2id for passwords, not a fast general-purpose hash like SHA-256." },
          ],
          success: "That's the password.service.ts you'll ship. Every stored 'password' is now an un-reversible, salted argon2id hash — a leak becomes survivable.",
        },
      ],
    },
    {
      id: "issuing-jwts",
      title: "Register, log in, and issue a JWT",
      steps: [
        {
          type: "text",
          md: [
            "## Hashing proves identity once. Now keep it.",
            "Hashing answers *are you who you say you are* — but only at the instant of login. HTTP is **stateless**: the next request (list my bookings, start a walk) is a fresh connection that knows nothing about the login a second ago. Something has to ride along on every request saying *I'm the walker who just authenticated*.",
            "That something is a **token**. On successful login the server mints one and hands it back; the client attaches it to every later request. The standard way to make a token trustworthy *without a database lookup on every call* is a **JWT** — a JSON Web Token.",
          ],
        },
        {
          type: "text",
          md: [
            "## What a JWT is, and the claims that matter",
            "A JWT is three base64 chunks joined by dots: `header.payload.signature`. The **payload** is JSON — a bag of **claims**. The **signature** is the point: the server signs header+payload with a secret only it holds. Anyone can *read* a JWT (it is signed, not encrypted), but nobody can forge or tamper with one without the secret. When the token returns later, the server re-checks the signature and trusts the claims — no session table.",
            "The claims you set for PawWalk:",
            "- **`sub`** — the *subject*, i.e. the user id the token is about.\n- **`exp`** — the expiry. Keep the **access token short-lived: 15 minutes or less.** A stolen token is only dangerous until it expires, so a tight window is your cheapest defense. (Long-lived *refresh* tokens are the next lesson.)",
            "> Because the payload is readable by anyone, `never put a secret in a claim`. A user id and an expiry are fine; a password or a card number is a leak.",
          ],
        },
        {
          type: "code",
          title: "src/auth/auth.module.ts",
          source: String.raw`import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { PasswordService } from "./password.service";

@Module({
  imports: [
    JwtModule.register({
      // Read the secret from the environment, never a literal in source.
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "15m", algorithm: "HS256" },
    }),
  ],
  providers: [AuthService, PasswordService],
})
export class AuthModule {}`,
          caption: "JwtModule.register wires @nestjs/jwt's JwtService into DI so AuthService can inject it. The secret comes from process.env.JWT_SECRET (set it in your env, keep it out of git). signOptions bakes in the 15-minute expiry and pins the algorithm to HS256 up front.",
        },
        {
          type: "code",
          title: "src/auth/auth.service.ts",
          source: String.raw`import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { PasswordService } from "./password.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly passwords: PasswordService,
  ) {}

  async register(email: string, password: string) {
    const hash = await this.passwords.hash(password);
    const user = await this.prisma.user.create({ data: { email, password: hash } });
    return this.issueAccessToken(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Same rejection whether the email is unknown or the password is wrong,
    // so an attacker can't probe which emails exist (user enumeration).
    if (!user || !(await this.passwords.verify(user.password, password))) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return this.issueAccessToken(user.id, user.email);
  }

  issueAccessToken(sub: string, email: string) {
    return this.jwt.signAsync({ sub, email }, { expiresIn: "15m" });
  }
}`,
          caption: "register reuses the Prisma walkers layer from module 08 (here the User model) — it hashes, stores, and returns a token. login verifies against the stored hash. Both funnel through issueAccessToken so there's exactly one place that mints tokens. Note the identical error on wrong-user and wrong-password.",
        },
        {
          type: "text",
          md: [
            "## Verify with `jwt.verify`, not `jwt.decode` — and pin the algorithm",
            "When a token comes back, resist the urge to just *read* it. `jwt.decode` unpacks the claims **without checking the signature** — it will happily hand you the payload of a token an attacker forged. Only `jwt.verify` (what `JwtService.verifyAsync` and the Passport strategy call under the hood) checks the signature against your secret and the `exp`. Decode is for debugging; verify is for trust.",
            "And always **pin the algorithm**. If you accept whatever `alg` the token's header claims, an attacker can send `alg: none` (no signature) or downgrade you, and a naive verifier waves it through. Stating `algorithm: \"HS256\"` up front — as `JwtModule` did — means anything else is rejected.",
            "> Red flag in a security round: `we decode the JWT and read the user id`. Decoding trusts the attacker. Say `verify, with the algorithm pinned` and you've shown you know where the forgery gets in.",
          ],
        },
        {
          type: "text",
          md: [
            "## Where the token lives on the client — httpOnly cookies, not localStorage",
            "It's tempting to return the JWT as JSON and let the web app stash it in `localStorage`. Don't. Anything in `localStorage` is readable by JavaScript, so a single XSS bug hands your attacker every logged-in user's token. Instead, set it as a cookie the browser attaches automatically but scripts can't touch:",
            "```ts\nres.cookie(\"access_token\", token, {\n  httpOnly: true,   // JS can't read it — survives XSS\n  secure: true,     // HTTPS only\n  sameSite: \"strict\", // not sent cross-site — blunts CSRF\n});\n```",
            "`httpOnly` keeps it out of `document.cookie`, `secure` keeps it off plain HTTP, and `sameSite: \"strict\"` stops it riding along on cross-site requests. In a NestJS controller you reach the response with `@Res({ passthrough: true }) res: Response`. (Native mobile clients like the iOS course's `APIClient` don't have `localStorage`; they store the token in the Keychain and send `Authorization: Bearer <token>` instead.)",
          ],
        },
        {
          type: "quiz",
          q: "Why should a PawWalk access token expire in 15 minutes rather than, say, 7 days?",
          choices: [
            "A stolen token is only usable until it expires, so a short window limits the damage of a leak",
            "The JWT signature is only valid for 15 minutes regardless of exp",
            "Longer expiries make the token string too large to send in a header",
            "Nest refuses to sign tokens with an expiry over one hour",
          ],
          answer: 0,
          explain: "The access token is a bearer credential — whoever holds it is treated as the user. If it leaks (XSS, a logged header, a shared machine), a 15-minute window caps the blast radius, whereas a 7-day token is a week of unauthorized access. You keep sessions long-lived instead with a separate, revocable refresh token — the next lesson.",
          nudge: "Assume the token will eventually leak. What does a short lifetime cost the attacker?",
        },
        {
          type: "exercise",
          title: "Mint a short-lived access token",
          prompt: [
            "Finish `issueAccessToken`. Return `this.jwt.signAsync(...)` with the payload `{ sub, email }` and options `{ expiresIn: \"15m\" }` so the access token is short-lived.",
          ],
          starter: String.raw`@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  issueAccessToken(sub: string, email: string) {
    // your code here
  }
}`,
          solution: String.raw`@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  issueAccessToken(sub: string, email: string) {
    return this.jwt.signAsync({ sub, email }, { expiresIn: "15m" });
  }
}`,
          checks: [
            { re: /return this\.jwt\.signAsync\(\{sub,email\}/, hint: "Sign the claims: `return this.jwt.signAsync({ sub, email }, ...)`." },
            { re: /\{expiresIn:"15m"\}/, hint: "Keep the access token short-lived: pass `{ expiresIn: \"15m\" }` as the second argument." },
          ],
          mustNot: [
            { re: /expiresIn:"\d+d"/, hint: "An access token measured in days defeats the point — keep it to minutes and use a refresh token for long sessions." },
            { re: /"password":/, hint: "Never put a password in the claims — the JWT payload is readable by anyone." },
          ],
          success: "Login and register can now return this signed, self-expiring token. Next: the guard that turns it back into a trusted user on every protected request.",
        },
      ],
    },
    {
      id: "guarding-routes",
      title: "Guard routes with a Passport JWT strategy",
      steps: [
        {
          type: "text",
          md: [
            "## One guard for every protected route",
            "The client now sends `Authorization: Bearer <token>` on each request. You *could* re-verify the token inside every controller method — but that's exactly what a **guard** exists to prevent. In Nest, a guard runs before the handler, decides whether the request may proceed, and either lets it through or throws `401`. Protect a route (or a whole controller) with `@UseGuards(...)`; leave login and signup unguarded.",
            "Nest leans on **Passport**, the standard Node auth toolkit, for the token-checking half. You write a tiny **strategy** that says how to extract and verify the JWT, and a one-line **guard** that activates it. Install the pieces once: `@nestjs/passport`, `passport`, `passport-jwt`.",
          ],
        },
        {
          type: "code",
          title: "src/auth/jwt.strategy.ts",
          source: String.raw`import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      algorithms: ["HS256"],
    });
  }

  validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}`,
          caption: "The super() options are the verification rules: pull the token from the Bearer header, honor exp (ignoreExpiration: false), verify against the secret, and pin the algorithm to HS256 so alg:none is rejected. passport-jwt verifies the signature for you — by the time validate runs, the token is already proven authentic.",
        },
        {
          type: "text",
          md: [
            "## `validate()` — the payload becomes `req.user`",
            "Once the signature checks out, Passport calls your `validate(payload)` with the decoded claims. **Whatever you return becomes `req.user`** on the request, available to every guarded handler. Keep it lean — the id and whatever the routes actually need. You can look the user up in the database here if you need fresh data (roles, is-banned), but for a stateless check the claims are enough.",
            "Returning a falsy value (or throwing) from `validate` is how you reject a token that verified but shouldn't be honored — a deleted user, a revoked account. That's your hook for authorization on top of authentication.",
          ],
        },
        {
          type: "exercise",
          title: "Write the strategy's validate()",
          prompt: [
            "The signature is already verified by the time `validate` runs. Return the shape you want as `req.user`: an object with `userId` set to `payload.sub` and `email` set to `payload.email`.",
          ],
          starter: String.raw`@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  validate(payload: JwtPayload) {
    // your code here
  }
}`,
          solution: String.raw`@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}`,
          checks: [
            { re: /return\{userId:payload\.sub/, hint: "Return an object: `return { userId: payload.sub, ... }` — this becomes req.user." },
            { re: /email:payload\.email\}/, hint: "Include the email from the claims: `email: payload.email`." },
          ],
          mustNot: [
            { re: /return payload\.password/, hint: "There's no password in the payload, and req.user should never carry one — return the id and email." },
          ],
          success: "That return value is now req.user in every guarded handler. Downstream code reads req.user.userId to know which walker is asking — no re-parsing, no globals.",
        },
        {
          type: "code",
          title: "src/auth/jwt-auth.guard.ts",
          source: String.raw`import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}`,
          caption: "The whole guard. AuthGuard(\"jwt\") ties into the strategy above (its default name is \"jwt\"). Applied to a route, it runs the strategy: valid token -> validate() -> req.user is set and the handler runs; missing or invalid -> 401 before the handler is ever called.",
        },
        {
          type: "text",
          md: [
            "## `@UseGuards` — protect a controller or a single route",
            "`@UseGuards(JwtAuthGuard)` on a **method** protects that one route. On the **class**, it protects every route in the controller. For PawWalk, bookings and walks are all private, so the guard goes on the whole `BookingsController` — one decorator, every route covered:",
            "```ts\n@UseGuards(JwtAuthGuard)\n@Controller(\"bookings\")\nexport class BookingsController {\n  @Get() findAll(@Req() req) { return this.bookings.forUser(req.user.userId); }\n}\n```",
            "> The senior framing: `authentication is a cross-cutting concern, so it lives in a guard, not sprinkled through handlers`. One guard, applied declaratively, is auditable — you can see at a glance which routes are protected.",
          ],
        },
        {
          type: "quiz",
          q: "You put `@UseGuards(JwtAuthGuard)` on the `BookingsController` class. A request with no `Authorization` header hits `GET /bookings`. What happens?",
          choices: [
            "The guard rejects it with 401 before findAll runs — the handler is never called",
            "findAll runs, but req.user is undefined so it returns an empty list",
            "Nest calls validate() with an empty payload and continues",
            "Only the first route in the controller is protected; the rest run",
          ],
          answer: 0,
          explain: "A class-level @UseGuards protects every route in the controller. With no valid Bearer token the JwtAuthGuard throws 401 and short-circuits — the handler never executes, so there's no chance to accidentally serve data to an unauthenticated caller. That fail-closed behavior is exactly why the check belongs in a guard.",
          nudge: "A guard runs before the handler and decides whether the handler runs at all.",
        },
        {
          type: "exercise",
          title: "Protect the bookings controller",
          prompt: [
            "Bookings are private. Add `@UseGuards(JwtAuthGuard)` directly above `@Controller(\"bookings\")` so every route in the class is guarded. Both imports are already in place.",
          ],
          starter: String.raw`import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("bookings")
export class BookingsController {
  @Get()
  findAll() {
    return "my bookings";
  }
}`,
          solution: String.raw`import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("bookings")
export class BookingsController {
  @Get()
  findAll() {
    return "my bookings";
  }
}`,
          checks: [
            { re: /@UseGuards\(JwtAuthGuard\)/, hint: "Apply the guard with `@UseGuards(JwtAuthGuard)`." },
            { re: /@UseGuards\(JwtAuthGuard\)@Controller\("bookings"\)/, hint: "Put it directly above `@Controller(\"bookings\")` so it wraps the whole class." },
          ],
          mustNot: [
            { re: /@UseGuards\(\)/, hint: "Pass the guard class into the decorator: `@UseGuards(JwtAuthGuard)`, not an empty `@UseGuards()`." },
          ],
          success: "Every route on BookingsController now demands a valid token. That's authentication enforced declaratively — the whole reason Nest has guards.",
        },
      ],
    },
    {
      id: "refresh-rotation",
      title: "Refresh tokens and rotation",
      steps: [
        {
          type: "text",
          md: [
            "## The 15-minute problem",
            "You made the access token expire in 15 minutes — great for security, annoying for users, who'd have to log in every quarter hour. The fix is a **second token**: a long-lived **refresh token** (days or weeks) whose *only* job is to mint fresh access tokens. The access token is used constantly and dies fast; the refresh token is used rarely — only when the access token expires — and is guarded far more carefully.",
            "The flow: login returns both. The client uses the access token until it expires, then sends the refresh token to `POST /auth/refresh` and gets a new access token back. The user never sees a login screen for weeks.",
          ],
        },
        {
          type: "text",
          md: [
            "## Rotation: how you detect a stolen refresh token",
            "A long-lived token is a fat target, so add **rotation**: every time a refresh token is used, you **invalidate it and issue a brand-new one**. A refresh token is single-use.",
            "Why this is clever: store a hash of the current refresh token per user. When one comes in, check it against the stored hash. If it matches, rotate — replace the stored hash, hand back a new pair. If a token comes in that *doesn't* match the stored one, that means an **old, already-rotated token was replayed** — the signature of theft. Someone copied the token, the real user (or the thief) already spent it, and now the other party is presenting the stale copy. Your move: **invalidate the whole chain**, forcing a fresh login. A stolen refresh token thus works at most until the legitimate user next refreshes.",
            "> The interview line: `rotation turns a stolen refresh token from a silent, permanent backdoor into a detectable, self-limiting event — reuse of a spent token is the alarm.`",
          ],
        },
        {
          type: "code",
          title: "src/auth/auth.service.ts (refresh)",
          source: String.raw`import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class AuthService {
  // ...prisma, jwt, passwords injected as before

  async refresh(userId: string, presented: string) {
    const stored = await this.prisma.refreshToken.findUnique({ where: { userId } });
    // No stored token, or the presented one doesn't match the current hash ->
    // this is a replay of a spent token. Kill the chain.
    if (!stored || !(await this.passwords.verify(stored.hash, presented))) {
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
      throw new UnauthorizedException("Refresh token reuse detected");
    }
    // Match: rotate. Store a hash of the new one, return a fresh pair.
    const next = await this.issueRefreshToken(userId);
    return {
      accessToken: await this.issueAccessToken(userId, stored.email),
      refreshToken: next,
    };
  }
}`,
          caption: "The refresh token is stored HASHED (same argon2 as passwords) — a database leak must not hand out live sessions. verify compares the presented token against the stored hash; a mismatch means a spent token was replayed, so deleteMany wipes the chain and everyone re-logs in. On a match, issueRefreshToken rotates it.",
        },
        {
          type: "text",
          md: [
            "## Store the refresh token in an httpOnly cookie too",
            "Everything from the access-token lesson applies double here: a refresh token is *more* powerful (it regenerates sessions), so it must live in an `httpOnly`, `Secure`, `SameSite=Strict` cookie, **never** `localStorage`. Scope its cookie `path` to `/auth/refresh` so it's only ever sent to the one endpoint that needs it, shrinking its exposure.",
            "Put together, the module is the whole authentication story: hash at signup, verify at login, mint a short-lived access JWT plus a rotating refresh token, guard every private route with the Passport strategy, and detect theft through reuse. That's production-grade auth — not a toy.",
          ],
        },
        {
          type: "quiz",
          q: "With refresh-token rotation, what does it mean when a refresh token arrives that doesn't match the hash currently stored for that user?",
          choices: [
            "An already-spent token was replayed — a theft signal — so you invalidate the whole chain and force re-login",
            "The user simply mistyped their password and should try again",
            "The access token expired normally and everything is fine",
            "The server's JWT secret was rotated and all tokens are now invalid",
          ],
          answer: 0,
          explain: "Because each use rotates the token, the stored hash always reflects the single most recent one. A non-matching token is therefore an old copy being replayed — which only happens if a token was stolen and one party already used it. Treating that reuse as an alarm (wipe the chain, force login) is what turns a silent compromise into a detectable, self-limiting one.",
          nudge: "Rotation makes each refresh token single-use. So what does presenting an out-of-date one imply?",
        },
        {
          type: "exercise",
          title: "Reject a replayed refresh token",
          prompt: [
            "Write the theft check inside `refresh`. If there's no `stored` token, or `argon2.verify(stored.hash, presented)` is false, throw `new UnauthorizedException(\"Refresh reuse detected\")`. (Assume `argon2` is imported.)",
          ],
          starter: String.raw`async refresh(userId: string, presented: string) {
  const stored = await this.prisma.refreshToken.findUnique({ where: { userId } });
  // your code here
  return this.issueTokens(userId, stored.email);
}`,
          solution: String.raw`async refresh(userId: string, presented: string) {
  const stored = await this.prisma.refreshToken.findUnique({ where: { userId } });
  if (!stored || !(await argon2.verify(stored.hash, presented))) {
    throw new UnauthorizedException("Refresh reuse detected");
  }
  return this.issueTokens(userId, stored.email);
}`,
          checks: [
            { re: /if\(!stored\|\|!\(await argon2\.verify\(stored\.hash,presented\)\)\)/, hint: "Guard both cases: `if (!stored || !(await argon2.verify(stored.hash, presented)))`." },
            { re: /throw new UnauthorizedException\(/, hint: "Reject a mismatch by throwing `new UnauthorizedException(...)`." },
          ],
          mustNot: [
            { re: /stored\.hash==presented/, hint: "Never compare a hash to the raw token with ==. Use `argon2.verify(stored.hash, presented)`." },
            { re: /stored\.hash===presented/, hint: "Never compare a hash to the raw token with ===. Use `argon2.verify(stored.hash, presented)`." },
          ],
          success: "That guard is the alarm: a spent refresh token that comes back around is caught, and the caller (your controller) wipes the chain. You've now built the full auth stack — hashing, JWTs, guards, and rotation.",
        },
      ],
    },
  ],
});
