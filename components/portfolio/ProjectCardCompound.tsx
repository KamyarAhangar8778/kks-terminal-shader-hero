'use client';

import React, { createContext, use, useMemo } from 'react';
import { Globe, ArrowUpRight, Info, ExternalLink, Code2 } from 'lucide-react';
import { IconBrandGithub } from '@tabler/icons-react';
import { SlideUpHeading } from '@/components/motion/SlideUpHeading';
import { ViewTransition } from '@/components/view-transitions/ViewTransition';
import { getCategoryPersianLabel } from './category-utils';
import { useOptionalPortfolioContext } from './PortfolioCompound';
import type { PortfolioProject } from '@/types/portfolio';
import { PORTFOLIO_FLAGS } from '@/lib/portfolio-data';

export interface ProjectCardState {
  project: PortfolioProject;
  isDeployed: boolean;
  isRepository: boolean;
  isInspected: boolean;
}

export interface ProjectCardActions {
  inspect?: (project: PortfolioProject) => void;
}

export interface ProjectCardMeta {
  titleId: string;
  linkId: string;
}

export interface ProjectCardContextValue {
  state: ProjectCardState;
  actions: ProjectCardActions;
  meta: ProjectCardMeta;
}

const ProjectCardContext = createContext<ProjectCardContextValue | null>(null);

export function useProjectCardContext(): ProjectCardContextValue {
  const context = use(ProjectCardContext);
  if (!context) {
    throw new Error('ProjectCard subcomponents must be rendered within a ProjectCard.Frame');
  }
  return context;
}

/**
 * ProjectCard chassis container with optical glassmorphism.
 * Inherits `inspectProject` from `<Portfolio.Provider>` when `onInspect` is omitted.
 */
export function ProjectCardFrame({
  project,
  onInspect,
  children,
  className,
}: {
  project: PortfolioProject;
  onInspect?: (project: PortfolioProject) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const portfolioContext = useOptionalPortfolioContext();
  const resolvedInspect = onInspect ?? portfolioContext?.actions.inspectProject;
  const isInspected = portfolioContext?.state.selectedProject?.id === project.id;

  const contextValue = useMemo<ProjectCardContextValue>(() => {
    const isRepository = project.url.includes('github.com');
    const isDeployed = Boolean(
      PORTFOLIO_FLAGS.SHOW_ONLINE_BADGE_FOR_DEPLOYED && project.isDeployed
    );
    return {
      state: {
        project,
        isDeployed,
        isRepository,
        isInspected,
      },
      actions: {
        inspect: resolvedInspect,
      },
      meta: {
        titleId: `project-title-${project.id}`,
        linkId: `project-link-${project.id}`,
      },
    };
  }, [project, resolvedInspect, isInspected]);

  return (
    <ProjectCardContext value={contextValue}>
      <ViewTransition
        key={isInspected ? 'inspected' : 'card'}
        name={isInspected ? undefined : `project-container-${project.id}`}
        share="morph"
        default="none"
      >
        <article
          className={
            className ||
            'group/card relative rounded-2xl bg-gradient-to-b from-zinc-900/85 via-zinc-950/92 to-black/95 border border-white/[0.1] hover:border-emerald-500/45 border-t-white/30 hover:border-t-emerald-400/75 p-5 sm:p-6 backdrop-blur-md md:backdrop-blur-xl h-full flex flex-col justify-between shadow-[0_16px_40px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.14)] hover:shadow-[0_22px_52px_rgba(0,0,0,0.88),0_0_28px_rgba(16,185,129,0.16),inset_0_1px_0_0_rgba(110,231,183,0.35)] hover:-translate-y-1 transition-[transform,border-color,box-shadow] duration-300 ease-out [contain:paint_layout] transform-gpu [backface-visibility:hidden] [transform:translateZ(0)]'
          }
          aria-labelledby={contextValue.meta.titleId}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(380px_circle_at_50%_0%,rgba(16,185,129,0.11),transparent_70%)] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
          />
          {children}
        </article>
      </ViewTransition>
    </ProjectCardContext>
  );
}

export function ProjectCardOnlineBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)] select-none whitespace-nowrap"
      title="سایت آنلاین و در دسترس"
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
      </span>
      <span>آنلاین</span>
    </span>
  );
}

export function ProjectCardSourceBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-zinc-400 bg-zinc-900/60 border border-white/[0.08] select-none whitespace-nowrap">
      <IconBrandGithub className="w-3 h-3 text-zinc-400" />
      <span>سورس‌کد</span>
    </span>
  );
}

