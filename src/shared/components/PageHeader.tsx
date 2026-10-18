interface PageHeaderProps {
  title: string;
  description?: string;
}

// 화면 상단 제목 + 설명
export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-xl font-semibold">{title}</h1>
      {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
    </div>
  );
}