/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { BioView } from './components/BioView';
import { CuratorialCmsDrawer } from './components/CuratorialCmsDrawer';
import { SeriesExhibitionView } from './components/SeriesExhibitionView';
import { VimeoStage00 } from './components/VimeoStage00';
import { PortfolioChapter } from './data/portfolioData';
import {
  clearCmsDraft,
  CmsPortfolioState,
  getDefaultCmsState,
  loadCmsDraft,
  saveCmsDraft,
} from './utils/cmsStorage';
import { getPlateSizingClass, mod } from './utils/galleryUtils';

export default function App() {
  // Portfolio & CMS State (hydrated from IndexedDB draft or /portfolio.json if present)
  const [cmsState, setCmsState] = useState<CmsPortfolioState>(() =>
    getDefaultCmsState()
  );
  const [cmsOpen, setCmsOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.toLowerCase();
    return (
      params.has('cms') ||
      params.has('studio') ||
      hash === '#cms' ||
      hash === '#studio'
    );
  });

  const artistProfile = cmsState.artistProfile;
  const chapters = cmsState.chapters;
  const totalChapters = chapters.length;

  // Vertical Scroll Refs — Strictly 1 chapter per gesture:
  const targetPosRef = useRef<number>(0);
  const currentPosRef = useRef<number>(0);
  const anchorRef = useRef<number>(0);
  const gestureOriginRef = useRef<number>(0);
  const wheelActivityRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const lastVertWheelTimeRef = useRef<number>(0);
  const lastChapterCommitTimeRef = useRef<number>(0);
  const gestureCommittedRef = useRef<boolean>(false);

  // Independent Horizontal Scroll (Barajeo) Refs:
  const horizAccumRef = useRef<number>(0);
  const lastHorizEventTimeRef = useRef<number>(0);
  const lastHorizStepTimeRef = useRef<number>(0);
  const lastHorizAbsDeltaRef = useRef<number>(0);
  const horizCooldownArmedRef = useRef<boolean>(true);

  // Touch gesture refs
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const touchAxisRef = useRef<'none' | 'x' | 'y'>('none');

  const pulseTimeoutRef = useRef<number | null>(null);

  const [scrollPos, setScrollPos] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [scrollVelocity, setScrollVelocity] = useState<number>(0);

  // Continuous virtual step counter per series for the 3-photo stage barajeo
  const [stepByChapter, setStepByChapter] = useState<Record<string, number>>(
    {}
  );
  const [lastDirByChapter, setLastDirByChapter] = useState<
    Record<string, number>
  >({});

  // Level 2: Large-Scale Series Exhibition View (ONLY for series with > 3 photos)
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(
    null
  );
  const [expandedStartIdx, setExpandedStartIdx] = useState<number>(0);

  // Unified bottom-right index & shuffle module state
  const [isScrollingNow, setIsScrollingNow] = useState<boolean>(false);
  const [indexHovered, setIndexHovered] = useState<boolean>(false);

  // Detailed Artist Bio page opened from top-right "Acerca de"
  const [bioOpen, setBioOpen] = useState<boolean>(false);

  // Hydrate portfolio state:
  // 1) Local IndexedDB curatorial draft (if artist is actively curating on this browser)
  // 2) Or `/portfolio.json` published to Vercel `public/portfolio.json`
  useEffect(() => {
    let cancelled = false;

    async function hydratePortfolio() {
      const localDraft = await loadCmsDraft();
      if (
        !cancelled &&
        localDraft &&
        Array.isArray(localDraft.chapters) &&
        localDraft.chapters.length > 0
      ) {
        setCmsState(localDraft);
        return;
      }

      try {
        const res = await fetch('/portfolio.json', { cache: 'no-cache' });
        if (res.ok) {
          const remoteState = (await res.json()) as CmsPortfolioState;
          if (
            !cancelled &&
            remoteState &&
            Array.isArray(remoteState.chapters) &&
            remoteState.chapters.length > 0 &&
            remoteState.artistProfile
          ) {
            setCmsState(remoteState);
          }
        }
      } catch {
        // Use compiled default portfolioData.ts silently if /portfolio.json is not present
      }
    }

    hydratePortfolio();
    return () => {
      cancelled = true;
    };
  }, []);

  // Preload all portfolio images into browser memory whenever chapters update
  useEffect(() => {
    chapters.forEach((chap) => {
      if (chap.coverPhoto) {
        const img = new Image();
        img.src = chap.coverPhoto;
      }
      chap.photos.forEach((p) => {
        const img = new Image();
        img.src = p.src;
      });
    });
  }, [chapters]);

  useEffect(() => {
    return () => {
      if (pulseTimeoutRef.current) {
        window.clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, []);

  const handleUpdateCmsState = (nextState: CmsPortfolioState) => {
    setCmsState(nextState);
    saveCmsDraft(nextState);
  };

  const handleResetCmsToDefaults = async () => {
    await clearCmsDraft();
    setCmsState(getDefaultCmsState());
    glideToChapter(0);
  };

  const triggerScrollActive = () => {
    setIsScrollingNow(true);
    if (pulseTimeoutRef.current) {
      window.clearTimeout(pulseTimeoutRef.current);
    }
    pulseTimeoutRef.current = window.setTimeout(() => {
      setIsScrollingNow(false);
    }, 850);
  };

  // Rotate the 3-photo stage by +1 (next photo) or -1 (previous photo)
  const rotateBarajeo = (chapterId: string, deltaStep: 1 | -1) => {
    setLastDirByChapter((prev) => ({ ...prev, [chapterId]: deltaStep }));
    setStepByChapter((prev) => ({
      ...prev,
      [chapterId]: (prev[chapterId] || 0) + deltaStep,
    }));
  };

  const expandedChapter = expandedChapterId
    ? chapters.find((c) => c.id === expandedChapterId) || null
    : null;

  // Global keyboard shortcuts: Escape (close Level 2 / Bio) & Shift + E (toggle Curatorial CMS)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (
        !isInputFocused &&
        e.shiftKey &&
        (e.key === 'E' || e.key === 'e')
      ) {
        e.preventDefault();
        setCmsOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        if (expandedChapterId) {
          setExpandedChapterId(null);
        } else if (bioOpen) {
          setBioOpen(false);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expandedChapterId, bioOpen]);

  useEffect(() => {
    if (bioOpen || expandedChapter) return;

    let rafId: number;

    const applyVerticalScrollDelta = (rawDelta: number) => {
      const now = performance.now();
      const timeSinceLastVert = now - lastVertWheelTimeRef.current;
      const timeSinceCommit = now - lastChapterCommitTimeRef.current;
      const distToAnchor = Math.abs(currentPosRef.current - anchorRef.current);

      if (
        timeSinceLastVert > 200 ||
        (gestureCommittedRef.current &&
          timeSinceCommit > 520 &&
          distToAnchor < 0.08)
      ) {
        gestureOriginRef.current = anchorRef.current;
        gestureCommittedRef.current = false;
      }

      lastVertWheelTimeRef.current = now;
      wheelActivityRef.current = 1;
      triggerScrollActive();

      if (gestureCommittedRef.current) {
        return;
      }

      const origin = gestureOriginRef.current;
      const dir = rawDelta > 0 ? 1 : -1;
      const nextChapterInDir = Math.max(
        0,
        Math.min(totalChapters - 1, origin + dir)
      );

      let candidate = targetPosRef.current + rawDelta;
      if (dir > 0) {
        candidate = Math.min(nextChapterInDir, candidate);
      } else {
        candidate = Math.max(nextChapterInDir, candidate);
      }
      candidate = Math.max(0, Math.min(totalChapters - 1, candidate));
      targetPosRef.current = candidate;

      const disp = candidate - origin;
      if (dir > 0 && disp >= 0.11) {
        anchorRef.current = nextChapterInDir;
        gestureCommittedRef.current = true;
        lastChapterCommitTimeRef.current = now;
      } else if (dir < 0 && disp <= -0.11) {
        anchorRef.current = nextChapterInDir;
        gestureCommittedRef.current = true;
        lastChapterCommitTimeRef.current = now;
      }
    };

    const applyHorizontalScrollDelta = (deltaX: number) => {
      const now = performance.now();
      const timeGap = now - lastHorizEventTimeRef.current;
      const absDx = Math.abs(deltaX);

      if (
        timeGap > 140 ||
        absDx < 4 ||
        (absDx > lastHorizAbsDeltaRef.current * 1.35 &&
          now - lastHorizStepTimeRef.current > 240) ||
        deltaX * horizAccumRef.current < 0
      ) {
        horizCooldownArmedRef.current = true;
        if (timeGap > 140 || deltaX * horizAccumRef.current < 0) {
          horizAccumRef.current = 0;
        }
      }

      lastHorizEventTimeRef.current = now;
      lastHorizAbsDeltaRef.current = absDx;

      if (!horizCooldownArmedRef.current) {
        return;
      }

      horizAccumRef.current += deltaX;

      if (
        Math.abs(horizAccumRef.current) >= 32 &&
        now - lastHorizStepTimeRef.current > 240
      ) {
        const chap = chapters[Math.round(currentPosRef.current)];
        if (chap && chap.kind === 'photo') {
          rotateBarajeo(chap.id, horizAccumRef.current > 0 ? 1 : -1);
          lastHorizStepTimeRef.current = now;
          horizAccumRef.current = 0;
          horizCooldownArmedRef.current = false;
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Allow native scrolling inside the Curatorial CMS drawer when open
      const target = e.target as HTMLElement | null;
      if (target && target.closest('aside')) {
        return;
      }

      e.preventDefault();

      if (
        Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.15 &&
        Math.abs(e.deltaX) > 2
      ) {
        applyHorizontalScrollDelta(e.deltaX);
        return;
      }

      const clampedDeltaY = Math.max(-90, Math.min(90, e.deltaY));
      applyVerticalScrollDelta(clampedDeltaY * 0.00095);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        glideToChapter(Math.min(totalChapters - 1, anchorRef.current + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        glideToChapter(Math.max(0, anchorRef.current - 1));
      } else if (e.key === 'ArrowRight') {
        const chap = chapters[Math.round(currentPosRef.current)];
        if (chap && chap.kind === 'photo') {
          rotateBarajeo(chap.id, 1);
        }
      } else if (e.key === 'ArrowLeft') {
        const chap = chapters[Math.round(currentPosRef.current)];
        if (chap && chap.kind === 'photo') {
          rotateBarajeo(chap.id, -1);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('aside')) return;

      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      touchAxisRef.current = 'none';
      gestureOriginRef.current = anchorRef.current;
      gestureCommittedRef.current = false;
      lastVertWheelTimeRef.current = performance.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('aside')) return;

      const cx = e.touches[0].clientX;
      const cy = e.touches[0].clientY;
      const dx = touchStartXRef.current - cx;
      const dy = touchStartYRef.current - cy;

      if (touchAxisRef.current === 'none') {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          touchAxisRef.current =
            Math.abs(dx) > Math.abs(dy) * 1.15 ? 'x' : 'y';
        }
      }

      if (touchAxisRef.current === 'x') {
        if (Math.abs(dx) > 42) {
          const chap = chapters[Math.round(currentPosRef.current)];
          if (chap && chap.kind === 'photo') {
            rotateBarajeo(chap.id, dx > 0 ? 1 : -1);
            touchStartXRef.current = cx;
          }
        }
        return;
      }

      if (touchAxisRef.current === 'y') {
        touchStartYRef.current = cy;
        applyVerticalScrollDelta(dy * 0.0028);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const animate = () => {
      rafId = requestAnimationFrame(animate);

      wheelActivityRef.current *= 0.88;

      const pullStrength = gestureCommittedRef.current
        ? 0.095
        : (1 - wheelActivityRef.current * 0.65) * 0.095;

      targetPosRef.current +=
        (anchorRef.current - targetPosRef.current) * pullStrength;

      const prev = currentPosRef.current;
      const diff = targetPosRef.current - prev;

      if (
        Math.abs(anchorRef.current - prev) < 0.0004 &&
        Math.abs(velocityRef.current) < 0.0002 &&
        wheelActivityRef.current < 0.01
      ) {
        if (prev !== anchorRef.current) {
          currentPosRef.current = anchorRef.current;
          targetPosRef.current = anchorRef.current;
          velocityRef.current = 0;
          setScrollPos(anchorRef.current);
          setScrollVelocity(0);
          setActiveIndex(anchorRef.current);
        }
        return;
      }

      currentPosRef.current += diff * 0.11;
      const vel = currentPosRef.current - prev;
      velocityRef.current += (vel - velocityRef.current) * 0.2;

      setScrollPos(currentPosRef.current);
      setScrollVelocity(velocityRef.current);
      setActiveIndex(
        Math.min(
          totalChapters - 1,
          Math.max(0, Math.round(currentPosRef.current))
        )
      );
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [totalChapters, chapters, bioOpen, expandedChapter]);

  const glideToChapter = (index: number) => {
    setBioOpen(false);
    setExpandedChapterId(null);
    const clamped = Math.max(0, Math.min(totalChapters - 1, index));
    lastVertWheelTimeRef.current = performance.now();
    lastChapterCommitTimeRef.current = performance.now();
    wheelActivityRef.current = 0.2;
    gestureOriginRef.current = clamped;
    anchorRef.current = clamped;
    targetPosRef.current = clamped;
    gestureCommittedRef.current = true;
    triggerScrollActive();
  };

  const openSeriesLevel2 = (chapter: PortfolioChapter, startIdx = 0) => {
    setExpandedStartIdx(startIdx);
    setExpandedChapterId(chapter.id);
  };

  const safeActiveIdx = Math.min(
    chapters.length - 1,
    Math.max(0, activeIndex)
  );
  const activeChapter = chapters[safeActiveIdx] || chapters[0];

  // Very subtle scroll-reactive shadow
  const clampedVel = Math.max(-0.25, Math.min(0.25, scrollVelocity));
  const textShadowY = 1.5 + clampedVel * 20;
  const textShadowBlur = 8 + Math.abs(clampedVel) * 22;
  const subtleTextShadow = `0px ${textShadowY.toFixed(
    1
  )}px ${textShadowBlur.toFixed(1)}px rgba(0, 0, 0, 0.14)`;

  const imageShadowY = 14 - clampedVel * 42;
  const imageShadowBlur = 34 + Math.abs(clampedVel) * 36;
  const subtleImageShadow = `0px ${imageShadowY.toFixed(
    1
  )}px ${imageShadowBlur.toFixed(1)}px rgba(17, 17, 16, 0.085)`;

  // 0% opacity for the index on the opening video screen (00)
  const isAtVideoStart = scrollPos < 0.35;

  const distanceToCenter = Math.abs(scrollPos - safeActiveIdx);
  const narrativeVisibility = Math.max(0, 1 - distanceToCenter * 2.3);

  const activeStep = stepByChapter[activeChapter.id] || 0;
  const activePhotoTotal = Math.max(1, activeChapter.photos.length);
  const currentPhotoIdxForActive = mod(activeStep, activePhotoTotal);
  const activeHasDeepArchive =
    activeChapter.kind === 'photo' && activeChapter.photos.length > 3;

  const indexFullyRevealed = isScrollingNow || indexHovered;
  const vimeoCoverProgress = Math.max(0, Math.min(1, scrollPos));

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#F6F5F2] text-[#111110] select-none font-sans">
      {/* =====================================================================
          1. TOP BAR IN NEGATIVE:
             - Left: DONAJI RAMIREZ
             - Right: ONLY "← Galería" or "Acerca de"
          ===================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-14 py-7 flex items-center justify-between mix-blend-difference text-white pointer-events-none">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            glideToChapter(0);
          }}
          style={{ textShadow: subtleTextShadow }}
          className="pointer-events-auto font-sans font-semibold text-base sm:text-lg tracking-[0.24em] uppercase whitespace-nowrap"
        >
          {artistProfile.logoMark}
        </a>

        <div className="flex items-center gap-6 sm:gap-8 pointer-events-auto">
          {expandedChapter ? (
            <button
              type="button"
              onClick={() => setExpandedChapterId(null)}
              style={{ textShadow: subtleTextShadow }}
              className="text-xs sm:text-sm font-sans font-medium tracking-[0.2em] uppercase opacity-90 hover:opacity-100 hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
            >
              ← Galería
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setBioOpen((v) => !v)}
              style={{ textShadow: subtleTextShadow }}
              className="text-xs sm:text-sm font-sans font-medium tracking-[0.2em] uppercase opacity-85 hover:opacity-100 hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
            >
              {bioOpen ? '← Galería' : 'Acerca de'}
            </button>
          )}
        </div>
      </header>

      {/* =====================================================================
          2. VIEW ROUTER: BIO ("Acerca de") / LEVEL 2 EXHIBITION / LEVEL 1 STAGE
          ===================================================================== */}
      {bioOpen ? (
        <BioView profile={artistProfile} />
      ) : expandedChapter ? (
        <SeriesExhibitionView
          chapter={expandedChapter}
          initialPhotoIndex={expandedStartIdx}
          subtleImageShadow={subtleImageShadow}
        />
      ) : (
        <main className="relative w-full h-full flex items-center justify-center">
          {chapters.map((chapter, idx) => {
            const offset = idx - scrollPos;

            const isVimeoChapter = chapter.kind === 'vimeo';
            const isVisible = isVimeoChapter
              ? scrollPos < 1.35
              : Math.abs(offset) < 1.25;
            if (!isVisible && !isVimeoChapter) return null;

            const translateYPercent = isVimeoChapter ? 0 : offset * 100;
            const innerParallaxY = isVimeoChapter ? 0 : -offset * 14;
            const scale = isVimeoChapter ? 1 : 1 + Math.abs(offset) * 0.045;

            const step = stepByChapter[chapter.id] || 0;
            const lastDir = lastDirByChapter[chapter.id] || 1;
            const photos = chapter.photos;
            const totalInSeries = photos.length;
            const hasMoreThanThree = totalInSeries > 3;

            const isGuideChapter01 = idx === 1;
            const virtualOffsets = [-2, -1, 0, 1, 2];

            return (
              <section
                key={chapter.id}
                style={{
                  zIndex: isVimeoChapter ? 10 : 20,
                  transform: `translate3d(0, ${translateYPercent.toFixed(
                    2
                  )}%, 0)`,
                  visibility:
                    isVimeoChapter && scrollPos >= 1.05 ? 'hidden' : 'visible',
                }}
                className="absolute inset-0 w-full h-full flex items-center justify-center will-change-transform bg-[#F6F5F2]"
              >
                {isVimeoChapter ? (
                  /* CHAPTER 00: STATIONARY FRAMELESS VIMEO STAGE */
                  <div
                    style={{ boxShadow: subtleImageShadow }}
                    className="relative w-[92vw] sm:w-[82vw] max-w-[1260px] aspect-video overflow-hidden"
                  >
                    <VimeoStage00
                      vimeoId={chapter.vimeoId || '76979871'}
                      title={chapter.title}
                      coverProgress={vimeoCoverProgress}
                    />
                  </div>
                ) : chapter.kind === 'closing' ? (
                  /* CHAPTER 06: SMALL-SCALE EDITORIAL CONTACT COLOPHON */
                  <div className="w-full max-w-md px-6 flex flex-col items-center text-center space-y-2.5">
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs sm:text-[13px] font-mono-tabular tracking-[0.08em] text-[#111110]">
                      <a
                        href={`mailto:${artistProfile.email}`}
                        className="hover:opacity-55 transition-opacity underline underline-offset-4"
                      >
                        {artistProfile.email}
                      </a>
                      <span aria-hidden="true" className="text-[#B5B2A8]">
                        ·
                      </span>
                      <span className="text-[#4A4945]">
                        {artistProfile.instagram}
                      </span>
                    </div>

                    <p className="text-[11px] font-sans font-light tracking-[0.06em] text-[#9A9890]">
                      Comisiones y proyectos visuales
                    </p>
                  </div>
                ) : (
                  /* CHAPTERS 01–05: OPTION A — FIXED SPATIAL GRADIENT BY POSITION */
                  <div className="relative w-full h-full flex items-center justify-center">
                    {totalInSeries > 0 &&
                      virtualOffsets.map((rel) => {
                        const vIdx = step + rel;
                        const photoIdx = mod(vIdx, totalInSeries);
                        const photo = photos[photoIdx] || photos[0];
                        const isPrimary = rel === 0;

                        const firstSideOpacity = isGuideChapter01 ? 0.8 : 0.64;
                        const outerSideOpacity = hasMoreThanThree
                          ? isGuideChapter01
                            ? 0.32
                            : 0.24
                          : 0;

                        let txVw = 0;
                        let cardScale = 1;
                        let cardOpacity = 1;
                        let zIndex = 30;
                        let pointerEvents: 'auto' | 'none' = 'auto';

                        if (rel === 0) {
                          txVw = 0;
                          cardScale = 1;
                          cardOpacity = 1;
                          zIndex = 30;
                        } else if (rel === 1) {
                          txVw = 28.5;
                          cardScale = 0.58;
                          cardOpacity = firstSideOpacity;
                          zIndex = lastDir < 0 ? 24 : 20;
                        } else if (rel === -1) {
                          txVw = -28.5;
                          cardScale = 0.58;
                          cardOpacity = firstSideOpacity;
                          zIndex = lastDir > 0 ? 24 : 20;
                        } else if (rel === 2) {
                          txVw = hasMoreThanThree ? 34.5 : 16;
                          cardScale = hasMoreThanThree ? 0.43 : 0.44;
                          cardOpacity = outerSideOpacity;
                          zIndex = 10;
                          pointerEvents = 'none';
                        } else {
                          txVw = hasMoreThanThree ? -34.5 : -16;
                          cardScale = hasMoreThanThree ? 0.43 : 0.44;
                          cardOpacity = outerSideOpacity;
                          zIndex = 10;
                          pointerEvents = 'none';
                        }

                        const sizingClass = getPlateSizingClass(
                          photo.aspectRatio
                        );

                        return (
                          <figure
                            key={`${chapter.id}-v-${vIdx}`}
                            onClick={() => {
                              if (rel === -1) {
                                rotateBarajeo(chapter.id, -1);
                              } else if (rel === 0 || rel === 1) {
                                rotateBarajeo(chapter.id, 1);
                              }
                            }}
                            style={{
                              zIndex,
                              opacity: cardOpacity,
                              pointerEvents,
                              transform: `translate3d(${txVw}vw, 0vh, 0px) scale(${cardScale})`,
                              boxShadow:
                                cardOpacity > 0.05 ? subtleImageShadow : 'none',
                              transition:
                                'transform 880ms cubic-bezier(0.22, 1, 0.36, 1), opacity 880ms cubic-bezier(0.22, 1, 0.36, 1)',
                            }}
                            className={`absolute ${sizingClass} cursor-pointer overflow-hidden will-change-transform bg-[#EFECE6] p-0`}
                          >
                            <div className="relative w-full h-full overflow-hidden bg-[#EFECE6]">
                              <img
                                src={photo.src}
                                alt={photo.title}
                                decoding="async"
                                style={{
                                  objectPosition:
                                    photo.cropPosition || 'center center',
                                  transform: `translate3d(0, ${(
                                    innerParallaxY * (isPrimary ? 1 : 1.1)
                                  ).toFixed(2)}%, 0) scale(${scale.toFixed(3)})`,
                                }}
                                className="w-full h-full object-cover will-change-transform"
                              />
                            </div>
                          </figure>
                        );
                      })}
                  </div>
                )}
              </section>
            );
          })}

          {/* =================================================================
              3. BOTTOM BAR IN NEGATIVE:
                 - Left: Series Title ("06 Contacto" on closing) + Circle & Arrow for > 3 photos
                 - Right: Unified Index & Step Control (`← 01/08 →  /  00 01 02 03 04 05 06`)
              ================================================================= */}
          <div
            style={{
              opacity: narrativeVisibility,
              transform: `translate3d(0, ${(
                (1 - narrativeVisibility) *
                6
              ).toFixed(1)}px, 0)`,
            }}
            className="fixed inset-x-0 bottom-6 sm:bottom-9 z-40 px-6 sm:px-14 flex items-end justify-between gap-4 mix-blend-difference text-white pointer-events-none transition-transform duration-200"
          >
            {/* Bottom-Left: Series Title + Circle & Arrow for > 3 Photo Series */}
            <div className="flex items-center gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-mono-tabular font-medium opacity-80">
                    {activeChapter.index}
                  </span>
                  <h1
                    style={{ textShadow: subtleTextShadow }}
                    className="font-sans font-semibold text-sm sm:text-base tracking-wide"
                  >
                    {activeChapter.title}
                  </h1>
                </div>

                {activeChapter.kind !== 'closing' && (
                  <p className="text-[11px] font-light tracking-wide opacity-65 max-w-sm">
                    {activeChapter.narrativeLine}
                  </p>
                )}
              </div>

              {activeHasDeepArchive && (
                <button
                  type="button"
                  aria-label={`Abrir serie completa de ${activeChapter.photos.length} obras`}
                  title={`Ver serie completa (${activeChapter.photos.length} obras)`}
                  onClick={() =>
                    openSeriesLevel2(activeChapter, currentPhotoIdxForActive)
                  }
                  className="pointer-events-auto group relative flex items-center justify-center w-9 h-9 rounded-full border border-white/60 hover:border-white hover:scale-105 transition-all duration-300 cursor-pointer shrink-0"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 17L17 7M17 7H9M17 7V15"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Bottom-Right: Clean Unified Block */}
            <div
              onMouseEnter={() => setIndexHovered(true)}
              onMouseLeave={() => setIndexHovered(false)}
              className={`flex items-center gap-4 text-[11px] font-mono-tabular transition-opacity duration-700 ${
                isAtVideoStart && !indexHovered
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-100 pointer-events-auto'
              }`}
            >
              {activeChapter.kind === 'photo' &&
                activeChapter.photos.length > 1 && (
                  <>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <button
                        type="button"
                        aria-label="Foto anterior"
                        onClick={() => rotateBarajeo(activeChapter.id, -1)}
                        className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => rotateBarajeo(activeChapter.id, 1)}
                        className="opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        {String(currentPhotoIdxForActive + 1).padStart(2, '0')}/
                        {String(activeChapter.photos.length).padStart(2, '0')}
                      </button>
                      <button
                        type="button"
                        aria-label="Siguiente foto"
                        onClick={() => rotateBarajeo(activeChapter.id, 1)}
                        className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        →
                      </button>
                    </div>

                    <span aria-hidden="true" className="opacity-25">
                      /
                    </span>
                  </>
                )}

              <nav
                aria-label="Índice de capítulos"
                style={{
                  maskImage: indexFullyRevealed
                    ? 'none'
                    : 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.85) 18%, black 50%, rgba(0,0,0,0.85) 82%, transparent 100%)',
                  WebkitMaskImage: indexFullyRevealed
                    ? 'none'
                    : 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.85) 18%, black 50%, rgba(0,0,0,0.85) 82%, transparent 100%)',
                }}
                className="flex items-center gap-2.5 px-1.5"
              >
                {chapters.map((chap, idx) => {
                  const isCurrent = idx === safeActiveIdx;
                  const dist = Math.abs(idx - safeActiveIdx);

                  const numOpacity = indexFullyRevealed
                    ? isCurrent
                      ? 1
                      : 0.72
                    : isCurrent
                    ? 0.95
                    : Math.max(0.14, 0.52 - dist * 0.14);

                  return (
                    <button
                      key={chap.id}
                      type="button"
                      onClick={() => glideToChapter(idx)}
                      style={{ opacity: numOpacity }}
                      className={`cursor-pointer transition-opacity duration-500 whitespace-nowrap ${
                        isCurrent
                          ? 'font-medium underline underline-offset-4'
                          : ''
                      }`}
                    >
                      {chap.index}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </main>
      )}

      {/* =====================================================================
          4. CURATORIAL CMS DRAWER (Hidden from public, opened via Shift+E or ?cms)
          ===================================================================== */}
      <CuratorialCmsDrawer
        isOpen={cmsOpen}
        onClose={() => setCmsOpen(false)}
        cmsState={cmsState}
        activeChapterIndex={safeActiveIdx}
        onSelectChapter={(idx) => glideToChapter(idx)}
        onUpdateState={handleUpdateCmsState}
        onResetToDefaults={handleResetCmsToDefaults}
      />
    </div>
  );
}
