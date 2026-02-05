interface StatCardsProps {
  listeners: number;
  playcount: number;
}

const StatCards = ({ listeners, playcount }: StatCardsProps) => {
  const formatCompact = (value: number) =>
    new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);

  const items = [
    { label: "Listeners", value: listeners.toLocaleString(), compact: formatCompact(listeners) },
    { label: "Playcount", value: playcount.toLocaleString(), compact: formatCompact(playcount) },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((item) => (
        <div key={item.label} className="glass rounded-2xl p-4">
          <p className="text-sm text-slate-400">{item.label}</p>
          <p className="font-display text-xl md:text-2xl break-words">
            <span className="md:hidden">{item.compact}</span>
            <span className="hidden md:inline">{item.value}</span>
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
