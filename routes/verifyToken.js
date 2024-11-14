import jwt from 'jsonwebtoken';

const verify = (req, res, next) => {
  // Récupère le token dans l'en-tête de la requête
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).json({ error: 'Accès refusé. Aucun token fourni.' });
  }

  try {
    // Vérifie la validité du token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Ajoute les données vérifiées au `req.user`
    next(); // Passe à la suite
  } catch (err) {
    // Gère les erreurs de vérification du token
    res.status(400).json({ error: 'Token invalide' });
  }
};

export default verify;
