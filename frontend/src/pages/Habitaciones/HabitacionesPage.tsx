import { useState, useEffect } from 'react';
import { habitacionService, tipoHabitacionService } from '../../api';
import { Habitacion, HabitacionCreate, TipoHabitacion } from '../../types';
import { DataTable, Modal, FormField, Button } from '../../components/common';
import './HabitacionesPage.css';

export default function HabitacionesPage() {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [tiposHabitacion, setTiposHabitacion] = useState<TipoHabitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [searchModal, setSearchModal] = useState(false);
  const [disponibles, setDisponibles] = useState<any[]>([]);
  const [showDisponibles, setShowDisponibles] = useState(false);
  const [selectedHabitacion, setSelectedHabitacion] = useState<Habitacion | null>(null);
  const [formData, setFormData] = useState<HabitacionCreate>({
    piso: '',
    numero: '',
    tipo_habitacion_id: 0,
    ocupado: false,
  });
  const [searchDates, setSearchDates] = useState({ fecha_entrada: '', fecha_salida: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [habData, tipoData] = await Promise.all([
        habitacionService.getAll(),
        tipoHabitacionService.getAll(),
      ]);
      setHabitaciones(habData);
      setTiposHabitacion(tipoData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchDisponibilidad = async () => {
    if (!searchDates.fecha_entrada || !searchDates.fecha_salida) {
      alert('Por favor seleccione ambas fechas');
      return;
    }
    try {
      setLoading(true);
      const data = await habitacionService.getDisponibles(searchDates.fecha_entrada, searchDates.fecha_salida);
      setDisponibles(data.map((d: any) => ({
        ...d.habitacion,
        tipo: d.habitacion.tipo_habitacion.nombre,
        precio: `$${d.habitacion.tipo_habitacion.precio_dia}`,
        disponible: d.disponible ? 'Sí' : 'No',
      })));
      setShowDisponibles(true);
      setSearchModal(false);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al buscar disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'tipo_habitacion_id' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedHabitacion) {
        await habitacionService.update(selectedHabitacion.id, formData);
      } else {
        await habitacionService.create(formData);
      }
      setModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al guardar la habitación');
    }
  };

  const handleEdit = (habitacion: Habitacion) => {
    setSelectedHabitacion(habitacion);
    setFormData({
      piso: habitacion.piso,
      numero: habitacion.numero,
      tipo_habitacion_id: habitacion.tipo_habitacion_id,
      ocupado: habitacion.ocupado,
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedHabitacion) return;
    try {
      await habitacionService.delete(selectedHabitacion.id);
      setDeleteModal(false);
      setSelectedHabitacion(null);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al eliminar la habitación');
    }
  };

  const resetForm = () => {
    setSelectedHabitacion(null);
    setFormData({ piso: '', numero: '', tipo_habitacion_id: 0, ocupado: false });
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'numero', label: 'Número' },
    { key: 'piso', label: 'Piso' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'estado', label: 'Estado' },
  ];

  const tableData = habitaciones.map((h) => ({
    ...h,
    tipo: h.tipo_habitacion?.nombre || '-',
    estado: h.ocupado ? 'Ocupada' : 'Disponible',
  }));

  const disponibilidadColumns = [
    { key: 'numero', label: 'Número' },
    { key: 'piso', label: 'Piso' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'precio', label: 'Precio/Día' },
    { key: 'disponible', label: 'Disponible' },
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
      onClick: (item: Habitacion) => {
        setSelectedHabitacion(item);
        setDeleteModal(true);
      },
    },
  ];

  const tipoOptions = tiposHabitacion.map((t) => ({
    value: t.id,
    label: `${t.nombre} - $${t.precio_dia}/día`,
  }));

  return (
    <div className="habitaciones-page">
      <div className="page-header">
        <h1 className="page-title">Gestión de Habitaciones</h1>
        <div className="header-actions">
          <Button variant="info" onClick={() => setSearchModal(true)}>🔍 Disponibilidad</Button>
          <Button variant="primary" onClick={() => { resetForm(); setModalOpen(true); }}>+ Nueva</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">Cargando...</div>
      ) : showDisponibles ? (
        <div>
          <div className="disponibilidad-header">
            <div>
              <h3>Habitaciones disponibles</h3>
              <p>{searchDates.fecha_entrada} → {searchDates.fecha_salida}</p>
            </div>
            <Button variant="secondary" onClick={() => setShowDisponibles(false)}>Ver todas</Button>
          </div>
          <DataTable columns={disponibilidadColumns} data={disponibles} />
        </div>
      ) : (
        <DataTable columns={columns} data={tableData} actions={actions} />
      )}

      <Modal isOpen={searchModal} onClose={() => setSearchModal(false)} title="Buscar Disponibilidad" size="sm">
        <FormField label="Fecha Entrada" name="fecha_entrada" type="date" value={searchDates.fecha_entrada} onChange={(n, v) => setSearchDates((p) => ({ ...p, [n]: v }))} required />
        <FormField label="Fecha Salida" name="fecha_salida" type="date" value={searchDates.fecha_salida} onChange={(n, v) => setSearchDates((p) => ({ ...p, [n]: v }))} required />
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setSearchModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={searchDisponibilidad}>Buscar</Button>
        </div>
      </Modal>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title={selectedHabitacion ? 'Editar' : 'Nueva Habitación'}>
        <form onSubmit={handleSubmit}>
          <FormField label="Número" name="numero" value={formData.numero} onChange={handleInputChange} required />
          <FormField label="Piso" name="piso" value={formData.piso} onChange={handleInputChange} required />
          <FormField label="Tipo" name="tipo_habitacion_id" value={formData.tipo_habitacion_id || ''} onChange={handleInputChange} options={tipoOptions} required />
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => { setModalOpen(false); resetForm(); }}>Cancelar</Button>
            <Button variant="primary" type="submit">{selectedHabitacion ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteModal} onClose={() => { setDeleteModal(false); setSelectedHabitacion(null); }} title="Eliminar" size="sm">
        <p>¿Eliminar habitación <strong>{selectedHabitacion?.numero}</strong>?</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => { setDeleteModal(false); setSelectedHabitacion(null); }}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}
