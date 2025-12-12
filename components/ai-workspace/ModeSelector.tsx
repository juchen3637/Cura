interface ModeSelectorProps {
  mode: "analyze" | "build";
  onChange: (mode: "analyze" | "build") => void;
}

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 inline-flex gap-2">
      <button
        onClick={() => onChange("analyze")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          mode === "analyze"
            ? "bg-blue-100 text-blue-700 shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        }`}
      >
        Analyze Existing Resume
      </button>
      <button
        onClick={() => onChange("build")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          mode === "build"
            ? "bg-purple-100 text-purple-700 shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        }`}
      >
        Build Curated Resume
      </button>
    </div>
  );
}
