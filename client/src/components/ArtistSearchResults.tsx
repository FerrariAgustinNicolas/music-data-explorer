import type { ArtistSearchResult, AlbumSearchResult } from "../types";

interface ArtistSearchResultsProps {
  results: ArtistSearchResult[] | AlbumSearchResult[];
  mode: "artist" | "album";
  onSelectArtist: (name: string) => void;
  onOpenAlbum?: (artist: string, name: string) => void;
}

const ArtistSearchResults = ({ results, mode, onSelectArtist, onOpenAlbum }: ArtistSearchResultsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {results.map((item) => (
        <button
          key={`${item.name}-${"mbid" in item ? item.mbid : ""}`}
          onClick={() =>
            mode === "artist"
              ? onSelectArtist(item.name)
              : onOpenAlbum?.("artist" in item ? item.artist : "", item.name)
          }
          className="glass rounded-2xl p-4 text-left hover:border-glow transition"
        >
          <div className="flex items-center gap-4">
            {"image" in item && item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="h-16 w-16 rounded-xl object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-400">
                {mode === "artist" ? "Artist" : "Album"}
              </div>
            )}
            <div>
              <h3 className="font-display text-lg">{item.name}</h3>
              {mode === "artist" && "listeners" in item ? (
                <p className="text-sm text-slate-400">Listeners: {item.listeners.toLocaleString()}</p>
              ) : (
                <p className="text-sm text-slate-400">
                  {"artist" in item ? item.artist : "Album"}{" "}
                  {"playcount" in item && item.playcount ? `· Plays: ${item.playcount.toLocaleString()}` : ""}
                </p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ArtistSearchResults;
