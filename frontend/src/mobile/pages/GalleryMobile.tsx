import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMemories, getMemory, updateMemory, deleteMemory } from "../../api/memory";
import type { Memory, MemoryType, MemoriesSortBy } from "../../api/memory";
import GalleryHeader from "../components/layout/GalleryHeader";
import {
  GalleryCategoryBadges,
  GalleryFiltersSheet,
  GalleryMemoryCard,
  GalleryYearDivider,
  DEFAULT_FILTERS,
  type GalleryFiltersState,
} from "../components/gallery";
import { GallerySkeleton } from "../components/skeletons";
import PwaBottomSheet from "../components/ui/BottomSheet";
import MobileLoader from "../components/ui/Loader";
import MemoryDetailSheetFuturo from "../components/detail/MemoryDetailSheetFuturo";
import { invalidateOnMemoryChange } from "../utils/queryInvalidations";
import { usePwaPrefetch } from "../hooks";

function filterBySearch(memories: Memory[], query: string): Memory[] {
  if (!query.trim()) return memories;
  const q = query.trim().toLowerCase();
  return memories.filter((m) => m.title.toLowerCase().includes(q));
}

function filterByCategory(
  memories: Memory[],
  category: "Tutti" | MemoryType
): Memory[] {
  if (category === "Tutti") return memories;
  const typeUpper = (t: string | undefined) => (t ?? "").toUpperCase();
  return memories.filter(
    (m) => typeUpper(m.type) === typeUpper(category)
  );
}

function filterByDate(
  memories: Memory[],
  dateFilter: GalleryFiltersState["dateFilter"]
): Memory[] {
  if (dateFilter === "all") return memories;
  const now = new Date();
  const thisYear = now.getFullYear();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  return memories.filter((m) => {
    const d = m.start_date ? new Date(m.start_date) : null;
    if (!d) return false;
    if (dateFilter === "this_year") return d.getFullYear() === thisYear;
    if (dateFilter === "last_12_months") return d >= oneYearAgo;
    return true;
  });
}

function filterBySong(memories: Memory[], withSongOnly: boolean): Memory[] {
  if (!withSongOnly) return memories;
  return memories.filter((m) => Boolean(m.song?.trim()));
}

function sortMemories(
  memories: Memory[],
  sortBy: GalleryFiltersState["sortBy"]
): Memory[] {
  const out = [...memories];
  switch (sortBy) {
    case "most_viewed":
      return out.sort((a, b) => {
        const viewsA = a.view_count ?? 0;
        const viewsB = b.view_count ?? 0;
        if (viewsA !== viewsB) return viewsB - viewsA;
        const viewedA = a.last_viewed_at ? new Date(a.last_viewed_at).getTime() : 0;
        const viewedB = b.last_viewed_at ? new Date(b.last_viewed_at).getTime() : 0;
        return viewedB - viewedA;
      });
    case "date_desc":
      return out.sort((a, b) => {
        const da = a.start_date ? new Date(a.start_date).getTime() : 0;
        const db = b.start_date ? new Date(b.start_date).getTime() : 0;
        return db - da;
      });
    case "date_asc":
      return out.sort((a, b) => {
        const da = a.start_date ? new Date(a.start_date).getTime() : 0;
        const db = b.start_date ? new Date(b.start_date).getTime() : 0;
        return da - db;
      });
    case "title_asc":
      return out.sort((a, b) =>
        (a.title || "").localeCompare(b.title || "", "it")
      );
    case "title_desc":
      return out.sort((a, b) =>
        (b.title || "").localeCompare(a.title || "", "it")
      );
    default:
      return out;
  }
}

function groupByYear(memories: Memory[]): Map<number, Memory[]> {
  const map = new Map<number, Memory[]>();
  for (const m of memories) {
    const year = m.start_date
      ? new Date(m.start_date).getFullYear()
      : new Date().getFullYear();
    const list = map.get(year) ?? [];
    list.push(m);
    map.set(year, list);
  }
  const sorted = new Map(
    [...map.entries()].sort((a, b) => b[0] - a[0])
  );
  return sorted;
}

