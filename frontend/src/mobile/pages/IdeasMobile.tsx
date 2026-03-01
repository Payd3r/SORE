import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Idea, IdeaType } from "../../api/ideas";
import { getIdeas, deleteIdea } from "../../api/ideas";
import IdeasHeader from "../components/layout/IdeasHeader";
import {
  IdeaTypeBadges,
  IdeasFiltersSheet,
  DEFAULT_IDEAS_FILTERS,
  type IdeasFiltersState,
} from "../components/ideas";
import IdeaListItem from "../components/home/IdeaListItem";
import IdeaDetailSheet from "../components/home/IdeaDetailSheet";
import { IdeasSkeleton } from "../components/skeletons";
import PwaBottomSheet from "../components/ui/BottomSheet";
import { invalidateOnIdeaChange } from "../utils/queryInvalidations";

type HomeIdea = {
  id: number;
  title: string;
  description: string;
  type?: string | null;
  created_at: string;
  completed_at: string | null;
};

function ideaFromApi(api: Idea): HomeIdea {
  return {
    id: api.id,
    title: api.title,
    description: api.description ?? "",
    type: api.type ?? null,
    created_at: api.created_at,
    completed_at: api.date_checked ?? null,
  };
}

function filterBySearch(ideas: HomeIdea[], query: string): HomeIdea[] {
  if (!query.trim()) return ideas;
  const q = query.trim().toLowerCase();
  return ideas.filter(
    (i) =>
      i.title.toLowerCase().includes(q) ||
      (i.description && i.description.toLowerCase().includes(q))
  );
}

function filterByType(
  ideas: HomeIdea[],
  typeFilter: "Tutti" | IdeaType
): HomeIdea[] {
  if (typeFilter === "Tutti") return ideas;
  const typeUpper = (t: string | null | undefined) => (t ?? "").toUpperCase();
  return ideas.filter((i) => typeUpper(i.type) === typeFilter);
}

function filterByStatus(
  ideas: HomeIdea[],
  statusFilter: IdeasFiltersState["statusFilter"]
): HomeIdea[] {
  if (statusFilter === "all") return ideas;
  if (statusFilter === "open_only")
    return ideas.filter((i) => !i.completed_at);
  return ideas.filter((i) => !!i.completed_at);
}

function sortIdeas(
  ideas: HomeIdea[],
  sortBy: IdeasFiltersState["sortBy"]
): HomeIdea[] {
  const out = [...ideas];
  switch (sortBy) {
    case "date_desc":
      return out.sort((a, b) => {
        const da = new Date(a.created_at).getTime();
        const db = new Date(b.created_at).getTime();
        return db - da;
      });
    case "date_asc":
      return out.sort((a, b) => {
        const da = new Date(a.created_at).getTime();
        const db = new Date(b.created_at).getTime();
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

export default function IdeasMobile() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"Tutti" | IdeaType>("Tutti");
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);
  const [filters, setFilters] = useState<IdeasFiltersState>(DEFAULT_IDEAS_FILTERS);
  const [selectedIdea, setSelectedIdea] = useState<HomeIdea | null>(null);

  const { data: ideasRaw = [], isLoading, error } = useQuery({
    queryKey: ["ideas"],
    queryFn: getIdeas,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const ideas: HomeIdea[] = useMemo(
    () => ideasRaw.map(ideaFromApi),
    [ideasRaw]
  );

  const filteredAndSorted = useMemo(() => {
    let result = filterBySearch(ideas, searchQuery);
    result = filterByType(result, typeFilter);
    result = filterByStatus(result, filters.statusFilter);
    result = sortIdeas(result, filters.sortBy);
    return result;
  }, [
    ideas,
    searchQuery,
    typeFilter,
    filters.statusFilter,
    filters.sortBy,
  ]);

  const deleteIdeaMutation = useMutation({
    mutationFn: deleteIdea,
    onSuccess: async () => {
      await invalidateOnIdeaChange(queryClient);
      setSelectedIdea(null);
    },
  });

  if (isLoading) {
    return <IdeasSkeleton />;
  }

  if (error) {
    return (
      <section className="pwa-page">
        <IdeasHeader />
        <header className="pwa-page-header">
          <h2 className="pwa-page-title">Errore</h2>
          <p className="pwa-page-subtitle">
            Non è stato possibile caricare le idee. Riprova più tardi.
          </p>
        </header>
      </section>
    );
  }

  return (
    <section className="pwa-page">
      <IdeasHeader />

      <div className="pwa-gallery-toolbar">
        <div className="pwa-gallery-search-wrap">
          <input
            type="search"
            className="pwa-gallery-search-input"
            placeholder="Cerca idee"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Cerca idee"
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

      <IdeaTypeBadges selected={typeFilter} onSelect={setTypeFilter} />

      {filteredAndSorted.length === 0 ? (
        <div className="pwa-gallery-empty">
          <p className="pwa-gallery-empty-text">Nessuna idea trovata.</p>
          <p className="pwa-gallery-empty-sub">
            Prova a cambiare filtri o ricerca.
          </p>
        </div>
      ) : (
        <div className="pwa-home-section">
          {filteredAndSorted.map((idea) => (
            <IdeaListItem
              key={idea.id}
              idea={idea}
              onSelect={(i) => setSelectedIdea(i)}
            />
          ))}
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
        open={filtersSheetOpen}
        onClose={() => setFiltersSheetOpen(false)}
      >
        <IdeasFiltersSheet
          open={filtersSheetOpen}
          initialFilters={filters}
          onApply={setFilters}
          onClose={() => setFiltersSheetOpen(false)}
        />
      </PwaBottomSheet>
    </section>
  );
}
