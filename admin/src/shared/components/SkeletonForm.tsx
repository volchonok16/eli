export function SkeletonForm({ fields = 5 }: { fields?: number }) {
  return (
    <div className="skeleton">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="skeleton-form-group">
          <div className="skeleton-line" style={{ width: "30%", height: 14, marginBottom: 8 }} />
          <div className="skeleton-line" style={{ width: "100%", height: 44 }} />
        </div>
      ))}
    </div>
  );
}
