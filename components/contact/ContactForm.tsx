'use client';

import React from 'react';
import {
  ContactFrame,
  ContactSubmit,
  ContactStateProvider,
  useOptionalContactContext,
} from './ContactCompound';
import {
  ContactFirstNameField,
  ContactLastNameField,
  ContactSubjectField,
  ContactEmailField,
  ContactNotesField,
} from './ContactFields';
import { ContactFormAlerts } from './ContactFormAlerts';

export const WebsiteInquiryFormFields: React.FC = () => {
  return (
    <ContactFrame>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ContactFirstNameField />
        <ContactLastNameField />
      </div>
      <ContactSubjectField />
      <ContactEmailField />
      <ContactNotesField />
      <ContactFormAlerts />
      <ContactSubmit />
    </ContactFrame>
  );
};

/**
 * Composed Website Inquiry Form. Automatically wraps itself in `<ContactStateProvider>`
 * when rendered outside an ancestor `<ContactProvider>`.
 */
export const ContactForm: React.FC = () => {
  const existingContext = useOptionalContactContext();
  if (existingContext) {
    return <WebsiteInquiryFormFields />;
  }
  return (
    <ContactStateProvider>
      <WebsiteInquiryFormFields />
    </ContactStateProvider>
  );
};
