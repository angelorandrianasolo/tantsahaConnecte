/* Test de non-régression du backend (aucune dépendance externe)
   Exécution : npm test  ->  démarre le serveur sur :3101, vérifie, arrête. */
const { spawn } = require('child_process');

const BASE = 'http://localhost:3101';
const PORT = 3101;
let echecs = 0;

async function verifier(nom, url, options, attendu) {
  try {
    const r = await fetch(BASE + url, options);
    const data = await r.json().catch(() => null);
    const ok = attendu(r, data);
    console.log(`${ok ? '✅' : '❌'} ${nom} (HTTP ${r.status})`);
    if (!ok) echecs++;
    return { r, data };
  } catch (e) {
    console.log(`❌ ${nom} — ${e.message}`);
    echecs++;
    return { r: null, data: null };
  }
}

async function main() {
  const srv = spawn(process.execPath, ['src/server.js'], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'ignore',
  });

  // attente du démarrage
  for (let i = 0; i < 30; i++) {
    try {
      await fetch(`${BASE}/health`);
      break;
    } catch { await new Promise((r) => setTimeout(r, 500)); }
  }

  await verifier('GET /health', '/health', {}, (r, d) => r.status === 200 && d.status === 'ok');
  await verifier('GET /cultures (4 cultures)', '/cultures', {}, (r, d) => r.status === 200 && d.length >= 4);
  await verifier('GET /cultures/1/recolte-estimee', '/cultures/1/recolte-estimee?plantation=2026-01-15', {},
    (r, d) => r.status === 200 && d.dateRecolte === '2026-05-15' && d.dureeCycleJours === 120);
  await verifier('GET /parcelles (avec culture)', '/parcelles', {},
    (r, d) => r.status === 200 && d.length > 0 && d[0].proprietaire && d[0].culture);
  await verifier('GET /utilisateurs (avec lieu)', '/utilisateurs', {},
    (r, d) => r.status === 200 && d[0].region && d[0].latitude != null);
  await verifier('GET /meteo/prochains-jours', '/meteo/prochains-jours', {},
    (r, d) => r.status === 200 && Array.isArray(d) && d.length > 0 && d[0].lieu);
  await verifier('GET /meteo (multilieu)', '/meteo', {},
    (r, d) => r.status === 200 && new Set(d.map((x) => x.lieu)).size >= 1);
  await verifier('GET /alertes (tri urgent d\'abord)', '/alertes', {},
    (r, d) => r.status === 200 && d.length > 0);
  await verifier('GET /dashboard (agrégat)', '/dashboard', {},
    (r, d) => r.status === 200 && d.meteo && d.alertes && d.parcelles >= 1);
  await verifier('GET /conseils', '/conseils', {},
    (r, d) => r.status === 200 && d.length > 0 && d[0].contenu.length <= 300);
  await verifier('GET /conseils/1/audio (params JS voix)', '/conseils/1/audio', {},
    (r, d) => r.status === 200 && d.texte && d.langue === 'mg-MG' && d.rapidite > 0);
  await verifier('GET /conseils/1/audio?lang=fr (bilingue)', '/conseils/1/audio?lang=fr', {},
    (r, d) => r.status === 200 && d.langue === 'fr-FR' && /Inspectez/.test(d.texte));
  await verifier('GET /audio?texte=bonjour&lang=fr', '/audio?texte=bonjour&lang=fr', {},
    (r, d) => r.status === 200 && d.texte === 'bonjour' && d.langue === 'fr-FR');
  await verifier('GET /audio sans texte -> 400', '/audio', {}, (r) => r.status === 400);
  const jours = await verifier('GET /meteo/prochains-jours (jour courant)', '/meteo/prochains-jours', {},
    (r, d) => r.status === 200 && Array.isArray(d) && d.length > 0);
  if (jours.data && jours.data[0]) {
    await verifier('GET /meteo resume-vocal fr', `/meteo/${jours.data[0].date_prev}/resume-vocal?lang=fr`, {},
      (r, d) => r.status === 200 && /Pluie|degr/.test(d.resume) && d.langue === 'fr');
    await verifier('GET /meteo resume-vocal mg', `/meteo/${jours.data[0].date_prev}/resume-vocal`, {},
      (r, d) => r.status === 200 && /Orana|digera/.test(d.resume) && d.langue === 'mg');
  }
  await verifier('GET /sync/telechargement', '/sync/telechargement', {},
    (r, d) => r.status === 200 && d.alertes && d.previsions && d.conseils);
  await verifier('CORS present', '/health', {}, (r) =>
    !!r.headers.get('access-control-allow-origin'));

  await verifier('POST /observations invalide -> 400', '/observations',
    { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parcelle_id: 999, type: 'FAUX', date_obs: '2026-11-01' }) },
    (r) => r.status === 400);
  await verifier('POST /observations date future -> 400', '/observations',
    { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parcelle_id: 1, type: 'PLUIE', date_obs: '2099-01-01' }) },
    (r) => r.status === 400);
  await verifier('GET /conseils/99 -> 404', '/conseils/99', {}, (r) => r.status === 404);
  await verifier('GET /conseils/99?lang=fr -> 404 traduit', '/conseils/99?lang=fr', {},
    (r, d) => r.status === 404 && d.error === 'Conseil introuvable');
  await verifier('GET /route-inconnue -> 404', '/route-inconnue', {}, (r) => r.status === 404);

  srv.kill();

  console.log(echecs === 0
    ? '\n🎉 TOUS LES TESTS PASSENT'
    : `\n⚠️  ${echecs} test(s) en échec`);
  process.exit(echecs === 0 ? 0 : 1);
}

main();
