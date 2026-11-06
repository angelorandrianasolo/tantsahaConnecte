const express = require('express');
const app = express();

app.use(express.json());

// --- Routes MVC ---
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/utilisateurs', require('./routes/utilisateur.routes'));
app.use('/parcelles', require('./routes/parcelle.routes'));
app.use('/observations', require('./routes/observation.routes'));
app.use('/alertes', require('./routes/alerte.routes'));
app.use('/meteo', require('./routes/meteo.routes'));
app.use('/conseils', require('./routes/conseil.routes'));
app.use('/sync', require('./routes/sync.routes'));
app.use('/dashboard', require('./routes/dashboard.routes'));

// 404
app.use((req, res) => res.status(404).json({ error: 'Tsy hita' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // Météo réelle : mise à jour silencieuse au démarrage (échec = on garde l'ancien cache)
  require('./services/meteo.service')
    .actualiser()
    .then((r) => console.log(`Meteo: ${r.miseAJour} jours mis a jour (open-meteo)`))
    .catch(() => console.log('Meteo: pas de reseau, ancien cache conserve'));
});
