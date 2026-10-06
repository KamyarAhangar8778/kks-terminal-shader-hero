'use client';

import React, { useMemo } from 'react';
import { LazyMotion, domAnimation, m, type Variants } from 'motion/react';
import { useReducedMotionPreference } from '@/hooks/use-motion-preference';
import { textRevealContainerVariants, textRevealWordVariants } from '@/lib/motion-tokens';
import { PORTFOLIO_FLAGS } from '@/lib/portfolio-data';

interface SlideUpHeadingLinkProps {
  href: string;
  target?: string;
  rel?: string;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

export interface SlideUpHeadingProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  id?: string;
  className?: string;
  staggerDelay?: number;
  delay?: number;
  viewportMargin?: string;
  once?: boolean;
  amount?: number | 'some' | 'all';
  link?: SlideUpHeadingLinkProps;
}

const REDUCED_MOTION_WORD_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

/**
 * SlideUpHeading Component
 *
 * Renders a semantic heading whose words slide up from an overflow mask in a staggered
 * sequence when scrolled into the viewport. Uses Motion's native `whileInView` with `once: true`
 * and `React.memo` so it renders strictly once without triggering React state re-renders on scroll.
 */
export const SlideUpHeading: React.FC<SlideUpHeadingProps> = React.memo(function SlideUpHeading({
  text,
  as: Component = 'h2',
  id,
  className = '',
  staggerDelay = 0.068,
  delay = 0.075,
  viewportMargin = PORTFOLIO_FLAGS.TEXT_REVEAL_MARGIN,
  once = PORTFOLIO_FLAGS.TEXT_REVEAL_ONCE,
  amount = PORTFOLIO_FLAGS.TEXT_REVEAL_AMOUNT,
  link,
}) {
  const prefersReducedMotion = useReducedMotionPreference();

  const wordEntries = useMemo(() => {
    const rawWords = text.trim().split(/\s+/);
    const counts = new Map<string, number>();
    return rawWords.map((word, idx) => {
      const occurrence = (counts.get(word) ?? 0) + 1;
      counts.set(word, occurrence);
      return {
        id: `${word}-${occurrence}`,
        word,
        isLast: idx === rawWords.length - 1,
      };
    });
  }, [text]);

  const wordVariants = prefersReducedMotion
    ? REDUCED_MOTION_WORD_VARIANTS
    : textRevealWordVariants;

  const customTiming = useMemo(() => ({ staggerDelay, delay }), [staggerDelay, delay]);
  const viewportConfig = useMemo(
    () => ({
      once,
      amount,
      margin: viewportMargin,
    }),
    [once, amount, viewportMargin]
  );

  const innerContent = (
    <m.span
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      variants={textRevealContainerVariants}
      custom={customTiming}
      className="inline-block"
    >
      {wordEntries.map((entry) => (
        <React.Fragment key={entry.id}>
          <span className="inline-block overflow-hidden align-top py-0.5">
            <m.span variants={wordVariants} className="inline-block">
              {entry.word}
            </m.span>
          </span>
          {entry.isLast ? null : ' '}
        </React.Fragment>
      ))}
    </m.span>
  );

  return (
    <LazyMotion features={domAnimation}>
      <Component id={id} className={className}>
        {link ? (
          <a
            id={link.id}
            href={link.href}
            target={link.target}
            rel={link.rel}
            aria-label={link.ariaLabel}
            data-interactive="true"
            className={link.className}
          >
            {innerContent}
          </a>
        ) : (
          innerContent
        )}
      </Component>
    </LazyMotion>
  );
});
