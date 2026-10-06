'use client';

import { useEffect, RefObject } from 'react';
import { isTouchDevice, checkClickable, checkHoveringText } from './utils/cursor-detection';

export interface CursorElementsRef {
  cursorRef: RefObject<HTMLDivElement | null>;
  innerRef: RefObject<HTMLDivElement | null>;
}

/**
 * Attaches a high-precision 60/120+ FPS kinematic LERP animation loop for the custom cursor.
 * Provides butter-smooth fluid trailing and organic velocity tilt without React state lag.
 *
 * @param {CursorElementsRef} refs - Direct DOM references to cursor container and inner 3D shell.
 */
export function useHardwareCursorListeners({ cursorRef, innerRef }: CursorElementsRef) {
  useEffect(() => {
    if (isTouchDevice()) return;

    let isVisible = false;
    let isMouseDown = false;
    let isClickable = false;
    let isHoveringText = false;
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout | null = null;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let rafId: number | null = null;
    let isLoopRunning = false;

    const LERP_FACTOR = 0.28; // Fluid, responsive kinematic interpolation

    const updateInnerTransform = (velX = 0) => {
      const inner = innerRef.current;
      if (!inner) return;

      const rotX = isMouseDown ? 25 : 0;
      const rotY = isMouseDown ? -25 : 0;
      const dynamicTilt = Math.max(-14, Math.min(14, velX * 0.35));
      const rotZ = isHoveringText ? 15 : isClickable ? -5 : dynamicTilt;
      const scale = isClickable ? (isMouseDown ? 1.05 : 1.15) : isMouseDown ? 0.92 : 1;

      inner.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`;
    };

    const animate = () => {
      const dx = targetX - currentX;
      const dy = targetY - currentY;

      // Smooth kinematic interpolation
      currentX += dx * LERP_FACTOR;
      currentY += dy * LERP_FACTOR;

      const cursor = cursorRef.current;
      if (cursor) {
        cursor.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      }

      // Apply subtle dynamic velocity tilt during motion
      if (!isMouseDown && !isClickable && !isHoveringText) {
        updateInnerTransform(dx);
      }

      // Keep loop running only while cursor is still settling toward target
      const distSq = dx * dx + dy * dy;
      if (distSq > 0.005) {
        rafId = requestAnimationFrame(animate);
      } else {
        currentX = targetX;
        currentY = targetY;
        isLoopRunning = false;
        rafId = null;
        updateInnerTransform(0);
      }
    };

    const startLoop = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(animate);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        currentX = targetX;
        currentY = targetY;
        if (cursorRef.current) {
          cursorRef.current.style.opacity = '1';
          cursorRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        }
      }

      startLoop();
    };

    const onPointerLeave = () => {
      isVisible = false;
      isLoopRunning = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '0';
      }
    };

    const onPointerEnter = (e: PointerEvent) => {
      isVisible = true;
      targetX = e.clientX;
      targetY = e.clientY;
      currentX = targetX;
      currentY = targetY;
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '1';
        cursorRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      startLoop();
    };

    const onPointerDown = () => {
      isMouseDown = true;
      updateInnerTransform();
    };

    const onPointerUp = () => {
      isMouseDown = false;
      updateInnerTransform();
    };

    const onMouseOver = (e: MouseEvent) => {
      if (isScrolling) return;
      const target = e.target as HTMLElement | null;
      const clickable = checkClickable(target);
      const textHover = checkHoveringText(target, clickable);

      if (clickable !== isClickable || textHover !== isHoveringText) {
        isClickable = clickable;
        isHoveringText = textHover;
        updateInnerTransform();
      }
    };

    const onScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
        isClickable = false;
        isHoveringText = false;
        updateInnerTransform();
      }
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 100);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave, { passive: true });
    document.addEventListener('pointerenter', onPointerEnter, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('pointerenter', onPointerEnter);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('scroll', onScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [cursorRef, innerRef]);
}
