const MealSectionSkeleton = () => {
  return (
    <div className="bg-card rounded-2xl p-5 card-shadow animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted" />
          <div>
            <div className="h-5 w-24 bg-muted rounded mb-2" />
            <div className="h-3 w-32 bg-muted rounded" />
          </div>
        </div>
        <div className="h-9 w-24 bg-muted rounded-md" />
      </div>

      {/* Meal items */}
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50"
          >
            <div className="w-14 h-14 rounded-lg bg-muted" />
            <div className="flex-1 min-w-0">
              <div className="h-5 w-40 bg-muted rounded mb-2" />
              <div className="flex items-center gap-3">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-8 w-8 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default MealSectionSkeleton