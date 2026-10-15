'use client';

import React from 'react';
import { IconUser, IconFolderCode, IconAt, IconFileText } from '@tabler/icons-react';
import { useContactContext } from './ContactCompound';
import { MAX_NOTES_LENGTH } from '@/lib/inquiry-protocol';

const SUGGESTED_SUBJECTS = [
  'طراحی صفحه فرود (Landing Page)',
  'سیستم و ابزار تحت وب (Web Tooling)',
  'رابط کاربری سفارشی (UI/UX)',
  'توسعه وب‌سایت اختصاصی',
] as const;

const INPUT_BASE_CLASSES =
  'w-full bg-zinc-950/70 border border-white/[0.1] hover:border-white/[0.18] px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 rounded-lg focus:outline-none focus:border-emerald-400/80 focus:ring-1 focus:ring-emerald-400/60 focus:bg-zinc-900/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[42px]';

const USER_ICON = <IconUser className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />;
const FOLDER_ICON = (
  <IconFolderCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
);
const AT_ICON = <IconAt className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />;
const FILE_ICON = (
  <IconFileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
);
const REQUIRED_STAR = <span className="text-emerald-400">*</span>;
const EMAIL_REPLY_BADGE = (
  <span className="text-zinc-400 text-[11px] font-sans">(جهت دریافت پاسخ)</span>
);

export function ContactFieldShell({
  htmlFor,
  icon,
  label,
  required = false,
  badge,
  children,
}: {
  htmlFor: string;
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 text-right" dir="rtl">
      <div className="flex items-center justify-between text-xs text-zinc-200">
        <label
          htmlFor={htmlFor}
          className="font-sans flex items-center gap-1.5 text-xs font-medium text-zinc-200 cursor-pointer whitespace-nowrap"
        >
          {icon}
          <span>
            {label} {required ? REQUIRED_STAR : null}
          </span>
        </label>
        {badge}
      </div>
      {children}
    </div>
  );
}

export const ContactFirstNameField: React.FC = () => {
  const {
    state: { formData, status },
    actions: { updateField },
  } = useContactContext();
  const isSubmitting = status === 'submitting';

  return (
    <ContactFieldShell htmlFor="input-first-name" icon={USER_ICON} label="نام" required>
      <input
        id="input-first-name"
        name="firstName"
        type="text"
        required
        aria-required="true"
        disabled={isSubmitting}
        autoComplete="given-name"
        value={formData.firstName}
        onChange={(e) => updateField('firstName', e.target.value)}
        placeholder="مثال: کیان"
        className={`${INPUT_BASE_CLASSES} font-sans`}
      />
    </ContactFieldShell>
  );
};

export const ContactLastNameField: React.FC = () => {
  const {
    state: { formData, status },
    actions: { updateField },
  } = useContactContext();
  const isSubmitting = status === 'submitting';

  return (
    <ContactFieldShell htmlFor="input-last-name" icon={USER_ICON} label="نام خانوادگی" required>
      <input
        id="input-last-name"
        name="lastName"
        type="text"
        required
        aria-required="true"
        disabled={isSubmitting}
        autoComplete="family-name"
        value={formData.lastName}
        onChange={(e) => updateField('lastName', e.target.value)}
        placeholder="مثال: رادمنش"
        className={`${INPUT_BASE_CLASSES} font-sans`}
      />
    </ContactFieldShell>
  );
};

export const ContactSubjectField: React.FC = () => {
  const {
    state: { formData, status },
    actions: { updateField },
  } = useContactContext();
  const isSubmitting = status === 'submitting';

  return (
    <ContactFieldShell
      htmlFor="input-website-subject"
      icon={FOLDER_ICON}
      label="موضوع و دسته‌بندی پروژه"
      required
    >
      <input
        id="input-website-subject"
        name="websiteSubject"
        type="text"
        required
        aria-required="true"
        disabled={isSubmitting}
        autoComplete="off"
        value={formData.websiteSubject}
        onChange={(e) => updateField('websiteSubject', e.target.value)}
        placeholder="مثال: طراحی صفحه فرود اختصاصی، سامانه ثبت سفارش..."
        className={`${INPUT_BASE_CLASSES} font-sans`}
      />

      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {SUGGESTED_SUBJECTS.map((subject) => {
          const isSelected = formData.websiteSubject === subject;
          return (
            <button
              key={subject}
              type="button"
              disabled={isSubmitting}
              onClick={() => updateField('websiteSubject', subject)}
              className={`text-[11px] px-2.5 py-1 rounded-md transition-colors border font-sans cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                  : 'bg-zinc-900/50 hover:bg-zinc-800/80 border-white/[0.06] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {subject}
            </button>
          );
        })}
      </div>
    </ContactFieldShell>
  );
};

export const ContactEmailField: React.FC = () => {
  const {
    state: { formData, status },
    actions: { updateField },
  } = useContactContext();
  const isSubmitting = status === 'submitting';

  return (
    <ContactFieldShell
      htmlFor="input-user-email"
      icon={AT_ICON}
      label="ایمیل یا آیدی تلگرام"
      badge={EMAIL_REPLY_BADGE}
    >
      <input
        id="input-user-email"
        name="userEmail"
        type="text"
        disabled={isSubmitting}
        autoComplete="email"
        value={formData.userEmail}
        onChange={(e) => updateField('userEmail', e.target.value)}
        placeholder="example@gmail.com یا @username"
        className={`${INPUT_BASE_CLASSES} text-left font-mono`}
        dir="ltr"
      />
    </ContactFieldShell>
  );
};

export const ContactNotesField: React.FC = () => {
  const {
    state: { formData, status },
    actions: { updateField },
  } = useContactContext();
  const isSubmitting = status === 'submitting';

  return (
    <ContactFieldShell
      htmlFor="input-additional-notes"
      icon={FILE_ICON}
      label="جزئیات و توضیحات پروژه"
      badge={
        <span className="text-zinc-400 font-mono text-[10px] tabular-nums" dir="ltr">
          {formData.additionalNotes.length}/{MAX_NOTES_LENGTH}
        </span>
      }
    >
      <textarea
        id="input-additional-notes"
        name="additionalNotes"
        rows={4}
        disabled={isSubmitting}
        value={formData.additionalNotes}
        onChange={(e) => updateField('additionalNotes', e.target.value)}
        maxLength={MAX_NOTES_LENGTH}
        placeholder="توضیح دهید به چه ویژگی‌هایی نیاز دارید، زمان‌بندی مدنظر یا نمونه‌های مشابهی که می‌پسندید..."
        className={`${INPUT_BASE_CLASSES} font-sans resize-none leading-relaxed`}
      />
    </ContactFieldShell>
  );
};
