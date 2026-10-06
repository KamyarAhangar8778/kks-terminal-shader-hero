/**
 * Types and interfaces for the Portfolio / Works module.
 */

/**
 * Valid portfolio category identifiers.
 */
export type PortfolioCategoryId = 'ALL' | 'WEB_DEPLOYMENT' | 'WEB_APPLICATION';

/**
 * Alias for category filtering tabs.
 */
export type PortfolioCategoryFilter = PortfolioCategoryId;

/**
 * Represents a single showcased project in the portfolio.
 */
export interface PortfolioProject {
  /** Unique project identifier */
  id: string;
  /** Primary title of the project (Persian or English) */
  title: string;
  /** Subtitle or display category label */
  category: string;
  /** Categories this project belongs to (supports multi-category membership) */
  categories: PortfolioCategoryId[];
  /** Description of the project */
  description: string;
  /** Live URL address */
  url: string;
  /** Display domain text */
  domainText: string;
  /** Technology stack tags */
  tags: string[];
  /** Status indicator (e.g. LIVE, SOURCE, STAGING, ARCHIVED) */
  status: 'LIVE' | 'SOURCE' | 'STAGING' | 'ARCHIVED';
  /** Release / Deploy year or code */
  version: string;
  /** Key features / highlights */
  highlights?: string[];
  /** Whether the project is actively deployed and reachable online as a web app/site */
  isDeployed?: boolean;
}
