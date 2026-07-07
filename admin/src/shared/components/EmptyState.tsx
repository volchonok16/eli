interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

const icons: Record<string, string> = {
  box: "📦",
  list: "📋",
  chat: "💬",
  star: "⭐",
  tag: "🏷️",
  map: "📍",
  truck: "🚚",
  percent: "💯",
  file: "📄",
};

export function EmptyState({ icon = "box", title, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icons[icon] ?? icons.box}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
    </div>
  );
}
