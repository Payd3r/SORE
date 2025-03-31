import dotenv from 'dotenv';

dotenv.config();

export const SPOTIFY_CONFIG = {
  CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI,
  AUTH_URL: 'https://accounts.spotify.com/authorize',
  TOKEN_URL: 'https://accounts.spotify.com/api/token',
  API_URL: 'https://api.spotify.com/v1'
}; 