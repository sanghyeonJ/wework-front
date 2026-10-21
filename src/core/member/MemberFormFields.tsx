import { SelectField } from "../../shared/components/SelectField";
import { TextField } from "../../shared/components/TextField";
import { indentLabel } from "../department/tree";
import type { MemberFormOptions } from "./useMemberFormOptions";

// 입력칸 값은 모두 문자열 (선택 상자·날짜 입력이 문자열을 다룸), 보낼 때 변환
export interface MemberFormValues {
  name: string;
  departmentId: string; // "" = 지정 안 함
  jobGradeId: string;
  jobTitleId: string;
  hireDate: string; // "2026-10-15" 또는 ""
}

export const EMPTY_MEMBER_FORM: MemberFormValues = {
  name: "",
  departmentId: "",
  jobGradeId: "",
  jobTitleId: "",
  hireDate: ""
};

// "" → null, "5" → 5
export function toNullableId(value: string): number | null {
  return value === "" ? null : Number(value);
}

interface MemberFormFieldsProps {
  idPrefix: string;
  values: MemberFormValues;
  options: MemberFormOptions;
  onChange: (field: keyof MemberFormValues, value: string) => void
}

// 사원 발급·수정 공용 입력칸 (이메일 제외)
export function MemberFormFields({ idPrefix, values, options, onChange }: MemberFormFieldsProps) {
  return (
    <>
      <TextField 
        id={`${idPrefix}-name`}
        label="이름"
        maxLength={50}
        value={values.name}
        onChange={(e) => onChange("name", e.target.value)}
      />

      <SelectField
        id={`${idPrefix}-department`}
        label="부서"
        value={values.departmentId}
        onChange={(e) => onChange("departmentId", e.target.value)}
      >
        <option value="">지정 안 함</option>
        {options.departments.map(({ node, depth }) => (
          <option key={node.id} value={node.id}>
            {indentLabel(node.name, depth)}
          </option>
        ))}
      </SelectField>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id={`${idPrefix}-job-grade`}
          label="직급"
          value={values.jobGradeId}
          onChange={(e) => onChange("jobGradeId", e.target.value)}
        >
          <option value="">지정 안 함</option>
          {options.jobGrades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.name}
            </option>
          ))}
        </SelectField>

        <SelectField
          id={`${idPrefix}-job-title`}
          label="직책"
          value={values.jobTitleId}
          onChange={(e) => onChange("jobTitleId", e.target.value)}
        >
          <option key="">지정 안 함</option>
          {options.jobTitles.map((title) => (
            <option key={title.id} value={title.id}>
              {title.name}
            </option>
          ))}
        </SelectField>
      </div>

      <TextField 
        id={`${idPrefix}-hire-date`}
        label="입사일"
        type="date"
        value={values.hireDate}
        onChange={(e) => onChange("hireDate", e.target.value)}
      />
    </>
  );
}