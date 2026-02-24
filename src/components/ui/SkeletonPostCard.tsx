import React from 'react';

export const SkeletonPostCard: React.FC = () => {
  return (
    <div className="post-card border-b border-ash/20 py-8 sm:py-12 w-full animate-pulse-subtle">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 sm:mb-6">
        <div className="h-6 w-3/4 bg-ash/20 rounded sm:h-8"></div> {/* Title placeholder */}
        <div className="h-4 w-1/4 bg-ash/20 rounded sm:h-6"></div> {/* Mood tag placeholder */}
      </div>

      <div className="space-y-2 mb-6 sm:mb-8">
        <div className="h-4 bg-ash/10 rounded w-full"></div>
        <div className="h-4 bg-ash/10 rounded w-11/12"></div>
        <div className="h-4 bg-ash/10 rounded w-5/6"></div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="h-3 w-20 bg-ash/20 rounded"></div>
        <div className="h-3 w-10 bg-ash/20 rounded"></div>
        <div className="h-3 w-16 bg-ash/20 rounded"></div>
        <div className="h-3 w-12 bg-ash/20 rounded"></div>
      </div>
    </div>
  );
};
