import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./layout/AppLayout";

import HomePage from "./pages/HomePage";
import CotizadorPage from "./pages/CotizadorPage";
import AdministracionPage from "./pages/AdministracionPage";
import LogisticaPage from "./pages/LogisticaPage";
import IngenieriaPage from "./pages/IngenieriaPage";
import GerenciaPage from "./pages/GerenciaPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

/**
 * MODO LOCAL (sin login por ahora):
 * - Dejamos /login disponible, pero NO bloqueamos las rutas.
 * - Esto te permite enfocarte en que el Cotizador funcione conectado a la API.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="cotizador" element={<CotizadorPage />} />
        <Route path="administracion" element={<AdministracionPage />} />
        <Route path="logistica" element={<LogisticaPage />} />
        <Route path="ingenieria" element={<IngenieriaPage />} />
        <Route path="gerencia" element={<GerenciaPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
