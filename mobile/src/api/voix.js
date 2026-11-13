/* Voix malagasy / française — la fonction parle à la place de l'utilisateur.
   Ordre : 1) paramètres du serveur (/audio)  2) secours local hors-ligne */
import * as Speech from 'expo-speech';
import { api } from './client.js';

export async function parler(texte) {
  if (!texte) return;
  try {
    const p = await api.get(`/audio?texte=${encodeURIComponent(texte)}`);
    Speech.speak(p.texte || texte, {
      language: p.langue,
      rate: p.rapidite,
      pitch: p.tonalite,
    });
  } catch {
    // hors ligne : on parle quand même
    Speech.speak(texte, { language: api.langue === 'fr' ? 'fr-FR' : 'mg-MG' });
  }
}

export function arreterVoix() {
  Speech.stop();
}
