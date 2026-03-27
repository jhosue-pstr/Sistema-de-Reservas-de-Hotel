import { apiClient } from './client';
import { Reserva, ReservaCreate, ReservaUpdate } from '../types';

export const reservaService = {
  async getAll(skip = 0, limit = 100): Promise<Reserva[]> {
    const { data } = await apiClient.get('/reservas/', { params: { skip, limit } });
    return data;
  },

  async getById(id: number): Promise<Reserva> {
    const { data } = await apiClient.get(`/reservas/${id}`);
    return data;
  },

  async create(reserva: ReservaCreate): Promise<Reserva> {
    const { data } = await apiClient.post('/reservas/', reserva);
    return data;
  },

  async update(id: number, reserva: ReservaUpdate): Promise<Reserva> {
    const { data } = await apiClient.put(`/reservas/${id}`, reserva);
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/reservas/${id}`);
  },

  async checkIn(id: number): Promise<Reserva> {
    const { data } = await apiClient.post(`/reservas/${id}/check-in`);
    return data;
  },

  async checkOut(id: number): Promise<Reserva> {
    const { data } = await apiClient.post(`/reservas/${id}/check-out`);
    return data;
  },
};
