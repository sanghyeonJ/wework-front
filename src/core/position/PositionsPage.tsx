import { PageHeader } from "../../shared/components/PageHeader";
import { PositionPanel } from "./PositionPanel";

export function PositionsPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader 
        title="직급·직책"
        description="직급은 사원의 등급(예: 사원, 과장), 직책은 맡은 역할(예: 팀장)입니다. 표시·정렬용이며 결재 권한과는 관계없습니다."
      />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <PositionPanel kind="job-grades" />
        <PositionPanel kind="job-titles" />
      </div>
    </div>
  );
}