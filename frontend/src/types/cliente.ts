export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  dni: string;
  telefono?: string;
  direccion?: string;
  created_at: string;
  updated_at?: string;
}

export interface ClienteCreate {
  nombre: string;
  email: string;
  dni: string;
  telefono?: string;
  direccion?: string;
}

export interface ClienteUpdate {
  nombre?: string;
  email?: string;
  dni?: string;
  telefono?: string;
  direccion?: string;
}
