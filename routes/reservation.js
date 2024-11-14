import express from 'express';
import { getAuthUrl, getTokens, setCredentials, getCalendarEvents, addCalendarEvent } from '../googleAuth.js';
import verify from './verifyToken.js';

const router = express.Router();

// Route pour obtenir l'URL d'authentification OAuth2
router.get('/auth-url', (req, res) => {
  const url = getAuthUrl();
  res.json({ url });
});

// Route de redirection OAuth2 pour échanger le code contre des tokens
router.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  try {
    const tokens = await getTokens(code);
    // Stocke les tokens dans la session pour un accès ultérieur
    req.session.tokens = tokens;
    res.redirect('/reservation'); // Redirige vers la page de réservation
  } catch (err) {
    console.error('Erreur lors de l\'authentification :', err.message);
    res.status(400).json({ error: 'Erreur lors de l\'authentification' });
  }
});

// Route pour récupérer les créneaux disponibles
router.get('/available-slots', verify, async (req, res) => {
  try {
    const tokens = req.session.tokens;
    if (!tokens) {
      return res.status(401).json({ error: 'Non autorisé. Token manquant.' });
    }
    setCredentials(tokens); // Définit les tokens pour les requêtes Google
    const events = await getCalendarEvents();
    res.json(events);
  } catch (err) {
    console.error('Erreur lors de la récupération des créneaux disponibles :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des créneaux disponibles' });
  }
});

// Route pour effectuer une réservation
router.post('/reserve', verify, async (req, res) => {
  const { date, heure, instrument } = req.body;
  const tokens = req.session.tokens;
  if (!tokens) {
    return res.status(401).json({ error: 'Non autorisé. Token manquant.' });
  }
  setCredentials(tokens);

  const event = {
    summary: `Cours de ${instrument}`,
    start: {
      dateTime: new Date(date + 'T' + heure).toISOString(),
      timeZone: 'Europe/Paris',
    },
    end: {
      dateTime: new Date(new Date(date + 'T' + heure).getTime() + 60 * 60 * 1000).toISOString(), // 1 heure plus tard
      timeZone: 'Europe/Paris',
    },
  };

  try {
    await addCalendarEvent(event);
    res.json({ message: 'Réservation effectuée avec succès' });
  } catch (err) {
    console.error('Erreur lors de la réservation :', err.message);
    res.status(500).json({ error: 'Erreur lors de la réservation' });
  }
});

export default router;
