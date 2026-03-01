interface AddMobileHeaderProps {
  title: string;
}

export default function AddMobileHeader({ title }: AddMobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-center px-4 pt-[env(safe-area-inset-top)] pb-2 bg-[var(--bg-card)] border-b border-[var(--border-default)]">
      <h1 className="truncate text-center text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h1>
    </header>
  );
}
