'use client';

import React, { createContext, use, useMemo } from 'react';
import { LazyMotion, domAnimation, m } from 'motion/react';
import { Send } from 'lucide-react';
import { MOTION_EASINGS } from '@/lib/motion-tokens';
import { useReducedMotionPreference } from '@/hooks/use-motion-preference';
import { useContactForm } from '@/hooks/use-contact-form';
import type { ContactFormData, ContactFormStatus } from '@/types/contact';

export interface ContactState {
  formData: ContactFormData;
  status: ContactFormStatus;
  errorMessage: string;
}

export interface ContactActions {
  updateField: (field: keyof ContactFormData, value: string) => void;
  submit: (e?: React.FormEvent) => void;
  reset?: () => void;
}

export interface ContactMeta {
  recipientEmail: string;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

export interface ContactContextValue {
  state: ContactState;
  actions: ContactActions;
  meta: ContactMeta;
}

const ContactContext = createContext<ContactContextValue | null>(null);

export function useContactContext(): ContactContextValue {
  const context = use(ContactContext);
  if (!context) {
    throw new Error('Contact compound subcomponents must be rendered within a Contact.Provider');
  }
  return context;
}

export function useOptionalContactContext(): ContactContextValue | null {
  return use(ContactContext);
}

export function ContactProvider({
  children,
  state,
  actions,
  meta,
}: {
  children: React.ReactNode;
  state: ContactState;
  actions: ContactActions;
  meta: ContactMeta;
}) {
  const contextValue = useMemo(() => ({ state, actions, meta }), [state, actions, meta]);

  return <ContactContext value={contextValue}>{children}</ContactContext>;
}

export function ContactStateProvider({ children }: { children: React.ReactNode }) {
  const { formData, status, errorMessage, recipientEmail, updateField, handleSubmit, resetForm } =
    useContactForm();

  const state = useMemo<ContactState>(
    () => ({ formData, status, errorMessage }),
    [formData, status, errorMessage]
  );

  const actions = useMemo<ContactActions>(
    () => ({
      updateField,
      submit: handleSubmit,
      reset: resetForm,
    }),
    [updateField, handleSubmit, resetForm]
  );

  const meta = useMemo<ContactMeta>(() => ({ recipientEmail }), [recipientEmail]);

  return (
    <ContactProvider state={state} actions={actions} meta={meta}>
      {children}
    </ContactProvider>
  );
}

/**
 * Contact Frame Component
 */
export function ContactFrame({
  children,
  id = 'website-inquiry-form',
  className = 'space-y-4 font-sans text-xs',
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  const { actions } = useContactContext();

  return (
    <form id={id} onSubmit={actions.submit} className={className}>
      {children}
    </form>
  );
}

/**
 * Contact Submit Button Component
 */
export function ContactSubmit({
  id = 'submit-inquiry-button',
  className,
}: {
  id?: string;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotionPreference();
  const {
    state: { status },
  } = useContactContext();

  const isSubmitting = status === 'submitting';

  return (
    <LazyMotion features={domAnimation}>
      <m.button
        id={id}
        type="submit"
        data-interactive="true"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.12, ease: MOTION_EASINGS.entrance }}
        className={
          className ||
          'w-full min-h-[46px] flex items-center justify-center gap-2.5 py-3 px-5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm font-sans tracking-wide transition-[background-color,box-shadow,opacity] shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_28px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer'
        }
      >
        <Send
          className={`w-4 h-4 text-zinc-950 shrink-0 ${isSubmitting ? 'animate-pulse' : ''}`}
          aria-hidden="true"
        />
        <span>{isSubmitting ? 'در حال ارسال درخواست...' : 'ارسال درخواست و ثبت سفارش'}</span>
      </m.button>
    </LazyMotion>
  );
}
