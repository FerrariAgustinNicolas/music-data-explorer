interface LoadingSkeletonProps {
  lines?: number;
}

const LoadingSkeleton = ({ lines = 3 }: LoadingSkeletonProps) => {
  return (
    <div className="glass rounded-2xl p-6 animate-pulse" data-testid="loading-skeleton">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="h-4 bg-slate-700/60 rounded mb-3" />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
