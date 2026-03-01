import { useState, useEffect } from "react";
import PwaSelect from "../ui/PwaSelect";

export type IdeasSortBy = "date_desc" | "date_asc" | "title_asc" | "title_desc";
export type IdeasStatusFilter = "all" | "open_only" | "completed_only";

export interface IdeasFiltersState {
  sortBy: IdeasSortBy;
  statusFilter: IdeasStatusFilter;
}

const DEFAULT_IDEAS_FILTERS: IdeasFiltersState = {
  sortBy: "date_desc",
  statusFilter: "all",
};

const SORT_OPTIONS: { value: IdeasSortBy; label: string }[] = [
  { value: "date_desc", label: "Più recenti" },
  { value: "date_asc", label: "Meno recenti" },
  { value: "title_asc", label: "Titolo A–Z" },
  { value: "title_desc", label: "Titolo Z–A" },
];

const STATUS_OPTIONS: { value: IdeasStatusFilter; label: string }[] = [
  { value: "all", label: "Tutte" },
  { value: "open_only", label: "Solo aperte" },
  { value: "completed_only", label: "Solo completate" },
];

type IdeasFiltersSheetProps = {
  open: boolean;
  initialFilters: IdeasFiltersState;
  onApply: (filters: IdeasFiltersState) => void;
  onClose: () => void;
};

export default function IdeasFiltersSheet({
  open,
  initialFilters,
  onApply,
  onClose,
}: IdeasFiltersSheetProps) {
  const [sortBy, setSortBy] = useState<IdeasSortBy>(initialFilters.sortBy);
  const [statusFilter, setStatusFilter] = useState<IdeasStatusFilter>(
    initialFilters.statusFilter
  );

  useEffect(() => {
    if (open) {
      setSortBy(initialFilters.sortBy);
      setStatusFilter(initialFilters.statusFilter);
    }
  }, [open, initialFilters.sortBy, initialFilters.statusFilter]);

  const handleApply = () => {
    onApply({ sortBy, statusFilter });
    onClose();
  };

  const handleReset = () => {
    onApply(DEFAULT_IDEAS_FILTERS);
    onClose();
  };

  return (
    <div className="pwa-gallery-filters-sheet">
      <div className="pwa-gallery-filters-header">
        <h2 className="pwa-gallery-filters-title">Filtri</h2>
      </div>

      <div className="pwa-gallery-filters-body">
        <div className="pwa-gallery-filters-group">
          <PwaSelect<IdeasSortBy>
            id="ideas-sort"
            label="Ordina per"
            value={sortBy}
            options={SORT_OPTIONS}
            onChange={setSortBy}
            aria-label="Ordina per"
          />
        </div>

        <div className="pwa-gallery-filters-group">
          <PwaSelect<IdeasStatusFilter>
            id="ideas-status"
            label="Stato"
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={setStatusFilter}
            aria-label="Stato"
          />
        </div>
      </div>

      <div className="pwa-gallery-filters-actions">
        <button
          type="button"
          className="pwa-gallery-filters-apply"
          onClick={handleApply}
        >
          Applica
        </button>
        <button
          type="button"
          className="pwa-gallery-filters-reset"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export { DEFAULT_IDEAS_FILTERS };
