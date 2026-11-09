const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());          // frontend servi depuis un autre origine (Figma, autre port...)
app.use(express.json());

// --- Routes MVC ---
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/utilisateurs', require('./routes/utilisateur.routes'));
app.use('/parcelles', require('./routes/parcelle.routes'));
app.use('/observations', require('./routes/observation.routes'));
app.use('/alertes', require('./routes/alerte.routes'));
app.use('/meteo', require('./routes/meteo.routes'));
app.use('/conseils', require('./routes/conseil.routes'));
app.use('/cultures', require('./routes/culture.routes'));
app.use('/sync', require('./routes/sync.routes'));
app.use('/dashboard', require('./routes/dashboard.routes'));
app.use('/audio', require('./routes/audio.routes'));

// Frontend statique (sert le dossier s'il existe — pour plus tard)
const dossierFrontend = path.join(__dirname, '..', '..', 'frontend');
if (fs.existsSync(dossierFrontend)) {
  app.use(express.static(dossierFrontend));
}

// 404
const { traduire } = require('./i18n');
app.use((req, res) => res.status(404).json({
  error: traduire('Tsy hita', req.query.lang || req.get('Accept-Language')),
}));

// Erreurs non prévues (garde-fou unique)
app.use((err, req, res, next) => {   // eslint-disable-line no-unused-vars
  console.error('ERREUR:', err.message || err);
  const lang = (req.query && req.query.lang) || req.get('Accept-Language');
  res.status(err.status || 500).json({
    error: traduire(err.message || "Tsy fahazotoana eo amin'ny solosaina", lang),
  });
});

const PORT = process.env.PORT || 3000;

// Météo réelle + alertes automatiques : au démarrage puis toutes les 6 h
function actualisationPeriodique() {
  const MeteoService = require('./services/meteo.service');
  const AlerteAutoService = require('./services/alerte-auto.service');

  MeteoService.actualiserTous()
    .then((r) => console.log(`Meteo: ${r.jours} jours mis a jour sur ${r.lieux} lieux (${r.source})`))
    .catch(() => console.log("Meteo: pas de reseau, ancien cache conserve"))
    .then(() => AlerteAutoService.generer())
    .then((r) => console.log(`Alertes: ${r.creees} creees automatiquement`))
    .catch((e) => console.log(`Alertes: ignorees (${e.message || 'erreur'})`));
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  setTimeout(actualisationPeriodique, 2000);   // 2 s de latence pour laisser le réseau démarrer
  setInterval(actualisationPeriodique, 6 * 60 * 60 * 1000);   // toutes les 6 heures
});
