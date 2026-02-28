import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { IoLayersOutline, IoLocateOutline } from 'react-icons/io5';
import Map from '../../desktop/components/Maps/Map';
import { getMapImages } from '../../api/map';
import { Button, Card } from '../components/ui';
import { HeaderActions, MobileHeader } from '../components/layout';
import { useMobileLoadingState } from '../hooks/useMobileLoadingState';
import { SkeletonMapMobile } from '../components/skeletons';

export default function MappaMobile() {
  const location = useLocation();

  const mapState = location.state as
    | {
        latitude?: number;
        longitude?: number;
        imageId?: string;
        imagePath?: string;
        zoom?: number;
        focusedImage?: boolean;
      }
    | null;

  const {
    data: images = [],
    isLoading,
    isFetching,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['mapImages'],
    queryFn: getMapImages,
    staleTime: 5 * 60 * 1000
  });

  const mapLoadingState = useMobileLoadingState({
    isLoading,
    data: images
  });

  const error = queryError ? queryError.message : null;

  return (
    <div className="relative h-full overflow-hidden bg-[var(--bg-page)]">
      <MobileHeader
        title="Mappa"
        className="absolute inset-x-0 top-0 z-50"
        variant="overlay"
        rightActions={
          <div className="flex items-center gap-1">
            <HeaderActions.Menu onClick={() => void refetch()} />
            <button
              type="button"
              onClick={() => void refetch()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
              aria-label="Layers"
            >
              <IoLayersOutline className="h-5 w-5" />
            </button>
          </div>
        }
      />

      <div className="h-full pt-[calc(env(safe-area-inset-top)+3.5rem)]">
        {mapLoadingState.showSkeleton ? (
          <SkeletonMapMobile />
        ) : (
          <Map
            images={images}
            isLoading={isLoading}
            error={error}
            initialLocation={
              mapState
                ? {
                    lat: mapState.latitude,
                    lon: mapState.longitude,
                    zoom: mapState.zoom || 18,
                    imageId: mapState.imageId,
                    imagePath: mapState.imagePath,
                    focusedImage: mapState.focusedImage
                  }
                : undefined
            }
          />
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 px-4 pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))]">
        <div className="pointer-events-auto ml-auto flex w-fit flex-col gap-2">
          <Button variant="icon" icon={<IoLocateOutline className="h-5 w-5" />} onClick={() => void refetch()} />
        </div>
      </div>

      {(isFetching || error) && (
        <div className="absolute inset-x-0 top-[calc(env(safe-area-inset-top)+4rem)] z-40 px-4">
          <Card className="p-3">
            <p className="text-xs text-[var(--text-secondary)]">
              {error ? 'Errore nel caricamento della mappa. Riprovo quando aggiorni.' : 'Aggiornamento mappa in corso...'}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