export function ProjectCardInspectButton() {
  const {
    state: { project },
    actions: { inspect },
  } = useProjectCardContext();

  if (!inspect) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        inspect(project);
      }}
      aria-label={`مشاهده جزئیات ${project.title}`}
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] text-zinc-400 hover:text-emerald-300 bg-zinc-900/50 hover:bg-zinc-800/80 border border-white/[0.08] hover:border-emerald-500/30 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black"
    >
      <Info className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden="true" />
      <span>جزئیات</span>
    </button>
  );
}

export function ProjectCardCornerBrackets() {
  return (
    <>
      <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-white/20 group-hover/card:border-emerald-400/80 transition-colors duration-300 pointer-events-none rounded-tl-sm" />
      <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-white/20 group-hover/card:border-emerald-400/80 transition-colors duration-300 pointer-events-none rounded-tr-sm" />
      <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-white/20 group-hover/card:border-emerald-400/80 transition-colors duration-300 pointer-events-none rounded-bl-sm" />
      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-white/20 group-hover/card:border-emerald-400/80 transition-colors duration-300 pointer-events-none rounded-br-sm" />
    </>
  );
}

export function ProjectCardHeader({ badge }: { badge?: React.ReactNode } = {}) {
  const {
    state: { project, isDeployed, isRepository },
  } = useProjectCardContext();

  return (
    <header className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3 text-xs font-sans">
      <div className="flex items-center gap-2" dir="rtl">
        <div className="w-6 h-6 rounded-md bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
          {isRepository ? (
            <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </div>
        <span className="text-zinc-300 group-hover/card:text-zinc-100 font-medium text-xs transition-colors duration-200 whitespace-nowrap">
          {getCategoryPersianLabel(project.category)}
        </span>
      </div>

      <div className="flex items-center gap-2" dir="rtl">
        {badge ?? (isDeployed ? <ProjectCardOnlineBadge /> : <ProjectCardSourceBadge />)}
        <ProjectCardInspectButton />
      </div>
    </header>
  );
}

export function ProjectCardHeading() {
  const {
    state: { project, isInspected },
  } = useProjectCardContext();

  return (
    <div className="flex flex-col gap-1 overflow-hidden mb-2.5" dir="rtl">
      <ViewTransition
        key={isInspected ? 'inspected' : 'card'}
        name={isInspected ? undefined : `project-title-${project.id}`}
        share="text-morph"
        default="none"
      >
        <SlideUpHeading
          as="h3"
          id={`project-title-${project.id}`}
          text={project.title}
          className="text-base sm:text-lg font-bold text-zinc-50 group-hover/card:text-white font-sans whitespace-nowrap overflow-hidden text-ellipsis leading-snug transition-colors"
          delay={0.12}
          link={{
            id: undefined,
            href: project.url,
            target: '_blank',
            rel: 'noopener noreferrer',
            className:
              'hover:text-emerald-300 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black block truncate',
          }}
        />
      </ViewTransition>
      <a
        id={`project-link-${project.id}`}
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        data-interactive="true"
        aria-label={`مشاهده ${project.title} در تب جدید (${project.domainText})`}
        className="group/link inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-emerald-300 font-mono self-start transition-colors duration-200 whitespace-nowrap"
        dir="ltr"
      >
        <span>{project.domainText}</span>
        <ArrowUpRight
          className="w-3 h-3 text-zinc-500 group-hover/link:text-emerald-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 shrink-0 transition-transform duration-200"
          aria-hidden="true"
        />
      </a>
    </div>
  );
}

export function ProjectCardDescription() {
  const {
    state: { project },
  } = useProjectCardContext();

  return (
    <p
      className="text-xs sm:text-sm text-zinc-400 group-hover/card:text-zinc-300 leading-relaxed font-sans text-right transition-colors duration-200 mb-4"
      dir="rtl"
    >
      {project.description}
    </p>
  );
}

export function ProjectCardTagList() {
  const {
    state: { project },
  } = useProjectCardContext();

  return (
    <div className="pt-3 mt-auto border-t border-white/[0.08] flex items-center justify-between gap-3">
      <ul
        className="flex flex-wrap gap-1.5 font-mono list-none p-0 m-0"
        aria-label="تکنولوژی‌های به کار رفته"
      >
        {project.tags.slice(0, 4).map((tag) => (
          <li key={tag}>
            <span className="inline-block text-[11px] font-mono text-zinc-400 group-hover/card:text-zinc-300 bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 rounded-md whitespace-nowrap transition-colors duration-200">
              {tag}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-sans font-medium transition-colors shrink-0 cursor-pointer"
        dir="rtl"
      >
        <span>{project.url.includes('github.com') ? 'سورس‌کد' : 'مشاهده وب‌سایت'}</span>
        <ExternalLink className="w-3 h-3 text-emerald-400" />
      </a>
    </div>
  );
}
