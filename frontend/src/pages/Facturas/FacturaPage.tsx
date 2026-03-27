import { useState, useEffect } from 'react';
import { facturaService } from '../../api';
import { Factura, FacturaUpdate } from '../../types';
import { DataTable, Modal, FormField, Button } from '../../components/common';
import './FacturaPage.css';

export default function FacturaPage() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [formData, setFormData] = useState<FacturaUpdate>({ estado: '', metodo_pago: '' });

  useEffect(() => { fetchFacturas(); }, []);

  const fetchFacturas = async () => {
    try {
      setLoading(true);
      const data = await facturaService.getAll();
      setFacturas(data);
    } catch (error) {
      console.error('Error fetching facturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFactura) return;
    try {
      await facturaService.update(selectedFactura.id, formData);
      setModalOpen(false);
      resetForm();
      fetchFacturas();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al actualizar');
    }
  };

  const handleEdit = (factura: Factura) => {
    setSelectedFactura(factura);
    setFormData({ estado: factura.estado, metodo_pago: factura.metodo_pago || '' });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedFactura) return;
    try {
      await facturaService.delete(selectedFactura.id);
      setDeleteModal(false);
      setSelectedFactura(null);
      fetchFacturas();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al eliminar');
    }
  };

  const resetForm = () => {
    setSelectedFactura(null);
    setFormData({ estado: '', metodo_pago: '' });
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'reserva', label: 'Reserva' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'total', label: 'Total' },
    { key: 'estado', label: 'Estado' },
  ];

  const tableData = facturas.map((f) => ({
    ...f,
    reserva: `Reserva #${f.reserva_id}`,
    fecha: new Date(f.created_at).toLocaleDateString(),
    total: `$${f.total.toFixed(2)}`,
    estado: f.estado,
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
      onClick: (item: Factura) => {
        setSelectedFactura(item);
        setDeleteModal(true);
      },
    },
  ];

  const estadoOptions = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'pagada', label: 'Pagada' },
    { value: 'cancelada', label: 'Cancelada' },
  ];

  const metodoPagoOptions = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'transferencia', label: 'Transferencia' },
  ];

  return (
    <div className="facturas-page">
      <div className="page-header">
        <h1 className="page-title">Gestión de Facturas</h1>
      </div>

      {loading ? (
        <div className="text-center py-5">Cargando...</div>
      ) : (
        <DataTable columns={columns} data={tableData} actions={actions} />
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title="Actualizar Factura">
        <form onSubmit={handleSubmit}>
          <div className="factura-info mb-3">
            <p><strong>Total:</strong> ${selectedFactura?.total.toFixed(2)}</p>
          </div>
          <FormField label="Estado" name="estado" value={formData.estado || ''} onChange={handleInputChange} options={estadoOptions} required />
          <FormField label="Método de Pago" name="metodo_pago" value={formData.metodo_pago || ''} onChange={handleInputChange} options={metodoPagoOptions} />
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => { setModalOpen(false); resetForm(); }}>Cancelar</Button>
            <Button variant="primary" type="submit">Actualizar</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteModal} onClose={() => { setDeleteModal(false); setSelectedFactura(null); }} title="Eliminar" size="sm">
        <p>¿Eliminar factura <strong>#{selectedFactura?.id}</strong>?</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => { setDeleteModal(false); setSelectedFactura(null); }}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}
