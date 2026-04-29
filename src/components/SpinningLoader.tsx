import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-burgundy/30 border-t-burgundy rounded-full animate-spin"></div>
        <p className="text-xs text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;