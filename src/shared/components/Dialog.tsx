import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

type DialogSize = "md" | "lg";

const SIZE_CLASS: Record<DialogSize, string> = {
  md: "max-w-md", // 448px: 확인창, 짧은 폼
  lg: "max-w-xl", // 576px: 입력칸이 많은 폼
};

interface DialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  size?: DialogSize;
  footer?: ReactNode;
  children: ReactNode;
}

// 브라우저 기본 <dialog>를 사용하는 대화상자 (Esc 닫기, 포커스 가두기는 브라우저가 처리)
export function Dialog({ open, title, onClose, size = "md", footer, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // open 값에 맞춰 열기·닫기
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // data-autofocus 표시가 있는 요소로 포커스 (없으면 브라우저 기본: 첫 번째 버튼)
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    };
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={titleId}
      className={`m-auto w-[calc(100%-2rem)] ${SIZE_CLASS[size]} overflow-hidden rounded-lg border border-line bg-panel p-0 text-fg shadow-xl outline-none backdrop:bg-black/40`}
    >
      {/* 열려 있을 때만 내용 생성 → 다시 열면 입력값이 초기화됨 */}
      {open && (
        <div className="flex max-h-[calc(100dvh-4rem)] flex-col">
          <div className="flex h-12 shrink-0 select-none items-center justify-between border-b border-line bg-chrome pl-5 pr-2">
            <h2 id={titleId} className="font-semibold">
              {title}
            </h2>
            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-md text-fg-muted hover:bg-hover hover:text-fg"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>

          <div className="min-h-0 overflow-y-auto px-5 py-4">{children}</div>

          {footer && (
            <div className="flex shrink-0 justify-end gap-2 border-t border-line bg-chrome px-5 py-3">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}