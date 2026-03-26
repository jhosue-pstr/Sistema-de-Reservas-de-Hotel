from datetime import date
from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload
from src.app.db.database import get_db
from src.app.models.habitacion import Habitacion
from src.app.models.reserva import Reserva
from src.app.schemas.habitacion import (
    HabitacionCreate,
    HabitacionUpdate,
    HabitacionResponse,
    HabitacionDisponibilidadResponse
)

router = APIRouter(prefix="/habitaciones", tags=["Habitaciones"])

DBSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("/", response_model=HabitacionResponse, status_code=status.HTTP_201_CREATED)
async def create_habitacion(db: DBSession, habitacion: HabitacionCreate):
    db_habitacion = Habitacion(**habitacion.model_dump())
    db.add(db_habitacion)
    await db.commit()
    await db.refresh(db_habitacion)
    
    result = await db.execute(
        select(Habitacion)
        .options(selectinload(Habitacion.tipo_habitacion))
        .where(Habitacion.id == db_habitacion.id)
    )
    return result.scalar_one()


@router.get("/", response_model=List[HabitacionResponse])
async def get_habitaciones(db: DBSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Habitacion)
        .options(selectinload(Habitacion.tipo_habitacion))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/disponibles",responses={400: {"description": "La fecha de salida debe ser posterior a la fecha de entrada"}}, response_model=List[HabitacionDisponibilidadResponse])
async def buscar_disponibles(
    db: DBSession,
    fecha_entrada: date = Query(..., description="Fecha de entrada"),
    fecha_salida: date = Query(..., description="Fecha de salida")
):
    if fecha_salida <= fecha_entrada:
        raise HTTPException(
            status_code=400,
            detail="La fecha de salida debe ser posterior a la fecha de entrada"
        )
    
    todas_habitaciones = await db.execute(
        select(Habitacion)
        .options(selectinload(Habitacion.tipo_habitacion))
    )
    habitaciones = todas_habitaciones.scalars().all()
    
    reservas_conflictivas = await db.execute(
        select(Reserva.habitacion_id).where(
            and_(
                or_(
                    and_(Reserva.fecha_entrada <= fecha_entrada, Reserva.fecha_salida > fecha_entrada),
                    and_(Reserva.fecha_entrada < fecha_salida, Reserva.fecha_salida >= fecha_salida),
                    and_(Reserva.fecha_entrada >= fecha_entrada, Reserva.fecha_salida <= fecha_salida)
                ),
                Reserva.estado != "cancelada"
            )
        )
    )
    habitaciones_ocupadas = {r[0] for r in reservas_conflictivas.fetchall()}
    
    resultado = []
    for h in habitaciones:
        resultado.append({
            "habitacion": h,
            "disponible": h.id not in habitaciones_ocupadas
        })
    
    return resultado


@router.get("/ocupacion", response_model=dict)
async def mostrar_ocupacion(db: DBSession):
    total_habitaciones = await db.execute(select(func.count(Habitacion.id)))
    total = total_habitaciones.scalar()
    
    ocupadas = await db.execute(
        select(func.count(Habitacion.id)).where(Habitacion.ocupado == True)
    )
    count_ocupadas = ocupadas.scalar()
    
    reservas_activas = await db.execute(
        select(func.count(Reserva.id)).where(Reserva.estado.in_(["reservada", "check-in"]))
    )
    count_reservas = reservas_activas.scalar()
    
    return {
        "total_habitaciones": total,
        "habitaciones_ocupadas": count_ocupadas,
        "habitaciones_disponibles": total - count_ocupadas,
        "reservas_activas": count_reservas,
        "porcentaje_ocupacion": round((count_ocupadas / total * 100) if total > 0 else 0, 2)
    }


@router.get("/{habitacion_id}",responses={404: {"description": "Habitación no encontrada"}} )
async def get_habitacion(db: DBSession, habitacion_id: int):
    result = await db.execute(
        select(Habitacion)
        .options(selectinload(Habitacion.tipo_habitacion))
        .where(Habitacion.id == habitacion_id)
    )
    habitacion = result.scalar_one_or_none()
    if not habitacion:
        raise HTTPException(status_code=404, detail="habitacion no encontrada")
    return habitacion


@router.put("/{habitacion_id}", responses={404: {"description": "Habitación no encontrada"}} )
async def update_habitacion(db: DBSession, habitacion_id: int, habitacion: HabitacionUpdate):
    result = await db.execute(
        select(Habitacion)
        .options(selectinload(Habitacion.tipo_habitacion))
        .where(Habitacion.id == habitacion_id)
    )
    db_habitacion = result.scalar_one_or_none()
    if not db_habitacion:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")

    update_data = habitacion.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_habitacion, key, value)

    await db.commit()
    await db.refresh(db_habitacion)
    return db_habitacion


@router.delete("/{habitacion_id}", responses={404: {"description": "Habitación no encontrada"}} ,status_code=status.HTTP_204_NO_CONTENT)
async def delete_habitacion(db: DBSession, habitacion_id: int):
    result = await db.execute(select(Habitacion).where(Habitacion.id == habitacion_id))
    db_habitacion = result.scalar_one_or_none()
    if not db_habitacion:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")

    await db.delete(db_habitacion)
    await db.commit()
