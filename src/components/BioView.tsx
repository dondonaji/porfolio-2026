import React from 'react';
import { ArtistProfileData } from '../utils/cmsStorage';

interface BioViewProps {
  profile: ArtistProfileData;
}

/**
 * Expanded "Acerca de" editorial page with artist statement,
 * documented audiovisual works, and digital archaeology notes.
 */
export const BioView: React.FC<BioViewProps> = ({ profile }) => {
  return (
    <section className="relative z-40 w-full h-full bg-[#F6F5F2] text-[#111110] px-6 sm:px-14 pt-28 pb-16 overflow-y-auto">
      <div className="max-w-6xl mx-auto min-h-full flex flex-col justify-between gap-16">
        {/* Upper Editorial Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
          <div className="lg:col-span-4 space-y-2 font-mono-tabular text-xs text-[#787670]">
            <p className="uppercase tracking-[0.22em] text-[#111110]">
              Sobre mí
            </p>
            <p>Fotografía e Imagen en Movimiento</p>
            <p>{profile.cities}</p>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <h1 className="font-sans font-medium text-2xl sm:text-4xl lg:text-[42px] leading-[1.18] tracking-tight text-[#111110]">
              {profile.bioHeadline}
            </h1>

            <p className="font-sans font-light text-base sm:text-lg leading-relaxed text-[#4A4945] max-w-2xl">
              {profile.bioParagraph2}
            </p>
          </div>
        </div>

        {/* Middle Witty "Lo que internet dice que soy (vs. la realidad)" */}
        {profile.bioWinkEnabled !== false &&
          profile.bioWinkItems &&
          profile.bioWinkItems.length > 0 && (
            <div className="border-t border-[#E2E0D8] pt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4 space-y-2">
                <p className="font-mono-tabular text-[11px] uppercase tracking-[0.2em] text-[#787670]">
                  {profile.bioWinkTitle ||
                    'Lo que internet dice que soy (vs. la realidad)'}
                </p>
                {profile.bioWinkSubtitle && (
                  <p className="font-sans font-light text-xs text-[#8C8A84] max-w-xs leading-relaxed">
                    {profile.bioWinkSubtitle}
                  </p>
                )}
              </div>

              <div
                className={`lg:col-span-8 grid grid-cols-1 ${
                  profile.bioWinkItems.length === 1
                    ? 'sm:grid-cols-1'
                    : profile.bioWinkItems.length === 2
                    ? 'sm:grid-cols-2'
                    : profile.bioWinkItems.length === 4
                    ? 'sm:grid-cols-2 lg:grid-cols-4'
                    : 'sm:grid-cols-3'
                } gap-8`}
              >
                {profile.bioWinkItems.map((item, idx) => (
                  <div key={`${item.label}-${idx}`} className="space-y-2.5">
                    <span className="block font-mono-tabular text-[11px] uppercase tracking-[0.16em] text-[#111110]">
                      {item.label}
                    </span>
                    <p className="font-sans font-light text-xs sm:text-[13px] leading-relaxed text-[#5A5852]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Bottom Contact Bar inside Acerca de */}
        <div className="border-t border-[#E2E0D8] pt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono-tabular text-[#6E6C66]">
          <div className="flex items-center gap-4">
            <a
              href={`mailto:${profile.email}`}
              className="text-[#111110] underline underline-offset-4 hover:opacity-60 transition-opacity"
            >
              {profile.email}
            </a>
            <span>·</span>
            <span>{profile.instagram}</span>
          </div>

          <span>{profile.cities}</span>
        </div>
      </div>
    </section>
  );
};
