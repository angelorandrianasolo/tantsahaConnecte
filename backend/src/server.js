const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

// CORS : origines autorisées via CORS_ORIGINS="http://...,http://..." (sinon ouvert)
const origines = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : undefined;
app.use(origines ? cors({ origin: origines }) : cors());

app.use(express.json({ limit: '2mb' }));   // photos en base64 acceptées
app.use(require('./middlewares/limit').limitateur);
app.use(require('./middlewares/session').optionnel);   // req.utilisateur si token valide

// --- Frontend web compilé (Vite -> frontend/dist) ---
// Deux comportements distincts :
//   * le navigateur demande une page (Accept: text/html)  -> sert l'app React (SPA)
//   * AJAX / API (Accept: */*)                           -> routes JSON ci-dessous
const dossierFrontend = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(dossierFrontend)) {
  app.use(express.static(dossierFrontend));            // /assets/*.js, css, favicon
  app.use((req, res, next) => {
    const navigateur = (req.get('Accept') || '').includes('text/html');
    if (req.method !== 'GET' || !navigateur) return next();
    res.sendFile(path.join(dossierFrontend, 'index.html'));   // routage côté React
  });
}

// --- Routes MVC ---
app.get('/health', async (req, res) => {
  // vérifie aussi la base : ok seulement si PostgreSQL répond
  try {
    await require('./config/db').query('SELECT 1');
    res.json({ status: 'ok', base: 'ok', horodatage: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'degrade', base: 'absente', horodatage: new Date().toISOString() });
  }
});
app.use('/session', require('./routes/session.routes'));
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

// Frontend : voir le bloc « Frontend web compilé » plus haut (avant les routes)

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
