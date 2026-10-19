import type { SelectHTMLAttributes } from "react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  hint?: string;
}

// 라벨 + 브라우저 기본 선택 상자 (TextField와 같은 모양)
export function SelectField({ id, label, hint, className = "", children, ...selectProps }: SelectFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-fg-muted">
        {label}
      </label>
      <select
        id={id}
        aria-describedby={hintId}
        {...selectProps}
        className={`h-9.5 rounded-md border border-line bg-panel px-2 text-base disabled:opacity-60 ${className}`}
      >
        {children}
      </select>
      {hint && (
        <p id={hintId} className="text-xs text-fg-muted">
          {hint}
        </p>
      )}
    </div>
  );
}