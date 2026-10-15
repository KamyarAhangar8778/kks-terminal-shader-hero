import { NextRequest, NextResponse } from 'next/server';
import { validateInquiryPayload } from '@/lib/inquiry-protocol';
import { sendInquiryToTelegram } from '@/lib/telegram-dispatcher';
import { sendInquiryToEmailJS } from '@/lib/emailjs-dispatcher';
import { SITE_CONFIG } from '@/lib/app-config';
import type { ContactFormData } from '@/types/contact';

/**
 * Handles incoming contact form inquiries and forwards them to Telegram & EmailJS in parallel.
 */
export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json();

    const payload: ContactFormData = {
      firstName: String(rawData.firstName || ''),
      lastName: String(rawData.lastName || ''),
      userEmail: String(rawData.userEmail || ''),
      websiteSubject: String(rawData.websiteSubject || ''),
      additionalNotes: String(rawData.additionalNotes || ''),
    };

    // 1. Validate boundary invariants
    const validation = validateInquiryPayload(payload);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.errorMessage || 'داده‌های ارسالی نامعتبر است.',
          code: validation.errorCode,
        },
        { status: 400 }
      );
    }

    // 2. Dispatch to Telegram Bot and EmailJS concurrently
    const [tgResult, emailResult] = await Promise.all([
      sendInquiryToTelegram(payload),
      sendInquiryToEmailJS(payload),
    ]);

    const recipientEmail =
      process.env.CONTACT_RECIPIENT_EMAIL || SITE_CONFIG.contact.recipientEmail;

    const responsePayload = {
      success: tgResult.sent || emailResult.sent,
      message: 'درخواست شما با موفقیت ثبت و ارسال شد.',
      channels: {
        telegram: {
          sent: tgResult.sent,
          chatId: tgResult.chatId,
          error: tgResult.error,
        },
        email: {
          sent: emailResult.sent,
          status: emailResult.status,
          error: emailResult.error,
          recipient: recipientEmail,
        },
      },
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error('[API/Contact] Error processing request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطای سرور در ثبت و ارسال پیام. لطفاً مجدداً تلاش کنید.',
      },
      { status: 500 }
    );
  }
}
