import type { ContactFormData } from '@/types/contact';
import { SITE_CONFIG } from '@/lib/app-config';
import { sendInquiryToEmailJSBrowser } from '@/lib/emailjs-dispatcher';
import { sendInquiryToTelegram } from '@/lib/telegram-dispatcher';

/** Default recipient email address for system inquiries */
export const DEFAULT_RECIPIENT_EMAIL = SITE_CONFIG.contact.recipientEmail;

/** Maximum character limit for additional notes to prevent browser mailto URL truncation */
export const MAX_NOTES_LENGTH = SITE_CONFIG.contact.maxNotesLength;

/** Maximum character limits for single-line fields at system boundary */
export const MAX_NAME_LENGTH = 80;
export const MAX_SUBJECT_LENGTH = 160;
export const MAX_CONTACT_LENGTH = 120;

/** RFC-5322 compliant regex for strict email format validation */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** Telegram username regex (@username or username, 5-32 alphanumeric/underscore chars) */
const TELEGRAM_REGEX = /^@[a-zA-Z0-9_]{5,32}$/;

/** Pre-computed character code constants for hot single-line scanning */
const CHAR_NULL = 0;
const CHAR_LF = 10;
const CHAR_CR = 13;
const CHAR_SPACE = 32;
const CHAR_AT = 64;

/** Control character replacement regex (used only on slow path when control chars are present) */
const CONTROL_CHAR_REGEX = /[\r\n\0]+/g;

/**
 * Strips CR/LF and null control characters from single-line user inputs.
 * Uses a fast single-pass charCodeAt scan to avoid regex and string allocation on clean inputs.
 *
 * @param {string} value - Raw single-line input string.
 * @returns {string} Sanitized single-line string.
 */
export function sanitizeSingleLine(value: string): string {
  const len = value.length;
  if (len === 0) return '';

  let start = 0;
  while (start < len && value.charCodeAt(start) <= CHAR_SPACE) {
    const code = value.charCodeAt(start);
    if (code === CHAR_NULL) break;
    start++;
  }
  if (start === len) return '';

  let end = len;
  while (end > start && value.charCodeAt(end - 1) <= CHAR_SPACE) {
    const code = value.charCodeAt(end - 1);
    if (code === CHAR_NULL) break;
    end--;
  }

  let hasControlChar = false;
  for (let i = start; i < end; i++) {
    const code = value.charCodeAt(i);
    if (code === CHAR_LF || code === CHAR_CR || code === CHAR_NULL) {
      hasControlChar = true;
      break;
    }
  }

  if (!hasControlChar) {
    return start === 0 && end === len ? value : value.slice(start, end);
  }

  return value.slice(start, end).replace(CONTROL_CHAR_REGEX, ' ').trim();
}

/**
 * Result returned from inquiry validation (consistent hidden class shape).
 */
