import { useState } from 'react';
import DeleteAccountModal from '../../desktop/components/Profile/DeleteAccountModal';
import MaterialIcon from '../components/ui/MaterialIcon';
import { ChangePassModal } from '../../desktop/components/Profile/ChangePassModal';
import { MobileHeader, MobilePageWrapper } from '../components/layout';
import Card from '../components/ui/Card';

export default function PrivacySecurityMobile() {
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <MobilePageWrapper accentBg className="h-full overflow-auto pb-24">
      <MobileHeader title="Privacy & Security" showBack />
      <section className="space-y-4 pt-4">
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
            Privacy & Security
          </h3>
          <Card className="divide-y divide-[var(--border-default)] p-0">
            <button
              type="button"
              onClick={() => setIsChangePassOpen(true)}
              className="flex w-full items-center gap-3 bg-[var(--bg-card)] px-4 py-3 text-left text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-input)] active:opacity-90"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                <MaterialIcon name="key" size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Cambia password</p>
                <p className="text-xs text-[var(--text-tertiary)]">Aggiorna la tua password per maggiore sicurezza</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              className="flex w-full items-center gap-3 bg-[var(--bg-card)] px-4 py-3 text-left text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-input)] active:opacity-90"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15">
                <MaterialIcon name="delete" size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Elimina account</p>
                <p className="text-xs text-[var(--text-tertiary)]">Elimina definitivamente il tuo account</p>
              </div>
            </button>
          </Card>
        </div>
      </section>

      <ChangePassModal
        isOpen={isChangePassOpen}
        onClose={() => setIsChangePassOpen(false)}
      />
      <DeleteAccountModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} />
    </MobilePageWrapper>
  );
}
