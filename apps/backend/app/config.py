from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="PAWWALK_", env_file=".env", extra="ignore")

    app_name: str = "PawWalk API"
    version: str = "0.1.0"

    database_url: str = "sqlite:///./pawwalk.db"

    # No default on purpose: a real deployment must set PAWWALK_JWT_SECRET or
    # startup fails loudly. Local/dev gets a value from compose.yaml instead.
    jwt_secret: str
    jwt_alg: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7

    llm_model: str | None = None
    stripe_secret_key: str | None = None
    # ponytail: lessons quote settings.has_stripe / settings.stripe_webhook_secret
    # (module 27) but never show the field declarations — smallest reconciling
    # addition, recorded in README "Deviations from the course".
    stripe_webhook_secret: str | None = None

    cors_origins: list[str] = ["*"]

    @property
    def has_llm(self) -> bool:
        return bool(self.llm_model)

    @property
    def has_stripe(self) -> bool:
        return bool(self.stripe_secret_key)


settings = Settings()
