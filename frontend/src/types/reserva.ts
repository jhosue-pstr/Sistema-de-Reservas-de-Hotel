import { ClienteNested } from './cliente';
import { HabitacionNested } from './habitacion';

export interface Reserva {
  id: number;
  cliente_id: number;
  habitacion_id: number;
  fecha_entrada: string;
  hora_entrada: string;
  fecha_salida: string;
  hora_salida: string;
  estado?: string;
  habitacion?: HabitacionNested;
  cliente?: ClienteNested;
  created_at: string;
  updated_at?: string;
}

export interface ReservaCreate {
  cliente_id: number;
  habitacion_id: number;
  fecha_entrada: string;
  hora_entrada: string;
  fecha_salida: string;
  hora_salida: string;
}

export interface ReservaUpdate {
  cliente_id?: number;
  habitacion_id?: number;
  fecha_entrada?: string;
  hora_entrada?: string;
  fecha_salida?: string;
  hora_salida?: string;
}

export interface ReservaNested {
  id: number;
  fecha_entrada: string;
  fecha_salida: string;
}
