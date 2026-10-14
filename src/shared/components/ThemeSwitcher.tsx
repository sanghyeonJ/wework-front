import { useThemeStore, type ThemeMode } from "../theme/store";

const OPTIONS: {value: ThemeMode; label: string}[] = [
  { value: "system", label: "시스템" },
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" }
]

export function ThemeSwitcher() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <div
      role="radiogroup"
      aria-label="테마"
      className="inline-flex select-none rounded-md border border-line bg-chrome p-0.5"
    >
      {OPTIONS.map((option) => {
        const selected = mode === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setMode(option.value)}
            className={`h-6 rounded px-2.5 text-sm ${
              selected
              ? "bg-panel text-fg ring-1 ring-line"
              : "text-fg-muted hover:text-fg"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}