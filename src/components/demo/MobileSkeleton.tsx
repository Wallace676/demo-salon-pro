export function MobileSkeleton() {
  return (
    <div className="space-y-3 animate-fade-in md:hidden">
      <div className="shimmer h-24 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <div className="shimmer h-20 rounded-xl" />
        <div className="shimmer h-20 rounded-xl" />
      </div>
      <div className="shimmer h-32 rounded-2xl" />
      <div className="shimmer h-16 rounded-xl" />
    </div>
  );
}
