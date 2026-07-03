from uuid import uuid4

from fastapi import APIRouter, Depends, Response, status
from sqlmodel import Session, select

from ..db import get_session
from ..models_db import WaitlistTable
from ..schemas import WaitlistRequest

router = APIRouter(prefix="/waitlist", tags=["waitlist"])


@router.post("")
def join_waitlist(
    req: WaitlistRequest,
    response: Response,
    session: Session = Depends(get_session),
) -> dict:
    email = req.email.lower()
    existing = session.exec(select(WaitlistTable).where(WaitlistTable.email == email)).first()
    if existing is not None:
        response.status_code = status.HTTP_200_OK
        return {"status": "ok"}

    session.add(WaitlistTable(id=f"wl_{uuid4().hex[:12]}", email=email))
    session.commit()
    response.status_code = status.HTTP_201_CREATED
    return {"status": "ok"}