export default function GalleryMobile() {
  const queryClient = useQueryClient();
  const { prefetchMemoryDetails } = usePwaPrefetch();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"Tutti" | MemoryType>(
    "Tutti"
  );
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);
  const [filters, setFilters] = useState<GalleryFiltersState>(DEFAULT_FILTERS);
  const [futuroSheetMemoryId, setFuturoSheetMemoryId] = useState<number | null>(null);
  const [futuroDeleteConfirmOpen, setFuturoDeleteConfirmOpen] = useState(false);
  const [futuroDeleting, setFuturoDeleting] = useState(false);

  const serverSort: MemoriesSortBy =
    filters.sortBy === "most_viewed" ? "most_viewed" : "created_desc";

  const {
    data: memories = [],
    status,
    error,
  } = useQuery({
    queryKey: ["memories", { sort: serverSort }],
    queryFn: () => getMemories({ sort: serverSort }),
    // Cache breve ma stabile: evita continui refetch mentre scorri
    // e mantiene i dati precedenti durante i ricaricamenti.
    staleTime: 60 * 1000, // 1 minuto
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
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

  const filteredAndSorted = useMemo(() => {
    let result = filterBySearch(memories, searchQuery);
    result = filterByCategory(result, categoryFilter);
    result = filterByDate(result, filters.dateFilter);
    result = filterBySong(result, filters.withSongOnly);
    result = sortMemories(result, filters.sortBy);
    return result;
  }, [
    memories,
    searchQuery,
    categoryFilter,
    filters.dateFilter,
    filters.withSongOnly,
    filters.sortBy,
  ]);

  const byYear = useMemo(
    () => groupByYear(filteredAndSorted),
    [filteredAndSorted]
  );

  useEffect(() => {
    const visibleCandidateIds = filteredAndSorted.slice(0, 3).map((memory) => memory.id);
    if (visibleCandidateIds.length > 0) {
      void prefetchMemoryDetails(visibleCandidateIds);
    }
  }, [filteredAndSorted, prefetchMemoryDetails]);

  if (status === "pending") {
    return <GallerySkeleton />;
  }

  if (error) {
    return (
      <section className="pwa-page">
        <GalleryHeader />
        <header className="pwa-page-header">
          <h2 className="pwa-page-title">Errore</h2>
          <p className="pwa-page-subtitle">
            Non è stato possibile caricare i ricordi. Riprova più tardi.
          </p>
        </header>
      </section>
    );
  }

  return (
    <section className="pwa-page">
      <GalleryHeader />

      <div className="pwa-gallery-toolbar">
        <div className="pwa-gallery-search-wrap">
          <input
            type="search"
            className="pwa-gallery-search-input"
            placeholder="Cerca ricordi"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Cerca ricordi"
          />
        </div>
        <button
          type="button"
          className="pwa-gallery-filter-btn"
          onClick={() => setFiltersSheetOpen(true)}
          aria-label="Apri filtri"
        >
          <span className="material-symbols-outlined">tune</span>
        </button>
      </div>

      <GalleryCategoryBadges
        selected={categoryFilter}
        onSelect={setCategoryFilter}
      />

      {filteredAndSorted.length === 0 ? (
        <div className="pwa-gallery-empty">
          <p className="pwa-gallery-empty-text">Nessun ricordo trovato.</p>
          <p className="pwa-gallery-empty-sub">
            Prova a cambiare filtri o ricerca.
          </p>
        </div>
      ) : (
        <>
          {Array.from(byYear.entries()).map(([year, yearMemories]) => (
            <div key={year} className="pwa-gallery-year-section">
              <GalleryYearDivider year={year} />
              <div className="pwa-gallery-grid">
                {yearMemories.map((memory) => (
                  <GalleryMemoryCard
                    key={memory.id}
                    memory={memory}
                    onFuturoClick={(m) => setFuturoSheetMemoryId(m.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      <PwaBottomSheet
        open={filtersSheetOpen}
        onClose={() => setFiltersSheetOpen(false)}
      >
        <GalleryFiltersSheet
          open={filtersSheetOpen}
          initialFilters={filters}
          onApply={setFilters}
          onClose={() => setFiltersSheetOpen(false)}
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
    </section>
  );
}
