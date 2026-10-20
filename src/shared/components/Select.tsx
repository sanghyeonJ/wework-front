import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

// 브라우저 기본 화살표 대신 아이콘 사용 (위치·크기를 직접 맞춤)
// className은 바깥 상자에 적용 → 너비 조절용 (예: w-48)
export function Select({ className = "", children, ...selectProps }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative ${className}`}>
      <select
        {...selectProps}
        className="h-9.5 w-full appearance-none rounded-md border border-line bg-panel pl-2.5 pr-9 text-base disabled:opacity-60"
      >
        {children}
      </select>
      <ChevronDown 
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
      />
    </div>
  );
}