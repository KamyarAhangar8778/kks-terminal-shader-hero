/**
 * @file lib/emailjs-dispatcher.ts
 * @description Helper for dispatching formatted project inquiries via EmailJS REST API.
 */

import { SITE_CONFIG } from '@/lib/app-config';
import type { ContactFormData } from '@/types/contact';

const EMAILJS_API_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

const TEHRAN_LONG_DATE_FORMATTER = new Intl.DateTimeFormat('fa-IR', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'Asia/Tehran',
});

export const EMAILJS_DEFAULTS = {
  serviceId: 'default_service',
  templateId: 'template_m6u6t2g',
  publicKey: 'tOl5cxHrmzOttylqi',
  privateKey: 'DW8lH6fyQE56fhtadh-VL',
} as const;

export interface EmailJSDispatchResult {
  sent: boolean;
  status?: number;
  error?: string;
}

/**
 * Builds the template parameters object compatible with both custom KKS HTML templates
 * and standard EmailJS default placeholders.
 *
 * @param {ContactFormData} data - Validated contact inquiry payload.
 * @param {string} [recipientEmail] - Target recipient email address.
 * @returns {Record<string, string>} Key-value map of EmailJS template parameters.
 */
export function buildEmailJSTemplateParams(
  data: ContactFormData,
  recipientEmail: string = SITE_CONFIG.contact.recipientEmail
): Record<string, string> {
  const firstName = data.firstName.trim();
  const lastName = data.lastName.trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const websiteSubject = data.websiteSubject.trim();
  const rawContact = data.userEmail?.trim() || '';
  const userContact = rawContact || 'ثبت نشده';
  const notes = data.additionalNotes?.trim() || 'بدون توضیحات تکمیلی';

  const timestamp = TEHRAN_LONG_DATE_FORMATTER.format(new Date());

  const isTelegramHandle = rawContact.startsWith('@');
  const isEmailAddress = !isTelegramHandle && rawContact.includes('@');

  const contactHref = isTelegramHandle
    ? `https://t.me/${rawContact.slice(1)}`
    : isEmailAddress
      ? `mailto:${rawContact}?subject=${encodeURIComponent(`پاسخ به درخواست پروژه: ${websiteSubject}`)}`
      : `mailto:${recipientEmail}`;

  const contactActionLabel = isTelegramHandle
    ? `پیام در تلگرام (${rawContact})`
    : isEmailAddress
      ? `پاسخ به ایمیل کارفرما`
      : 'ثبت نشده';

  const formattedPlainMessage =
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 کارفرما: ${fullName}\n` +
    `📌 موضوع پروژه: ${websiteSubject}\n` +
    `📬 راه ارتباطی: ${userContact}\n` +
    `⏱ زمان ثبت: ${timestamp}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📝 توضیحات و نیازمندی‌ها:\n${notes}`;

  return {
    firstName,
    lastName,
    fullName,
    from_name: fullName,
    to_name: SITE_CONFIG.brand.shortName,
    userEmail: userContact,
    reply_to: isEmailAddress ? rawContact : recipientEmail,
    contactHref,
    contactActionLabel,
    timestamp,
    websiteSubject,
    subject: websiteSubject,
    additionalNotes: notes,
    message: formattedPlainMessage,
    to_email: recipientEmail,
  };
}

/**
 * Sends the inquiry payload to EmailJS from the server (includes Private Key / accessToken).
 *
 * @param {ContactFormData} data - Contact form data.
 * @returns {Promise<EmailJSDispatchResult>} Dispatch status and diagnostic message.
 */
export async function sendInquiryToEmailJS(data: ContactFormData): Promise<EmailJSDispatchResult> {
  const serviceId = process.env.EMAILJS_SERVICE_ID?.trim() || EMAILJS_DEFAULTS.serviceId;
  const templateId = process.env.EMAILJS_TEMPLATE_ID?.trim() || EMAILJS_DEFAULTS.templateId;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY?.trim() || EMAILJS_DEFAULTS.publicKey;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY?.trim() || EMAILJS_DEFAULTS.privateKey;
  const recipientEmail =
    process.env.CONTACT_RECIPIENT_EMAIL?.trim() || SITE_CONFIG.contact.recipientEmail;

  if (!serviceId || !templateId || !publicKey) {
    return { sent: false, error: 'EmailJS configuration is incomplete.' };
  }

  try {
    const response = await fetch(EMAILJS_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: SITE_CONFIG.brand.siteUrl,
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: buildEmailJSTemplateParams(data, recipientEmail),
      }),
    });

    if (!response.ok) {
      return {
        sent: false,
        status: response.status,
        error: `EmailJS returned status ${response.status} (${response.statusText || 'Error'})`,
      };
    }

    await response.text();
    return { sent: true, status: response.status };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown EmailJS network error';
    return { sent: false, error: message };
  }
}

/**
 * Browser-side fallback for EmailJS when server-side non-browser API mode is restricted.
 * Uses only the public key and template/service identifiers.
 *
 * @param {ContactFormData} data - Contact form data.
 * @returns {Promise<EmailJSDispatchResult>} Dispatch status.
 */
export async function sendInquiryToEmailJSBrowser(
  data: ContactFormData
): Promise<EmailJSDispatchResult> {
  const serviceId =
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID?.trim() || EMAILJS_DEFAULTS.serviceId;
  const templateId =
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID?.trim() || EMAILJS_DEFAULTS.templateId;
  const publicKey =
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?.trim() || EMAILJS_DEFAULTS.publicKey;

  try {
    const response = await fetch(EMAILJS_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: buildEmailJSTemplateParams(data),
      }),
    });

    if (!response.ok) {
      return {
        sent: false,
        status: response.status,
        error: `EmailJS browser call returned status ${response.status} (${response.statusText || 'Error'})`,
      };
    }

    await response.text();
    return { sent: true, status: response.status };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Browser EmailJS network error';
    return { sent: false, error: message };
  }
}
