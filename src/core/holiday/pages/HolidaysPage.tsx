import { PageHeader } from "../../../shared/components/PageHeader";

export function HolidaysPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader 
          title="휴일 관리"
          description="회사 휴일을 등록·관리합니다. 근태 조회와 휴가 일수 계산에 반영됩니다."
        />
    </div>
  );
}