from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from ..db import get_session
from ..models_db import UserTable
from ..schemas import AuthResponse, LoginRequest, SignupRequest, User
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def _email_taken_response() -> JSONResponse:
    return JSONResponse(
        status_code=409,
        content={"code": "email_taken", "detail": "Email already registered"},
    )


@router.post("/signup", response_model=AuthResponse, status_code=201)
def signup(
    req: SignupRequest, session: Session = Depends(get_session)
) -> AuthResponse | JSONResponse:
    existing = session.exec(select(UserTable).where(UserTable.email == req.email)).first()
    if existing is not None:
        return _email_taken_response()

    row = UserTable(
        id=f"usr_{uuid4().hex[:12]}",
        email=req.email,
        name=req.name,
        password_hash=hash_password(req.password),
        role=req.role,
        created_at=datetime.now(timezone.utc),
    )
    session.add(row)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        existing = session.exec(select(UserTable).where(UserTable.email == req.email)).first()
        if existing is not None:
            return _email_taken_response()
        raise
    session.refresh(row)

    user = User.model_validate(row, from_attributes=True)
    return AuthResponse(access_token=create_access_token(row.id), user=user)


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, session: Session = Depends(get_session)) -> AuthResponse:
    row = session.exec(select(UserTable).where(UserTable.email == req.email)).first()
    if row is None or not verify_password(req.password, row.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = User.model_validate(row, from_attributes=True)
    return AuthResponse(access_token=create_access_token(row.id), user=user)
