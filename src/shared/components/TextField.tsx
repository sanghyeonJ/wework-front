import type { InputHTMLAttributes } from "react";

// input의 기본 속성(type, value, onChange, autoComplete ...)을 모두 받고 라벨·안내 문구를 추가
interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
}

export function TextField({id, label, hint, className = "", ...inputProps}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-fg-muted">
        {label}
      </label>
      <input 
        id={id}
        aria-describedby={hintId}
        {...inputProps}
        className={`h-9.5 rounded-md border border-line bg-panel px-2.5 text-base ${className}`}
      />
      {hint && (
        <p id={hintId} className="text-xs text-fg-muted">
          {hint}
        </p>
      )}
    </div>
  );
}