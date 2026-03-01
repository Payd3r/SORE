import { useState, useEffect } from "react";
import PwaSelect from "../ui/PwaSelect";

export type GallerySortBy =
  | "date_desc"
  | "date_asc"
  | "title_asc"
  | "title_desc"
  | "most_viewed";

export type GalleryDateFilter = "all" | "this_year" | "last_12_months";

export interface GalleryFiltersState {
  sortBy: GallerySortBy;
  dateFilter: GalleryDateFilter;
  withSongOnly: boolean;
}

const DEFAULT_FILTERS: GalleryFiltersState = {
  sortBy: "date_desc",
  dateFilter: "all",
  withSongOnly: false,
};

const SORT_OPTIONS: { value: GallerySortBy; label: string }[] = [
  { value: "most_viewed", label: "Più visti" },
  { value: "date_desc", label: "Più recenti" },
  { value: "date_asc", label: "Meno recenti" },
  { value: "title_asc", label: "Titolo A–Z" },
  { value: "title_desc", label: "Titolo Z–A" },
];

const DATE_OPTIONS: { value: GalleryDateFilter; label: string }[] = [
  { value: "all", label: "Tutti" },
  { value: "this_year", label: "Quest'anno" },
  { value: "last_12_months", label: "Ultimi 12 mesi" },
];

type GalleryFiltersSheetProps = {
  open: boolean;
  initialFilters: GalleryFiltersState;
  onApply: (filters: GalleryFiltersState) => void;
  onClose: () => void;
};

export default function GalleryFiltersSheet({
  open,
  initialFilters,
  onApply,
  onClose,
}: GalleryFiltersSheetProps) {
  const [sortBy, setSortBy] = useState<GallerySortBy>(initialFilters.sortBy);
  const [dateFilter, setDateFilter] = useState<GalleryDateFilter>(
    initialFilters.dateFilter
  );
  const [withSongOnly, setWithSongOnly] = useState(initialFilters.withSongOnly);

  useEffect(() => {
    if (open) {
      setSortBy(initialFilters.sortBy);
      setDateFilter(initialFilters.dateFilter);
      setWithSongOnly(initialFilters.withSongOnly);
    }
  }, [open, initialFilters.sortBy, initialFilters.dateFilter, initialFilters.withSongOnly]);

  const handleApply = () => {
    onApply({ sortBy, dateFilter, withSongOnly });
    onClose();
  };

  const handleReset = () => {
    onApply(DEFAULT_FILTERS);
    onClose();
  };

  return (
    <div className="pwa-gallery-filters-sheet">
      <div className="pwa-gallery-filters-header">
        <h2 className="pwa-gallery-filters-title">Filtri</h2>
      </div>

      <div className="pwa-gallery-filters-body">
        <div className="pwa-gallery-filters-group">
          <PwaSelect<GallerySortBy>
            id="gallery-sort"
            label="Ordina per"
            value={sortBy}
            options={SORT_OPTIONS}
            onChange={setSortBy}
            aria-label="Ordina per"
          />
        </div>

        <div className="pwa-gallery-filters-group">
          <PwaSelect<GalleryDateFilter>
            id="gallery-date"
            label="Periodo"
            value={dateFilter}
            options={DATE_OPTIONS}
            onChange={setDateFilter}
            aria-label="Periodo"
          />
        </div>

        <div className="pwa-gallery-filters-row">
          <span className="pwa-gallery-filters-label">
            Solo ricordi con canzone
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={withSongOnly}
            className={`pwa-gallery-filters-toggle ${withSongOnly ? "pwa-gallery-filters-toggle-on" : ""}`}
            onClick={() => setWithSongOnly((v) => !v)}
          >
            <span className="pwa-gallery-filters-toggle-thumb" />
          </button>
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

export { DEFAULT_FILTERS };
