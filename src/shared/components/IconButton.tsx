import type { ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string; // 화면 낭독기와 마우스 툴팁에 표시할 이름 (예: "과장 수정")
}

// 아이콘만 있는 작은 버튼 (목록의 수정·삭제 등)
export function IconButton({ label, className = "", children, ...buttonProps }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...buttonProps}
      className={`flex size-8 items-center justify-center rounded-md text-fg-muted hover:bg-hover hover:text-fg ${className}`}
    >
      {children}
    </button>
  );
}