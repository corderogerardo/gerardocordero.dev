from uuid import uuid4

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..db import get_session
from ..deps import get_current_owner
from ..models_db import PetTable
from ..schemas import CreatePetRequest, Pet, User

router = APIRouter(prefix="/pets", tags=["pets"])


@router.get("", response_model=list[Pet])
def list_my_pets(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_owner),
) -> list[Pet]:
    rows = session.exec(select(PetTable).where(PetTable.owner_id == current_user.id)).all()
    return [Pet.model_validate(row, from_attributes=True) for row in rows]


@router.post("", response_model=Pet, status_code=201)
def create_pet(
    req: CreatePetRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_owner),
) -> Pet:
    row = PetTable(id=f"pet_{uuid4().hex[:12]}", owner_id=current_user.id, **req.model_dump())
    session.add(row)
    session.commit()
    session.refresh(row)
    return Pet.model_validate(row, from_attributes=True)
