/**
 * Material Symbols Outlined – wrapper per uso coerente nella PWA.
 * Richiede il font caricato in index.html.
 */
interface MaterialIconProps {
  name: string;
  className?: string;
  size?: number;
  /** font-variation-settings: 'FILL' 0|1, 'wght' 100-700 */
  fill?: 0 | 1;
  weight?: number;
}

export default function MaterialIcon({
  name,
  className = '',
  size = 24,
  fill = 0,
  weight = 400,
}: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}`,
      }}
      aria-hidden
    >
      {name}
    </span>
  );
}
