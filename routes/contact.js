import express from 'express';
import { PrismaClient } from '@prisma/client';
import transporter from '../mailer.js';

const router = express.Router();
const prisma = new PrismaClient();

// Envoyer un message de contact
router.post('/', async (req, res) => {
  const { nom, email, message } = req.body;

  // Log des données reçues
  console.log('Données reçues:', { nom, email, message });

  // Validation des champs
  if (!nom || !email || !message) {
    console.log('Validation échouée: Tous les champs sont requis');
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    // Enregistrer le message dans la base de données
    await prisma.contact.create({
      data: { nom, email, message },
    });

    // Configurer et envoyer l'email à l'administrateur
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER, // L'adresse email de réception des messages de contact
      subject: `Nouveau message de contact de ${nom}`,
      text: `Nom: ${nom}\nEmail: ${email}\nMessage: ${message}`,
    };

    transporter.sendMail(adminMailOptions, (error, info) => {
      if (error) {
        console.error('Erreur lors de l\'envoi de l\'email à l\'administrateur:', error);
      } else {
        console.log('Email envoyé à l\'administrateur:', info.response);
      }
    });

    // Configurer et envoyer l'email de confirmation à l'utilisateur
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email, // L'adresse email fournie dans le formulaire
      subject: 'Confirmation de réception de votre message',
      text: `Bonjour ${nom},\n\nNous avons bien reçu votre message et nous vous répondrons très prochainement.\n\nCordialement,\nNicolas Lanternier`,
    };

    transporter.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
        return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email de confirmation' });
      }
      console.log('Email de confirmation envoyé à l\'utilisateur:', info.response);
      res.json({ message: 'Message envoyé avec succès et email de confirmation envoyé' });
    });

  } catch (err) {
    console.error('Erreur lors de l\'envoi du message:', err);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
});

export default router;
