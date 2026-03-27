export interface ClienteNested {
  id: number;
  nombre: string;
  email: string;
}

export interface HabitacionNested {
  id: number;
  piso: string;
  numero: string;
  tipo_habitacion_id: number;
  ocupado: boolean;
}
