interface ArtistHeaderProps {
  name: string;
  image: string | null;
  bioSummary: string | null;
}

const ArtistHeader = ({ name, image, bioSummary }: ArtistHeaderProps) => {
  return (
    <div className="glass rounded-3xl p-6 flex flex-col gap-4 md:flex-row md:items-center">
      {image ? (
        <img
          src={image}
          alt={name}
          className="h-28 w-28 rounded-2xl object-cover"
        />
      ) : (
        <div className="h-28 w-28 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm text-slate-400">
          Artist
        </div>
      )}
      <div>
        <h1 className="font-display text-3xl">{name}</h1>
        <p className="text-slate-300 max-w-2xl">
          {bioSummary || "No bio available. Try another artist for more context."}
        </p>
      </div>
    </div>
  );
};

export default ArtistHeader;
