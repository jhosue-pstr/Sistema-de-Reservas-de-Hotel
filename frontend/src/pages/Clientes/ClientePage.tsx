import { useState, useEffect } from 'react';
import { clienteService } from '../../api';
import { Cliente, ClienteCreate } from '../../types';
import { DataTable, Modal, FormField, Button } from '../../components/common';
import './ClientePage.css';

export default function ClientePage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<ClienteCreate>({
    nombre: '',
    email: '',
    dni: '',
    telefono: '',
    direccion: '',
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await clienteService.getAll();
      setClientes(data);
    } catch (error) {
      console.error('Error fetching clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedCliente) {
        await clienteService.update(selectedCliente.id, formData);
      } else {
        await clienteService.create(formData);
      }
      setModalOpen(false);
      resetForm();
      fetchClientes();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al guardar el cliente');
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setFormData({
      nombre: cliente.nombre,
      email: cliente.email,
      dni: cliente.dni,
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCliente) return;
    try {
      await clienteService.delete(selectedCliente.id);
      setDeleteModal(false);
      setSelectedCliente(null);
      fetchClientes();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al eliminar el cliente');
    }
  };

  const resetForm = () => {
    setSelectedCliente(null);
    setFormData({
      nombre: '',
      email: '',
      dni: '',
      telefono: '',
      direccion: '',
    });
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'dni', label: 'DNI' },
    { key: 'telefono', label: 'Teléfono' },
  ];

  const actions = [
    {
      label: 'Editar',
      variant: 'primary' as const,
      onClick: handleEdit,
    },
    {
      label: 'Eliminar',
      variant: 'danger' as const,
      onClick: (item: Cliente) => {
        setSelectedCliente(item);
        setDeleteModal(true);
      },
    },
  ];

  return (
    <div className="cliente-page">
      <div className="page-header">
        <h1 className="page-title">Gestión de Clientes</h1>
        <Button variant="primary" onClick={() => { resetForm(); setModalOpen(true); }}>
          + Nuevo Cliente
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">Cargando...</div>
      ) : (
        <DataTable columns={columns} data={clientes} actions={actions} />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title={selectedCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <form onSubmit={handleSubmit}>
          <FormField label="Nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
          <FormField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
          <FormField label="DNI" name="dni" value={formData.dni} onChange={handleInputChange} required />
          <FormField label="Teléfono" name="telefono" type="tel" value={formData.telefono || ''} onChange={handleInputChange} />
          <FormField label="Dirección" name="direccion" value={formData.direccion || ''} onChange={handleInputChange} />
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => { setModalOpen(false); resetForm(); }}>Cancelar</Button>
            <Button variant="primary" type="submit">{selectedCliente ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteModal}
        onClose={() => { setDeleteModal(false); setSelectedCliente(null); }}
        title="Eliminar Cliente"
        size="sm"
      >
        <p>¿Está seguro que desea eliminar a <strong>{selectedCliente?.nombre}</strong>?</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => { setDeleteModal(false); setSelectedCliente(null); }}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}
