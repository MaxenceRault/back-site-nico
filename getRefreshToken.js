import { google } from 'googleapis';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:5000/oauth2callback' // Redirection URI pour le développement local
);

// Scopes d'accès requis pour Google Calendar
const scopes = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];

// Génère l'URL d'autorisation
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // Permet d'obtenir un refresh token pour un accès continu
  scope: scopes,
});

console.log('Authorize this app by visiting this url:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Demande de saisir le code d'autorisation
rl.question('Enter the code from that page here: ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Affichage des tokens d'accès et d'actualisation
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);

    // Sauvegarder les tokens pour une utilisation ultérieure
    console.log('OAuth2 credentials have been set successfully.');
  } catch (error) {
    console.error('Error retrieving access token:', error.message);
  }
});
