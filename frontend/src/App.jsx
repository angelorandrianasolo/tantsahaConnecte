import { Routes, Route } from 'react-router-dom';
import Accueil from './pages/Accueil.jsx';
import Meteo from './pages/Meteo.jsx';
import Alertes from './pages/Alertes.jsx';
import Parcelles from './pages/Parcelles.jsx';
import Journal from './pages/Journal.jsx';
import Conseils from './pages/Conseils.jsx';
import TableauDeBord from './pages/TableauDeBord.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/meteo" element={<Meteo />} />
      <Route path="/alertes" element={<Alertes />} />
      <Route path="/parcelles" element={<Parcelles />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/conseils" element={<Conseils />} />
      <Route path="/tableau-de-bord" element={<TableauDeBord />} />
    </Routes>
  );
}
