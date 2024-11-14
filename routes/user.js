import express from 'express';
import { PrismaClient } from '@prisma/client';
import verify from './verifyToken.js';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcrypt';

const router = express.Router();
const prisma = new PrismaClient();

// Configuration de multer pour le stockage des images de profil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// Obtenir le profil utilisateur
router.get('/profile', verify, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

// Mettre à jour le profil utilisateur
router.put('/profile', verify, upload.single('photo'), async (req, res) => {
  const { nom, email, motDePasse } = req.body;
  const photo = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    // Construire l'objet `data` avec les champs fournis
    const data = {};
    if (nom) data.nom = nom;
    if (email) data.email = email;
    if (photo) data.photo = photo;

    if (motDePasse) {
      // Hash le mot de passe si un nouveau mot de passe est fourni
      const salt = await bcrypt.genSalt(10);
      data.motDePasse = await bcrypt.hash(motDePasse, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});

export default router;
