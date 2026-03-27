import { apiClient } from './client';
import { Factura, FacturaCreate, FacturaUpdate } from '../types';

export const facturaService = {
  async getAll(skip = 0, limit = 100): Promise<Factura[]> {
    const { data } = await apiClient.get('/facturas/', { params: { skip, limit } });
    return data;
  },

  async getById(id: number): Promise<Factura> {
    const { data } = await apiClient.get(`/facturas/${id}`);
    return data;
  },

  async create(factura: FacturaCreate): Promise<Factura> {
    const { data } = await apiClient.post('/facturas/', factura);
    return data;
  },

  async update(id: number, factura: FacturaUpdate): Promise<Factura> {
    const { data } = await apiClient.put(`/facturas/${id}`, factura);
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/facturas/${id}`);
  },
};
