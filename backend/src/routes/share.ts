import express from 'express';
import { RowDataPacket } from 'mysql2';
import pool from '../config/db';

const router = express.Router();

type SharedMemoryRow = RowDataPacket & {
  id: number;
  title: string;
  type: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  song: string | null;
  description: string | null;
  image_path: string | null;
  token: string;
  expires_at: string;
};

const crawlerRegex = /(whatsapp|facebookexternalhit|twitterbot|telegrambot|slackbot|discordbot|linkedinbot|skypeuripreview|googlebot|bingbot)/i;

const formatMemoryType = (type: string) => {
  const normalized = (type || '').toUpperCase();
  if (normalized === 'VIAGGIO') return 'Viaggio';
  if (normalized === 'EVENTO') return 'Evento';
  if (normalized === 'SEMPLICE') return 'Ricordo';
  if (normalized === 'FUTURO') return 'Futuro';
  return type || 'Ricordo';
};

const formatDateIt = (dateValue: string | null) => {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

const escapeHtml = (input: string) =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const toAbsoluteImageUrl = (pathValue: string | null) => {
  if (!pathValue) return null;
  if (pathValue.startsWith('http://') || pathValue.startsWith('https://')) {
    return pathValue;
  }

  const apiBase =
    process.env.API_PUBLIC_URL ||
    process.env.SHARE_BASE_URL ||
    `http://localhost:${process.env.PORT || 3002}`;

  const normalizedBase = apiBase.replace(/\/$/, '');
  const normalizedPath = pathValue.startsWith('/') ? pathValue : `/${pathValue}`;
  return `${normalizedBase}${normalizedPath}`;
};

const getShareRecordByToken = async (token: string): Promise<SharedMemoryRow | null> => {
  const [rows] = await pool.promise().query<SharedMemoryRow[]>(
    `SELECT
      m.id,
      m.title,
      m.type,
      m.start_date,
      m.end_date,
      m.location,
      m.song,
      m.description,
      COALESCE(
        (
          SELECT
            CASE
              WHEN i.webp_path IS NOT NULL AND i.webp_path != '' THEN i.webp_path
              ELSE i.thumb_big_path
            END
          FROM images i
          WHERE i.memory_id = m.id
          ORDER BY
            CASE WHEN i.display_order IS NULL THEN 1 ELSE 0 END ASC,
            CASE
              WHEN i.display_order IS NULL THEN RAND()
              ELSE i.display_order
            END ASC,
            i.created_at DESC
          LIMIT 1
        ),
        NULL
      ) AS image_path,
      st.token,
      st.expires_at
    FROM memory_share_tokens st
    INNER JOIN memories m ON m.id = st.memory_id
    WHERE st.token = ?
      AND st.expires_at > UTC_TIMESTAMP()
    ORDER BY st.created_at DESC
    LIMIT 1`,
    [token]
  );

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
};

export const sharePreviewHandler: express.RequestHandler = async (req, res) => {
  try {
    const { token } = req.params;
    const record = await getShareRecordByToken(token);

    if (!record) {
      return res.status(404).send('Link di condivisione non valido o scaduto.');
    }

    const startDate = formatDateIt(record.start_date);
    const endDate = formatDateIt(record.end_date);
    const dateLabel = startDate
      ? (endDate && endDate !== startDate ? `${startDate} - ${endDate}` : startDate)
      : null;
    const typeLabel = formatMemoryType(record.type);

    const descriptionParts = [typeLabel, dateLabel, record.location].filter(Boolean) as string[];
    const ogDescription = descriptionParts.length > 0
      ? descriptionParts.join(' · ')
      : 'Scopri questo ricordo condiviso su SORE.';

    const baseUrl =
      process.env.SHARE_BASE_URL ||
      process.env.FRONTEND_URL ||
      `http://localhost:${process.env.PORT || 3002}`;
    const normalizedBaseUrl = baseUrl.replace(/\/$/, '');

    const shareUrl = `${normalizedBaseUrl}/share/${record.token}`;
    const appUrl = `${normalizedBaseUrl}/condividi/${record.token}`;
    const imageUrl = toAbsoluteImageUrl(record.image_path);
    const userAgent = req.get('user-agent') || '';
    const isCrawler = crawlerRegex.test(userAgent);
    const noScriptRedirect = isCrawler ? appUrl : appUrl;

    const safeTitle = escapeHtml(record.title || 'Ricordo condiviso');
    const safeDescription = escapeHtml(ogDescription);
    const safeShareUrl = escapeHtml(shareUrl);
    const safeAppUrl = escapeHtml(appUrl);
    const safeImageUrl = imageUrl ? escapeHtml(imageUrl) : '';

    const imageMeta = imageUrl
      ? `
  <meta property="og:image" content="${safeImageUrl}" />
  <meta property="twitter:image" content="${safeImageUrl}" />
`
      : '';

    const html = `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle} | SORE</title>
  <meta name="description" content="${safeDescription}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:url" content="${safeShareUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="SORE" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />${imageMeta}
  <meta http-equiv="refresh" content="0;url=${escapeHtml(noScriptRedirect)}" />
</head>
<body>
  <p>Apertura del ricordo in corso...</p>
  <script>window.location.replace(${JSON.stringify(appUrl)});</script>
  <noscript><a href="${safeAppUrl}">Apri il ricordo condiviso</a></noscript>
</body>
</html>`;

    return res.status(200).type('html').send(html);
  } catch (error) {
    console.error('[Share] Error rendering share preview:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).send('Errore durante la generazione dell\'anteprima.');
  }
};

router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const record = await getShareRecordByToken(token);

    if (!record) {
      return res.status(404).json({ error: 'Share link not found or expired' });
    }

    return res.json({
      data: {
        token: record.token,
        memoryId: record.id,
        title: record.title,
        type: record.type,
        start_date: record.start_date,
        end_date: record.end_date,
        location: record.location,
        song: record.song,
        description: record.description,
        image: record.image_path,
      },
    });
  } catch (error) {
    console.error('[Share] Error fetching shared memory:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Failed to fetch shared memory' });
  }
});

export default router;
