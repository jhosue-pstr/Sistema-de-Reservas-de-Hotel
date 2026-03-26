from datetime import date, datetime
from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from src.app.db.database import get_db
from src.app.models.reserva import Reserva
from src.app.models.habitacion import Habitacion
from src.app.models.factura import Factura
from src.app.schemas.reserva import (
    ReservaCreate,
    ReservaUpdate,
    ReservaResponse,
    ReservaDisponibilidad
)

router = APIRouter(prefix="/reservas", tags=["Reservas"])

DBSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("/", response_model=ReservaResponse, status_code=status.HTTP_201_CREATED)
async def create_reserva(db: DBSession, reserva: ReservaCreate):
    fecha_entrada = reserva.fecha_entrada
    fecha_salida = reserva.fecha_salida
    
    if fecha_salida <= fecha_entrada:
        raise HTTPException(
            status_code=400,
            detail="La fecha de salida debe ser posterior a la fecha de entrada"
        )
    
    result_habitacion = await db.execute(
        select(Habitacion)
        .options(selectinload(Habitacion.tipo_habitacion))
        .where(Habitacion.id == reserva.habitacion_id)
    )
    habitacion = result_habitacion.scalar_one_or_none()
    if not habitacion:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")
    
    reservas_conflictivas = await db.execute(
        select(Reserva).where(
            and_(
                Reserva.habitacion_id == reserva.habitacion_id,
                or_(
                    and_(Reserva.fecha_entrada <= fecha_entrada, Reserva.fecha_salida > fecha_entrada),
                    and_(Reserva.fecha_entrada < fecha_salida, Reserva.fecha_salida >= fecha_salida),
                    and_(Reserva.fecha_entrada >= fecha_entrada, Reserva.fecha_salida <= fecha_salida)
                )
            )
        )
    )
    if reservas_conflictivas.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="La habitación no está disponible para las fechas solicitadas"
        )
    
    db_reserva = Reserva(**reserva.model_dump())
    db.add(db_reserva)
    await db.commit()
    await db.refresh(db_reserva)
    
    habitacion.ocupado = True
    await db.commit()
    
    num_noches = (fecha_salida - fecha_entrada).days
    precio_total = num_noches * habitacion.tipo_habitacion.precio_dia
    
    db_factura = Factura(
        reserva_id=db_reserva.id,
        total=precio_total,
        estado="pendiente"
    )
    db.add(db_factura)
    await db.commit()
    
    result = await db.execute(
        select(Reserva)
        .options(selectinload(Reserva.cliente), selectinload(Reserva.habitacion).selectinload(Habitacion.tipo_habitacion))
        .where(Reserva.id == db_reserva.id)
    )
    return result.scalar_one()


@router.get("/", response_model=List[ReservaResponse])
async def get_reservas(db: DBSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Reserva)
        .options(selectinload(Reserva.cliente), selectinload(Reserva.habitacion).selectinload(Habitacion.tipo_habitacion))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/{reserva_id}", response_model=ReservaResponse)
async def get_reserva(db: DBSession, reserva_id: int):
    result = await db.execute(
        select(Reserva)
        .options(selectinload(Reserva.cliente), selectinload(Reserva.habitacion).selectinload(Habitacion.tipo_habitacion))
        .where(Reserva.id == reserva_id)
    )
    reserva = result.scalar_one_or_none()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return reserva


@router.put("/{reserva_id}", response_model=ReservaResponse)
async def update_reserva(db: DBSession, reserva_id: int, reserva: ReservaUpdate):
    result = await db.execute(
        select(Reserva)
        .options(selectinload(Reserva.cliente), selectinload(Reserva.habitacion).selectinload(Habitacion.tipo_habitacion))
        .where(Reserva.id == reserva_id)
    )
    db_reserva = result.scalar_one_or_none()
    if not db_reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    update_data = reserva.model_dump(exclude_unset=True)
    
    if 'fecha_entrada' in update_data and 'fecha_salida' in update_data:
        if update_data['fecha_salida'] <= update_data['fecha_entrada']:
            raise HTTPException(
                status_code=400,
                detail="La fecha de salida debe ser posterior a la fecha de entrada"
            )
    
    for key, value in update_data.items():
        setattr(db_reserva, key, value)

    await db.commit()
    await db.refresh(db_reserva)
    return db_reserva


@router.delete("/{reserva_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reserva(db: DBSession, reserva_id: int):
    result = await db.execute(
        select(Reserva)
        .options(selectinload(Reserva.habitacion))
        .where(Reserva.id == reserva_id)
    )
    db_reserva = result.scalar_one_or_none()
    if not db_reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    habitacion = db_reserva.habitacion
    habitacion.ocupado = False
    
    await db.delete(db_reserva)
    await db.commit()


@router.post("/{reserva_id}/check-in", response_model=ReservaResponse)
async def check_in(db: DBSession, reserva_id: int):
    result = await db.execute(
        select(Reserva)
        .options(selectinload(Reserva.cliente), selectinload(Reserva.habitacion).selectinload(Habitacion.tipo_habitacion))
        .where(Reserva.id == reserva_id)
    )
    reserva = result.scalar_one_or_none()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    if hasattr(reserva, 'estado') and reserva.estado == "check-in":
        raise HTTPException(status_code=400, detail="Ya se realizó el check-in")
    
    reserva.estado = "check-in"
    reserva.habitacion.ocupado = True
    await db.commit()
    await db.refresh(reserva)
    
    return reserva


@router.post("/{reserva_id}/check-out", response_model=ReservaResponse)
async def check_out(db: DBSession, reserva_id: int):
    result = await db.execute(
        select(Reserva)
        .options(selectinload(Reserva.cliente), selectinload(Reserva.habitacion).selectinload(Habitacion.tipo_habitacion))
        .where(Reserva.id == reserva_id)
    )
    reserva = result.scalar_one_or_none()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    if hasattr(reserva, 'estado') and reserva.estado == "check-out":
        raise HTTPException(status_code=400, detail="Ya se realizó el check-out")
    
    reserva.estado = "check-out"
    reserva.habitacion.ocupado = False
    await db.commit()
    await db.refresh(reserva)
    
    return reserva
