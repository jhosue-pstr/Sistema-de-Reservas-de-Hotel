from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.app.db.database import get_db
from src.app.models.factura import Factura
from src.app.schemas.factura import (
    FacturaCreate,
    FacturaUpdate,
    FacturaResponse
)

router = APIRouter(prefix="/facturas", tags=["Facturas"])

DBSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("/", response_model=FacturaResponse, status_code=status.HTTP_201_CREATED)
async def create_factura(db: DBSession, factura: FacturaCreate):
    db_factura = Factura(**factura.model_dump())
    db.add(db_factura)
    await db.commit()
    await db.refresh(db_factura)
    
    result = await db.execute(
        select(Factura)
        .options(selectinload(Factura.reserva))
        .where(Factura.id == db_factura.id)
    )
    return result.scalar_one()


@router.get("/", response_model=List[FacturaResponse])
async def get_facturas(db: DBSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Factura)
        .options(selectinload(Factura.reserva))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/{factura_id}", response_model=FacturaResponse)
async def get_factura(db: DBSession, factura_id: int):
    result = await db.execute(
        select(Factura)
        .options(selectinload(Factura.reserva))
        .where(Factura.id == factura_id)
    )
    factura = result.scalar_one_or_none()
    if not factura:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
    return factura


@router.put("/{factura_id}", response_model=FacturaResponse)
async def update_factura(db: DBSession, factura_id: int, factura: FacturaUpdate):
    result = await db.execute(
        select(Factura)
        .options(selectinload(Factura.reserva))
        .where(Factura.id == factura_id)
    )
    db_factura = result.scalar_one_or_none()
    if not db_factura:
        raise HTTPException(status_code=404, detail="Factura no encontrada")

    update_data = factura.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_factura, key, value)

    await db.commit()
    await db.refresh(db_factura)
    return db_factura


@router.delete("/{factura_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_factura(db: DBSession, factura_id: int):
    result = await db.execute(select(Factura).where(Factura.id == factura_id))
    db_factura = result.scalar_one_or_none()
    if not db_factura:
        raise HTTPException(status_code=404, detail="Factura no encontrada")

    await db.delete(db_factura)
    await db.commit()
