import { useState, useRef, useEffect } from "react";

export type PwaSelectOption<T extends string> = {
  value: T;
  label: string;
};

type PwaSelectProps<T extends string> = {
  id?: string;
  label?: string;
  value: T;
  options: PwaSelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  "aria-label"?: string;
};

export default function PwaSelect<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: PwaSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={ref} className="pwa-select-wrap">
      {label && (
        <label
          id={id ? `${id}-label` : undefined}
          className="pwa-gallery-filters-label"
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <button
        type="button"
        id={id}
        className="pwa-select-trigger"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel ?? label ?? "Seleziona"}
        aria-labelledby={label && id ? `${id}-label` : undefined}
      >
        <span className="pwa-select-trigger-text">{selectedOption.label}</span>
        <span
          className={`pwa-select-trigger-icon ${open ? "pwa-select-trigger-icon-open" : ""}`}
          aria-hidden
        >
          <span className="material-symbols-outlined">expand_more</span>
        </span>
      </button>
      {open && (
        <ul
          className="pwa-select-dropdown"
          role="listbox"
          aria-activedescendant={id ? `${id}-opt-${value}` : undefined}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              id={id ? `${id}-opt-${opt.value}` : undefined}
              role="option"
              aria-selected={opt.value === value}
              className={`pwa-select-option ${opt.value === value ? "pwa-select-option-selected" : ""}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
