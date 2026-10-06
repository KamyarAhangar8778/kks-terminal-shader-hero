/**
 * @file lib/telegram-dispatcher.ts
 * @description Helper for dispatching formatted project inquiries to Telegram Bot API.
 */

import type { ContactFormData } from '@/types/contact';

const DEFAULT_BOT_TOKEN = '8831284480:AAH5nv75wKEOgsgKDqcxuOnCa0sr_7o2rOo';

const TEHRAN_MEDIUM_DATE_FORMATTER = new Intl.DateTimeFormat('fa-IR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Tehran',
});

export interface TelegramDispatchResult {
  sent: boolean;
  chatId?: string | number;
  error?: string;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Retrieves the configured or latest active chat ID for the Telegram bot.
 * If TELEGRAM_CHAT_ID environment variable is set, it uses that.
 * Otherwise, queries getUpdates to automatically find the most recent chat.
 */
async function resolveTelegramChatId(botToken: string): Promise<string | number | null> {
  if (process.env.TELEGRAM_CHAT_ID && process.env.TELEGRAM_CHAT_ID.trim()) {
    return process.env.TELEGRAM_CHAT_ID.trim();
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (!data.ok || !Array.isArray(data.result) || data.result.length === 0) {
      return null;
    }

    // Find the latest update with a message or callback
    for (let i = data.result.length - 1; i >= 0; i--) {
      const update = data.result[i];
      const chat = update.message?.chat || update.channel_post?.chat || update.my_chat_member?.chat;
      if (chat?.id) {
        return chat.id;
      }
    }
  } catch (err) {
    console.error('[TelegramDispatcher] Error fetching getUpdates:', err);
  }

  return null;
}

/**
 * Formats a project inquiry into a clean, HTML-safe Telegram message.
 */
export function formatTelegramMessage(data: ContactFormData): string {
  const timestamp = TEHRAN_MEDIUM_DATE_FORMATTER.format(new Date());

  const fullName = escapeHtml(`${data.firstName.trim()} ${data.lastName.trim()}`);
  const subject = escapeHtml(data.websiteSubject.trim());
  const userContact = escapeHtml(data.userEmail?.trim() || 'ثبت نشده');
  const notes = escapeHtml(data.additionalNotes?.trim() || 'بدون توضیحات تکمیلی');

  return (
    `🚀 <b>سفارش و پیام جدید از وب‌سایت KKS</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>کارفرما:</b> ${fullName}\n` +
    `📌 <b>موضوع:</b> ${subject}\n` +
    `📬 <b>پل ارتباطی:</b> <code>${userContact}</code>\n` +
    `⏱ <b>زمان ثبت:</b> ${timestamp}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📝 <b>جزئیات و نیازمندی‌ها:</b>\n${notes}\n` +
    `━━━━━━━━━━━━━━━━━━━━`
  );
}

/**
 * Sends the inquiry message directly to Telegram via the bot token.
 */
export async function sendInquiryToTelegram(
  data: ContactFormData,
  customToken?: string
): Promise<TelegramDispatchResult> {
  const token = customToken || process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
  if (!token) {
    return { sent: false, error: 'Telegram Bot Token not configured' };
  }

  const chatId = await resolveTelegramChatId(token);
  if (!chatId) {
    return {
      sent: false,
      error:
        'شناسه چت تلگرام یافت نشد. لطفاً ابتدا در تلگرام به ربات پیام دهید یا /start را ارسال کنید.',
    };
  }

  try {
    const text = formatTelegramMessage(data);
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      return {
        sent: false,
        chatId,
        error: `Telegram API returned status ${response.status}`,
      };
    }

    const resData = await response.json();
    if (resData.ok) {
      return { sent: true, chatId };
    }

    return {
      sent: false,
      chatId,
      error: resData.description || 'Telegram API returned an error',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Telegram network error';
    return { sent: false, error: message };
  }
}
