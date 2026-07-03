from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db import get_session
from ..models_db import UserTable
from ..schemas import AuthResponse, LoginRequest, SignupRequest, User
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=201)
def signup(req: SignupRequest, session: Session = Depends(get_session)) -> AuthResponse:
    existing = session.exec(select(UserTable).where(UserTable.email == req.email)).first()
    if existing is not None:
        raise HTTPException(status_code=409, detail="Email already registered")

    row = UserTable(
        id=f"usr_{uuid4().hex[:12]}",
        email=req.email,
        name=req.name,
        password_hash=hash_password(req.password),
        role=req.role,
        created_at=datetime.now(timezone.utc),
    )
    session.add(row)
    session.commit()
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
