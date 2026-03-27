import { apiClient } from './client';
import { Habitacion, HabitacionCreate, HabitacionUpdate, HabitacionDisponibilidadResponse, OcupacionStats } from '../types';

export const habitacionService = {
  async getAll(skip = 0, limit = 100): Promise<Habitacion[]> {
    const { data } = await apiClient.get('/habitaciones/', { params: { skip, limit } });
    return data;
  },

  async getById(id: number): Promise<Habitacion> {
    const { data } = await apiClient.get(`/habitaciones/${id}`);
    return data;
  },

  async create(habitacion: HabitacionCreate): Promise<Habitacion> {
    const { data } = await apiClient.post('/habitaciones/', habitacion);
    return data;
  },

  async update(id: number, habitacion: HabitacionUpdate): Promise<Habitacion> {
    const { data } = await apiClient.put(`/habitaciones/${id}`, habitacion);
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/habitaciones/${id}`);
  },

  async getDisponibles(fecha_entrada: string, fecha_salida: string): Promise<HabitacionDisponibilidadResponse[]> {
    const { data } = await apiClient.get('/habitaciones/disponibles', {
      params: { fecha_entrada, fecha_salida },
    });
    return data;
  },

  async getOcupacion(): Promise<OcupacionStats> {
    const { data } = await apiClient.get('/habitaciones/ocupacion');
    return data;
  },
};
