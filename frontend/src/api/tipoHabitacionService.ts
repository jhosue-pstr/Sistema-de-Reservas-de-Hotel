import { apiClient } from './client';
import { TipoHabitacion, TipoHabitacionCreate, TipoHabitacionUpdate } from '../types';

export const tipoHabitacionService = {
  async getAll(skip = 0, limit = 100): Promise<TipoHabitacion[]> {
    const { data } = await apiClient.get('/tipo-habitaciones/', { params: { skip, limit } });
    return data;
  },

  async getById(id: number): Promise<TipoHabitacion> {
    const { data } = await apiClient.get(`/tipo-habitaciones/${id}`);
    return data;
  },

  async create(tipo: TipoHabitacionCreate): Promise<TipoHabitacion> {
    const { data } = await apiClient.post('/tipo-habitaciones/', tipo);
    return data;
  },

  async update(id: number, tipo: TipoHabitacionUpdate): Promise<TipoHabitacion> {
    const { data } = await apiClient.put(`/tipo-habitaciones/${id}`, tipo);
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/tipo-habitaciones/${id}`);
  },
};
