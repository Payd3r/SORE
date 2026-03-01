import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { getSharedMemory } from '../api/share';
import { getImageUrl } from '../api/images';
import { useAuth } from '../contexts/AuthContext';

const formatDate = (value: string | null) => {
  if (!value) return null;
  try {
    return format(new Date(value), 'd MMM yyyy', { locale: it });
  } catch {
    return null;
  }
};

const formatType = (type: string) => {
  const normalized = type?.toUpperCase();
  if (normalized === 'VIAGGIO') return 'Viaggio';
  if (normalized === 'EVENTO') return 'Evento';
  if (normalized === 'SEMPLICE') return 'Ricordo';
  if (normalized === 'FUTURO') return 'Futuro';
  return type || 'Ricordo';
};

export default function SharedMemoryPage() {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['sharedMemory', token],
    queryFn: async () => getSharedMemory(token!),
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (isLoading) {
    return (
      <section className="pwa-page">
        <div className="pwa-page-card">
          <h1 className="pwa-page-title">Caricamento ricordo...</h1>
          <p className="pwa-page-subtitle">Stiamo preparando i dettagli condivisi.</p>
        </div>
      </section>
    );
  }

  if (isError || !data?.data) {
    return (
      <section className="pwa-page">
        <div className="pwa-page-card">
          <h1 className="pwa-page-title">Link non disponibile</h1>
          <p className="pwa-page-subtitle">Il link potrebbe essere scaduto o non valido.</p>
          <div className="pwa-idea-detail-actions">
            <Link to="/welcome" className="pwa-idea-detail-btn pwa-idea-detail-btn-save">
              Vai a SORE
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const shared = data.data;
  const startDate = formatDate(shared.start_date);
  const endDate = formatDate(shared.end_date);
  const dateLabel = startDate
    ? (endDate && endDate !== startDate ? `${startDate} - ${endDate}` : startDate)
    : null;
  const imageUrl = shared.image ? getImageUrl(shared.image) : '';

  return (
    <section className="pwa-page">
      <header className="pwa-page-header">
        <h1 className="pwa-page-title">{shared.title}</h1>
        <p className="pwa-page-subtitle">{formatType(shared.type)}</p>
      </header>

      <div className="pwa-page-card">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={shared.title}
            style={{ width: '100%', borderRadius: '16px', marginBottom: '12px', objectFit: 'cover' }}
          />
        )}

        {dateLabel && <p className="pwa-idea-detail-desc">{dateLabel}</p>}
        {shared.location && <p className="pwa-idea-detail-desc">{shared.location}</p>}
        {shared.song && <p className="pwa-idea-detail-desc">{shared.song}</p>}
        {shared.description && <p className="pwa-idea-detail-desc">{shared.description}</p>}

        <div className="pwa-idea-detail-actions" style={{ marginTop: '16px' }}>
          {isAuthenticated ? (
            <Link to={`/ricordo/${shared.memoryId}`} className="pwa-idea-detail-btn pwa-idea-detail-btn-save">
              Apri nell'app
            </Link>
          ) : (
            <Link to="/welcome" className="pwa-idea-detail-btn pwa-idea-detail-btn-save">
              Accedi a SORE
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
