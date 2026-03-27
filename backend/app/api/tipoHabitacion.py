from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.tipoHabitacion import TipoHabitacion
from app.schemas.tipoHabitacion import (
    TipoHabitacionCreate,
    TipoHabitacionUpdate,
    TipoHabitacionResponse
)

router = APIRouter(prefix="/tipo-habitaciones", tags=["Tipo Habitaciones"])

DBSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("/", response_model=TipoHabitacionResponse, status_code=status.HTTP_201_CREATED)
async def create_tipo_habitacion(db: DBSession, tipo: TipoHabitacionCreate):
    db_tipo = TipoHabitacion(**tipo.model_dump())
    db.add(db_tipo)
    await db.commit()
    await db.refresh(db_tipo)
    return db_tipo


@router.get("/", response_model=List[TipoHabitacionResponse])
async def get_tipos_habitacion(db: DBSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(TipoHabitacion).offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{tipo_id}", response_model=TipoHabitacionResponse)
async def get_tipo_habitacion(db: DBSession, tipo_id: int):
    result = await db.execute(select(TipoHabitacion).where(TipoHabitacion.id == tipo_id))
    tipo = result.scalar_one_or_none()
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de habitación no encontrado")
    return tipo


@router.put("/{tipo_id}", response_model=TipoHabitacionResponse)
async def update_tipo_habitacion(db: DBSession, tipo_id: int, tipo: TipoHabitacionUpdate):
    result = await db.execute(select(TipoHabitacion).where(TipoHabitacion.id == tipo_id))
    db_tipo = result.scalar_one_or_none()
    if not db_tipo:
        raise HTTPException(status_code=404, detail="Tipo de habitación no encontrado")

    update_data = tipo.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_tipo, key, value)

    await db.commit()
    await db.refresh(db_tipo)
    return db_tipo


@router.delete("/{tipo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tipo_habitacion(db: DBSession, tipo_id: int):
    result = await db.execute(select(TipoHabitacion).where(TipoHabitacion.id == tipo_id))
    db_tipo = result.scalar_one_or_none()
    if not db_tipo:
        raise HTTPException(status_code=404, detail="Tipo de habitación no encontrado")

    await db.delete(db_tipo)
    await db.commit()
