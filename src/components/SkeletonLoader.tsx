import React from 'react';

const Loader = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-burgundy/20 to-burgundy/10 animate-pulse"></div>
            <div className="p-3 space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-muted rounded animate-pulse w-full"></div>
              <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
              <div className="flex gap-2 pt-2">
                <div className="h-8 bg-muted rounded animate-pulse w-16"></div>
                <div className="h-8 bg-muted rounded animate-pulse w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loader;