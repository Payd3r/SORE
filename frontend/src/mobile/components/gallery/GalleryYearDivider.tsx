type GalleryYearDividerProps = {
  year: number;
};

export default function GalleryYearDivider({ year }: GalleryYearDividerProps) {
  return (
    <div className="pwa-gallery-year-divider" role="separator">
      <span className="pwa-gallery-year-divider-text">{year}</span>
      <span className="pwa-gallery-year-divider-line" />
    </div>
  );
}
