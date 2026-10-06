import { useState, useCallback, useRef, startTransition } from 'react';
import { DEFAULT_RECIPIENT_EMAIL, submitInquiryAsync } from '@/lib/inquiry-protocol';
import type { ContactFormData, SubmissionStatus } from '@/types/contact';

export interface UseContactFormReturn {
  formData: ContactFormData;
  status: SubmissionStatus;
  errorMessage: string;
  recipientEmail: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  updateField: (field: keyof ContactFormData, value: string) => void;
  handleSubmit: (e?: React.FormEvent) => void;
  resetForm: () => void;
}

/**
 * Custom React hook for managing the terminal contact form state
 * and dispatching project inquiries via the deep inquiry-protocol module.
 *
 * @returns {UseContactFormReturn} Form handlers, states, and submission dispatchers.
 */
export function useContactForm(): UseContactFormReturn {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    userEmail: '',
    websiteSubject: '',
    additionalNotes: '',
  });

  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Keep ref up to date inside state updaters for stable callback references
  const formDataRef = useRef<ContactFormData>(formData);

  /**
   * Synchronizes input change events with the form state.
   *
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e Input change event.
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      const next = { ...formDataRef.current, [name]: value };
      formDataRef.current = next;
      setFormData(next);
    },
    []
  );

  /**
   * Directly updates a single form field by key name.
   *
   * @param {keyof ContactFormData} field - Form field key.
   * @param {string} value - Value to assign.
   */
  const updateField = useCallback((field: keyof ContactFormData, value: string) => {
    const next = { ...formDataRef.current, [field]: value };
    formDataRef.current = next;
    setFormData(next);
  }, []);

  /**
   * Resets the contact form to its initial empty state.
   */
  const resetForm = useCallback(() => {
    const initial: ContactFormData = {
      firstName: '',
      lastName: '',
      userEmail: '',
      websiteSubject: '',
      additionalNotes: '',
    };
    formDataRef.current = initial;
    setFormData(initial);
    startTransition(() => {
      setStatus('idle');
      setErrorMessage('');
    });
  }, []);

  /**
   * Validates form parameters and executes the server API dispatch protocol.
   * Leverages formDataRef to maintain a stable function identity across re-renders.
   *
   * @param {React.FormEvent} [e] Form submission event.
   */
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setStatus('submitting');

    try {
      const result = await submitInquiryAsync(formDataRef.current);
      startTransition(() => {
        if (result.success) {
          setStatus('success');
        } else {
          const msg = result.errorMessage || 'خطا در ارسال فرم.';
          setErrorMessage(msg);
          setStatus('error');
        }
      });
    } catch (error) {
      console.error('Contact inquiry error:', error);
      startTransition(() => {
        setErrorMessage('خطای پیش‌بینی‌نشده در پردازش فرم.');
        setStatus('error');
      });
    }
  }, []);

  return {
    formData,
    status,
    errorMessage,
    recipientEmail: DEFAULT_RECIPIENT_EMAIL,
    handleChange,
    updateField,
    handleSubmit,
    resetForm,
  };
}
