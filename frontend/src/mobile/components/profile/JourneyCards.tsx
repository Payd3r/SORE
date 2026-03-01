import { useNavigate } from 'react-router-dom';
import { cn } from '../../../components/ui/cn';
import MaterialIcon from '../ui/MaterialIcon';

interface JourneyCardsProps {
  memoriesCount: number;
  tripsCount: number;
  countriesCount: number;
}

const cards: Array<{
  key: 'memories' | 'trips' | 'countries';
  label: string;
  iconName: string;
  colorClass: string;
  path: string;
}> = [
  {
    key: 'memories',
    label: 'Memories',
    iconName: 'photo_camera',
    colorClass: 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]',
    path: '/ricordi',
  },
  {
    key: 'trips',
    label: 'Trips',
    iconName: 'map',
    colorClass: 'bg-[var(--color-accent-blue)]/15 text-[var(--color-accent-blue)]',
    path: '/ricordi',
  },
  {
    key: 'countries',
    label: 'Countries',
    iconName: 'flag',
    colorClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    path: '/mappa',
  },
];

export default function JourneyCards({
  memoriesCount,
  tripsCount,
  countriesCount,
}: JourneyCardsProps) {
  const navigate = useNavigate();
  const values = {
    memories: memoriesCount,
    trips: tripsCount,
    countries: countriesCount,
  };

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
        Our Journey
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {cards.map(({ key, label, iconName, colorClass, path }) => (
          <button
            key={key}
            type="button"
            onClick={() => navigate(path)}
            className={cn(
              'flex flex-col items-start gap-2 rounded-card border border-[var(--border-default)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-md)]',
              'transition-all duration-[var(--duration-fast)]',
              'active:opacity-95 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]'
            )}
          >
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', colorClass)}>
              <MaterialIcon name={iconName} size={20} />
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)]">{values[key]}</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
              {label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
