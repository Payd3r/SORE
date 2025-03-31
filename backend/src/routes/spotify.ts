import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/db';
import { SPOTIFY_CONFIG } from '../config/spotify';
import { ResultSetHeader } from '../types/db';
import axios from 'axios';

interface Track {
    id: string;
    name: string;
    artists: any[];
    album: {
        name: string;
    };
}

const router = express.Router();

// Get Spotify auth URL
router.get('/auth-url', auth, (req: any, res) => {
    try {
        const scopes = [
            'user-read-private',
            'user-read-email',
            'playlist-read-private',
            'playlist-read-collaborative',
            'user-read-playback-state',
            'user-modify-playback-state'
        ];

        const authUrl = `${SPOTIFY_CONFIG.AUTH_URL}?client_id=${SPOTIFY_CONFIG.CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(SPOTIFY_CONFIG.REDIRECT_URI || '')}&scope=${encodeURIComponent(scopes.join(' '))}`;

        res.json({ data: { authUrl } });
    } catch (error) {
        console.error('Errore nella generazione dell\'URL di autenticazione:', {
            error: error instanceof Error ? error.message : 'Errore sconosciuto',
            stack: error instanceof Error ? error.stack : undefined,
            user: req.user ? { id: req.user.id, coupleId: req.user.coupleId } : 'Non autenticato'
        });
        res.status(500).json({ error: 'Failed to generate auth URL' });
    }
});

// Funzione per ottenere il token di accesso da Spotify
const getSpotifyToken = async () => {
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token',
            'grant_type=client_credentials',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CONFIG.CLIENT_ID}:${SPOTIFY_CONFIG.CLIENT_SECRET}`).toString('base64')}`
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Errore nel recupero del token Spotify:', error);
        throw error;
    }
};

// Route per la ricerca delle canzoni
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Query parameter mancante' });
        }

        const token = await getSpotifyToken();
        const response = await axios.get(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(q as string)}&type=track&limit=5`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        // Restituiamo solo i dati necessari per il frontend
        res.json({
            tracks: {
                items: response.data.tracks.items.map((track: Track) => ({
                    id: track.id,
                    name: track.name,
                    artists: track.artists,
                    album: {
                        name: track.album.name
                    }
                }))
            }
        });
    } catch (error) {
        console.error('Errore nella ricerca delle canzoni:', error);
        res.status(500).json({ error: 'Errore nella ricerca delle canzoni' });
    }
});

router.get('/track', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Query parameter mancante' });
        }

        const token = await getSpotifyToken();

        // Prima cerchiamo la canzone
        const searchResponse = await axios.get(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(q as string)}&type=track&limit=1`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!searchResponse.data.tracks.items.length) {
            return res.status(404).json({ error: 'Canzone non trovata' });
        }

        const trackId = searchResponse.data.tracks.items[0].id;

        // Poi otteniamo i dettagli completi della canzone
        const trackResponse = await axios.get(
            `https://api.spotify.com/v1/tracks/${trackId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const track = trackResponse.data;

        // Formattiamo la risposta come richiesto dal frontend
        res.json({
            id: track.id,
            name: track.name,
            artists: track.artists,
            album: {
                name: track.album.name,
                images: track.album.images
            },
            external_urls: track.external_urls,
            preview_url: track.preview_url
        });
    } catch (error) {
        console.error('Errore nel recupero dei dettagli della canzone:', error);
        res.status(500).json({ error: 'Errore nel recupero dei dettagli della canzone' });
    }
});

export default router; 