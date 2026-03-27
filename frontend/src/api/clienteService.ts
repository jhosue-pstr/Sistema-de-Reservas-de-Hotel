import { apiClient } from './client';
import { Cliente, ClienteCreate, ClienteUpdate } from '../types';

export const clienteService = {
  async getAll(skip = 0, limit = 100): Promise<Cliente[]> {
    const { data } = await apiClient.get('/clientes/', { params: { skip, limit } });
    return data;
  },

  async getById(id: number): Promise<Cliente> {
    const { data } = await apiClient.get(`/clientes/${id}`);
    return data;
  },

  async create(cliente: ClienteCreate): Promise<Cliente> {
    const { data } = await apiClient.post('/clientes/', cliente);
    return data;
  },

  async update(id: number, cliente: ClienteUpdate): Promise<Cliente> {
    const { data } = await apiClient.put(`/clientes/${id}`, cliente);
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/clientes/${id}`);
  },
};
