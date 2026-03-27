import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Loader from "./components/Loader/Loader";
import Sidebar from "./components/Sidebars/Sidebar";
import PrincipalPage from "./pages/Principal/PrincipalPage";
import ClientePage from "./pages/Clientes/ClientePage";
import TipoHabitacionPage from "./pages/TipoHabitacion/TipoHabitacionPage";
import HabitacionesPage from "./pages/Habitaciones/HabitacionesPage";
import ReservasPage from "./pages/Reservas/ReservasPage";
import FacturasPage from "./pages/Facturas/FacturaPage";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      <div style={{ display: "flex", height: "100vh" }}>
        <Sidebar />
        <main style={{ flex: 1, background: "#f5f5f5", overflow: "auto" }}>
          <Routes>
            <Route path="/" element={<PrincipalPage />} />
            <Route path="/clientes" element={<ClientePage />} />
            <Route path="/tipos-habitacion" element={<TipoHabitacionPage />} />
            <Route path="/habitaciones" element={<HabitacionesPage />} />
            <Route path="/reservas" element={<ReservasPage />} />
            <Route path="/facturas" element={<FacturasPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
