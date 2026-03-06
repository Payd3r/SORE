import { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getHomeData } from "../../api/home";
import { getMemories, getMemory, updateMemory, deleteMemory } from "../../api/memory";
import type { Memory } from "../../api/memory";
import { deleteIdea } from "../../api/ideas";
import { useUpload } from "../../contexts/UploadContext";
import HomeHeader from "../components/layout/HomeHeader";
import TripCardsCarousel from "../components/home/TripCardsCarousel";
import IdeaListItem from "../components/home/IdeaListItem";
import MemoryCardSmall from "../components/home/MemoryCardSmall";
import IdeaDetailSheet from "../components/home/IdeaDetailSheet";
import UploadBanner from "../components/home/UploadBanner";
import UploadDetailSheet from "../components/home/UploadDetailSheet";
import MemoryDetailSheetFuturo from "../components/detail/MemoryDetailSheetFuturo";
import { HomeSkeleton } from "../components/skeletons";
import { useScrollEdgeMask } from "../hooks";
import PwaBottomSheet from "../components/ui/BottomSheet";
import MobileLoader from "../components/ui/Loader";
import {
  invalidateOnIdeaChange,
  invalidateOnMemoryChange,
} from "../utils/queryInvalidations";

type HomeIdea = {
  id: number;
  title: string;
  description: string;
  type?: string | null;
  created_at: string;
  completed_at: string | null;
};

