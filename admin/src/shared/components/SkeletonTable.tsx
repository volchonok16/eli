export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div>
      <div className="skeleton skeleton-header">
        <div className="skeleton-line" style={{ width: "60%" }} />
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="skeleton skeleton-row">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skeleton-cell">
              <div className="skeleton-line" style={{ width: `${60 + c * 10}%` }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
