import { useEffect, useId, useState, type SubmitEvent } from "react";
import { createPosition, deletePosition, getPositions, updatePosition, type PositionKind } from "./api";
import type { PositionResponse } from "./types";
import { getErrorCode } from "../../shared/api/client";
import { Button } from "../../shared/components/Button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { IconButton } from "../../shared/components/IconButton";
import { Dialog } from "../../shared/components/Dialog";
import { TextField } from "../../shared/components/TextField";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";

const LABELS: Record<PositionKind, string> = {
  "job-grades": "직급",
  "job-titles": "직책"
};

const NAME_PLACEHOLDERS: Record<PositionKind, string> = {
  "job-grades": "예: 과장",
  "job-titles": "예: 팀장",
};

// 에러 코드 → 문구 (JOB_GRADE_..., JOB_TITLE_... 공용이라 코드 끝부분으로 판단)
function toErrorMessage(code: string, label: string): string {
  if (code.endsWith("_NAME_DUPLICATED")) return `이미 같은 이름의 ${label}이 있습니다.`;
  if (code.endsWith("_IN_USE")) return `이 ${label}을 사용하는 사원이 있어 삭제할 수 없습니다. 퇴사한 사원도 포함됩니다.`;
  if (code.endsWith("_NOT_FOUND")) return `이미 삭제된 ${label}입니다. 목록을 새로 불러왔습니다.`;
  if (code === "INVALID_INPUT") return "입력값을 확인해 주세요.";
  if (code === "NETWORK_ERROR") return "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.";
  return "처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
};

// 대화상자 대상: 추가 또는 특정 항목 수정
type FormTarget = { mode: "create" } | { mode: "edit"; item: PositionResponse };

