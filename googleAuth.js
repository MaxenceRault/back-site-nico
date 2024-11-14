import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:5000/oauth2callback' // URL de redirection
);

// Génère l'URL d'autorisation OAuth2
export const getAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
  ];
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
};

// Échange le code d'autorisation contre les tokens d'accès et d'actualisation
export const getTokens = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error('Erreur lors de l\'obtention des tokens :', error.message);
    throw error;
  }
};

// Définit les tokens pour le client OAuth2 si déjà obtenus
export const setCredentials = (tokens) => {
  oauth2Client.setCredentials(tokens);
};

// Récupère les événements à venir du calendrier
export const getCalendarEvents = async () => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return res.data.items;
  } catch (error) {
    console.error('Erreur lors de la récupération des événements du calendrier :', error.message);
    throw error;
  }
};

// Ajoute un événement au calendrier
export const addCalendarEvent = async (event) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const res = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    return res.data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'événement au calendrier :', error.message);
    throw error;
  }
};