export interface InquiryValidationResult {
  isValid: boolean;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Result returned from dispatching an inquiry (consistent hidden class shape).
 */
export interface InquiryDispatchResult {
  success: boolean;
  mailtoUrl?: string;
  errorMessage?: string;
}

function isValidContactIdentifier(userEmail: string): boolean {
  if (userEmail.length > MAX_CONTACT_LENGTH) return false;
  if (userEmail.charCodeAt(0) === CHAR_AT) {
    return TELEGRAM_REGEX.test(userEmail);
  }
  return userEmail.indexOf('@') > 0 && EMAIL_REGEX.test(userEmail);
}

/**
 * Validates the contact inquiry form data invariants.
 * All return paths maintain identical property order for monomorphic V8 inline caches.
 *
 * @param {ContactFormData} data - Form data input payload.
 * @returns {InquiryValidationResult} Validation outcome with error code and localized message if invalid.
 */
export function validateInquiryPayload(data: ContactFormData): InquiryValidationResult {
  const firstName = sanitizeSingleLine(data.firstName);
  const lastName = sanitizeSingleLine(data.lastName);
  const websiteSubject = sanitizeSingleLine(data.websiteSubject);
  const userEmail = sanitizeSingleLine(data.userEmail);

  if (!firstName || !lastName) {
    return {
      isValid: false,
      errorCode: 'ERR_EMPTY_NAME',
      errorMessage: 'لطفاً نام و نام خانوادگی را وارد کنید.',
    };
  }

  if (firstName.length > MAX_NAME_LENGTH || lastName.length > MAX_NAME_LENGTH) {
    return {
      isValid: false,
      errorCode: 'ERR_NAME_TOO_LONG',
      errorMessage: `طول نام و نام خانوادگی نباید بیشتر از ${MAX_NAME_LENGTH} کاراکتر باشد.`,
    };
  }

  if (!websiteSubject) {
    return {
      isValid: false,
      errorCode: 'ERR_EMPTY_SUBJECT',
      errorMessage: 'لطفاً موضوع یا نوع وب‌سایت را مشخص کنید.',
    };
  }

  if (websiteSubject.length > MAX_SUBJECT_LENGTH) {
    return {
      isValid: false,
      errorCode: 'ERR_SUBJECT_TOO_LONG',
      errorMessage: `طول موضوع پروژه نباید بیشتر از ${MAX_SUBJECT_LENGTH} کاراکتر باشد.`,
    };
  }

  if (userEmail && !isValidContactIdentifier(userEmail)) {
    return {
      isValid: false,
      errorCode: 'ERR_INVALID_EMAIL',
      errorMessage: 'فرمت ایمیل یا آیدی تلگرام (مثال: @username) معتبر نیست.',
    };
  }

  if (data.additionalNotes && data.additionalNotes.length > MAX_NOTES_LENGTH) {
    return {
      isValid: false,
      errorCode: 'ERR_NOTES_TOO_LONG',
      errorMessage: `متن توضیحات نباید بیشتر از ${MAX_NOTES_LENGTH} کاراکتر باشد.`,
    };
  }

  return {
    isValid: true,
    errorCode: undefined,
    errorMessage: undefined,
  };
}

/**
 * Formats inquiry data into a structured system dispatch email body without intermediate array allocations.
 *
 * @param {ContactFormData} data - Form data.
 * @returns {string} Plain-text formatted payload body.
 */
export function formatInquiryBody(data: ContactFormData): string {
  const firstName = sanitizeSingleLine(data.firstName);
  const lastName = sanitizeSingleLine(data.lastName);
  const websiteSubject = sanitizeSingleLine(data.websiteSubject);
  const userEmail = sanitizeSingleLine(data.userEmail);
  const notes = data.additionalNotes.trim() || '(None provided)';
  const contactLine = userEmail ? `\nCONTACT_EMAIL:  ${userEmail}` : '';

  return (
    '========================================\n' +
    'SYSTEM DISPATCH: PROJECT INQUIRY\n' +
    '========================================\n' +
    `FIRST_NAME:     ${firstName}\n` +
    `LAST_NAME:      ${lastName}\n` +
    `WEBSITE_TOPIC:  ${websiteSubject}` +
    contactLine +
    '\n----------------------------------------\n' +
    'SPECIFICATIONS / NOTES:\n' +
    notes +
    '\n========================================'
  );
}

/**
 * Constructs a fully encoded mailto URL for project inquiry transmission.
 *
 * @param {ContactFormData} data - Form data payload.
 * @param {string} [recipient=DEFAULT_RECIPIENT_EMAIL] - Target recipient email address.
 * @returns {string} The formatted mailto URL.
 */
export function buildInquiryMailtoUrl(
  data: ContactFormData,
  recipient: string = DEFAULT_RECIPIENT_EMAIL
): string {
  const trimmedRecipient = sanitizeSingleLine(recipient);
  const safeRecipient =
    trimmedRecipient.indexOf('@') > 0 && EMAIL_REGEX.test(trimmedRecipient)
      ? trimmedRecipient
      : DEFAULT_RECIPIENT_EMAIL;
  const firstName = sanitizeSingleLine(data.firstName);
  const lastName = sanitizeSingleLine(data.lastName);
  const websiteSubject = sanitizeSingleLine(data.websiteSubject);

  const subject = encodeURIComponent(
    `[PROJECT_INQUIRY] ${websiteSubject} // ${firstName} ${lastName}`
  );
  const body = encodeURIComponent(formatInquiryBody(data));

  return `mailto:${safeRecipient}?subject=${subject}&body=${body}`;
}

/**
 * Executes inquiry dispatch by validating inputs and triggering the client mailto protocol.
 *
 * @param {ContactFormData} data - Form data payload to dispatch.
 * @param {string} [recipient=DEFAULT_RECIPIENT_EMAIL] - Target recipient email.
 * @returns {InquiryDispatchResult} Outcome of the dispatch attempt.
 */
export function dispatchInquiry(
  data: ContactFormData,
  recipient: string = DEFAULT_RECIPIENT_EMAIL
): InquiryDispatchResult {
  const validation = validateInquiryPayload(data);
  if (!validation.isValid) {
    return {
      success: false,
      mailtoUrl: undefined,
      errorMessage: validation.errorMessage || 'خطای اعتبارسنجی فرم.',
    };
  }

  const mailtoUrl = buildInquiryMailtoUrl(data, recipient);

  if (typeof window !== 'undefined') {
    window.location.href = mailtoUrl;
  }
  return {
    success: true,
    mailtoUrl,
    errorMessage: undefined,
  };
}

/**
 * Submits inquiry data to the backend API route (/api/contact) which dispatches
 * notifications to Telegram and configured email receivers.
 *
 * @param {ContactFormData} data - Form data payload.
 * @returns {Promise<InquiryDispatchResult>} Outcome of the API dispatch.
 */
export async function submitInquiryAsync(data: ContactFormData): Promise<InquiryDispatchResult> {
  const validation = validateInquiryPayload(data);
  if (!validation.isValid) {
    return {
      success: false,
      mailtoUrl: undefined,
      errorMessage: validation.errorMessage || 'خطای اعتبارسنجی فرم.',
    };
  }

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('application/json')) {
      const [tgDirect, emailDirect] = await Promise.all([
        sendInquiryToTelegram(data),
        sendInquiryToEmailJSBrowser(data),
      ]);
      if (tgDirect.sent || emailDirect.sent) {
        return {
          success: true,
          mailtoUrl: undefined,
          errorMessage: undefined,
        };
      }
      return {
        success: false,
        mailtoUrl: undefined,
        errorMessage:
          tgDirect.error ||
          emailDirect.error ||
          'خطا در ارسال پیام. لطفاً از طریق تلگرام یا ایمیل مستقیم اقدام کنید.',
      };
    }

