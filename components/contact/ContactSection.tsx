'use client';

import React, { useState } from 'react';
import { LazyMotion, domAnimation, m } from 'motion/react';
import { Mail, Send, Check, Copy, Clock, ShieldCheck, Zap } from 'lucide-react';
import { IconBrandTelegram } from '@tabler/icons-react';
import { ContactForm } from './ContactForm';
import { ContactStateProvider } from './ContactCompound';
import { GeometricBackground } from '@/components/common/GeometricBackground';
import { ViewTransition } from '@/components/view-transitions/ViewTransition';
import { MOTION_EASINGS } from '@/lib/motion-tokens';
import { useReducedMotionPreference } from '@/hooks/use-motion-preference';
import { FEATURE_FLAGS, SITE_CONFIG } from '@/lib/app-config';

const CONTACT_TRUST_BADGES_NODE = (
  <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-white/[0.07]">
    <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-zinc-950/50 border border-white/[0.05] text-center gap-1">
      <Clock className="w-4 h-4 text-emerald-400" />
      <span className="text-[11px] font-bold text-zinc-200 font-sans">پاسخ فوری</span>
      <span className="text-[10px] text-zinc-400 font-sans">زیر ۲ ساعت</span>
    </div>
    <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-zinc-950/50 border border-white/[0.05] text-center gap-1">
      <Zap className="w-4 h-4 text-emerald-400" />
      <span className="text-[11px] font-bold text-zinc-200 font-sans">سرعت بالا</span>
      <span className="text-[10px] text-zinc-400 font-sans">عملکرد بهینه</span>
    </div>
    <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-zinc-950/50 border border-white/[0.05] text-center gap-1">
      <ShieldCheck className="w-4 h-4 text-emerald-400" />
      <span className="text-[11px] font-bold text-zinc-200 font-sans">کد استاندارد</span>
      <span className="text-[10px] text-zinc-400 font-sans">پشتیبانی مستقیم</span>
    </div>
  </div>
);

const FORM_CHASSIS_BRACKETS_NODE = (
  <>
    <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-white/40 pointer-events-none rounded-tl-sm" />
    <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-white/40 pointer-events-none rounded-tr-sm" />
    <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-white/40 pointer-events-none rounded-bl-sm" />
    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-white/40 pointer-events-none rounded-br-sm" />
  </>
);

/**
 * ContactSection Component
 *
 * Premium engineering contact studio featuring a dual-column layout:
 * Direct contact channels, trust badges & rapid inquiry form.
 *
 * @returns {React.ReactElement} The rendered contact section.
 */
export const ContactSection: React.FC = () => {
  const prefersReducedMotion = useReducedMotionPreference();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedTg, setCopiedTg] = useState(false);

  const handleCopy = async (text: string, type: 'email' | 'tg') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2200);
      } else {
        setCopiedTg(true);
        setTimeout(() => setCopiedTg(false), 2200);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <ViewTransition>
      <section
        id={SITE_CONFIG.nav.sectionIds.contact}
        className="relative w-full py-20 sm:py-28 md:py-36 px-4 sm:px-6 bg-[#000000] border-t border-white/[0.08] overflow-hidden [content-visibility:auto] [contain-intrinsic-size:auto_700px]"
      >
        {/* Geometric Vector Background Layer */}
        {FEATURE_FLAGS.geometricBackgrounds ? <GeometricBackground variant="contact" /> : null}

        {/* Subtle Radial Emerald Ambient Glow */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.065)_0%,rgba(16,185,129,0.02)_45%,transparent_75%)] pointer-events-none -z-10"
        />

        <div className="adaptive-container max-w-6xl">
          <ContactStateProvider>
            <LazyMotion features={domAnimation}>
              <m.div
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{
                  once: true,
                  amount: 0.1,
                  margin: '0px 0px -40px 0px',
                }}
                transition={{
                  duration: 0.42,
                  ease: MOTION_EASINGS.entrance,
                }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start"
              >
                {/* Right Column (Col 1-5): Direct Channels & Info */}
                <div className="lg:col-span-5 flex flex-col gap-6 text-right" dir="rtl">
                  {/* Badge & Title */}
                  <div className="flex flex-col gap-3">
                    <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-400 font-sans">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>پذیرش سفارش و پروژه‌های جدید</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-zinc-50 font-sans tracking-tight">
                      ثبت سفارش و شروع همکاری
                    </h2>

                    <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                      ایده، نیازمندی‌ها یا ویژگی‌های مدنظر برای وب‌سایت خود را مطرح کنید. در
                      سریع‌ترین زمان ممکن پاسخگوی شما خواهیم بود.
                    </p>
                  </div>

                  {/* Direct Quick-Contact Cards */}
                  <div className="flex flex-col gap-3 pt-2">
                    {/* Telegram Card */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.08] hover:border-emerald-500/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                          <IconBrandTelegram className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-xs font-bold text-zinc-100 font-sans">
                            پیام‌رسان تلگرام
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono" dir="ltr">
                            @kaveh8778
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5" dir="ltr">
                        <button
                          type="button"
                          onClick={() => handleCopy('@kaveh8778', 'tg')}
                          aria-label="کپی آیدی تلگرام"
                          className="p-2 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-emerald-300 text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                          {copiedTg ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href="https://t.me/kaveh8778"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold font-sans transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                          <span>چت مستقیم</span>
                          <Send className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Email Card */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.08] hover:border-emerald-500/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800/60 border border-white/10 flex items-center justify-center text-zinc-300 shrink-0">
                          <Mail className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-xs font-bold text-zinc-100 font-sans">
                            ارسال ایمیل مستقیم
                          </span>
                          <span
                            className="text-[11px] text-zinc-400 font-mono truncate max-w-[150px] sm:max-w-[200px]"
                            dir="ltr"
                          >
                            {SITE_CONFIG.contact.recipientEmail}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(SITE_CONFIG.contact.recipientEmail, 'email')}
                        aria-label={
                          copiedEmail ? 'کپی شد - آدرس ایمیل' : 'کپی ایمیل - کپی آدرس ایمیل'
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-emerald-300 text-xs font-sans transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      >
                        {copiedEmail ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>کپی شد</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>کپی ایمیل</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Value Props & Trust Badges */}
                  {CONTACT_TRUST_BADGES_NODE}
                </div>

                {/* Left Column (Col 6-12): The Form Chassis */}
                <div className="lg:col-span-7">
                  <div className="relative rounded-2xl bg-gradient-to-b from-zinc-900/90 via-zinc-950/95 to-black border border-white/[0.12] border-t-white/30 p-5 sm:p-7 backdrop-blur-md md:backdrop-blur-xl shadow-[0_24px_50px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.15)] [contain:paint_layout] transform-gpu">
                    {FORM_CHASSIS_BRACKETS_NODE}

                    <div className="border-b border-white/[0.08] pb-3.5 mb-5 text-right" dir="rtl">
                      <h3 className="text-base sm:text-lg font-bold text-zinc-50 font-sans">
                        فرم ارسال مشخصات پروژه
                      </h3>
                      <p className="text-xs text-zinc-400 font-sans mt-0.5">
                        فیلدهای دارای ستاره (<span className="text-emerald-400">*</span>) الزامی
                        هستند.
                      </p>
                    </div>

                    <ContactForm />
                  </div>
                </div>
              </m.div>
            </LazyMotion>
          </ContactStateProvider>
        </div>
      </section>
    </ViewTransition>
  );
};
