interface PlaceholderPageProps {
  title: string;
  note?: string;
}

// 아직 구현하지 않은 화면 자리
export function PlaceholderPage({ title, note = "준비 중인 화면입니다." }: PlaceholderPageProps) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-fg-muted">{note}</p>
    </div>
  );
}