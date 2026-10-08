import { AspectRatioType } from '../data/portfolioData';

/**
 * Positive modulo helper that handles negative step numbers cleanly.
 */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * Returns gallery-proportioned dimensions for each photographic aspect ratio
 * on the Level 1 stage (3:4, 4:3, 16:9, 1:1) sitting on a symmetric horizon.
 */
export function getPlateSizingClass(aspect: AspectRatioType): string {
  switch (aspect) {
    case '3:4':
      return 'w-[66vw] sm:w-[36vw] max-w-[560px] aspect-[3/4] max-h-[75vh]';
    case '4:3':
      return 'w-[76vw] sm:w-[52vw] max-w-[820px] aspect-[4/3] max-h-[74vh]';
    case '16:9':
      return 'w-[82vw] sm:w-[58vw] max-w-[920px] aspect-[16/9] max-h-[70vh]';
    case '1:1':
      return 'w-[68vw] sm:w-[42vw] max-w-[640px] aspect-square max-h-[74vh]';
    default:
      return 'w-[74vw] sm:w-[48vw] max-w-[760px] aspect-[4/3] max-h-[74vh]';
  }
}

/**
 * Returns large-format exhibition dimensions for Level 2 (series with > 3 works).
 */
export function getLevel2PlateSizingClass(aspect: AspectRatioType): string {
  switch (aspect) {
    case '3:4':
      return 'w-[82vw] sm:w-[44vw] max-w-[640px] aspect-[3/4]';
    case '1:1':
      return 'w-[82vw] sm:w-[50vw] max-w-[720px] aspect-square';
    case '16:9':
      return 'w-[88vw] sm:w-[68vw] max-w-[1020px] aspect-[16/9]';
    case '4:3':
    default:
      return 'w-[86vw] sm:w-[60vw] max-w-[880px] aspect-[4/3]';
  }
}
