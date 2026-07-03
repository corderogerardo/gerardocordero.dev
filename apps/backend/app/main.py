from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from .config import settings
from .db import engine, run_migrations
from .routers import assistant, auth, bookings, live, payments, pets, waitlist, walkers
from .seed import seed_demo_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_migrations()
    with Session(engine) as session:
        seed_demo_data(session)
    yield


app = FastAPI(title=settings.app_name, version=settings.version, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(walkers.router)
app.include_router(bookings.router)
app.include_router(pets.router)
app.include_router(payments.router)
app.include_router(assistant.router)
app.include_router(live.router)
app.include_router(waitlist.router)


@app.get("/")
def root() -> dict:
    return {"name": settings.app_name, "version": settings.version}
