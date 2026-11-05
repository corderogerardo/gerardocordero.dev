//! Short-lived, stateless access tokens (HS256). Refresh tokens are opaque and
//! live in the database — see the auth handlers — so this module owns only the
//! access-token contract.

use std::{collections::HashSet, time::Duration};

use chrono::{DateTime, Utc};
use jsonwebtoken::{Algorithm, DecodingKey, EncodingKey, Header, Validation, decode, encode};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::AuthError;

const TOKEN_TYPE: &str = "access";
const CLOCK_LEEWAY_SECONDS: u64 = 5;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: i64,
    pub iat: i64,
    pub jti: String,
    pub typ: String,
}

#[derive(Debug, Clone)]
pub struct IssuedToken {
    pub token: String,
    pub expires_in: u64,
}

pub struct TokenIssuer {
    encoding: EncodingKey,
    decoding: DecodingKey,
    validation: Validation,
    ttl: Duration,
}

impl TokenIssuer {
    pub fn new(secret: &str, ttl: Duration) -> Self {
        let mut validation = Validation::new(Algorithm::HS256);
        validation.validate_exp = true;
        validation.leeway = CLOCK_LEEWAY_SECONDS;
        validation.required_spec_claims = HashSet::from(["exp".to_string()]);

        Self {
            encoding: EncodingKey::from_secret(secret.as_bytes()),
            decoding: DecodingKey::from_secret(secret.as_bytes()),
            validation,
            ttl,
        }
    }

    pub fn issue(&self, user_id: Uuid, now: DateTime<Utc>) -> Result<IssuedToken, AuthError> {
        let claims = Claims {
            sub: user_id.to_string(),
            exp: now.timestamp() + self.ttl.as_secs() as i64,
            iat: now.timestamp(),
            jti: Uuid::new_v4().to_string(),
            typ: TOKEN_TYPE.to_string(),
        };

        let token = encode(&Header::new(Algorithm::HS256), &claims, &self.encoding)
            .map_err(|_| AuthError::Signing)?;

        Ok(IssuedToken {
            token,
            expires_in: self.ttl.as_secs(),
        })
    }

    pub fn verify(&self, token: &str) -> Result<Uuid, AuthError> {
        let data = decode::<Claims>(token, &self.decoding, &self.validation)
            .map_err(|_| AuthError::InvalidToken)?;

        if data.claims.typ != TOKEN_TYPE {
            return Err(AuthError::InvalidToken);
        }

        Uuid::parse_str(&data.claims.sub).map_err(|_| AuthError::InvalidToken)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const SECRET: &str = "a-test-secret-long-enough-for-hs256!!";

    fn issuer() -> TokenIssuer {
        TokenIssuer::new(SECRET, Duration::from_secs(900))
    }

    #[test]
    fn issues_and_verifies_an_access_token() {
        let user_id = Uuid::new_v4();
        let issued = issuer().issue(user_id, Utc::now()).expect("issued");

        assert_eq!(issued.expires_in, 900);
        assert_eq!(issuer().verify(&issued.token).expect("verified"), user_id);
    }

    #[test]
    fn rejects_expired_tokens() {
        let issued = issuer()
            .issue(
                Uuid::new_v4(),
                Utc::now() - chrono::Duration::seconds(1_000),
            )
            .expect("issued");

        assert_eq!(issuer().verify(&issued.token), Err(AuthError::InvalidToken));
    }

    #[test]
    fn rejects_tokens_signed_with_another_secret() {
        let issued = TokenIssuer::new(
            "another-secret-long-enough-for-hs256!!!",
            Duration::from_secs(900),
        )
        .issue(Uuid::new_v4(), Utc::now())
        .expect("issued");

        assert_eq!(issuer().verify(&issued.token), Err(AuthError::InvalidToken));
    }

    #[test]
    fn rejects_a_tampered_payload() {
        let issued = issuer().issue(Uuid::new_v4(), Utc::now()).expect("issued");
        let mut parts: Vec<&str> = issued.token.split('.').collect();
        let forged_payload = jsonwebtoken::encode(
            &Header::new(Algorithm::HS256),
            &Claims {
                sub: Uuid::new_v4().to_string(),
                exp: Utc::now().timestamp() + 900,
                iat: Utc::now().timestamp(),
                jti: "forged".to_string(),
                typ: "access".to_string(),
            },
            &EncodingKey::from_secret(b"wrong-secret"),
        )
        .expect("encoded");
        parts[1] = forged_payload.split('.').nth(1).expect("payload");

        let forged = parts.join(".");

        assert_eq!(issuer().verify(&forged), Err(AuthError::InvalidToken));
    }

    #[test]
    fn rejects_tokens_of_another_type() {
        let claims = Claims {
            sub: Uuid::new_v4().to_string(),
            exp: Utc::now().timestamp() + 900,
            iat: Utc::now().timestamp(),
            jti: Uuid::new_v4().to_string(),
            typ: "refresh".to_string(),
        };
        let token = encode(
            &Header::new(Algorithm::HS256),
            &claims,
            &EncodingKey::from_secret(SECRET.as_bytes()),
        )
        .expect("encoded");

        assert_eq!(issuer().verify(&token), Err(AuthError::InvalidToken));
    }

    #[test]
    fn rejects_another_algorithm() {
        let claims = Claims {
            sub: Uuid::new_v4().to_string(),
            exp: Utc::now().timestamp() + 900,
            iat: Utc::now().timestamp(),
            jti: Uuid::new_v4().to_string(),
            typ: "access".to_string(),
        };
        let token = encode(
            &Header::new(Algorithm::HS384),
            &claims,
            &EncodingKey::from_secret(SECRET.as_bytes()),
        )
        .expect("encoded");

        assert_eq!(issuer().verify(&token), Err(AuthError::InvalidToken));
    }

    #[test]
    fn rejects_garbage() {
        assert_eq!(issuer().verify("not.a.jwt"), Err(AuthError::InvalidToken));
        assert_eq!(issuer().verify(""), Err(AuthError::InvalidToken));
    }
}
