import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { habitacionService, clienteService, reservaService, facturaService, tipoHabitacionService } from '../../api';
import './Principal.css';

interface Stats {
  total_habitaciones: number;
  habitaciones_ocupadas: number;
  habitaciones_disponibles: number;
  reservas_activas: number;
  porcentaje_ocupacion: number;
}

export default function PrincipalPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [totales, setTotales] = useState({ clientes: 0, reservas: 0, facturas: 0, tipos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ocupacion, clientes, reservas, facturas, tipos] = await Promise.all([
        habitacionService.getOcupacion(),
        clienteService.getAll(),
        reservaService.getAll(),
        facturaService.getAll(),
        tipoHabitacionService.getAll(),
      ]);
      setStats(ocupacion);
      setTotales({
        clientes: clientes.length,
        reservas: reservas.length,
        facturas: facturas.length,
        tipos: tipos.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      id: 1,
      title: 'Clientes',
      value: totales.clientes,
      icon: '👥',
      gradient: 'gradient-clientes',
      link: '/clientes',
    },
    {
      id: 2,
      title: 'Habitaciones',
      value: stats?.habitaciones_disponibles ?? '-',
      subtitle: stats ? `de ${stats.total_habitaciones}` : '',
      icon: '🛏️',
      gradient: 'gradient-habitaciones',
      link: '/habitaciones',
    },
    {
      id: 3,
      title: 'Reservas',
      value: stats?.reservas_activas ?? '-',
      icon: '📅',
      gradient: 'gradient-reservas',
      link: '/reservas',
    },
    {
      id: 4,
      title: 'Facturas',
      value: totales.facturas,
      icon: '🧾',
      gradient: 'gradient-facturas',
      link: '/facturas',
    },
    {
      id: 5,
      title: 'Tipos Hab.',
      value: totales.tipos,
      icon: '🏨',
      gradient: 'gradient-tipos',
      link: '/tipos-habitacion',
    },
  ];

  return (
    <div className="principal-page">
      <div className="dashboard-container">
        <h1 className="dashboard-title">Panel de Control</h1>
        
        {loading ? (
          <div className="text-center py-5">Cargando estadísticas...</div>
        ) : (
          <>
            <div className="cards-container">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`stat-card ${card.gradient}`}
                  onClick={() => navigate(card.link)}
                >
                  <div className="stat-icon">{card.icon}</div>
                  <div className="stat-content">
                    <h3 className="stat-title">{card.title}</h3>
                    <p className="stat-value">{card.value}</p>
                    {card.subtitle && <p className="stat-subtitle">{card.subtitle}</p>}
                  </div>
                </div>
              ))}
            </div>

            {stats && (
              <div className="stats-summary">
                <div className="summary-item">
                  <span className="summary-label">Ocupación:</span>
                  <span className="summary-value">{stats.porcentaje_ocupacion}%</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Habitaciones Ocupadas:</span>
                  <span className="summary-value">{stats.habitaciones_ocupadas}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Habitaciones Disponibles:</span>
                  <span className="summary-value">{stats.habitaciones_disponibles}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
