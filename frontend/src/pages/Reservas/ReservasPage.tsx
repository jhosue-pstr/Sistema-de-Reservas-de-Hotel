import { useState, useEffect } from 'react';
import { reservaService, clienteService, habitacionService } from '../../api';
import { Reserva, ReservaCreate, Cliente, Habitacion } from '../../types';
import { DataTable, Modal, FormField, Button } from '../../components/common';
import './ReservasPage.css';

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [allReservas, setAllReservas] = useState<Reserva[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [formData, setFormData] = useState<ReservaCreate>({
    cliente_id: 0,
    habitacion_id: 0,
    fecha_entrada: '',
    fecha_salida: '',
    hora_entrada: '14:00',
    hora_salida: '12:00',
  });
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroFecha, setFiltroFecha] = useState({ inicio: '', fin: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resData, cliData, habData] = await Promise.all([
        reservaService.getAll(),
        clienteService.getAll(),
        habitacionService.getAll(),
      ]);
      setReservas(resData);
      setAllReservas(resData);
      setClientes(cliData);
      setHabitaciones(habData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let filtered = [...allReservas];

    if (filtroEstado) {
      filtered = filtered.filter((r) => r.estado === filtroEstado);
    }

    if (filtroFecha.inicio) {
      filtered = filtered.filter((r) => r.fecha_entrada >= filtroFecha.inicio);
    }

    if (filtroFecha.fin) {
      filtered = filtered.filter((r) => r.fecha_entrada <= filtroFecha.fin);
    }

    setReservas(filtered);
  };

  useEffect(() => {
    if (allReservas.length > 0) {
      aplicarFiltros();
    }
  }, [filtroEstado, filtroFecha, allReservas]);

  const limpiarFiltros = () => {
    setFiltroEstado('');
    setFiltroFecha({ inicio: '', fin: '' });
    setReservas(allReservas);
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: ['cliente_id', 'habitacion_id'].includes(name) ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedReserva) {
        await reservaService.update(selectedReserva.id, formData);
      } else {
        await reservaService.create(formData);
      }
      setModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving reserva:', error);
      alert(error.response?.data?.detail || 'Error al guardar la reserva');
    }
  };

  const handleEdit = (reserva: Reserva) => {
    setSelectedReserva(reserva);
    setFormData({
      cliente_id: reserva.cliente_id,
      habitacion_id: reserva.habitacion_id,
      fecha_entrada: reserva.fecha_entrada,
      fecha_salida: reserva.fecha_salida,
      hora_entrada: reserva.hora_entrada,
      hora_salida: reserva.hora_salida,
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedReserva) return;
    try {
      await reservaService.delete(selectedReserva.id);
      setDeleteModal(false);
      setSelectedReserva(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting reserva:', error);
      alert('Error al eliminar la reserva');
    }
  };

  const handleCheckIn = async (reserva: Reserva) => {
    const today = new Date().toISOString().split('T')[0];
    if (reserva.fecha_entrada > today) {
      alert(`No se puede hacer check-in antes del ${reserva.fecha_entrada}`);
      return;
    }
    try {
      await reservaService.checkIn(reserva.id);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al hacer check-in');
    }
  };

  const handleCheckOut = async (reserva: Reserva) => {
    try {
      await reservaService.checkOut(reserva.id);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al hacer check-out');
    }
  };

  const resetForm = () => {
    setSelectedReserva(null);
    setFormData({
      cliente_id: 0,
      habitacion_id: 0,
      fecha_entrada: '',
      fecha_salida: '',
      hora_entrada: '14:00',
      hora_salida: '12:00',
    });
  };

  const getClienteNombre = (id: number) => {
    const cliente = clientes.find((c) => c.id === id);
    return cliente?.nombre || '-';
  };

  const getHabitacionNumero = (id: number) => {
    const hab = habitaciones.find((h) => h.id === id);
    return hab?.numero || '-';
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, string> = {
      reservada: 'Reservada',
      'check-in': 'Check-in',
      'check-out': 'Check-out',
      cancelada: 'Cancelada',
    };
    return badges[estado] || estado;
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'habitacion', label: 'Habitación' },
    { key: 'fecha_entrada', label: 'Entrada' },
    { key: 'fecha_salida', label: 'Salida' },
    { key: 'estado', label: 'Estado' },
  ];

  const tableData = reservas.map((r) => ({
    ...r,
    cliente: r.cliente?.nombre || getClienteNombre(r.cliente_id),
    habitacion: r.habitacion?.numero || getHabitacionNumero(r.habitacion_id),
    estado: getEstadoBadge(r.estado || 'reservada'),
  }));

  const actions = [
    {
      label: 'Check-in',
      variant: 'success' as const,
      onClick: handleCheckIn,
      condition: (item: any) => item.estado === 'Reservada',
    },
    {
      label: 'Check-out',
      variant: 'warning' as const,
      onClick: handleCheckOut,
      condition: (item: any) => item.estado === 'Check-in',
    },
    {
      label: 'Editar',
      variant: 'primary' as const,
      onClick: handleEdit,
      condition: (item: any) => item.estado !== 'Check-out',
    },
    {
      label: 'Eliminar',
      variant: 'danger' as const,
      onClick: (item: any) => {
        const reserva = reservas.find((r) => r.id === item.id);
        setSelectedReserva(reserva || null);
        setDeleteModal(true);
      },
    },
  ];

  const clienteOptions = clientes.map((c) => ({ value: c.id, label: c.nombre }));
  const habitacionOptions = habitaciones.map((h) => ({
    value: h.id,
    label: `Hab ${h.numero} - ${h.tipo_habitacion?.nombre || ''}`,
  }));

  const estadoOptions = [
    { value: 'reservada', label: 'Reservada' },
    { value: 'check-in', label: 'Check-in' },
    { value: 'check-out', label: 'Check-out' },
    { value: 'cancelada', label: 'Cancelada' },
  ];

  return (
    <div className="reservas-page">
      <div className="page-header">
        <h1 className="page-title">Gestión de Reservas</h1>
        <Button variant="primary" onClick={() => { resetForm(); setModalOpen(true); }}>
          + Nueva Reserva
        </Button>
      </div>

      <div className="filtros-container">
        <div className="filtro-group">
          <label>Estado:</label>
          <select
            className="form-select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos</option>
            {estadoOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="filtro-group">
          <label>Desde:</label>
          <input
            type="date"
            className="form-control"
            value={filtroFecha.inicio}
            onChange={(e) => setFiltroFecha((prev) => ({ ...prev, inicio: e.target.value }))}
          />
        </div>
        <div className="filtro-group">
          <label>Hasta:</label>
          <input
            type="date"
            className="form-control"
            value={filtroFecha.fin}
            onChange={(e) => setFiltroFecha((prev) => ({ ...prev, fin: e.target.value }))}
          />
        </div>
        <Button variant="secondary" onClick={limpiarFiltros}>
          Limpiar
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">Cargando...</div>
      ) : (
        <DataTable
          columns={columns}
          data={tableData}
          actions={actions}
        />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title={selectedReserva ? 'Editar Reserva' : 'Nueva Reserva'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <FormField
                label="Cliente"
                name="cliente_id"
                value={formData.cliente_id || ''}
                onChange={handleInputChange}
                options={clienteOptions}
                required
              />
            </div>
            <div className="col-md-6">
              <FormField
                label="Habitación"
                name="habitacion_id"
                value={formData.habitacion_id || ''}
                onChange={handleInputChange}
                options={habitacionOptions}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <FormField
                label="Fecha Entrada"
                name="fecha_entrada"
                type="date"
                value={formData.fecha_entrada}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-3">
              <FormField
                label="Hora Entrada"
                name="hora_entrada"
                type="time"
                value={formData.hora_entrada}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-3">
              <FormField
                label="Fecha Salida"
                name="fecha_salida"
                type="date"
                value={formData.fecha_salida}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-3">
              <FormField
                label="Hora Salida"
                name="hora_salida"
                type="time"
                value={formData.hora_salida}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => { setModalOpen(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {selectedReserva ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteModal}
        onClose={() => { setDeleteModal(false); setSelectedReserva(null); }}
        title="Eliminar Reserva"
        size="sm"
      >
        <p>¿Está seguro que desea eliminar esta reserva?</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => { setDeleteModal(false); setSelectedReserva(null); }}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
