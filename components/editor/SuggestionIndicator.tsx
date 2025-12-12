interface SuggestionIndicatorProps {
  count: number;
  color?: "blue" | "green" | "yellow" | "purple";
  onClick: () => void;
}

export default function SuggestionIndicator({
  count,
  color = "blue",
  onClick,
}: SuggestionIndicatorProps) {
  const colorClasses = {
    blue: "bg-blue-500 text-white hover:bg-blue-600",
    green: "bg-green-500 text-white hover:bg-green-600",
    yellow: "bg-yellow-500 text-white hover:bg-yellow-600",
    purple: "bg-purple-500 text-white hover:bg-purple-600",
  };

  return (
    <button
      onClick={onClick}
      className={`absolute -right-2 -top-2 w-6 h-6 rounded-full ${colorClasses[color]} flex items-center justify-center text-xs font-bold shadow-lg hover:scale-110 transition-transform z-10`}
      title={`${count} suggestion${count !== 1 ? "s" : ""}`}
    >
      {count}
    </button>
  );
}
