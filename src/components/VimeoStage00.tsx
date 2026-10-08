import React, { useEffect, useRef, useState } from 'react';

interface VimeoStage00Props {
  vimeoId: string;
  title: string;
  coverProgress: number;
}

/**
 * Real Vimeo Stage for Chapter 00:
 * - Stays stationary in place while Chapter 01 slides up over it.
 * - Uses Vimeo's native postMessage API to attenuate volume proportionally with scroll
 *   as Chapter 01 covers it, pauses when covered (coverProgress >= 0.96), and resumes
 *   when scrolling back to 00.
 */
export const VimeoStage00: React.FC<VimeoStage00Props> = ({
  vimeoId,
  title,
  coverProgress,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const isPausedByScrollRef = useRef<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  const embedSrc = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=1&background=1&autopause=0&title=0&byline=0&portrait=0&dnt=1&api=1`;

  const postVimeoCommand = (method: string, value?: number | boolean) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    try {
      const payload = value !== undefined ? { method, value } : { method };
      win.postMessage(JSON.stringify(payload), '*');
    } catch {
      // Ignore cross-origin postMessage errors while iframe initializes
    }
  };

  useEffect(() => {
    const clampedCover = Math.max(0, Math.min(1, coverProgress));

    if (clampedCover >= 0.96) {
      if (!isPausedByScrollRef.current) {
        isPausedByScrollRef.current = true;
        if (soundEnabled) {
          postVimeoCommand('setVolume', 0);
        }
        postVimeoCommand('pause');
      }
    } else {
      if (isPausedByScrollRef.current) {
        isPausedByScrollRef.current = false;
        postVimeoCommand('play');
      }
      if (soundEnabled) {
        const targetVolume = Number(
          Math.pow(1 - clampedCover, 1.5).toFixed(3)
        );
        postVimeoCommand('setVolume', targetVolume);
      }
    }
  }, [coverProgress, soundEnabled]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      const clampedCover = Math.max(0, Math.min(1, coverProgress));
      const vol = Number(Math.pow(1 - clampedCover, 1.5).toFixed(3));
      postVimeoCommand('setMuted', false);
      postVimeoCommand('setVolume', vol);
    } else {
      postVimeoCommand('setVolume', 0);
      postVimeoCommand('setMuted', true);
    }
  };

  return (
    <div
      onClick={toggleSound}
      title={soundEnabled ? 'Silenciar video' : 'Activar sonido'}
      className="relative w-full h-full overflow-hidden bg-transparent cursor-pointer"
    >
      <iframe
        ref={iframeRef}
        src={embedSrc}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        className="w-full h-full border-0 pointer-events-none select-none scale-[1.01]"
      />
    </div>
  );
};
