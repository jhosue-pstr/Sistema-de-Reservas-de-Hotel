export interface TipoHabitacion {
  id: number;
  nombre: string;
  precio_dia: number;
  capacidad: number;
  created_at: string;
  updated_at?: string;
}

export interface TipoHabitacionCreate {
  nombre: string;
  precio_dia: number;
  capacidad: number;
}

export interface TipoHabitacionUpdate {
  nombre?: string;
  precio_dia?: number;
  capacidad?: number;
}

export interface TipoHabitacionNested {
  id: number;
  nombre: string;
  precio_dia: number;
  capacidad: number;
}
