import { useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { getMemoryCarousel } from "../../../api/memory";
import { getImageUrl } from "../../../api/images";
import PwaSkeleton from "../skeletons/PwaSkeleton";

type DetailCarouselProps = {
  memoryId: string;
  onImageClick?: (createdAt: string) => void;
};

interface CarouselImageItem {
  image: string;
  created_at: string;
}

export default function DetailCarousel({ memoryId, onImageClick }: DetailCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const minSwipeDistance = 50;

  const { data: carouselData = [], isLoading } = useQuery({
    queryKey: ["memoryCarousel", memoryId],
    queryFn: async () => {
      const res = await getMemoryCarousel(memoryId);
      return res.data;
    },
    enabled: !!memoryId,
    staleTime: 5 * 60 * 1000,
  });

  const images: { url: string; created_at: string }[] = (carouselData as CarouselImageItem[]).map(
    (img) => ({ url: getImageUrl(img.image), created_at: img.created_at })
  );

  const goPrev = useCallback(() => {
    if (isTransitioning || images.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  }, [images.length, isTransitioning]);

  const goNext = useCallback(() => {
    if (isTransitioning || images.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
    setTimeout(() => setIsTransitioning(false), 300);
  }, [images.length, isTransitioning]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => {
    const diff = touchEndX.current - touchStartX.current;
    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) goPrev();
      else goNext();
    }
  }, [goPrev, goNext]);

  if (isLoading) {
    return (
      <div className="pwa-detail-carousel">
        <PwaSkeleton
          style={{ width: "100%", height: "100%", borderRadius: 0 }}
        />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="pwa-detail-carousel pwa-detail-carousel-empty">
        <span className="material-symbols-outlined">photo_library</span>
        <p>Nessuna foto nel carousel</p>
      </div>
    );
  }

  const current = images[currentIndex];
  const dateTimeStr = current.created_at
    ? format(new Date(current.created_at), "d MMM yyyy 'alle' HH:mm", { locale: it })
    : "";

  return (
    <div
      className="pwa-detail-carousel"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={() => {
        if (!images.length) return;
        const img = images[currentIndex];
        if (!img.created_at) return;
        onImageClick?.(img.created_at);
      }}
      role="region"
      aria-label="Carousel foto del ricordo"
    >
      <div className="pwa-detail-carousel-inner">
        {images.map((img, index) => (
          <img
            key={`${img.url}-${index}`}
            src={img.url}
            alt=""
            className={`pwa-detail-carousel-img ${index === currentIndex ? "pwa-detail-carousel-img-active" : ""}`}
            loading={index === currentIndex ? "eager" : "lazy"}
          />
        ))}
      </div>
      {dateTimeStr && (
        <div className="pwa-detail-carousel-caption">{dateTimeStr}</div>
      )}
      <div className="pwa-detail-carousel-counter">
        {currentIndex + 1} / {images.length}
      </div>
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="pwa-detail-carousel-arrow pwa-detail-carousel-arrow-prev"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Foto precedente"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            type="button"
            className="pwa-detail-carousel-arrow pwa-detail-carousel-arrow-next"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Foto successiva"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </>
      )}
    </div>
  );
}
