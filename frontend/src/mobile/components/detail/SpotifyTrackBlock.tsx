import { useQuery } from "@tanstack/react-query";
import { getTrackDetails } from "../../../api/spotify";
import { FaSpotify } from "react-icons/fa";

type SpotifyTrackBlockProps = {
  song: string;
};

export default function SpotifyTrackBlock({ song }: SpotifyTrackBlockProps) {
  const { data: trackInfo, isLoading } = useQuery({
    queryKey: ["trackDetails", song],
    queryFn: () => getTrackDetails(song),
    enabled: !!song?.trim(),
    staleTime: 10 * 60 * 1000,
  });

  if (!song?.trim()) return null;

  if (isLoading) {
    return (
      <div className="pwa-spotify-block pwa-spotify-block-loading">
        <div className="pwa-spotify-block-skeleton" />
      </div>
    );
  }

  if (!trackInfo) {
    return (
      <div className="pwa-spotify-block">
        <p className="pwa-spotify-block-fallback">{song}</p>
      </div>
    );
  }

  const coverUrl =
    trackInfo.album.images[1]?.url ?? trackInfo.album.images[0]?.url;
  const artistsStr = trackInfo.artists.map((a) => a.name).join(", ");

  return (
    <div className="pwa-spotify-block">
      {coverUrl && (
        <img
          src={coverUrl}
          alt=""
          className="pwa-spotify-block-cover"
        />
      )}
      <div className="pwa-spotify-block-info">
        <p className="pwa-spotify-block-title">{trackInfo.name}</p>
        <p className="pwa-spotify-block-artists">{artistsStr}</p>
        <p className="pwa-spotify-block-album">{trackInfo.album.name}</p>
      </div>
      {trackInfo.external_urls?.spotify && (
        <a
          href={trackInfo.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="pwa-spotify-block-link"
          aria-label="Apri in Spotify"
        >
          <FaSpotify className="pwa-spotify-block-icon" />
        </a>
      )}
    </div>
  );
}