function SimpleMemoriesCarousel({
  memories,
  cardSize = "default",
  showDate = true,
}: {
  memories: Memory[];
  cardSize?: "default" | "large";
  showDate?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { atStart, atEnd } = useScrollEdgeMask(scrollRef);
  const fadeClasses = `pwa-scroll-horizontal pwa-scroll-horizontal-fade${atStart ? " at-start" : ""}${atEnd ? " at-end" : ""}`;
  return (
    <div ref={scrollRef} className={fadeClasses} role="list">
      {memories.map((memory) => (
        <MemoryCardSmall key={memory.id} memory={memory} size={cardSize} showDate={showDate} />
      ))}
    </div>
  );
}

function sortMemoriesByDate(memories: Memory[]): Memory[] {
  return [...memories].sort((a, b) => {
    const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
    const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
    return dateB - dateA;
  });
}

function normalizeMemoryType(type?: string): Memory["type"] {
  const upper = (type ?? "").toUpperCase();
  if (upper === "VIAGGIO" || upper === "EVENTO" || upper === "SEMPLICE" || upper === "FUTURO") {
    return upper;
  }
  return "SEMPLICE";
}

export default function HomeMobile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedIdea, setSelectedIdea] = useState<HomeIdea | null>(null);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [futuroSheetMemoryId, setFuturoSheetMemoryId] = useState<number | null>(null);
  const [futuroDeleteConfirmOpen, setFuturoDeleteConfirmOpen] = useState(false);
  const [futuroDeleting, setFuturoDeleting] = useState(false);
  const deleteIdeaMutation = useMutation({
    mutationFn: deleteIdea,
    onSuccess: () => {
      void invalidateOnIdeaChange(queryClient);
      setSelectedIdea(null);
    },
  });
  const {
    jobs,
    summary,
    hasActiveUploads,
    retryFailedFiles,
    cancelJob,
    clearFinishedJobs,
  } = useUpload();

  const { data: homeData, isLoading: isLoadingHome, error } = useQuery({
    queryKey: ["homeData"],
    queryFn: getHomeData,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const { data: memories = [], isLoading: isLoadingMemories } = useQuery({
    queryKey: ["memories"],
    queryFn: () => getMemories(),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const { data: futuroMemory } = useQuery({
    queryKey: ["memory", futuroSheetMemoryId],
    queryFn: async () => {
      const res = await getMemory(String(futuroSheetMemoryId!));
      return res.data;
    },
    enabled: futuroSheetMemoryId != null,
    staleTime: 3 * 60 * 1000,
    placeholderData: () =>
      memories.find((memory) => memory.id === futuroSheetMemoryId),
  });

  const handleSaveFuturoMemory = async (data: Partial<Memory>) => {
    if (futuroSheetMemoryId == null) return;
    await updateMemory(String(futuroSheetMemoryId), data);
    await invalidateOnMemoryChange(queryClient, futuroSheetMemoryId);
  };

  const handleConfirmFuturoDelete = async () => {
    if (futuroSheetMemoryId == null) return;
    setFuturoDeleting(true);
    try {
      await deleteMemory(String(futuroSheetMemoryId));
      await invalidateOnMemoryChange(queryClient, futuroSheetMemoryId);
      setFuturoDeleteConfirmOpen(false);
      setFuturoSheetMemoryId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setFuturoDeleting(false);
    }
  };

  const trips = useMemo(() => {
    const typeUpper = (t: string | undefined) => (t ?? "").toUpperCase();
    const filtered = memories.filter((m) => typeUpper(m.type) === "VIAGGIO");
    if (filtered.length > 0) return sortMemoriesByDate(filtered);
    return sortMemoriesByDate(memories);
  }, [memories]);

  const simpleMemories = useMemo(() => {
    const typeUpper = (t: string | undefined) => (t ?? "").toUpperCase();
    const filtered = memories.filter(
      (m) => typeUpper(m.type) === "SEMPLICE" || typeUpper(m.type) === "EVENTO"
    );
    return sortMemoriesByDate(filtered);
  }, [memories]);

  const mostViewedMemories = useMemo(() => {
    const items = homeData?.data?.most_viewed_memories ?? [];

    if (items.length > 0) {
      return items.map((item) => {
        const memoryFromList = memories.find((memory) => memory.id === item.id);
        if (memoryFromList) {
          return memoryFromList;
        }
        return {
          id: item.id,
          title: item.title,
          type: normalizeMemoryType(item.type),
          start_date: item.start_date,
          end_date: item.end_date,
          location: null,
          song: null,
          images: item.image
            ? [
              {
                id: item.id,
                thumb_path: null,
                thumb_small_path: null,
                thumb_big_path: item.image,
                webp_path: null,
                created_at: item.last_viewed_at ?? "",
                display_order: null,
              },
            ]
            : [],
          created_at: item.last_viewed_at ?? "",
          updated_at: item.last_viewed_at ?? "",
          tot_img: item.image ? 1 : 0,
          view_count: item.view_count,
          last_viewed_at: item.last_viewed_at,
        } as Memory;
      });
    }

    // Fallback: usa memories ordinati per view_count (o più recenti)
    return [...memories]
      .sort((a, b) => {
        const va = a.view_count ?? 0;
        const vb = b.view_count ?? 0;
        if (va !== vb) return vb - va;
        const da = a.start_date ? new Date(a.start_date).getTime() : 0;
        const db = b.start_date ? new Date(b.start_date).getTime() : 0;
        return db - da;
      })
      .slice(0, 10);
  }, [homeData, memories]);

  const ideas: HomeIdea[] = useMemo(() => {
    const raw = homeData?.data?.Ideas ?? [];
    return raw
      .filter((i) => !i.date_checked)
      .slice(0, 5)
      .map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description ?? "",
        type: i.type ?? null,
        created_at: i.created_at,
        completed_at: i.date_checked ?? null,
      }));
  }, [homeData]);

  const isLoading = isLoadingHome || isLoadingMemories;

  if (isLoading) {
    return <HomeSkeleton />;
  }

  if (error) {
    return (
      <section className="pwa-page">
        <header className="pwa-page-header">
          <h1 className="pwa-page-title">Errore</h1>
          <p className="pwa-page-subtitle">
            Non è stato possibile caricare i dati. Riprova più tardi.
          </p>
        </header>
      </section>
    );
  }

  return (
    <section className="pwa-page">
      <HomeHeader />

      {jobs.length > 0 && (
        <UploadBanner
          summary={summary}
          hasActiveUploads={hasActiveUploads}
          onClick={() => setUploadSheetOpen(true)}
        />
      )}

      {trips.length > 0 && (
        <div className="pwa-home-section">
          <TripCardsCarousel
            trips={trips}
            onFuturoClick={(m) => setFuturoSheetMemoryId(m.id)}
          />
        </div>
      )}

      {ideas.length > 0 && (
        <div className="pwa-home-section">
          <div className="pwa-section-title">
            <h2>Ultime idee</h2>
            <button
              type="button"
              className="pwa-section-link"
              onClick={() => navigate("/idee")}
            >
              Vedi tutte
            </button>
          </div>
          {ideas.map((idea) => (
            <IdeaListItem
              key={idea.id}
              idea={idea}
              onSelect={(i) => setSelectedIdea(i)}
            />
          ))}
        </div>
      )}

      {mostViewedMemories.length > 0 && (
        <div className="pwa-home-section">
          <div className="pwa-section-title">
            <h2>Più visti</h2>
            <button
              type="button"
              className="pwa-section-link"
              onClick={() => navigate("/galleria")}
            >
              Vedi tutti
            </button>
          </div>
          <SimpleMemoriesCarousel memories={mostViewedMemories} cardSize="large" />
        </div>
      )}

      <div className="pwa-home-section">
        <button
          type="button"
          className="pwa-best-moments-cta"
          onClick={() => navigate("/galleria")}
        >
          Our Best Moments
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>

      {simpleMemories.length > 0 && (
        <div className="pwa-home-section">
          <div className="pwa-section-title">
            <h2>Ricordi semplici</h2>
            <button
              type="button"
              className="pwa-section-link"
              onClick={() => navigate("/ricordi")}
            >
              Vedi tutti
            </button>
          </div>
          <SimpleMemoriesCarousel memories={simpleMemories} showDate={false} />
        </div>
      )}

      <PwaBottomSheet
        open={!!selectedIdea}
        onClose={() => setSelectedIdea(null)}
      >
        <IdeaDetailSheet
          idea={selectedIdea}
          onClose={() => setSelectedIdea(null)}
          onDelete={(idea) => {
            deleteIdeaMutation.mutate(idea.id);
          }}
          onSaved={(updated) => setSelectedIdea(updated)}
        />
      </PwaBottomSheet>

      <PwaBottomSheet
        open={futuroSheetMemoryId != null}
        onClose={() => {
          setFuturoSheetMemoryId(null);
          setFuturoDeleteConfirmOpen(false);
        }}
      >
        {futuroMemory && (
          <MemoryDetailSheetFuturo
            memory={futuroMemory}
            onClose={() => setFuturoSheetMemoryId(null)}
            onSave={handleSaveFuturoMemory}
            onDelete={() => setFuturoDeleteConfirmOpen(true)}
          />
        )}
        {futuroSheetMemoryId != null && !futuroMemory && (
          <div className="pwa-page">
            <MobileLoader text="Caricamento..." subText="Stiamo preparando il ricordo" />
          </div>
        )}
      </PwaBottomSheet>

      <PwaBottomSheet
        open={futuroDeleteConfirmOpen}
        onClose={() => !futuroDeleting && setFuturoDeleteConfirmOpen(false)}
      >
        <div
          className="pwa-idea-detail-sheet"
          role="alertdialog"
          aria-labelledby="futuro-delete-title"
          aria-describedby="futuro-delete-desc"
        >
          <h2 id="futuro-delete-title" className="pwa-memory-edit-sheet-title">
            Elimina ricordo
          </h2>
          <p id="futuro-delete-desc" className="pwa-idea-detail-desc">
            Vuoi eliminare questo ricordo? Questa azione non si può annullare.
          </p>
          <div className="pwa-idea-detail-actions">
            <button
              type="button"
              className="pwa-idea-detail-btn pwa-idea-detail-btn-cancel"
              onClick={() => setFuturoDeleteConfirmOpen(false)}
              disabled={futuroDeleting}
            >
              Annulla
            </button>
            <button
              type="button"
              className="pwa-idea-detail-btn pwa-idea-detail-btn-save"
              style={{ background: "var(--pwa-accent-red, #dc2626)" }}
              onClick={handleConfirmFuturoDelete}
              disabled={futuroDeleting}
            >
              {futuroDeleting ? "Eliminazione..." : "Elimina"}
            </button>
          </div>
        </div>
      </PwaBottomSheet>

      <PwaBottomSheet
        open={uploadSheetOpen}
        onClose={() => setUploadSheetOpen(false)}
      >
        <UploadDetailSheet
          jobs={jobs}
          summary={summary}
          onClose={() => setUploadSheetOpen(false)}
          onRetry={retryFailedFiles}
          onCancelJob={(id) => void cancelJob(id)}
          onClearFinished={() => void clearFinishedJobs()}
        />
      </PwaBottomSheet>
    </section>
  );
}
