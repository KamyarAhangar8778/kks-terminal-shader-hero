'use client';

import React, { useEffect, useCallback } from 'react';
import { ViewTransition } from '@/components/view-transitions/ViewTransition';
import { ExternalLink, X, Cpu, CheckCircle2, Layers } from 'lucide-react';
import { IconBrandGithub } from '@tabler/icons-react';
import { getCategoryPersianLabel } from './category-utils';
import { useOptionalPortfolioContext } from './PortfolioCompound';
import type { PortfolioProject } from '@/types/portfolio';

const NOOP = () => {};

const MODAL_CORNER_BRACKETS = (
  <>
    <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-400 pointer-events-none rounded-tl-sm" />
    <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-400 pointer-events-none rounded-tr-sm" />
    <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-400 pointer-events-none rounded-bl-sm" />
    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-400 pointer-events-none rounded-br-sm" />
  </>
);

interface ProjectDetailModalProps {
  project?: PortfolioProject | null;
  onClose?: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project: propProject,
  onClose: propOnClose,
}) => {
  const portfolioContext = useOptionalPortfolioContext();
  const project =
    propProject !== undefined ? propProject : (portfolioContext?.state.selectedProject ?? null);
  const onClose = propOnClose ?? portfolioContext?.actions.closeModal ?? NOOP;
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!project) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, handleKeyDown]);

  if (!project) return null;

  return (
    <ViewTransition enter="fade-in" exit="fade-out" default="none">
      <dialog
        open
        aria-modal="true"
        aria-labelledby={`modal-title-${project.id}`}
        className="fixed inset-0 z-[100] m-0 h-full w-full max-w-none max-h-none border-0 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="بستن پنجره جزئیات"
          onClick={onClose}
          className="fixed inset-0 w-full h-full bg-transparent border-0 cursor-default"
        />
        <ViewTransition
          name={`project-container-${project.id}`}
          share="morph"
          enter="scale-in"
          exit="scale-out"
          default="none"
        >
          <div
            className="relative z-10 w-full max-w-2xl rounded-2xl bg-gradient-to-b from-zinc-900/95 via-zinc-950/98 to-black border border-white/[0.14] border-t-emerald-400/80 p-5 sm:p-7 text-zinc-300 font-sans shadow-[0_24px_64px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.18)] backdrop-blur-2xl flex flex-col gap-4.5 transform-gpu"
            dir="rtl"
          >
            {MODAL_CORNER_BRACKETS}

            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[11px] font-sans">
                  {getCategoryPersianLabel(project.category)}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="بستن پنجره جزئیات"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 border border-white/[0.1] text-zinc-300 hover:text-white text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                <span>بستن</span>
              </button>
            </div>

            <div className="flex flex-col gap-1 text-right">
              <ViewTransition
                name={`project-title-${project.id}`}
                share="text-morph"
                default="none"
              >
                <h2
                  id={`modal-title-${project.id}`}
                  className="text-lg sm:text-xl font-bold text-zinc-50 font-sans tracking-tight leading-snug"
                >
                  {project.title}
                </h2>
              </ViewTransition>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-400 hover:text-emerald-300 font-mono self-start"
                dir="ltr"
              >
                {project.domainText}
              </a>
            </div>

            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans text-right">
              {project.description}
            </p>

            {project.highlights && project.highlights.length > 0 ? (
              <div className="flex flex-col gap-2.5 bg-zinc-950/60 border border-white/[0.08] rounded-xl p-3.5 sm:p-4 text-right">
                <div className="flex items-center gap-1.5 text-xs text-zinc-200 font-bold">
                  <Cpu className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <span>ویژگی‌های کلیدی و معماری پروژه:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-400 font-sans pr-2">
                  {project.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5 text-right">
              <div className="flex items-center gap-1 text-xs text-zinc-400 font-sans">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>فناوری‌های به‌کاررفته:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-md bg-zinc-900 border border-white/[0.08] text-zinc-300 font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-sans">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>
                  {project.isDeployed
                    ? 'وضعیت: آنلاین و در دسترس'
                    : 'وضعیت: سورس‌کد آزاد در گیت‌هاب'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors shadow-[0_0_16px_rgba(16,185,129,0.25)] flex-1 sm:flex-none cursor-pointer"
                >
                  {project.url.includes('github.com') ? (
                    <>
                      <IconBrandGithub className="w-4 h-4" />
                      <span>مشاهده ریپازیتوری در گیت‌هاب</span>
                    </>
                  ) : (
                    <>
                      <span>مشاهده زنده وب‌سایت</span>
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </a>
              </div>
            </div>
          </div>
        </ViewTransition>
      </dialog>
    </ViewTransition>
  );
};