    const result = await response.json();
    const tgSent = Boolean(result.channels?.telegram?.sent);
    let emailSent = Boolean(result.channels?.email?.sent);

    // If server-side EmailJS did not send (e.g. non-browser API mode not enabled yet),
    // automatically attempt browser-side EmailJS delivery.
    if (!emailSent && typeof window !== 'undefined') {
      const browserEmailRes = await sendInquiryToEmailJSBrowser(data);
      emailSent = browserEmailRes.sent;
    }

    if (tgSent || emailSent || (response.ok && result.success)) {
      return {
        success: true,
        mailtoUrl: undefined,
        errorMessage: undefined,
      };
    }

    return {
      success: false,
      mailtoUrl: undefined,
      errorMessage:
        result.error ||
        result.channels?.telegram?.error ||
        'خطا در ارسال پیام. لطفاً از فعال بودن ربات تلگرام یا سرویس ایمیل اطمینان حاصل کنید.',
    };
  } catch (error) {
    console.error('submitInquiryAsync error:', error);
    const [tgFallback, emailFallback] = await Promise.all([
      sendInquiryToTelegram(data),
      sendInquiryToEmailJSBrowser(data),
    ]);
    if (tgFallback.sent || emailFallback.sent) {
      return {
        success: true,
        mailtoUrl: undefined,
        errorMessage: undefined,
      };
    }
    return {
      success: false,
      mailtoUrl: undefined,
      errorMessage: 'خطای ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.',
    };
  }
}
