import { TipoHabitacionNested } from './tipoHabitacion';

export interface Habitacion {
  id: number;
  piso: string;
  numero: string;
  tipo_habitacion_id: number;
  ocupado: boolean;
  tipo_habitacion?: TipoHabitacionNested;
  created_at: string;
  updated_at?: string;
}

export interface HabitacionCreate {
  piso: string;
  numero: string;
  tipo_habitacion_id: number;
  ocupado?: boolean;
}

export interface HabitacionUpdate {
  piso?: string;
  numero?: string;
  tipo_habitacion_id?: number;
  ocupado?: boolean;
}

export interface HabitacionDisponibilidad {
  id: number;
  piso: string;
  numero: string;
  tipo_habitacion: TipoHabitacionNested;
}

export interface HabitacionDisponibilidadResponse {
  habitacion: HabitacionDisponibilidad;
  disponible: boolean;
}

export interface OcupacionStats {
  total_habitaciones: number;
  habitaciones_ocupadas: number;
  habitaciones_disponibles: number;
  reservas_activas: number;
  porcentaje_ocupacion: number;
}
