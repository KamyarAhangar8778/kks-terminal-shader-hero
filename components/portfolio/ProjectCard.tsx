'use client';

import React from 'react';
import {
  ProjectCardFrame,
  ProjectCardCornerBrackets,
  ProjectCardHeader,
  ProjectCardHeading,
  ProjectCardDescription,
  ProjectCardTagList,
  ProjectCardOnlineBadge,
  ProjectCardSourceBadge,
} from './ProjectCardCompound';
import type { PortfolioProject } from '@/types/portfolio';

export interface ProjectCardProps {
  project: PortfolioProject;
  onInspect?: (project: PortfolioProject) => void;
  isInspected?: boolean;
}

const ONLINE_BADGE_ELEMENT = <ProjectCardOnlineBadge />;
const SOURCE_BADGE_ELEMENT = <ProjectCardSourceBadge />;
const CORNER_BRACKETS_ELEMENT = <ProjectCardCornerBrackets />;
const CARD_BODY_ELEMENT = (
  <div className="flex flex-col gap-3 flex-1">
    <ProjectCardHeading />
    <ProjectCardDescription />
    <ProjectCardTagList />
  </div>
);

export const DeployedProjectCard: React.FC<ProjectCardProps> = React.memo(
  function DeployedProjectCard({ project, onInspect }) {
    return (
      <ProjectCardFrame project={project} onInspect={onInspect}>
        {CORNER_BRACKETS_ELEMENT}
        <ProjectCardHeader badge={ONLINE_BADGE_ELEMENT} />
        {CARD_BODY_ELEMENT}
      </ProjectCardFrame>
    );
  }
);

export const SourceProjectCard: React.FC<ProjectCardProps> = React.memo(function SourceProjectCard({
  project,
  onInspect,
}) {
  return (
    <ProjectCardFrame project={project} onInspect={onInspect}>
      {CORNER_BRACKETS_ELEMENT}
      <ProjectCardHeader badge={SOURCE_BADGE_ELEMENT} />
      {CARD_BODY_ELEMENT}
    </ProjectCardFrame>
  );
});

export const ProjectCard: React.FC<ProjectCardProps> = React.memo(function ProjectCard({
  project,
  onInspect,
  isInspected,
}: ProjectCardProps) {
  return project.isDeployed ? (
    <DeployedProjectCard project={project} onInspect={onInspect} isInspected={isInspected} />
  ) : (
    <SourceProjectCard project={project} onInspect={onInspect} isInspected={isInspected} />
  );
});
