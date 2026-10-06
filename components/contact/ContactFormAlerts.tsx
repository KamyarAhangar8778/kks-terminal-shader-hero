'use client';

import React, { useState } from 'react';
import { LazyMotion, domAnimation, m } from 'motion/react';
import { CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { ViewTransition } from '@/components/view-transitions/ViewTransition';
import { MOTION_EASINGS, MOTION_DURATIONS } from '@/lib/motion-tokens';
import { useReducedMotionPreference } from '@/hooks/use-motion-preference';
import { useOptionalContactContext } from './ContactCompound';
import type { SubmissionStatus } from '@/types/contact';

interface ContactFormAlertsProps {
  status?: SubmissionStatus;
  errorMessage?: string;
  recipientEmail?: string;
}

export const ContactErrorAlert: React.FC<{ message?: string }> = ({ message }) => {
  const context = useOptionalContactContext();
  const prefersReducedMotion = useReducedMotionPreference();
  const resolvedMessage = message ?? context?.state.errorMessage ?? '';
  const isError = message !== undefined ? Boolean(message) : context?.state.status === 'error';

  if (!isError || !resolvedMessage) return null;

  return (
    <ViewTransition enter="slide-up" exit="fade-out" default="none">
      <LazyMotion features={domAnimation}>
        <m.div
          id="contact-form-error-banner"
          role="alert"
          aria-live="assertive"
          initial={{ opacity: 0, y: -6 }}
          animate={{
            opacity: 1,
            y: 0,
            x: prefersReducedMotion ? 0 : [0, -6, 6, -4, 4, -2, 2, 0],
          }}
          transition={{
            duration: 0.35,
            ease: MOTION_EASINGS.shake,
          }}
          className="p-3.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-sans flex items-center gap-2.5 text-right"
          dir="rtl"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" aria-hidden="true" />
          <span className="leading-relaxed">{resolvedMessage}</span>
        </m.div>
      </LazyMotion>
    </ViewTransition>
  );
};

export const ContactSuccessAlert: React.FC<{ recipientEmail?: string }> = ({ recipientEmail }) => {
  const context = useOptionalContactContext();
  const [copied, setCopied] = useState(false);
  const prefersReducedMotion = useReducedMotionPreference();

  const resolvedEmail = recipientEmail ?? context?.meta.recipientEmail ?? '';
  const isSuccess =
    recipientEmail !== undefined && !context ? true : context?.state.status === 'success';

  if (!isSuccess) return null;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(resolvedEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard fallback ignored if unsupported
    }
  };

  return (
    <ViewTransition enter="slide-up" exit="fade-out" default="none">
      <LazyMotion features={domAnimation}>
        <m.div
          id="contact-form-success-banner"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.96, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: MOTION_DURATIONS.standard, ease: MOTION_EASINGS.entrance }}
          className="p-4 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs font-sans flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right"
          dir="rtl"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" aria-hidden="true" />
            <span className="leading-relaxed">
              درخواست شما با موفقیت ثبت و به ربات تلگرام و ایمیل ارسال شد. در اسرع وقت با شما ارتباط
              برقرار خواهد شد.
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyEmail}
            aria-label="کپی آدرس ایمیل"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-600/40 text-emerald-100 text-xs whitespace-nowrap transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" />
                <span>کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" />
                <span>کپی ایمیل</span>
              </>
            )}
          </button>
        </m.div>
      </LazyMotion>
    </ViewTransition>
  );
};

/**
 * ContactFormAlerts Component
 *
 * Composes explicit `ContactErrorAlert` and `ContactSuccessAlert` variants,
 * reading state directly from `ContactContext` when props are omitted.
 */
export const ContactFormAlerts: React.FC<ContactFormAlertsProps> = ({
  status,
  errorMessage,
  recipientEmail,
}) => {
  const context = useOptionalContactContext();
  const effectiveStatus = status ?? context?.state.status ?? 'idle';

  if (effectiveStatus === 'error') {
    return <ContactErrorAlert message={errorMessage ?? context?.state.errorMessage} />;
  }

  if (effectiveStatus === 'success') {
    return <ContactSuccessAlert recipientEmail={recipientEmail ?? context?.meta.recipientEmail} />;
  }

  return null;
};
