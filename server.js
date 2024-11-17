import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { PrismaClient } from '@prisma/client';

import authRoute from './routes/auth.js';
import reservationRoute from './routes/reservation.js';
import contactRoute from './routes/contact.js';
import userRoute from './routes/user.js'; 
import slotsRoute from './routes/slots.js'; 

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware CORS avec configuration explicite
app.use(cors({
  origin: 'http://localhost:3000', // Autorise le front-end local
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes HTTP autorisées
  credentials: true, // Autorise l'envoi de cookies ou d'en-têtes d'authentification
}));

// Répondre aux requêtes préliminaires (OPTIONS)
app.options('*', cors());

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Middleware pour les sessions
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// Connexion à la base de données
prisma.$connect()
  .then(() => {
    console.log('Base de données synchronisée');
  })
  .catch((err) => {
    console.error('Erreur lors de la synchronisation de la base de données :', err);
  });

// Routes
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute); 
app.use('/api/reservation', reservationRoute);
app.use('/api/contact', contactRoute);
app.use('/api/slots', slotsRoute); 

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur :', err.message);
  res.status(500).json({ error: 'Une erreur est survenue sur le serveur.' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
