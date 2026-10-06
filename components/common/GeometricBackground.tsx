'use client';

import React from 'react';

export type GeometricVariant = 'portfolio' | 'github' | 'contact' | 'blueprint';

interface GeometricBackgroundProps {
  /** Variant of the background grid */
  variant?: GeometricVariant;
  /** Optional extra CSS classes */
  className?: string;
}

/**
 * GeometricBackground Component
 *
 * Renders an ultra-subtle, minimal cybernetic background grid.
 * Zero-overhead static SVG layer to preserve 60/120 FPS scrolling performance.
 *
 * @param {GeometricBackgroundProps} props - Component properties.
 * @returns {React.ReactElement} The minimal background grid layer.
 */
export const GeometricBackground: React.FC<GeometricBackgroundProps> = ({
  variant = 'portfolio',
  className = '',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
    >
      <div className="absolute inset-0 w-full h-full opacity-45 transform-gpu [mask-image:radial-gradient(ellipse_85%_75%_at_50%_50%,black_30%,transparent_90%)]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id={`minimal-grid-${variant}`}
              width={variant === 'github' ? '56' : variant === 'contact' ? '64' : '48'}
              height={variant === 'github' ? '56' : variant === 'contact' ? '64' : '48'}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={
                  variant === 'contact'
                    ? 'M 64 0 L 0 0 0 64'
                    : variant === 'github'
                      ? 'M 56 0 L 0 0 0 56'
                      : 'M 48 0 L 0 0 0 48'
                }
                fill="none"
                stroke="#1e293b"
                strokeWidth="0.6"
              />
              <circle cx="0" cy="0" r="1" fill="#34d399" fillOpacity="0.35" />
            </pattern>
            <pattern
              id={`major-crosshair-${variant}`}
              width={variant === 'contact' ? '256' : '192'}
              height={variant === 'contact' ? '256' : '192'}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={variant === 'contact' ? 'M 256 0 L 0 0 0 256' : 'M 192 0 L 0 0 0 192'}
                fill="none"
                stroke="#334155"
                strokeWidth="0.85"
                strokeOpacity="0.55"
              />
              <path
                d="M -4 0 L 4 0 M 0 -4 L 0 4"
                stroke="#34d399"
                strokeWidth="1"
                strokeOpacity="0.45"
              />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill={`url(#minimal-grid-${variant})`} />
          <rect width="100%" height="100%" fill={`url(#major-crosshair-${variant})`} />
        </svg>
      </div>
    </div>
  );
};
