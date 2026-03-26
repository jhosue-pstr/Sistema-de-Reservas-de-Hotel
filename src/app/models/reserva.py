from sqlalchemy import Column, Integer, String, Date, Time, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.app.db.database import Base


class Reserva(Base):
    __tablename__ = "reservas"

    id = Column(Integer, primary_key=True, index=True)
    habitacion_id = Column(Integer, ForeignKey("habitaciones.id"), nullable=False)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    
    fecha_entrada = Column(Date, nullable=False)
    hora_entrada = Column(Time, nullable=False)
    fecha_salida = Column(Date, nullable=False)
    hora_salida = Column(Time, nullable=False)
    estado = Column(String(50), nullable=False, default="reservada")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    habitacion = relationship("Habitacion", back_populates="reservas")
    cliente = relationship("Cliente", back_populates="reservas")
    facturas = relationship("Factura", back_populates="reserva")
