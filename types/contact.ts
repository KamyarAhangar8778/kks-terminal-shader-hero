/**
 * Form payload for project inquiries and client contact dispatch.
 */
export interface ContactFormData {
  /** Client given / first name */
  firstName: string;
  /** Client family / last name */
  lastName: string;
  /** Client return email address (optional) */
  userEmail: string;
  /** Project website domain or technical subject */
  websiteSubject: string;
  /** Optional project specifications, requirements, or architecture notes */
  additionalNotes: string;
}

/**
 * Lifecycle status of the contact form submission process.
 */
export type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';
export type ContactFormStatus = SubmissionStatus;
