import { useMemo } from 'react';
import type { Memory } from '../../../api/memory';

interface MonthlyHighlightCardProps {
  memories: Memory[];
  onReview?: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthlyHighlightCard({ memories, onReview }: MonthlyHighlightCardProps) {
  const { count, monthName } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const filtered = memories.filter((m) => {
      const d = new Date(m.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    return {
      count: filtered.length,
      monthName: MONTH_NAMES[currentMonth] ?? ''
    };
  }, [memories]);

  if (count === 0) {
    return null;
  }

  return (
    <article
      className="relative overflow-hidden rounded-[2.5rem] p-10 text-center shadow-sm"
      style={{
        background: `linear-gradient(135deg, var(--monthly-highlight-gradient-from), var(--monthly-highlight-gradient-to))`,
      }}
    >
      <div
        className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 rounded-full opacity-10"
        style={{ backgroundColor: 'var(--monthly-highlight-badge-bg)' }}
      />
      <div className="relative z-10 flex flex-col items-center">
        <span
          className="mb-8 inline-block rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-white"
          style={{ backgroundColor: 'var(--monthly-highlight-badge-bg)' }}
        >
          Monthly highlight
        </span>
        <h2 className="text-4xl font-black leading-tight" style={{ color: 'var(--monthly-highlight-title)' }}>
          Our Best
          <br />
          Moments
        </h2>
        <p className="mb-10 mt-4 px-4 text-[15px] font-medium leading-relaxed" style={{ color: 'var(--monthly-highlight-text)' }}>
          Relive the {count} {count === 1 ? 'memory' : 'memories'} you captured this {monthName} together.
        </p>
        <button
          type="button"
          onClick={onReview}
          className="rounded-full px-12 py-4 text-[13px] font-black uppercase tracking-[0.1em] shadow-xl transition-transform active:scale-95"
          style={{
            backgroundColor: 'var(--monthly-highlight-button-bg)',
            color: 'var(--monthly-highlight-button-text)',
          }}
        >
          Review now
        </button>
      </div>
    </article>
  );
}
