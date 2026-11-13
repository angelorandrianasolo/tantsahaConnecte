/* Voix malagasy / française — la fonction parle à la place de l'utilisateur.
   Ordre : 1) paramètres du serveur (/audio)  2) secours local hors-ligne */
import { api } from './client.js';

function prononcer(texte, params) {
  const u = new SpeechSynthesisUtterance(params.texte || texte);
  if (params.langue) u.lang = params.langue;
  if (params.rapidite != null) u.rate = params.rapidite;
  if (params.tonalite != null) u.pitch = params.tonalite;
  if (params.volume != null) u.volume = params.volume;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export async function parler(texte) {
  if (!texte) return;
  try {
    const p = await api.get(`/audio?texte=${encodeURIComponent(texte)}`);
    prononcer(texte, p);
  } catch {
    // hors ligne : on parle quand même, avec la langue choisie
    prononcer(texte, { langue: api.langue === 'fr' ? 'fr-FR' : 'mg-MG' });
  }
}

export function arreterVoix() {
  window.speechSynthesis.cancel();
}
