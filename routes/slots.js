// routes/slots.js
import express from 'express';
import { getCalendarEvents } from '../googleAuth.js';
import verify from './verifyToken.js';

const router = express.Router();

router.get('/available-slots', verify, async (req, res) => {
  try {
    const events = await getCalendarEvents();
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Erreur lors de la récupération des créneaux disponibles' });
  }
});

export default router;