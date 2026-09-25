import { Routes, Route } from 'react-router-dom';
import { useContext } from 'react';

import ThemeContext from '../contexts/ThemeContext';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Clases from '../pages/Clases';
import DetalleClase from '../pages/DetalleClase';
import Estaciones from '../pages/Estaciones';
import DetalleEstacion from '../pages/DetalleEstacion';
import Simulador from '../pages/Simulador';
import NoEncontrado from '../pages/NoEncontrado';

const AppContent = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className="app-shell" data-theme={theme}>
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clases" element={<Clases />} />
          <Route path="/clases/:id" element={<DetalleClase />} />
          <Route path="/estaciones" element={<Estaciones />} />
          <Route path="/estaciones/:id" element={<DetalleEstacion />} />
          <Route path="/simulador" element={<Simulador />} />
          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default AppContent;
