import {
  ARTIST_PROFILE,
  AspectRatioType,
  PORTFOLIO_CHAPTERS,
  PortfolioChapter,
  SeriesPhoto,
} from '../data/portfolioData';

export type ArtistProfileData = typeof ARTIST_PROFILE;

export interface CmsPortfolioState {
  version: number;
  updatedAt: string;
  artistProfile: ArtistProfileData;
  chapters: PortfolioChapter[];
  /**
   * Optional map of local file name -> base64 data URL for photos added from
   * the artist's computer during curation before or during publishing to Vercel.
   */
  localAssetMap?: Record<string, string>;
}

export interface GitHubPublishConfig {
  repo: string; // e.g. "dondonaji/portafolio"
  branch: string; // e.g. "main"
  token: string;
}

const DB_NAME = 'donaji_portfolio_cms_db';
const STORE_NAME = 'curatorial_state';
const STATE_KEY = 'active_draft_v1';
const GH_CONFIG_KEY = 'donaji_cms_github_config';

function openCmsDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadCmsDraft(): Promise<CmsPortfolioState | null> {
  try {
    const db = await openCmsDb();
    return await new Promise<CmsPortfolioState | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(STATE_KEY);
      req.onsuccess = () => resolve((req.result as CmsPortfolioState) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function saveCmsDraft(state: CmsPortfolioState): Promise<void> {
  try {
    const db = await openCmsDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(state, STATE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Error saving CMS draft to IndexedDB:', err);
  }
}

export async function clearCmsDraft(): Promise<void> {
  try {
    const db = await openCmsDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(STATE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Error clearing CMS draft:', err);
  }
}

export function getDefaultCmsState(): CmsPortfolioState {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    artistProfile: structuredClone(ARTIST_PROFILE),
    chapters: structuredClone(PORTFOLIO_CHAPTERS),
    localAssetMap: {},
  };
}

/**
 * Detects the closest gallery aspect ratio ('3:4' | '4:3' | '16:9' | '1:1')
 * from an image's natural pixel dimensions.
 */
export function detectClosestAspectRatio(
  width: number,
  height: number
): AspectRatioType {
  if (!width || !height) return '4:3';
  const ratio = width / height;
  const candidates: { type: AspectRatioType; value: number }[] = [
    { type: '3:4', value: 3 / 4 }, // 0.75
    { type: '1:1', value: 1.0 }, // 1.00
    { type: '4:3', value: 4 / 3 }, // 1.333
    { type: '16:9', value: 16 / 9 }, // 1.777
  ];

  let best = candidates[0];
  let minDiff = Math.abs(ratio - best.value);
  for (const c of candidates) {
    const diff = Math.abs(ratio - c.value);
    if (diff < minDiff) {
      minDiff = diff;
      best = c;
    }
  }
  return best.type;
}

/**
 * Sanitizes a local filename for clean static hosting under `/obras/<filename>`.
 */
export function sanitizeAssetFilename(rawName: string): string {
  const cleaned = rawName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || `obra-${Date.now()}.jpg`;
}

/**
 * Reads an image file from disk, compresses/resizes only if excessively huge (> 2600px)
 * so preview and upload stay crisp and fast, and returns its DataURL + detected aspectRatio.
 */
export function readAndAnalyzeImageFile(file: File): Promise<{
  dataUrl: string;
  aspectRatio: AspectRatioType;
  cleanFilename: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Archivo de imagen inválido.'));
      img.onload = () => {
        const w = img.naturalWidth || 1200;
        const h = img.naturalHeight || 900;
        const aspectRatio = detectClosestAspectRatio(w, h);
        const baseName = file.name.replace(/\.[^.]+$/, '');
        const cleanFilename = `${sanitizeAssetFilename(baseName)}.jpg`;

        // Keep high museum resolution up to 2400px on longest side
        const maxDim = 2400;
        let targetW = w;
        let targetH = h;
        if (w > maxDim || h > maxDim) {
          if (w >= h) {
            targetW = maxDim;
            targetH = Math.round((h * maxDim) / w);
          } else {
            targetH = maxDim;
            targetW = Math.round((w * maxDim) / h);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: rawDataUrl,
            aspectRatio,
            cleanFilename,
            width: w,
            height: h,
          });
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve({
          dataUrl: optimizedDataUrl,
          aspectRatio,
          cleanFilename,
          width: targetW,
          height: targetH,
        });
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts a clean numeric Vimeo ID from either a full URL or raw ID string.
 */
export function parseVimeoInput(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (match && match[1]) return match[1];
  const digitsOnly = trimmed.replace(/\D/g, '');
  return digitsOnly || trimmed;
}

/**
 * Re-indexes chapters sequentially ('00', '01', '02', ..., '06') and updates photo codes ('01.1', '01.2', ...).
 */
export function reindexChapters(
  chapters: PortfolioChapter[]
): PortfolioChapter[] {
  return chapters.map((chap, cIdx) => {
    const newIndex = String(cIdx).padStart(2, '0');
    const updatedPhotos: SeriesPhoto[] = chap.photos.map((p, pIdx) => ({
      ...p,
      id: `${newIndex}-${pIdx + 1}`,
      code: `${newIndex}.${pIdx + 1}`,
    }));
    const firstPhoto = updatedPhotos[0];
    return {
      ...chap,
      index: newIndex,
      coverPhoto: firstPhoto ? firstPhoto.src : chap.coverPhoto,
      coverAspect: firstPhoto ? firstPhoto.aspectRatio : chap.coverAspect,
      photos: updatedPhotos,
    };
  });
}

/**
 * Produces a clean production state where local `data:image/...` URLs are replaced
 * with their `/obras/<filename>` static paths for `public/portfolio.json` and `portfolioData.ts`.
 */
export function buildProductionExportState(state: CmsPortfolioState): {
  productionState: CmsPortfolioState;
  requiredStaticFiles: { filename: string; dataUrl: string }[];
} {
  const localMap = state.localAssetMap || {};
  const reverseLookup = new Map<string, string>();
  Object.entries(localMap).forEach(([filename, dataUrl]) => {
    reverseLookup.set(dataUrl, filename);
  });

  const usedFiles = new Map<string, string>();

  const resolveSrc = (src: string): string => {
    const matchedFilename = reverseLookup.get(src);
    if (matchedFilename) {
      usedFiles.set(matchedFilename, src);
      return `/obras/${matchedFilename}`;
    }
    return src;
  };

  const cleanChapters: PortfolioChapter[] = state.chapters.map((chap) => {
    const cleanPhotos = chap.photos.map((p) => ({
      ...p,
      src: resolveSrc(p.src),
    }));
    return {
      ...chap,
      coverPhoto: cleanPhotos[0]?.src || resolveSrc(chap.coverPhoto),
      photos: cleanPhotos,
    };
  });

  const requiredStaticFiles = Array.from(usedFiles.entries()).map(
    ([filename, dataUrl]) => ({
      filename,
      dataUrl,
    })
  );

  return {
    productionState: {
      version: state.version,
      updatedAt: new Date().toISOString(),
      artistProfile: state.artistProfile,
      chapters: cleanChapters,
    },
    requiredStaticFiles,
  };
}

/**
 * Generates the complete TypeScript source code for `src/data/portfolioData.ts`.
 */
export function generatePortfolioDataTsCode(state: CmsPortfolioState): string {
  const { productionState } = buildProductionExportState(state);

  return `export type AspectRatioType = '3:4' | '4:3' | '16:9' | '1:1';

export interface SeriesPhoto {
  id: string;
  code: string;
  title: string;
  aspectRatio: AspectRatioType;
  src: string;
  cropPosition?: string;
  originalAspectRatio?: AspectRatioType;
}

export interface PortfolioChapter {
  id: string;
  index: string;
  kind: 'vimeo' | 'photo' | 'closing';
  title: string;
  narrativeLine: string;
  year: string;
  location: string;
  coverPhoto: string;
  coverAspect: AspectRatioType;
  photos: SeriesPhoto[];
  vimeoId?: string;
}

export const ARTIST_PROFILE = ${JSON.stringify(
    productionState.artistProfile,
    null,
    2
  )};

export const PORTFOLIO_CHAPTERS: PortfolioChapter[] = ${JSON.stringify(
    productionState.chapters,
    null,
    2
  )};
`;
}

export function loadSavedGitHubConfig(): GitHubPublishConfig {
  const fallback: GitHubPublishConfig = {
    repo: 'dondonaji/porfolio-2026',
    branch: 'main',
    token: '',
  };
  try {
    const raw = localStorage.getItem(GH_CONFIG_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<GitHubPublishConfig>;
    return {
      repo: parsed.repo || fallback.repo,
      branch: parsed.branch || fallback.branch,
      token: parsed.token || fallback.token,
    };
  } catch {
    return fallback;
  }
}

export function saveGitHubConfig(cfg: GitHubPublishConfig): void {
  try {
    localStorage.setItem(GH_CONFIG_KEY, JSON.stringify(cfg));
  } catch {
    // Ignore storage errors
  }
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function putGitHubFile(params: {
  repo: string;
  branch: string;
  token: string;
  path: string;
  base64Content: string;
  message: string;
}): Promise<void> {
  const apiUrl = `https://api.github.com/repos/${params.repo}/contents/${params.path}`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${params.token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // Check if file already exists to include its current SHA
  let existingSha: string | undefined;
  const getRes = await fetch(
    `${apiUrl}?ref=${encodeURIComponent(params.branch)}`,
    { headers }
  );
  if (getRes.ok) {
    const data = (await getRes.json()) as { sha?: string };
    existingSha = data.sha;
  }

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: params.message,
      content: params.base64Content,
      branch: params.branch,
      ...(existingSha ? { sha: existingSha } : {}),
    }),
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(
      `Error en GitHub API (${putRes.status}) al subir ${params.path}: ${errText}`
    );
  }
}

/**
 * Publishes all newly added local photos to `public/obras/<filename>` and commits
 * `public/portfolio.json` directly to the user's GitHub repository, triggering
 * an automatic Vercel deployment in ~20 seconds.
 */
export async function publishToGitHubForVercel(
  state: CmsPortfolioState,
  config: GitHubPublishConfig,
  onProgress?: (status: string) => void
): Promise<void> {
  const cleanRepo = config.repo
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/^\/|\/$/g, '');
  const branch = config.branch.trim() || 'main';
  const token = config.token.trim();

  if (!cleanRepo || !cleanRepo.includes('/')) {
    throw new Error('Ingresa el repositorio en formato usuario/repositorio.');
  }
  if (!token) {
    throw new Error('Ingresa un Personal Access Token de GitHub con permiso repo/contents.');
  }

  const { productionState, requiredStaticFiles } =
    buildProductionExportState(state);

  // 1. Upload each local image to public/obras/<filename>
  for (let i = 0; i < requiredStaticFiles.length; i++) {
    const item = requiredStaticFiles[i];
    onProgress?.(
      `Subiendo fotografía ${i + 1}/${requiredStaticFiles.length} (${item.filename})...`
    );
    const commaIdx = item.dataUrl.indexOf(',');
    const rawBase64 =
      commaIdx >= 0 ? item.dataUrl.slice(commaIdx + 1) : item.dataUrl;

    await putGitHubFile({
      repo: cleanRepo,
      branch,
      token,
      path: `public/obras/${item.filename}`,
      base64Content: rawBase64,
      message: `chore(obras): subir ${item.filename}`,
    });
  }

  // 2. Upload public/portfolio.json so the deployed app loads the new curation immediately
  onProgress?.('Actualizando public/portfolio.json en el repositorio...');
  const jsonString = JSON.stringify(productionState, null, 2);
  await putGitHubFile({
    repo: cleanRepo,
    branch,
    token,
    path: 'public/portfolio.json',
    base64Content: utf8ToBase64(jsonString),
    message: 'feat(curaduria): actualizar portafolio desde Estudio CMS',
  });

  onProgress?.('¡Publicado! Vercel desplegará los cambios automáticamente.');
}
