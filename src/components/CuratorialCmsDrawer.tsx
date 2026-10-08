import React, { useRef, useState } from 'react';
import {
  AspectRatioType,
  PortfolioChapter,
  SeriesPhoto,
} from '../data/portfolioData';
import {
  ArtistProfileData,
  buildProductionExportState,
  CmsPortfolioState,
  detectClosestAspectRatio,
  generatePortfolioDataTsCode,
  GitHubPublishConfig,
  loadSavedGitHubConfig,
  parseVimeoInput,
  publishToGitHubForVercel,
  readAndAnalyzeImageFile,
  reindexChapters,
  saveGitHubConfig,
} from '../utils/cmsStorage';

interface CuratorialCmsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cmsState: CmsPortfolioState;
  activeChapterIndex: number;
  onSelectChapter: (index: number) => void;
  onUpdateState: (nextState: CmsPortfolioState) => void;
  onResetToDefaults: () => void;
}

const ASPECT_OPTIONS: AspectRatioType[] = ['3:4', '4:3', '16:9', '1:1'];

const CROP_OPTIONS: { label: string; value: string }[] = [
  { label: 'Centro', value: 'center center' },
  { label: 'Arriba', value: 'center 22%' },
  { label: 'Abajo', value: 'center 78%' },
  { label: 'Izq', value: 'left center' },
  { label: 'Der', value: 'right center' },
];

