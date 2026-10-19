import { useId, useState, type SubmitEvent } from "react";
import { collectSubtreeIds, type DepartmentNode, type FlatDepartment } from "./tree";
import { createDepartment, updateDepartment } from "./api";
import { getErrorCode } from "../../shared/api/client";
import { toDepartmentErrorMessage } from "./errorMessages";
import { Dialog } from "../../shared/components/Dialog";
import { Button } from "../../shared/components/Button";
import { TextField } from "../../shared/components/TextField";
import { SelectField } from "../../shared/components/SelectField";

// 대화상자를 여는 세 가지 상황
export type DepartmentFormTarget =
  | { mode: "create-root" }
  | { mode: "create-child"; parent: DepartmentNode }
  | { mode: "edit"; department: DepartmentNode };

const TITLES: Record<DepartmentFormTarget["mode"], string> = {
  "create-root": "최상위 부서 만들기",
  "create-child": "하위 부서 추가",
  edit: "부서 수정",
};

// 선택 상자에서 들여쓰기용 공백 (일반 공백은 합쳐져서 사라지므로 줄바꿈 없는 공백 사용)
const INDENT = "\u00A0\u00A0\u00A0\u00A0";

interface DepartmentFormDialogProps {
  target: DepartmentFormTarget;
  flatItems: FlatDepartment[];
  onClose: () => void;
  onSaved: () => void;
  onStale: () => void;  // 이미 삭제된 부서면 목록 다시 불러오기
}

export function DepartmentFormDialog({
  target,
  flatItems,
  onClose,
  onSaved,
  onStale
}: DepartmentFormDialogProps) {
  const formId = useId();
  const editing = target.mode === "edit" ? target.department : null;
  // 최상위 부서를 만들거나, 최상위 부서를 수정하는 경우
  const isRoot = target.mode === "create-root" || (editing !== null && editing.parentId === null);

  const [name, setName] = useState(editing?.name ?? "");
  const [parentId, setParentId] = useState(() => {
    if (target.mode === "create-child") return String(target.parent.id);
    if (editing && editing.parentId !== null) return String(editing.parentId);
    return "";
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 수정할 때는 자기 자신과 하위 부서를 상위 부서 후보에서 제외 (순환 방지)
  const excludedIds = editing ? collectSubtreeIds(editing) : new Set<number>();
  const parentOptions = flatItems.filter(({ node }) => !excludedIds.has(node.id));

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const trimmedName = name.trim();
    if (trimmedName === "") {
      setErrorMessage("부서 이름을 입력해 주세요.");
      return;
    }
    if (!isRoot && parentId === "") {
      setErrorMessage("상위 부서를 선택해 주세요.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const request = { name: trimmedName, parentId: isRoot ? null : Number(parentId) };
      if (editing) {
        await updateDepartment(editing.id, request);
      } else {
        await createDepartment(request);
      }
      onSaved();
    } catch (error) {
      const code = getErrorCode(error);
      setErrorMessage(toDepartmentErrorMessage(code));
      if (code === "DEPARTMENT_NOT_FOUND") onStale();
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open
      title={TITLES[target.mode]}
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
          label="부서 이름"
          data-autofocus
          maxLength={100}
          placeholder={isRoot ? "예: 위워크 서울" : "예: 개발팀"}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {isRoot ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-fg-muted">상위 부서</p>
            <p>없음 (최상위 부서)</p>
            <p className="text-xs text-fg-muted">최상위 부서는 회사 전체를 나타내며 다른 부서 아래로 옮길 수 없습니다. 부서장은 대표가 맡습니다.</p>
          </div>
        ) : (
          <SelectField
            id={`${formId}-parent`}
            label="상위 부서"
            hint={editing ? "자기 자신과 하위 부서는 선택할 수 없습니다." : undefined}
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            {parentOptions.map(({ node, depth }) => (
              <option key={node.id} value={node.id}>
                {`${INDENT.repeat(depth)}${node.name}`}
              </option>
            ))}
          </SelectField>
        )}

        {errorMessage && (
          <p role="alert" className="text-sm text-danger">
            {errorMessage}
          </p>
        )}
      </form>
    </Dialog>
  );
}