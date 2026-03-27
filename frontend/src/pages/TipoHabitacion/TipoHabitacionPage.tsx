import { useState, useEffect } from 'react';
import { tipoHabitacionService } from '../../api';
import { TipoHabitacion, TipoHabitacionCreate } from '../../types';
import { DataTable, Modal, FormField, Button } from '../../components/common';
import './TipoHabitacionPage.css';

export default function TipoHabitacionPage() {
  const [tipos, setTipos] = useState<TipoHabitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoHabitacion | null>(null);
  const [formData, setFormData] = useState<TipoHabitacionCreate>({
    nombre: '',
    precio_dia: 0,
    capacidad: 1,
  });

  useEffect(() => { fetchTipos(); }, []);

  const fetchTipos = async () => {
    try {
      setLoading(true);
      const data = await tipoHabitacionService.getAll();
      setTipos(data);
    } catch (error) {
      console.error('Error fetching tipos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'precio_dia' || name === 'capacidad' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedTipo) {
        await tipoHabitacionService.update(selectedTipo.id, formData);
      } else {
        await tipoHabitacionService.create(formData);
      }
      setModalOpen(false);
      resetForm();
      fetchTipos();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al guardar');
    }
  };

  const handleEdit = (tipo: TipoHabitacion) => {
    setSelectedTipo(tipo);
    setFormData({
      nombre: tipo.nombre,
      precio_dia: tipo.precio_dia,
      capacidad: tipo.capacidad,
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTipo) return;
    try {
      await tipoHabitacionService.delete(selectedTipo.id);
      setDeleteModal(false);
      setSelectedTipo(null);
      fetchTipos();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al eliminar');
    }
  };

  const resetForm = () => {
    setSelectedTipo(null);
    setFormData({ nombre: '', precio_dia: 0, capacidad: 1 });
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'precio_dia', label: 'Precio/Día' },
    { key: 'capacidad', label: 'Capacidad' },
  ];

  const tableData = tipos.map((t) => ({
    ...t,
    precio_dia: `$${t.precio_dia.toFixed(2)}`,
    capacidad: `${t.capacidad} personas`,
  }));

  const actions = [
    {
      label: 'Editar',
      variant: 'primary' as const,
      onClick: handleEdit,
    },
    {
      label: 'Eliminar',
      variant: 'danger' as const,
      onClick: (item: TipoHabitacion) => {
        setSelectedTipo(item);
        setDeleteModal(true);
      },
    },
  ];

  return (
    <div className="tipo-habitacion-page">
      <div className="page-header">
        <h1 className="page-title">Tipos de Habitación</h1>
        <Button variant="primary" onClick={() => { resetForm(); setModalOpen(true); }}>+ Nuevo</Button>
      </div>

      {loading ? (
        <div className="text-center py-5">Cargando...</div>
      ) : (
        <DataTable columns={columns} data={tableData} actions={actions} />
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title={selectedTipo ? 'Editar' : 'Nuevo Tipo'}>
        <form onSubmit={handleSubmit}>
          <FormField label="Nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
          <FormField label="Precio/Día" name="precio_dia" type="number" value={formData.precio_dia || ''} onChange={handleInputChange} required />
          <FormField label="Capacidad" name="capacidad" type="number" value={formData.capacidad || ''} onChange={handleInputChange} required />
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => { setModalOpen(false); resetForm(); }}>Cancelar</Button>
            <Button variant="primary" type="submit">{selectedTipo ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteModal} onClose={() => { setDeleteModal(false); setSelectedTipo(null); }} title="Eliminar" size="sm">
        <p>¿Eliminar <strong>{selectedTipo?.nombre}</strong>?</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => { setDeleteModal(false); setSelectedTipo(null); }}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}
