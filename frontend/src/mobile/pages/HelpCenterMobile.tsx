import { MobileHeader, MobilePageWrapper } from '../components/layout';
import MaterialIcon from '../components/ui/MaterialIcon';

export default function HelpCenterMobile() {
  return (
    <MobilePageWrapper accentBg className="h-full overflow-auto pb-24">
      <MobileHeader title="Help Center" showBack />
      <section className="flex min-h-[200px] flex-col items-center justify-center pt-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-input)] text-[var(--text-tertiary)]">
          <MaterialIcon name="help" size={32} />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">Help Center</h2>
        <p className="mt-2 max-w-[280px] text-sm text-[var(--text-secondary)]">
          Domande frequenti e supporto. Funzionalità in arrivo.
        </p>
      </section>
    </MobilePageWrapper>
  );
}
