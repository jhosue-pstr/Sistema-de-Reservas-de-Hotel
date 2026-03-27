import { ReservaNested } from './reserva';

export interface Factura {
  id: number;
  reserva_id: number;
  total: number;
  estado: string;
  metodo_pago?: string;
  reserva?: ReservaNested;
  created_at: string;
  updated_at?: string;
}

export interface FacturaCreate {
  reserva_id: number;
  total: number;
  estado?: string;
  metodo_pago?: string;
}

export interface FacturaUpdate {
  total?: number;
  estado?: string;
  metodo_pago?: string;
}
