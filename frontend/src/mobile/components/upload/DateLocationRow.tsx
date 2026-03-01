import MaterialIcon from '../ui/MaterialIcon';

interface DateLocationRowProps {
  date: string;
  onDateChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  showDate?: boolean;
}

export default function DateLocationRow({
  date,
  onDateChange,
  location,
  onLocationChange,
  showDate = true,
}: DateLocationRowProps) {
  return (
    <div className={`grid gap-3 ${showDate ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {showDate && (
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] p-4 shadow-sm">
          <div className="flex flex-col items-center gap-2">
            <MaterialIcon name="calendar_today" size={24} className="text-[var(--color-primary)]" />
            <span className="text-sm font-semibold uppercase text-[var(--text-primary)]">DATE</span>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            id="memory-date-input"
            className="mt-2 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>
      )}

      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] p-4 shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <MaterialIcon name="location_on" size={24} className="text-[var(--color-primary)]" />
          <span className="text-sm font-semibold uppercase text-[var(--text-primary)]">LOCATION</span>
        </div>
        <input
          id="location-field"
          type="text"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="Dove è successo?"
          className="mt-2 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
        />
      </div>
    </div>
  );
}