export function PositionPanel({ kind }: { kind: PositionKind }) {
  const label = LABELS[kind];
  const headingId = useId();

  // 목록
  const [items, setItems] = useState<PositionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // 추가·수정, 삭제
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PositionResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // 처음 열릴 때 + reloadKey가 바뀔 때마다 목록 조회
  useEffect(() => {
    let ignore = false;
    getPositions(kind)
      .then((data) => {
        if (ignore) return;
        setItems(data)
        setLoadError(null);
      })
      .catch((error) => {
        if (!ignore) setLoadError(toErrorMessage(getErrorCode(error), label));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    
    return () => {
      ignore = true;
    }
  }, [kind, label, reloadKey]);

  function reload() {
    setReloadKey((key) => key + 1);
  }

  // 새로 추가할 때 순서 기본값: 가장 큰 값 + 10
  const suggestedLevel = items.length > 0 ? Math.max(...items.map((item) => item.level)) + 10 : 10;

  function closeDelete() {
    setDeleteTarget(null);
    setDeleteError(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deletePosition(kind, deleteTarget.id);
      closeDelete();
      reload();
    } catch (error) {
      const code = getErrorCode(error);
      setDeleteError(toErrorMessage(code, label));
      if (code.endsWith("_NOT_FOUND")) reload();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-line"
    >
      {/* 패널 제목줄 */}
      <div className="flex items-center justify-between border-b border-line bg-chrome px-4 py-2">
        <h2 id={headingId} className="font-semibold">
          {label}
          <span className="ml-1.5 text-sm font-normal text-fg-muted">{items.length}</span>
        </h2>
        <Button onClick={() => setFormTarget({ mode: "create" })}>
          <Plus aria-hidden="true" className="size-4" />
          추가
        </Button>
      </div>

      {/* 내용: 로딩 / 에러 / 빈 목록 / 표 */}
      <div className="min-h-0 overflow-auto">
        {loading ? (
          <p role="status" className="px-4 py-6 text-sm text-fg-muted">
            불러오는 중...
          </p>
        ) : loadError ? (
          <div className="flex flex-col items-start gap-3 px-4 py-6">
            <p role="alert" className="text-sm text-danger">
              {loadError}
            </p>
            <Button onClick={reload}>다시 시도</Button>
          </div>
        ) : items.length === 0 ? (
          <p className="px-4 py-6 text-sm text-fg-muted">
            등록된 {label}이 없습니다. [추가]를 눌러 등록하세요.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-panel text-sm text-fg-muted">
              <tr className="border-b border-line">
                <th scope="col" className="w-20 px-4 py-2 font-normal">순서</th>
                <th scope="col" className="px-4 py-2 font-normal">이름</th>
                <th scope="col" className="w-24 px-2 py-2"><span className="sr-only">작업</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  onDoubleClick={() => setFormTarget({ mode: "edit", item })}
                  className="border-b border-line last:border-b-0 hover:bg-hover/50"
                >
                  <td className="px-4 py-2 tabular-nums text-fg-muted">{item.level}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-2 py-1">
                    <div className="flex justify-end gap-1">
                      <IconButton
                        label={`${item.name} 수정`}
                        onClick={() => setFormTarget({ mode: "edit", item })}
                      >
                        <Pencil aria-hidden="true" className="size-4" />
                      </IconButton>
                      <IconButton
                        label={`${item.name} 삭제`}
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 추가·수정 대화상자: 열 때마다 새로 생성 → 입력값 자동 초기화 */}
      {formTarget && (
        <PositionFormDialog 
          key={formTarget.mode === "edit" ? formTarget.item.id : "create"}
          kind={kind}
          target={formTarget}
          suggestedLevel={suggestedLevel}
          onClose={() => setFormTarget(null)}
          onSaved={() => {
            setFormTarget(null);
            reload();
          }}
          onStale={reload}
        />
      )}

      {/* 삭제 확인창 */}
      <ConfirmDialog 
        open={deleteTarget !== null}
        title={`${label} 삭제`}
        message={
          <>
            <strong className="font-semibold">{deleteTarget?.name}</strong> {label}을
            삭제합니다. 삭제한 뒤에는 되돌릴 수 없습니다.
          </>
        }
        confirmLabel="삭제"
        busy={deleting}
        errorMessage={deleteError}
        onConfirm={() => void handleDelete()}
        onClose={closeDelete}
      />
    </section>
  );
}

// ===== 추가·수정 대화상자 =====
interface PositionFormDialogProps {
  kind: PositionKind;
  target: FormTarget;
  suggestedLevel: number;
  onClose: () => void;
  onSaved: () => void;
  onStale: () => void; // 이미 삭제된 항목이면 목록 다시 불러오기
}

function PositionFormDialog({
  kind,
  target,
  suggestedLevel,
  onClose,
  onSaved,
  onStale
}: PositionFormDialogProps) {
  const label = LABELS[kind];
  const editing = target.mode === "edit" ? target.item : null;
  const formId = useId();

  const [name, setName] = useState(editing?.name ?? "");
  const [level, setLevel] = useState(String(editing?.level ?? suggestedLevel));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const trimmedName = name.trim();
    const levelNumber = Number(level);
    if (trimmedName === "") {
      setErrorMessage("이름을 입력해 주세요.");
      return;
    }
    if (!Number.isInteger(levelNumber) || levelNumber <= 0) {
      setErrorMessage("순서는 1 이상의 정수로 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const request = { name: trimmedName, level: levelNumber };
      if (editing) {
        await updatePosition(kind, editing.id, request);
      } else {
        await createPosition(kind, request);
      }
      onSaved();
    } catch (error) {
      const code = getErrorCode(error);
      setErrorMessage(toErrorMessage(code, label));
      if (code.endsWith("_NOT_FOUND")) onStale();
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open
      title={editing ? `${label} 수정` : `${label} 추가`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={submitting}>
            취소
          </Button>
          <Button type="submit" form={formId} variant="primary" disabled={submitting}>
            {submitting ? "저장 중..." : "저장"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField 
          id={`${formId}-name`}
          label="이름"
          data-autofocus
          maxLength={50}
          placeholder={NAME_PLACEHOLDERS[kind]}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField 
          id={`${formId}-level`}
          label="순서"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          hint="작을수록 위에 표시됩니다. 10, 20, 30처럼 간격을 두면 중간에 끼워 넣기 쉽습니다."
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        />
        {errorMessage && (
          <p role="alert" className="text-sm text-danger">
            {errorMessage}
          </p>
        )}
      </form>
    </Dialog>
  );
}