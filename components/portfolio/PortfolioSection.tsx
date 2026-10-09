'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ProjectCard } from './ProjectCard';
import { PortfolioFilterTabs } from './PortfolioFilterTabs';
import {
  PortfolioStateProvider,
  PortfolioFrame,
  PortfolioHeader,
  PortfolioGrid,
  PortfolioWordmark,
} from './PortfolioCompound';

import type { PortfolioProject } from '@/types/portfolio';

const ProjectDetailModal = dynamic(
  () => import('./ProjectDetailModal').then((m) => m.ProjectDetailModal),
  { ssr: false }
);

const renderProjectCard = (project: PortfolioProject) => <ProjectCard project={project} />;

/**
 * Showcases featured web development and engineering projects with
 * interactive category filters, glassmorphic cards, and detailed inspectors.
 */
export const PortfolioSection: React.FC = () => (
  <PortfolioStateProvider>
    <PortfolioFrame>
      <PortfolioHeader>
        <PortfolioFilterTabs />
      </PortfolioHeader>

      <PortfolioGrid renderItem={renderProjectCard} />

      <PortfolioWordmark />
    </PortfolioFrame>

    <ProjectDetailModal />
  </PortfolioStateProvider>
);
