window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "rust-auth",
  title: "Auth: passwords & JWT",
  emoji: "🔐",
  lang: "rust",
  lessons: [
    {
      id: "passwords",
      title: "Hashing passwords",
      steps: [
        {
          type: "text",
          md: [
            "## Never store a password. Store a hash, slowly.",
            "A password hash must be **deliberately slow** so that an attacker with the database can't brute-force it. `argon2` is the current recommendation: memory-hard, tunable, and the winner of the Password Hashing Competition.",
            "Three rules that aren't negotiable:",
            "- **Unique salt per password** — generated for you by `SaltString::generate`.\n- **A slow, memory-hard algorithm** — argon2id, not SHA-256.\n- **Never log the password or the hash.**",
            "> **Pitch line:** if your `users` table can be leaked without your users' passwords being cracked, you did this right.",
          ],
        },
        {
          type: "code",
          title: "src/auth/password.rs",
          source: String.raw`use argon2::password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString};
use argon2::Argon2;

pub fn hash(password: &str) -> Result<String, argon2::password_hash::Error> {
    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default()
        .hash_password(password.as_bytes(), &salt)?
        .to_string();
    Ok(hash)
}

pub fn verify(password: &str, stored: &str) -> bool {
    let parsed = match PasswordHash::new(stored) {
        Ok(parsed) => parsed,
        Err(_) => return false,
    };
    Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok()
}`,
          caption: "The stored string carries the algorithm, parameters and salt — that's why `verify` only needs the hash and the attempt. Upgrading parameters later still verifies old hashes.",
        },
        {
          type: "quiz",
          q: "Why must every password get its own salt?",
          choices: [
            "So identical passwords produce different hashes, defeating precomputed tables and cross-user comparison",
            "To make hashing faster",
            "Because argon2 requires it to compile",
            "To encrypt the hash",
          ],
          answer: 0,
          explain: "Without a salt, two users with the same password have the same hash — crack one, you've cracked both, and rainbow tables work. The salt is stored alongside (it's not secret); it just guarantees uniqueness.",
          nudge: "What does an attacker learn from two identical hashes?",
        },
        {
          type: "text",
          md: [
            "## Compare in constant time",
            "For tokens, comparing with `==` leaks timing information. Use a constant-time comparison (`subtle::ConstantTimeEq`, or the verifier from your crypto crate). For argon2 the library handles it — but if you ever compare a raw secret, remember this.",
            "**Red flag:** `if user.password == input` anywhere in the codebase. That's a plaintext comparison and almost certainly a leak.",
          ],
        },
        {
          type: "exercise",
          title: "Hash the password",
          prompt: [
            "Implement `hash`: generate a salt, hash the password with argon2, return the encoded string.",
            "Use `SaltString::generate(&mut OsRng)` and `Argon2::default().hash_password(...)`.",
          ],
          starter: String.raw`use argon2::password_hash::{rand_core::OsRng, SaltString};
use argon2::{Argon2, PasswordHasher};

pub fn hash(password: &str) -> Result<String, argon2::password_hash::Error> {
    // your code here
}`,
          solution: String.raw`use argon2::password_hash::{rand_core::OsRng, SaltString};
use argon2::{Argon2, PasswordHasher};

pub fn hash(password: &str) -> Result<String, argon2::password_hash::Error> {
    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default()
        .hash_password(password.as_bytes(), &salt)?
        .to_string();
    Ok(hash)
}`,
          checks: [
            { re: /SaltString::generate\(&mut OsRng\)/, hint: "Generate a fresh salt: `SaltString::generate(&mut OsRng)`." },
            { re: /Argon2::default\(\)/, hint: "Use the default argon2id parameters: `Argon2::default()`." },
            { re: /hash_password\(password\.as_bytes\(\),&salt\)/, hint: "Hash the bytes with the salt: `.hash_password(password.as_bytes(), &salt)?`." },
          ],
          success: "Encoded hash with algorithm, parameters and salt in one string. That's what goes in the users table.",
        },
      ],
    },
    {
      id: "jwt",
      title: "Issuing & verifying JWTs",
      steps: [
        {
          type: "text",
          md: [
            "## A JWT is a signed claim, not a session",
            "A JSON Web Token carries claims (`sub`, `exp`, `role`) and a signature. The server verifies the signature on each request and trusts the payload without a database lookup.",
            "That's the trade: **stateless and fast**, but you cannot revoke a token before it expires. That's why access tokens live minutes and refresh tokens live days.",
            "- **`sub`** — the user id.\n- **`exp`** — expiry, in seconds since the epoch. Always set it.\n- **`iat`** — issued at, useful for debugging.",
          ],
        },
        {
          type: "code",
          title: "src/auth/jwt.rs",
          source: String.raw`use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}

pub fn issue(secret: &[u8], sub: &str, exp: usize) -> Result<String, jsonwebtoken::errors::Error> {
    let claims = Claims { sub: sub.to_string(), exp };
    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret))
}

pub fn verify(secret: &[u8], token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let validation = Validation::default();
    let data = decode::<Claims>(token, &DecodingKey::from_secret(secret), &validation)?;
    Ok(data.claims)
}`,
          caption: "`Validation::default()` checks the signature and `exp` for you. Never decode with validation disabled — that accepts anything.",
        },
        {
          type: "quiz",
          q: "What does `Validation::default()` verify?",
          choices: [
            "The signature algorithm, the signature, and the expiry (among other claims)",
            "Only that the token is valid base64",
            "That the user exists in the database",
            "Nothing — you must verify manually",
          ],
          answer: 0,
          explain: "It verifies the algorithm matches an allowed one, the signature is correct for the key, and `exp` (if present) hasn't passed. It does **not** check that the user still exists — that's your handler's job.",
          nudge: "The token is signed. What does that prove?",
        },
        {
          type: "text",
          md: [
            "## Secrets are configuration, never constants",
            "The signing key comes from the environment, has at least 32 bytes of entropy, and rotates on a schedule. A hard-coded secret in a repo is a full authentication bypass for anyone who reads the repo.",
            "**Production note:** use an asymmetric algorithm (`RS256`/`ES256`) when another service must verify your tokens — it can then hold only the public key. Shared-secret `HS256` is fine when one service both issues and verifies.",
          ],
        },
        {
          type: "exercise",
          title: "Sign the claims",
          prompt: [
            "Implement `issue`: build the claims and sign them with the secret.",
            "Use `encode(&Header::default(), &claims, &EncodingKey::from_secret(secret))`.",
          ],
          starter: String.raw`use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}

pub fn issue(secret: &[u8], sub: &str, exp: usize) -> Result<String, jsonwebtoken::errors::Error> {
    // your code here
}`,
          solution: String.raw`use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}

pub fn issue(secret: &[u8], sub: &str, exp: usize) -> Result<String, jsonwebtoken::errors::Error> {
    let claims = Claims { sub: sub.to_string(), exp };
    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret))
}`,
          checks: [
            { re: /let claims=Claims\{sub:sub\.to_string\(\),exp\}/, hint: "Build the claims: `let claims = Claims { sub: sub.to_string(), exp };`." },
            { re: /encode\(&Header::default\(\),&claims,&EncodingKey::from_secret\(secret\)\)/, hint: "Sign with `encode(&Header::default(), &claims, &EncodingKey::from_secret(secret))`." },
          ],
          success: "That's a signed, expiring token. The client carries it; the server verifies it without a session table.",
        },
      ],
    },
    {
      id: "middleware",
      title: "The auth boundary",
      steps: [
        {
          type: "text",
          md: [
            "## One place that answers who you are",
            "In Axum, the clean way to authenticate is an **extractor**: a type whose `FromRequestParts` implementation reads the `Authorization` header, verifies the token, and yields either a `CurrentUser` or a 401.",
            "```",
            "async fn me(user: CurrentUser) -> Json<Me> {",
            "    Json(Me { id: user.id })",
            "}",
            "```",
            "The handler never parses a header. If it takes `CurrentUser`, it is authenticated — by construction. If it doesn't, it's public. That's the entire policy, visible in signatures.",
          ],
        },
        {
          type: "code",
          title: "src/auth/middleware.rs",
          source: String.raw`pub struct CurrentUser {
    pub id: u64,
}

pub fn bearer_token(header: &str) -> Option<&str> {
    header.strip_prefix("Bearer ")
}

impl<S> axum::extract::FromRequestParts<S> for CurrentUser
where
    S: Send + Sync,
{
    type Rejection = (axum::http::StatusCode, &'static str);

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        _state: &S,
    ) -> Result<Self, Self::Rejection> {
        let header = parts
            .headers
            .get(axum::http::header::AUTHORIZATION)
            .and_then(|value| value.to_str().ok())
            .ok_or((axum::http::StatusCode::UNAUTHORIZED, "missing authorization header"))?;

        let token = bearer_token(header)
            .ok_or((axum::http::StatusCode::UNAUTHORIZED, "expected Bearer scheme"))?;

        // verify(token) -> Claims, then map to CurrentUser
        let _ = token;
        Ok(CurrentUser { id: 0 })
    }
}`,
          caption: "The rejection type is a response: `(StatusCode, &str)` implements `IntoResponse`, so a failed extraction becomes a 401 automatically.",
        },
        {
          type: "quiz",
          q: "What is the advantage of an extractor over checking the header inside each handler?",
          choices: [
            "Authentication becomes a type: a handler that takes `CurrentUser` cannot forget to check",
            "It is faster",
            "It avoids async",
            "It removes the need for a token",
          ],
          answer: 0,
          explain: "The check happens once, before the handler body runs. Forgetting it is impossible because the type is required to compile. That's the same \"make illegal states unrepresentable\" rule, applied to authorization.",
          nudge: "What does the signature prove when it compiles?",
        },
        {
          type: "text",
          md: [
            "## Authorization is a second question",
            "Authentication answers *who*; authorization answers *whether*. Keep them separate: the extractor yields `CurrentUser`, then the handler or a policy function decides if that user may touch this walker or booking.",
            "**Red flag:** ownership checks scattered across handlers (`if booking.walker_id != user.id { … }`). Extract them into one policy module, or you will miss one — and the one you miss is the vulnerability.",
          ],
        },
        {
          type: "exercise",
          title: "Extract the bearer token",
          prompt: [
            "Implement `bearer_token`: return the token part of an `Authorization: Bearer <token>` header, or `None`.",
            "Use `strip_prefix` — it does the check and the slice in one step.",
          ],
          starter: String.raw`pub fn bearer_token(header: &str) -> Option<&str> {
    // your code here
}`,
          solution: String.raw`pub fn bearer_token(header: &str) -> Option<&str> {
    header.strip_prefix("Bearer ")
}`,
          checks: [
            { re: /strip_prefix\("Bearer"\)/, hint: "`strip_prefix(\"Bearer \")` returns `Some(rest)` only when the prefix matches." },
          ],
          success: "No allocation, no panic, and the scheme check and extraction are the same operation.",
        },
      ],
    },
  ],
});