export const CuratorialCmsDrawer: React.FC<CuratorialCmsDrawerProps> = ({
  isOpen,
  onClose,
  cmsState,
  activeChapterIndex,
  onSelectChapter,
  onUpdateState,
  onResetToDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'series' | 'bio' | 'publish'>(
    'series'
  );
  const [isProcessingFiles, setIsProcessingFiles] = useState<boolean>(false);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [customImageAspect, setCustomImageAspect] =
    useState<AspectRatioType>('3:4');

  // GitHub -> Vercel direct publish state
  const [ghConfig, setGhConfig] = useState<GitHubPublishConfig>(() =>
    loadSavedGitHubConfig()
  );
  const [publishStatus, setPublishStatus] = useState<string>('');
  const [publishError, setPublishError] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  const fileInputAddRef = useRef<HTMLInputElement | null>(null);
  const fileInputReplaceRef = useRef<HTMLInputElement | null>(null);
  const snapshotImportRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const chapters = cmsState.chapters;
  const selectedChapter =
    chapters[activeChapterIndex] || chapters[1] || chapters[0];

  const commitChapters = (
    nextChapters: PortfolioChapter[],
    nextLocalAssets?: Record<string, string>
  ) => {
    const reindexed = reindexChapters(nextChapters);
    onUpdateState({
      ...cmsState,
      updatedAt: new Date().toISOString(),
      chapters: reindexed,
      localAssetMap: nextLocalAssets ?? cmsState.localAssetMap ?? {},
    });
  };

  const commitProfile = (nextProfile: ArtistProfileData) => {
    onUpdateState({
      ...cmsState,
      updatedAt: new Date().toISOString(),
      artistProfile: nextProfile,
    });
  };

  const updateSelectedChapterField = <K extends keyof PortfolioChapter>(
    key: K,
    value: PortfolioChapter[K]
  ) => {
    const next = chapters.map((chap, idx) =>
      idx === activeChapterIndex ? { ...chap, [key]: value } : chap
    );
    commitChapters(next);
  };

  // Add a new photo series right before the closing chapter (06)
  const handleAddNewSeries = () => {
    const closingIdx = chapters.findIndex((c) => c.kind === 'closing');
    const insertAt = closingIdx >= 0 ? closingIdx : chapters.length;
    const sampleCover =
      chapters[1]?.photos[0]?.src || chapters[0]?.coverPhoto || '';

    const newSeries: PortfolioChapter = {
      id: `series-${Date.now()}`,
      index: String(insertAt).padStart(2, '0'),
      kind: 'photo',
      title: 'Nueva Serie',
      narrativeLine: 'Nota o atmósfera visual de la serie.',
      year: String(new Date().getFullYear()),
      location: 'Ciudad de México',
      coverPhoto: sampleCover,
      coverAspect: '3:4',
      photos: sampleCover
        ? [
            {
              id: 'temp-1',
              code: '01.1',
              title: 'Obra I',
              aspectRatio: '3:4',
              src: sampleCover,
              cropPosition: 'center center',
            },
            {
              id: 'temp-2',
              code: '01.2',
              title: 'Obra II',
              aspectRatio: '4:3',
              src: sampleCover,
              cropPosition: 'center center',
            },
            {
              id: 'temp-3',
              code: '01.3',
              title: 'Obra III',
              aspectRatio: '3:4',
              src: sampleCover,
              cropPosition: 'center center',
            },
          ]
        : [],
    };

    const next = [
      ...chapters.slice(0, insertAt),
      newSeries,
      ...chapters.slice(insertAt),
    ];
    commitChapters(next);
    onSelectChapter(insertAt);
  };

  // Delete currently selected photo series (if there is more than 1 photo series)
  const handleDeleteCurrentSeries = () => {
    if (selectedChapter.kind !== 'photo') return;
    const photoSeriesCount = chapters.filter((c) => c.kind === 'photo').length;
    if (photoSeriesCount <= 1) return;

    const next = chapters.filter((_, idx) => idx !== activeChapterIndex);
    commitChapters(next);
    onSelectChapter(Math.max(1, activeChapterIndex - 1));
  };

  // Move current photo series up or down among photo series (keeping 00 first and closing last)
  const handleMoveSeries = (dir: -1 | 1) => {
    if (selectedChapter.kind !== 'photo') return;
    const targetIdx = activeChapterIndex + dir;
    if (
      targetIdx <= 0 ||
      targetIdx >= chapters.length ||
      chapters[targetIdx].kind !== 'photo'
    ) {
      return;
    }
    const next = [...chapters];
    const [moved] = next.splice(activeChapterIndex, 1);
    next.splice(targetIdx, 0, moved);
    commitChapters(next);
    onSelectChapter(targetIdx);
  };

  // Handle uploading local image files from computer (either appending or replacing series photos)
  const handleLocalFilesSelected = async (
    files: FileList | null,
    replaceExisting: boolean
  ) => {
    if (!files || files.length === 0 || selectedChapter.kind !== 'photo')
      return;

    setIsProcessingFiles(true);
    try {
      const nextLocalAssets = { ...(cmsState.localAssetMap || {}) };
      const uploadedPhotos: SeriesPhoto[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const analyzed = await readAndAnalyzeImageFile(file);
        nextLocalAssets[analyzed.cleanFilename] = analyzed.dataUrl;

        const baseTitle = file.name
          .replace(/\.[^.]+$/, '')
          .replace(/[-_]+/g, ' ');
        uploadedPhotos.push({
          id: `${selectedChapter.index}-${Date.now()}-${i}`,
          code: `${selectedChapter.index}.${i + 1}`,
          title: baseTitle.charAt(0).toUpperCase() + baseTitle.slice(1),
          aspectRatio: analyzed.aspectRatio,
          originalAspectRatio: analyzed.aspectRatio,
          src: analyzed.dataUrl,
          cropPosition: 'center center',
        });
      }

      const nextPhotos = replaceExisting
        ? uploadedPhotos
        : [...selectedChapter.photos, ...uploadedPhotos];

      const nextChapters = chapters.map((chap, idx) =>
        idx === activeChapterIndex ? { ...chap, photos: nextPhotos } : chap
      );
      commitChapters(nextChapters, nextLocalAssets);
    } catch (err) {
      console.error('Error processing image files:', err);
    } finally {
      setIsProcessingFiles(false);
    }
  };

  // Add photo by URL or /obras/... path
  const handleAddPhotoByUrl = () => {
    const trimmed = customImageUrl.trim();
    if (!trimmed || selectedChapter.kind !== 'photo') return;

    const newPhoto: SeriesPhoto = {
      id: `${selectedChapter.index}-${Date.now()}`,
      code: `${selectedChapter.index}.${selectedChapter.photos.length + 1}`,
      title: `Obra ${selectedChapter.photos.length + 1}`,
      aspectRatio: customImageAspect,
      originalAspectRatio: customImageAspect,
      src: trimmed,
      cropPosition: 'center center',
    };

    const nextChapters = chapters.map((chap, idx) =>
      idx === activeChapterIndex
        ? { ...chap, photos: [...chap.photos, newPhoto] }
        : chap
    );
    commitChapters(nextChapters);
    setCustomImageUrl('');
  };

  // Update a single photo inside the selected series
  const updatePhotoInSeries = (
    photoIndex: number,
    patch: Partial<SeriesPhoto>
  ) => {
    if (selectedChapter.kind !== 'photo') return;
    const nextPhotos = selectedChapter.photos.map((p, idx) =>
      idx === photoIndex ? { ...p, ...patch } : p
    );
    updateSelectedChapterField('photos', nextPhotos);
  };

  // Reorder a photo inside the selected series
  const movePhotoInSeries = (photoIndex: number, dir: -1 | 1) => {
    if (selectedChapter.kind !== 'photo') return;
    const targetIdx = photoIndex + dir;
    if (targetIdx < 0 || targetIdx >= selectedChapter.photos.length) return;
    const nextPhotos = [...selectedChapter.photos];
    const [moved] = nextPhotos.splice(photoIndex, 1);
    nextPhotos.splice(targetIdx, 0, moved);
    updateSelectedChapterField('photos', nextPhotos);
  };

  // Delete a photo inside the selected series
  const deletePhotoInSeries = (photoIndex: number) => {
    if (selectedChapter.kind !== 'photo') return;
    if (selectedChapter.photos.length <= 1) return;
    const nextPhotos = selectedChapter.photos.filter(
      (_, idx) => idx !== photoIndex
    );
    updateSelectedChapterField('photos', nextPhotos);
  };

  // Download helper
  const triggerFileDownload = (
    filename: string,
    content: string,
    mimeType = 'application/json'
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const triggerDataUrlDownload = (filename: string, dataUrl: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Export full curation draft (including local base64 photos so Donaji can save/load multiple curations)
  const handleExportFullDraftJson = () => {
    const dateSlug = new Date().toISOString().slice(0, 10);
    triggerFileDownload(
      `curaduria-donaji-${dateSlug}.json`,
      JSON.stringify(cmsState, null, 2)
    );
  };

  // Import a saved curation draft JSON
  const handleImportDraftJson = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as CmsPortfolioState;
        if (parsed && Array.isArray(parsed.chapters) && parsed.artistProfile) {
          onUpdateState({
            ...parsed,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Invalid curation JSON file:', err);
      }
    };
    reader.readAsText(files[0]);
  };

  const { productionState, requiredStaticFiles } =
    buildProductionExportState(cmsState);

  const handlePublishToGitHub = async () => {
    setPublishError('');
    setPublishStatus('Iniciando conexión con GitHub...');
    setIsPublishing(true);
    saveGitHubConfig(ghConfig);
    try {
      await publishToGitHubForVercel(cmsState, ghConfig, (msg) =>
        setPublishStatus(msg)
      );
    } catch (err) {
      setPublishError(
        err instanceof Error ? err.message : 'Error al publicar en GitHub.'
      );
      setPublishStatus('');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <aside className="fixed top-0 right-0 bottom-0 z-[70] w-full sm:w-[450px] bg-[#111110]/96 backdrop-blur-md text-[#F6F5F2] border-l border-white/12 flex flex-col shadow-2xl select-text font-sans">
      {/* Top Header */}
      <div className="px-5 py-4 border-b border-white/12 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="font-mono-tabular text-xs uppercase tracking-[0.2em] font-medium">
              Estudio Curatorial · CMS
            </h2>
          </div>
          <p className="text-[11px] text-white/50 mt-0.5">
            Atajo: <kbd className="font-mono-tabular">Shift + E</kbd> o{' '}
            <span className="font-mono-tabular">?cms</span> · Cambios en vivo
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-[11px] font-mono-tabular uppercase tracking-[0.15em] border border-white/20 hover:border-white/60 transition-colors cursor-pointer"
        >
          Cerrar ×
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="grid grid-cols-3 border-b border-white/12 text-[11px] font-mono-tabular uppercase tracking-[0.14em]">
        <button
          type="button"
          onClick={() => setActiveTab('series')}
          className={`py-3 text-center transition-colors cursor-pointer ${
            activeTab === 'series'
              ? 'bg-white text-[#111110] font-medium'
              : 'text-white/65 hover:text-white'
          }`}
        >
          1. Series y Fotos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bio')}
          className={`py-3 text-center transition-colors cursor-pointer ${
            activeTab === 'bio'
              ? 'bg-white text-[#111110] font-medium'
              : 'text-white/65 hover:text-white'
          }`}
        >
          2. Acerca de
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('publish')}
          className={`py-3 text-center transition-colors cursor-pointer ${
            activeTab === 'publish'
              ? 'bg-white text-[#111110] font-medium'
              : 'text-white/65 hover:text-white'
          }`}
        >
          3. Vercel / Export
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {activeTab === 'series' && (
          <>
            {/* Chapter Selector Strip */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono-tabular uppercase tracking-[0.16em] text-white/60">
                  Capítulos ({chapters.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddNewSeries}
                  className="px-2.5 py-1 text-[11px] font-mono-tabular bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  + Nueva Serie
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {chapters.map((chap, idx) => {
                  const isSel = idx === activeChapterIndex;
                  return (
                    <button
                      key={chap.id}
                      type="button"
                      onClick={() => onSelectChapter(idx)}
                      className={`px-3 py-1.5 text-xs font-mono-tabular transition-all cursor-pointer border ${
                        isSel
                          ? 'bg-[#F6F5F2] text-[#111110] border-[#F6F5F2] font-medium'
                          : 'bg-transparent text-white/75 border-white/15 hover:border-white/45'
                      }`}
                    >
                      {chap.index} ·{' '}
                      {chap.kind === 'vimeo'
                        ? 'Vimeo'
                        : chap.kind === 'closing'
                        ? 'Contacto'
                        : `${chap.photos.length}f`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Chapter Editor */}
            {selectedChapter.kind === 'vimeo' ? (
              <div className="space-y-4 border-t border-white/12 pt-5">
                <span className="block text-[11px] font-mono-tabular uppercase tracking-[0.16em] text-white/55">
                  Capítulo 00 · Portada Vimeo
                </span>

                <label className="block space-y-1.5">
                  <span className="text-xs text-white/75">
                    ID o URL de tu video en Vimeo
                  </span>
                  <input
                    type="text"
                    value={selectedChapter.vimeoId || ''}
                    onChange={(e) =>
                      updateSelectedChapterField(
                        'vimeoId',
                        parseVimeoInput(e.target.value)
                      )
                    }
                    placeholder="Ej. 76979871 o https://vimeo.com/76979871"
                    className="w-full px-3 py-2 bg-white/8 border border-white/20 text-sm font-mono-tabular text-white focus:outline-none focus:border-white"
                  />
                  <span className="block text-[11px] text-white/45">
                    Puedes pegar el enlace completo de Vimeo y se extraerá el ID
                    automáticamente.
                  </span>
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs text-white/75">
                    Título en esquina inferior (`00`)
                  </span>
                  <input
                    type="text"
                    value={selectedChapter.title}
                    onChange={(e) =>
                      updateSelectedChapterField('title', e.target.value)
                    }
                    className="w-full px-3 py-2 bg-white/8 border border-white/20 text-sm text-white focus:outline-none focus:border-white"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs text-white/75">
                    Subtítulo / Línea poética
                  </span>
                  <input
                    type="text"
                    value={selectedChapter.narrativeLine}
                    onChange={(e) =>
                      updateSelectedChapterField(
                        'narrativeLine',
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 bg-white/8 border border-white/20 text-sm text-white focus:outline-none focus:border-white"
                  />
                </label>
              </div>
            ) : selectedChapter.kind === 'closing' ? (
              <div className="space-y-4 border-t border-white/12 pt-5">
                <span className="block text-[11px] font-mono-tabular uppercase tracking-[0.16em] text-white/55">
                  Capítulo {selectedChapter.index} · Pantalla de Cierre
                </span>

                <label className="block space-y-1.5">
                  <span className="text-xs text-white/75">
                    Título inferior izquierdo
                  </span>
                  <input
                    type="text"
                    value={selectedChapter.title}
                    onChange={(e) =>
                      updateSelectedChapterField('title', e.target.value)
                    }
                    className="w-full px-3 py-2 bg-white/8 border border-white/20 text-sm text-white focus:outline-none focus:border-white"
                  />
                </label>

                <p className="text-xs text-white/55 leading-relaxed">
                  El correo (<span className="font-mono-tabular">{cmsState.artistProfile.email}</span>) e Instagram (<span className="font-mono-tabular">{cmsState.artistProfile.instagram}</span>) se editan en la pestaña <strong>2. Acerca de</strong>.
                </p>
              </div>
            ) : (
              /* PHOTO SERIES EDITOR */
              <div className="space-y-5 border-t border-white/12 pt-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono-tabular uppercase tracking-[0.16em] text-white/65">
                    Serie {selectedChapter.index} ·{' '}
                    {selectedChapter.photos.length} fotos
                    {selectedChapter.photos.length > 3
                      ? ' (Activa Nivel 2 ↗)'
                      : ' (Solo Nivel 1)'}
                  </span>

                  <div className="flex items-center gap-1.5 font-mono-tabular text-xs">
                    <button
                      type="button"
                      title="Subir serie de posición"
                      onClick={() => handleMoveSeries(-1)}
                      className="px-2 py-1 border border-white/20 hover:border-white/60 cursor-pointer"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      title="Bajar serie de posición"
                      onClick={() => handleMoveSeries(1)}
                      className="px-2 py-1 border border-white/20 hover:border-white/60 cursor-pointer"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      title="Eliminar esta serie"
                      onClick={handleDeleteCurrentSeries}
                      className="px-2 py-1 border border-red-400/40 text-red-300 hover:border-red-400 cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* Series Title & Narrative */}
                <div className="grid grid-cols-1 gap-3">
                  <label className="block space-y-1">
                    <span className="text-[11px] text-white/65">
                      Título de la serie
                    </span>
                    <input
                      type="text"
                      value={selectedChapter.title}
                      onChange={(e) =>
                        updateSelectedChapterField('title', e.target.value)
                      }
                      className="w-full px-3 py-1.5 bg-white/8 border border-white/20 text-sm text-white focus:outline-none focus:border-white"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-[11px] text-white/65">
                      Línea descriptiva (bajo el título)
                    </span>
                    <input
                      type="text"
                      value={selectedChapter.narrativeLine}
                      onChange={(e) =>
                        updateSelectedChapterField(
                          'narrativeLine',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-1.5 bg-white/8 border border-white/20 text-xs text-white focus:outline-none focus:border-white"
                    />
                  </label>
                </div>

                {/* Upload / Add Photos to Series */}
                <div className="p-3.5 bg-white/5 border border-dashed border-white/25 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white">
                      Mesa de Luz · Probar fotografías
                    </span>
                    {isProcessingFiles && (
                      <span className="text-[11px] font-mono-tabular text-amber-300">
                        Analizando proporciones...
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-white/55 leading-relaxed">
                    Selecciona fotos desde tu computadora. El estudio detecta
                    automáticamente si cada obra es <code>3:4</code>,{' '}
                    <code>4:3</code>, <code>16:9</code> o <code>1:1</code>.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={fileInputAddRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        handleLocalFilesSelected(e.target.files, false);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputAddRef.current?.click()}
                      className="flex-1 py-2 px-3 bg-[#F6F5F2] text-[#111110] text-xs font-mono-tabular font-medium hover:bg-white transition-colors cursor-pointer"
                    >
                      + Agregar fotos locales
                    </button>

                    <input
                      ref={fileInputReplaceRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        handleLocalFilesSelected(e.target.files, true);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputReplaceRef.current?.click()}
                      className="py-2 px-3 border border-white/25 hover:border-white/60 text-xs font-mono-tabular text-white/85 transition-colors cursor-pointer"
                    >
                      Reemplazar serie
                    </button>
                  </div>

                  {/* Optional URL or /obras/ path input */}
                  <div className="pt-2 border-t border-white/10 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="O pega ruta /obras/foto.jpg o URL..."
                      className="flex-1 px-2.5 py-1.5 bg-white/8 border border-white/15 text-xs text-white focus:outline-none focus:border-white"
                    />
                    <select
                      value={customImageAspect}
                      onChange={(e) =>
                        setCustomImageAspect(e.target.value as AspectRatioType)
                      }
                      className="px-2 py-1.5 bg-[#1C1C1A] border border-white/15 text-xs font-mono-tabular text-white"
                    >
                      {ASPECT_OPTIONS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddPhotoByUrl}
                      className="px-2.5 py-1.5 bg-white/15 hover:bg-white/25 text-xs font-mono-tabular cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Photo Cards List in Current Series */}
                <div className="space-y-3">
                  <span className="block text-[11px] font-mono-tabular uppercase tracking-[0.14em] text-white/55">
                    Orden del Barajeo (#1 abre al centro, #2 a la derecha, última
                    a la izquierda)
                  </span>

                  {selectedChapter.photos.map((photo, pIdx) => (
                    <div
                      key={photo.id}
                      className="p-3 bg-white/6 border border-white/12 flex gap-3 items-start"
                    >
                      <div className="w-16 h-20 bg-black/40 shrink-0 overflow-hidden border border-white/10">
                        <img
                          src={photo.src}
                          alt={photo.title}
                          onLoad={(e) => {
                            if (!photo.originalAspectRatio) {
                              const nw = e.currentTarget.naturalWidth;
                              const nh = e.currentTarget.naturalHeight;
                              if (nw && nh) {
                                const detected = detectClosestAspectRatio(nw, nh);
                                updatePhotoInSeries(pIdx, {
                                  originalAspectRatio: detected,
                                });
                              }
                            }
                          }}
                          style={{
                            objectPosition:
                              photo.cropPosition || 'center center',
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono-tabular text-[11px] text-white/60">
                            {photo.code}
                            {pIdx === 0
                              ? ' · Centro inicial'
                              : pIdx === 1
                              ? ' · Derecha inicial'
                              : pIdx === selectedChapter.photos.length - 1
                              ? ' · Izquierda inicial'
                              : ''}
                          </span>

                          <div className="flex items-center gap-1 font-mono-tabular text-xs">
                            <button
                              type="button"
                              onClick={() => movePhotoInSeries(pIdx, -1)}
                              disabled={pIdx === 0}
                              className="px-1.5 py-0.5 border border-white/15 hover:border-white/50 disabled:opacity-25 cursor-pointer"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => movePhotoInSeries(pIdx, 1)}
                              disabled={
                                pIdx === selectedChapter.photos.length - 1
                              }
                              className="px-1.5 py-0.5 border border-white/15 hover:border-white/50 disabled:opacity-25 cursor-pointer"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => deletePhotoInSeries(pIdx)}
                              disabled={selectedChapter.photos.length <= 1}
                              className="px-1.5 py-0.5 border border-red-400/30 text-red-300 hover:border-red-400 disabled:opacity-25 cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={photo.title}
                          onChange={(e) =>
                            updatePhotoInSeries(pIdx, { title: e.target.value })
                          }
                          placeholder="Título de la fotografía"
                          className="w-full px-2 py-1 bg-white/8 border border-white/15 text-xs text-white focus:outline-none focus:border-white"
                        />

                        {/* Aspect Ratio & Crop Selector */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                          <div className="flex items-center gap-1 font-mono-tabular">
                            {/* Unified 3:4 / 4:3 Toggle: switches between vertical and horizontal */}
                            <button
                              type="button"
                              title={
                                photo.aspectRatio === '3:4'
                                  ? 'Actualmente 3:4 Vertical. Haz clic para cambiar a 4:3 Horizontal'
                                  : photo.aspectRatio === '4:3'
                                  ? 'Actualmente 4:3 Horizontal. Haz clic para cambiar a 3:4 Vertical'
                                  : 'Cambiar a formato 3:4 / 4:3'
                              }
                              onClick={() => {
                                if (photo.aspectRatio === '3:4') {
                                  updatePhotoInSeries(pIdx, { aspectRatio: '4:3' });
                                } else if (photo.aspectRatio === '4:3') {
                                  updatePhotoInSeries(pIdx, { aspectRatio: '3:4' });
                                } else {
                                  const target =
                                    photo.originalAspectRatio === '4:3' ? '4:3' : '3:4';
                                  updatePhotoInSeries(pIdx, { aspectRatio: target });
                                }
                              }}
                              className={`px-2 py-0.5 text-[10px] border transition-colors cursor-pointer flex items-center gap-1 ${
                                photo.aspectRatio === '3:4' || photo.aspectRatio === '4:3'
                                  ? 'bg-white text-[#111110] border-white font-semibold'
                                  : 'border-white/20 text-white/65 hover:border-white/50'
                              }`}
                            >
                              <span>{photo.aspectRatio === '4:3' ? '4:3 ↔' : '3:4 ↕'}</span>
                              <span className="text-[9px] opacity-75">
                                {photo.aspectRatio === '4:3' ? '(Horiz)' : '(Vert)'}
                              </span>
                            </button>

                            {/* 16:9 */}
                            <button
                              type="button"
                              title="Proporción panorámica 16:9"
                              onClick={() =>
                                updatePhotoInSeries(pIdx, {
                                  aspectRatio: '16:9',
                                })
                              }
                              className={`px-1.5 py-0.5 text-[10px] border transition-colors cursor-pointer ${
                                photo.aspectRatio === '16:9'
                                  ? 'bg-white text-[#111110] border-white font-semibold'
                                  : 'border-white/20 text-white/65 hover:border-white/50'
                              }`}
                            >
                              16:9
                            </button>

                            {/* 1:1 */}
                            <button
                              type="button"
                              title="Proporción cuadrada 1:1"
                              onClick={() =>
                                updatePhotoInSeries(pIdx, {
                                  aspectRatio: '1:1',
                                })
                              }
                              className={`px-1.5 py-0.5 text-[10px] border transition-colors cursor-pointer ${
                                photo.aspectRatio === '1:1'
                                  ? 'bg-white text-[#111110] border-white font-semibold'
                                  : 'border-white/20 text-white/65 hover:border-white/50'
                              }`}
                            >
                              1:1
                            </button>

                            {/* Original Aspect Ratio Button */}
                            {(() => {
                              const origAspect =
                                photo.originalAspectRatio || photo.aspectRatio;
                              const isOriginal = photo.aspectRatio === origAspect;
                              return (
                                <button
                                  type="button"
                                  title={`Restablecer a la proporción original de la imagen (${origAspect})`}
                                  onClick={() =>
                                    updatePhotoInSeries(pIdx, {
                                      aspectRatio: origAspect,
                                    })
                                  }
                                  className={`px-2 py-0.5 text-[10px] border transition-colors cursor-pointer flex items-center gap-1 ${
                                    isOriginal
                                      ? 'border-emerald-400/80 text-emerald-300 bg-emerald-950/40 font-medium'
                                      : 'border-white/20 text-white/70 hover:border-white/50'
                                  }`}
                                >
                                  <span>Orig</span>
                                  <span className="text-[9px] opacity-75">
                                    ({origAspect})
                                  </span>
                                  {isOriginal && (
                                    <span className="text-[9px] text-emerald-400">
                                      ✓
                                    </span>
                                  )}
                                </button>
                              );
                            })()}
                          </div>

                          <select
                            value={photo.cropPosition || 'center center'}
                            onChange={(e) =>
                              updatePhotoInSeries(pIdx, {
                                cropPosition: e.target.value,
                              })
                            }
                            className="px-1.5 py-0.5 bg-[#1C1C1A] border border-white/20 text-[10px] font-mono-tabular text-white/80"
                          >
                            {CROP_OPTIONS.map((c) => (
                              <option key={c.value} value={c.value}>
                                Encuadre: {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'bio' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-[11px] text-white/65">
                  Firma Superior Izquierda
                </span>
                <input
                  type="text"
                  value={cmsState.artistProfile.logoMark}
                  onChange={(e) =>
                    commitProfile({
                      ...cmsState.artistProfile,
                      logoMark: e.target.value,
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-white/8 border border-white/20 text-xs text-white"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-[11px] text-white/65">Ciudad</span>
                <input
                  type="text"
                  value={cmsState.artistProfile.cities}
                  onChange={(e) =>
                    commitProfile({
                      ...cmsState.artistProfile,
                      cities: e.target.value,
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-white/8 border border-white/20 text-xs text-white"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-[11px] text-white/65">
                  Correo (06 Contacto y Bio)
                </span>
                <input
                  type="text"
                  value={cmsState.artistProfile.email}
                  onChange={(e) =>
                    commitProfile({
                      ...cmsState.artistProfile,
                      email: e.target.value,
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-white/8 border border-white/20 text-xs font-mono-tabular text-white"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-[11px] text-white/65">Instagram</span>
                <input
                  type="text"
                  value={cmsState.artistProfile.instagram}
                  onChange={(e) =>
                    commitProfile({
                      ...cmsState.artistProfile,
                      instagram: e.target.value,
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-white/8 border border-white/20 text-xs font-mono-tabular text-white"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-[11px] text-white/65">
                Titular Principal (Acerca de)
              </span>
              <textarea
                rows={3}
                value={cmsState.artistProfile.bioHeadline}
                onChange={(e) =>
                  commitProfile({
                    ...cmsState.artistProfile,
                    bioHeadline: e.target.value,
                  })
                }
                className="w-full px-2.5 py-1.5 bg-white/8 border border-white/20 text-xs text-white leading-relaxed"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[11px] text-white/65">
                Párrafo de Semblanza y Proyectos
              </span>
              <textarea
                rows={5}
                value={cmsState.artistProfile.bioParagraph2}
                onChange={(e) =>
                  commitProfile({
                    ...cmsState.artistProfile,
                    bioParagraph2: e.target.value,
                  })
                }
                className="w-full px-2.5 py-1.5 bg-white/8 border border-white/20 text-xs text-white leading-relaxed"
              />
            </label>

            {/* Parte 2 de Acerca de: Arqueología digital y notas editoriales */}
            <div className="border-t border-white/12 pt-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono-tabular uppercase tracking-[0.16em] text-white/80">
                  Parte 2 · Arqueología Digital y Notas
                </span>

                {/* Switch de visibilidad en web */}
                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono-tabular">
                  <input
                    type="checkbox"
                    checked={cmsState.artistProfile.bioWinkEnabled !== false}
                    onChange={(e) =>
                      commitProfile({
                        ...cmsState.artistProfile,
                        bioWinkEnabled: e.target.checked,
                      })
                    }
                    className="accent-white cursor-pointer"
                  />
                  <span
                    className={
                      cmsState.artistProfile.bioWinkEnabled !== false
                        ? 'text-white'
                        : 'text-white/40'
                    }
                  >
                    {cmsState.artistProfile.bioWinkEnabled !== false
                      ? 'Visible en la web'
                      : 'Oculto'}
                  </span>
                </label>
              </div>

              {cmsState.artistProfile.bioWinkEnabled !== false && (
                <div className="space-y-4">
                  {/* Título de la sección (Parte 2) */}
                  <label className="block space-y-1">
                    <span className="text-[11px] text-white/65">
                      Título de la sección (Parte 2)
                    </span>
                    <input
                      type="text"
                      value={
                        cmsState.artistProfile.bioWinkTitle ??
                        'Lo que internet dice que soy (vs. la realidad)'
                      }
                      onChange={(e) =>
                        commitProfile({
                          ...cmsState.artistProfile,
                          bioWinkTitle: e.target.value,
                        })
                      }
                      placeholder="Lo que internet dice que soy (vs. la realidad)"
                      className="w-full px-2.5 py-1.5 bg-white/8 border border-white/20 text-xs text-white focus:outline-none focus:border-white"
                    />
                  </label>

                  {/* Subtítulo / Bajada descriptiva */}
                  <label className="block space-y-1">
                    <span className="text-[11px] text-white/65">
                      Subtítulo / Bajada descriptiva
                    </span>
                    <textarea
                      rows={2}
                      value={
                        cmsState.artistProfile.bioWinkSubtitle ??
                        'Arqueología digital de buscar «Donaji Ramirez» y «eldonaji» en la red.'
                      }
                      onChange={(e) =>
                        commitProfile({
                          ...cmsState.artistProfile,
                          bioWinkSubtitle: e.target.value,
                        })
                      }
                      placeholder="Arqueología digital de buscar «Donaji Ramirez» y «eldonaji» en la red."
                      className="w-full px-2.5 py-1.5 bg-white/8 border border-white/20 text-xs text-white leading-relaxed focus:outline-none focus:border-white"
                    />
                  </label>

                  {/* Lista de Columnas / Notas */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono-tabular uppercase tracking-[0.14em] text-white/60">
                        Columnas / Notas ({(cmsState.artistProfile.bioWinkItems || []).length})
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          const currentItems =
                            cmsState.artistProfile.bioWinkItems || [];
                          const nextNum = String(currentItems.length + 1).padStart(
                            2,
                            '0'
                          );
                          const newItem = {
                            label: `${nextNum} · Nueva nota`,
                            text: '',
                          };
                          commitProfile({
                            ...cmsState.artistProfile,
                            bioWinkItems: [...currentItems, newItem],
                          });
                        }}
                        className="px-2.5 py-1 bg-[#F6F5F2] text-[#111110] text-xs font-mono-tabular font-medium hover:bg-white transition-colors cursor-pointer"
                      >
                        + Agregar nota
                      </button>
                    </div>

                    {(cmsState.artistProfile.bioWinkItems || []).length === 0 ? (
                      <div className="p-4 bg-white/4 border border-dashed border-white/15 text-center space-y-2">
                        <p className="text-xs text-white/50">
                          No hay notas en esta sección.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            commitProfile({
                              ...cmsState.artistProfile,
                              bioWinkItems: [
                                {
                                  label: '01 · Título de la nota',
                                  text: 'Descripción o anécdota...',
                                },
                              ],
                            });
                          }}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-xs font-mono-tabular cursor-pointer"
                        >
                          + Crear primera nota
                        </button>
                      </div>
                    ) : (
                      (cmsState.artistProfile.bioWinkItems || []).map(
                        (item, wIdx, arr) => (
                          <div
                            key={wIdx}
                            className="p-3 bg-white/5 border border-white/10 space-y-2.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-mono-tabular text-white/50">
                                Columna #{wIdx + 1}
                              </span>

                              <div className="flex items-center gap-1 font-mono-tabular text-xs">
                                {/* Subir */}
                                <button
                                  type="button"
                                  title="Mover nota hacia arriba"
                                  disabled={wIdx === 0}
                                  onClick={() => {
                                    const nextItems = [...arr];
                                    const [moved] = nextItems.splice(wIdx, 1);
                                    nextItems.splice(wIdx - 1, 0, moved);
                                    commitProfile({
                                      ...cmsState.artistProfile,
                                      bioWinkItems: nextItems,
                                    });
                                  }}
                                  className="px-1.5 py-0.5 border border-white/15 hover:border-white/50 disabled:opacity-25 cursor-pointer"
                                >
                                  ↑
                                </button>

                                {/* Bajar */}
                                <button
                                  type="button"
                                  title="Mover nota hacia abajo"
                                  disabled={wIdx === arr.length - 1}
                                  onClick={() => {
                                    const nextItems = [...arr];
                                    const [moved] = nextItems.splice(wIdx, 1);
                                    nextItems.splice(wIdx + 1, 0, moved);
                                    commitProfile({
                                      ...cmsState.artistProfile,
                                      bioWinkItems: nextItems,
                                    });
                                  }}
                                  className="px-1.5 py-0.5 border border-white/15 hover:border-white/50 disabled:opacity-25 cursor-pointer"
                                >
                                  ↓
                                </button>

                                {/* Eliminar */}
                                <button
                                  type="button"
                                  title="Eliminar esta nota"
                                  onClick={() => {
                                    const nextItems = arr.filter(
                                      (_, idx) => idx !== wIdx
                                    );
                                    commitProfile({
                                      ...cmsState.artistProfile,
                                      bioWinkItems: nextItems,
                                    });
                                  }}
                                  className="px-1.5 py-0.5 border border-red-400/30 text-red-300 hover:border-red-400 cursor-pointer"
                                >
                                  ×
                                </button>
                              </div>
                            </div>

                            <label className="block space-y-1">
                              <span className="text-[10px] text-white/50 font-mono-tabular">
                                Encabezado / Etiqueta
                              </span>
                              <input
                                type="text"
                                value={item.label}
                                placeholder="Ej. 01 · Título de la nota"
                                onChange={(e) => {
                                  const nextItems = arr.map((it, idx) =>
                                    idx === wIdx
                                      ? { ...it, label: e.target.value }
                                      : it
                                  );
                                  commitProfile({
                                    ...cmsState.artistProfile,
                                    bioWinkItems: nextItems,
                                  });
                                }}
                                className="w-full px-2 py-1 bg-white/8 border border-white/15 text-xs font-mono-tabular text-white focus:outline-none focus:border-white"
                              />
                            </label>

                            <label className="block space-y-1">
                              <span className="text-[10px] text-white/50 font-mono-tabular">
                                Texto de la nota
                              </span>
                              <textarea
                                rows={3}
                                value={item.text}
                                placeholder="Escribe el texto de esta columna..."
                                onChange={(e) => {
                                  const nextItems = arr.map((it, idx) =>
                                    idx === wIdx
                                      ? { ...it, text: e.target.value }
                                      : it
                                  );
                                  commitProfile({
                                    ...cmsState.artistProfile,
                                    bioWinkItems: nextItems,
                                  });
                                }}
                                className="w-full px-2 py-1 bg-white/8 border border-white/15 text-xs text-white leading-relaxed focus:outline-none focus:border-white"
                              />
                            </label>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'publish' && (
          <div className="space-y-6">
            {/* Quick Tip Banner: Vercel CLI already linked */}
            <div className="p-3 bg-white/6 border border-emerald-400/30 space-y-1.5 font-mono-tabular">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                <span>✓</span>
                <span>Vercel CLI Vinculado en tu Computadora</span>
              </div>
              <p className="text-[11px] text-white/70 font-sans leading-relaxed">
                No necesitas cuenta ni token de GitHub para desplegar. Desde tu terminal local sólo ejecuta <code>vercel --prod</code> para subir cambios directamente a producción.
              </p>
            </div>

            {/* Section 1: Snapshots while curating */}
            <div className="p-4 bg-white/5 border border-white/15 space-y-3">
              <span className="block text-[11px] font-mono-tabular uppercase tracking-[0.16em] text-white/75">
                A. Guardar / Comparar Selecciones (Borradores)
              </span>
              <p className="text-xs text-white/60 leading-relaxed">
                Todo lo que mueves se guarda automáticamente en este navegador
                (IndexedDB). También puedes descargar un archivo de respaldo con
                tus fotos incluidas para probar distintas curadurías.
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExportFullDraftJson}
                  className="px-3 py-2 bg-white/15 hover:bg-white/25 text-xs font-mono-tabular cursor-pointer"
                >
                  ↓ Guardar borrador (.json)
                </button>

                <input
                  ref={snapshotImportRef}
                  type="file"
                  accept="application/json"
                  onChange={(e) => {
                    handleImportDraftJson(e.target.files);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => snapshotImportRef.current?.click()}
                  className="px-3 py-2 border border-white/25 hover:border-white/60 text-xs font-mono-tabular cursor-pointer"
                >
                  ↑ Cargar borrador (.json)
                </button>
              </div>
            </div>

            {/* Section 2: 1-Click Direct Publish to Vercel */}
            <div className="p-4 bg-white/6 border border-emerald-400/40 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-tabular uppercase tracking-[0.16em] text-emerald-300 font-bold flex items-center gap-1.5">
                  <span>🚀</span> Publicar en Vivo a Vercel
                </span>
                <span className="text-[10px] font-mono-tabular text-emerald-300 bg-emerald-950/60 border border-emerald-400/40 px-2 py-0.5">
                  Conectado · dondonaji/porfolio-2026
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-sans">
                Guarda automáticamente todas tus fotos nuevas y cambios editoriales directamente en tu sitio público en vivo sin tocar código ni abrir terminales.
              </p>

              <button
                type="button"
                disabled={isPublishing}
                onClick={handlePublishToGitHub}
                className="w-full py-3 bg-[#F6F5F2] text-[#111110] text-xs font-mono-tabular font-bold hover:bg-white disabled:opacity-50 cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isPublishing ? (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Publicando y actualizando Vercel en vivo...</span>
                  </>
                ) : (
                  <>
                    <span>⚡ Publicar cambios a Vercel ahora (1 Clic)</span>
                  </>
                )}
              </button>

              {publishStatus && (
                <div className="p-2.5 bg-emerald-950/50 border border-emerald-400/40 text-emerald-300 text-xs font-mono-tabular leading-relaxed">
                  ✓ {publishStatus}
                </div>
              )}
              {publishError && (
                <div className="p-2.5 bg-red-950/50 border border-red-400/40 text-red-300 text-xs font-mono-tabular leading-relaxed">
                  ✕ {publishError}
                </div>
              )}

              {/* Advanced folded settings */}
              <details className="pt-1 text-[11px] font-mono-tabular text-white/50 cursor-pointer">
                <summary className="hover:text-white/80 transition-colors">
                  ⚙ Configuración de conexión (ya configurada)
                </summary>
                <div className="space-y-2 pt-2.5">
                  <input
                    type="text"
                    value={ghConfig.repo}
                    onChange={(e) =>
                      setGhConfig({ ...ghConfig, repo: e.target.value })
                    }
                    placeholder="Repositorio (ej. dondonaji/porfolio-2026)"
                    className="w-full px-3 py-1.5 bg-white/8 border border-white/20 text-xs font-mono-tabular text-white"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={ghConfig.branch}
                      onChange={(e) =>
                        setGhConfig({ ...ghConfig, branch: e.target.value })
                      }
                      placeholder="Rama (main)"
                      className="col-span-1 px-3 py-1.5 bg-white/8 border border-white/20 text-xs font-mono-tabular text-white"
                    />
                    <input
                      type="password"
                      value={ghConfig.token}
                      onChange={(e) =>
                        setGhConfig({ ...ghConfig, token: e.target.value })
                      }
                      placeholder="Token de GitHub"
                      className="col-span-2 px-3 py-1.5 bg-white/8 border border-white/20 text-xs font-mono-tabular text-white"
                    />
                  </div>
                </div>
              </details>
            </div>

            {/* Section 3: Manual File Export for Repo */}
            <div className="p-4 bg-white/5 border border-white/15 space-y-3">
              <span className="block text-[11px] font-mono-tabular uppercase tracking-[0.16em] text-white/75">
                C. Exportar archivos para tu carpeta local
              </span>
              <p className="text-xs text-white/60 leading-relaxed">
                Si prefieres subir por tu cuenta a Git/Vercel: descarga{' '}
                <code>portfolio.json</code> (colócalo en <code>public/</code>) o{' '}
                <code>portfolioData.ts</code> (en <code>src/data/</code>).
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    triggerFileDownload(
                      'portfolio.json',
                      JSON.stringify(productionState, null, 2)
                    )
                  }
                  className="px-3 py-2 bg-white text-[#111110] text-xs font-mono-tabular font-medium cursor-pointer"
                >
                  ↓ Descargar portfolio.json
                </button>

                <button
                  type="button"
                  onClick={() =>
                    triggerFileDownload(
                      'portfolioData.ts',
                      generatePortfolioDataTsCode(cmsState),
                      'text/typescript'
                    )
                  }
                  className="px-3 py-2 border border-white/25 hover:border-white/60 text-xs font-mono-tabular cursor-pointer"
                >
                  ↓ Descargar portfolioData.ts
                </button>
              </div>

              {requiredStaticFiles.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <span className="block text-[11px] font-mono-tabular text-amber-300">
                    Fotos nuevas para colocar en <code>public/obras/</code> (
                    {requiredStaticFiles.length}):
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {requiredStaticFiles.map((f) => (
                      <div
                        key={f.filename}
                        className="flex items-center justify-between text-[11px] font-mono-tabular bg-black/30 px-2.5 py-1"
                      >
                        <span className="truncate">/obras/{f.filename}</span>
                        <button
                          type="button"
                          onClick={() =>
                            triggerDataUrlDownload(f.filename, f.dataUrl)
                          }
                          className="text-white/80 underline hover:text-white cursor-pointer ml-2 shrink-0"
                        >
                          Descargar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reset local draft */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="text-[11px] font-mono-tabular text-white/45 hover:text-red-300 cursor-pointer"
                >
                  Restaurar datos originales de fábrica...
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-red-300">
                    ¿Borrar borrador local?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmReset(false);
                      onResetToDefaults();
                    }}
                    className="px-2.5 py-1 bg-red-500/20 border border-red-400 text-[11px] font-mono-tabular text-red-200 cursor-pointer"
                  >
                    Sí, restaurar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="text-[11px] text-white/60 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
