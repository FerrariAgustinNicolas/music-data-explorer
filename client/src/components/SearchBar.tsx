import { FormEvent } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

const SearchBar = ({ value, onChange, onSubmit, isLoading }: SearchBarProps) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 md:flex-row">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search an artist (e.g., Radiohead)"
        autoFocus
        className="w-full rounded-xl bg-panel/70 border border-slate-700 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-glow"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="rounded-xl bg-glow text-ink font-semibold px-6 py-3 hover:opacity-90 disabled:opacity-60"
      >
        {isLoading ? "Searching..." : "Explore"}
      </button>
    </form>
  );
};

export default SearchBar;
