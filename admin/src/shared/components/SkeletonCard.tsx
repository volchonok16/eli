import { Skeleton } from "./Skeleton";

export function SkeletonCard() {
  return (
    <div className="card">
      <Skeleton lines={4} />
    </div>
  );
}
