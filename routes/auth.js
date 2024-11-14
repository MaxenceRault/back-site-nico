import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Inscription
router.post('/register', async (req, res) => {
  const { nom, email, motDePasse } = req.body;

  // Validation des champs
  if (!nom || !email || !motDePasse) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    // Vérification si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet utilisateur existe déjà' });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Création de l'utilisateur dans la base de données
    const user = await prisma.user.create({
      data: { nom, email, motDePasse: hashedPassword },
    });

    // Génération du token JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.header('auth-token', token).json({
      token,
      message: 'Utilisateur enregistré avec succès',
    });
  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err.message);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  const { email, motDePasse } = req.body;

  // Validation des champs
  if (!email || !motDePasse) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    // Recherche de l'utilisateur par email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérification du mot de passe
    const validPassword = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!validPassword) {
      return res.status(400).json({ error: 'Mot de passe incorrect' });
    }

    // Génération du token JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.header('auth-token', token).json({
      token,
      message: 'Connexion réussie',
    });
  } catch (err) {
    console.error('Erreur lors de la connexion:', err.message);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

export default router;
