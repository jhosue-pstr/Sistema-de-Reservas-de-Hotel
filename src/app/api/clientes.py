from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.app.db.database import get_db
from src.app.models.cliente import Cliente
from src.app.schemas.cliente import (
    ClienteCreate,
    ClienteUpdate,
    ClienteResponse
)

router = APIRouter(prefix="/clientes", tags=["Clientes"])

DBSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("/",responses={400:{"description":"email ya registrado"}}, response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
async def create_cliente(db: DBSession, cliente: ClienteCreate):
    result = await db.execute(select(Cliente).where(Cliente.email == cliente.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    db_cliente = Cliente(**cliente.model_dump())
    db.add(db_cliente)
    await db.commit()
    await db.refresh(db_cliente)
    return db_cliente


@router.get("/", response_model=List[ClienteResponse])
async def get_clientes(db: DBSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Cliente).offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{cliente_id}", responses={404: {"description": "cliente no encontrada"}},response_model=ClienteResponse)
async def get_cliente(db: DBSession, cliente_id: int):
    result = await db.execute(select(Cliente).where(Cliente.id == cliente_id))
    cliente = result.scalar_one_or_none()
    if not cliente:
        raise HTTPException(status_code=404, detail="cliente no encontrado")
    return cliente


@router.put("/{cliente_id}",responses={404: {"description": "cliente no encontrada"}}, response_model=ClienteResponse)
async def update_cliente(db: DBSession, cliente_id: int, cliente: ClienteUpdate):
    result = await db.execute(select(Cliente).where(Cliente.id == cliente_id))
    db_cliente = result.scalar_one_or_none()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="cliente no encontrado")

    update_data = cliente.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_cliente, key, value)

    await db.commit()
    await db.refresh(db_cliente)
    return db_cliente


@router.delete("/{cliente_id}", responses={404: {"description": "cliente no encontrada"}} ,status_code=status.HTTP_204_NO_CONTENT)
async def delete_cliente(db: DBSession, cliente_id: int):
    result = await db.execute(select(Cliente).where(Cliente.id == cliente_id))
    db_cliente = result.scalar_one_or_none()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    await db.delete(db_cliente)
    await db.commit()
