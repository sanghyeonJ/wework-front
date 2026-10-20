import type { SelectHTMLAttributes } from "react";
import { Select } from "./Select";

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
      <Select id={id} aria-describedby={hintId} {...selectProps} className={className}>
        {children}
      </Select>
      {hint && (
        <p id={hintId} className="text-xs text-fg-muted">
          {hint}
        </p>
      )}
    </div>
  );
}