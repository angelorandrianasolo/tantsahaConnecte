import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import BandeauEtat from './composants/BandeauEtat.jsx';
import { api } from './api/client.js';
import Accueil from './pages/Accueil.jsx';
import Meteo from './pages/Meteo.jsx';
import Alertes from './pages/Alertes.jsx';
import Parcelles from './pages/Parcelles.jsx';
import Journal from './pages/Journal.jsx';
import Conseils from './pages/Conseils.jsx';
import TableauDeBord from './pages/TableauDeBord.jsx';

export default function App() {
  const [langue, setLangue] = useState(api.langue);

  useEffect(() => {
    document.documentElement.lang = langue;   // accessibilité + ?lang=
  }, [langue]);

  const changerLangue = (l) => {
    api.setLangue(l);
    setLangue(l);
    // garde ?lang=fr dans l'URL (partageable)
    const u = new URL(window.location.href);
    u.searchParams.set('lang', l);
    window.history.replaceState(null, '', u);
  };

  return (
    <>
      <BandeauEtat langue={langue} onChangeLangue={changerLangue} />
      {/* key={langue} : tout l'écran se redessine dans la nouvelle langue */}
      <Routes key={langue}>
        <Route path="/" element={<Accueil />} />
        <Route path="/meteo" element={<Meteo />} />
        <Route path="/alertes" element={<Alertes />} />
        <Route path="/parcelles" element={<Parcelles />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/conseils" element={<Conseils />} />
        <Route path="/tableau-de-bord" element={<TableauDeBord />} />
      </Routes>
    </>
  );
}
