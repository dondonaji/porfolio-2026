import React, { useEffect, useRef, useState } from 'react';
import { PortfolioChapter } from '../data/portfolioData';
import { getLevel2PlateSizingClass } from '../utils/galleryUtils';

interface SeriesExhibitionViewProps {
  chapter: PortfolioChapter;
  initialPhotoIndex: number;
  subtleImageShadow: string;
}

/**
 * Level 2: Large-Scale Series Exhibition View (for series with > 3 photos).
 * Displays all works at generous gallery scale with a fixed bottom index in negative.
 */
export const SeriesExhibitionView: React.FC<SeriesExhibitionViewProps> = ({
  chapter,
  initialPhotoIndex,
  subtleImageShadow,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] =
    useState<number>(initialPhotoIndex);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const plateRefs = useRef<Record<number, HTMLElement | null>>({});

  useEffect(() => {
    setActivePhotoIdx(initialPhotoIndex);
    const frameId = window.requestAnimationFrame(() => {
      if (initialPhotoIndex > 0 && plateRefs.current[initialPhotoIndex]) {
        plateRefs.current[initialPhotoIndex]?.scrollIntoView({
          behavior: 'instant' as ScrollBehavior,
          block: 'center',
        });
      } else if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [chapter.id, initialPhotoIndex]);

  const scrollToPlate = (idx: number) => {
    setActivePhotoIdx(idx);
    plateRefs.current[idx]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const maxScroll = Math.max(1, el.scrollHeight - el.clientHeight);
    const ratio = Math.min(1, Math.max(0, el.scrollTop / maxScroll));
    const idx = Math.min(
      chapter.photos.length - 1,
      Math.round(ratio * (chapter.photos.length - 1))
    );
    setActivePhotoIdx(idx);
  };

  return (
    <section
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="relative z-30 w-full h-full bg-[#F6F5F2] text-[#111110] overflow-y-auto px-6 sm:px-20 pt-28 pb-36"
    >
      <div className="max-w-[1120px] mx-auto flex flex-col items-center space-y-24 sm:space-y-36">
        {chapter.photos.map((photo, pIdx) => {
          const plateWidthClass = getLevel2PlateSizingClass(photo.aspectRatio);

          return (
            <figure
              key={photo.id}
              ref={(el) => {
                plateRefs.current[pIdx] = el;
              }}
              className="w-full flex flex-col items-center"
            >
              <div
                style={{ boxShadow: subtleImageShadow }}
                className={`${plateWidthClass} overflow-hidden bg-[#EFECE6]`}
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  loading={pIdx < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                  style={{
                    objectPosition: photo.cropPosition || 'center center',
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            </figure>
          );
        })}
      </div>

      {/* Fixed Bottom Bar in Level 2 */}
      <div className="fixed inset-x-0 bottom-6 sm:bottom-9 z-40 px-6 sm:px-14 flex items-end justify-between mix-blend-difference text-white pointer-events-none">
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-2.5">
            <span className="text-[11px] font-mono-tabular font-medium opacity-80">
              {chapter.index}
            </span>
            <h2 className="font-sans font-semibold text-sm sm:text-base tracking-wide">
              {chapter.title}
            </h2>
          </div>
          <p className="text-[11px] font-light tracking-wide opacity-65">
            {chapter.photos[activePhotoIdx]?.code} —{' '}
            {chapter.photos[activePhotoIdx]?.title}
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono-tabular pointer-events-auto">
          <span className="opacity-75">
            {String(activePhotoIdx + 1).padStart(2, '0')}/
            {String(chapter.photos.length).padStart(2, '0')}
          </span>
          <span aria-hidden="true" className="opacity-25">
            /
          </span>
          <nav
            aria-label="Láminas de la serie"
            className="hidden sm:flex items-center gap-2"
          >
            {chapter.photos.map((p, i) => {
              const isCurr = i === activePhotoIdx;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => scrollToPlate(i)}
                  className={`cursor-pointer transition-opacity ${
                    isCurr
                      ? 'opacity-100 font-medium underline underline-offset-4'
                      : 'opacity-40 hover:opacity-90'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </section>
  );
};
