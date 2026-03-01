import { MobileHeader, MobilePageWrapper } from '../components/layout';
import MaterialIcon from '../components/ui/MaterialIcon';

export default function ShareSpaceMobile() {
  return (
    <MobilePageWrapper accentBg className="h-full overflow-auto pb-24">
      <MobileHeader title="Share Space" showBack />
      <section className="flex min-h-[200px] flex-col items-center justify-center pt-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
          <MaterialIcon name="share" size={32} />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">Share Space</h2>
        <p className="mt-2 max-w-[280px] text-sm text-[var(--text-secondary)]">
          Gestione dello spazio condiviso tra i partner. Funzionalità in arrivo.
        </p>
      </section>
    </MobilePageWrapper>
  );
}
