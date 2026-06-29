export function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="container page-shell">
      <div className="page-heading">
        <p className="eyebrow">BBooks</p>
        <h1>{title}</h1>
        <p>Trang này đã được giữ route để tiếp tục phát triển trong các bước sau.</p>
      </div>
    </main>
  );
}
