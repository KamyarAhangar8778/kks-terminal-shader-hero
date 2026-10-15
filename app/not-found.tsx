import Link from 'next/link';
import { DirectionalTransition } from '@/components/view-transitions/ViewTransition';

export default function NotFound() {
  return (
    <DirectionalTransition>
      <main className="flex flex-col items-center justify-center min-h-screen bg-[#000000] text-zinc-200 font-sans p-4 text-center">
        <section
          aria-labelledby="not-found-title"
          className="rounded-2xl border border-white/[0.1] border-t-white/25 bg-zinc-950/90 p-8 max-w-md w-full shadow-[0_16px_40px_rgba(0,0,0,0.75)]"
          dir="rtl"
        >
          <h1 id="not-found-title" className="text-4xl font-bold text-emerald-400 font-mono mb-2">
            404
          </h1>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            صفحه موردنظر یافت نشد یا آدرس آن تغییر کرده است.
          </p>
          <Link
            href="/"
            className="inline-block py-2.5 px-5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors"
          >
            بازگشت به صفحه اصلی
          </Link>
        </section>
      </main>
    </DirectionalTransition>
  );
}
