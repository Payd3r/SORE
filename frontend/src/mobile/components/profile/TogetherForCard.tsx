interface TogetherForCardProps {
  /** Giorni insieme calcolati da anniversary_date */
  daysTogether: number;
  /** Utilizzo spazio (placeholder: "24.5 GB / 50 GB") */
  storageUsed?: string;
  /** Percentuale usata per la barra (0-100), default da storageUsed o 49 */
  storagePercent?: number;
}

export default function TogetherForCard({
  daysTogether,
  storageUsed = '24.5 GB / 50 GB',
  storagePercent = 49,
}: TogetherForCardProps) {
  return (
    <section className="space-y-3">
      <div
        className="relative overflow-hidden rounded-card p-5 shadow-[var(--shadow-md)]"
        style={{ backgroundColor: 'var(--color-together-card)' }}
      >
        <div
          className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full opacity-20"
          style={{ backgroundColor: 'var(--color-together-card-accent)' }}
          aria-hidden
        />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-white/90">
          Together for
        </h3>
        <p className="mt-1 text-2xl font-bold text-white">{daysTogether} Days</p>
        <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-white/80">
          Shared Space
        </h4>
        <p className="mt-1 text-sm font-medium text-white/90">{storageUsed}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/30">
          <div
            className="h-full rounded-full bg-white/90 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, storagePercent))}%` }}
          />
        </div>
      </div>
    </section>
  );
}
