import Link from 'next/link'
import { CATEGORIES, FOOTER_MARK } from '@/lib/brand'

export default function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-black text-paper mt-24">
      <div className="container-editorial py-20">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center justify-center overflow-hidden rounded-sm shrink-0"
                style={{ width: 40, height: 40 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={FOOTER_MARK}
                  alt="FailureSays"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </span>
              <span className="display text-2xl tracking-[0.02em] text-paper">FailureSays</span>
            </div>
            <p className="mt-8 text-paper/70 text-lg max-w-md leading-relaxed">
              A premium editorial publication for founders, operators, investors, and lifelong learners.
            </p>
            <blockquote className="mt-10 pl-4 border-l border-paper/30 text-paper/90 italic max-w-md">
              &ldquo;The harder you try to avoid failure, the longer it owns you.&rdquo;
            </blockquote>
          </div>
          <div className="md:col-span-3">
            <div className="eyebrow text-paper/60">Explore</div>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link className="hover:text-white" href="/">Home</Link></li>
              <li><Link className="hover:text-white" href="/wisdom">Wisdom</Link></li>
              <li><Link className="hover:text-white" href="/blog">Blog</Link></li>
              <li><Link className="hover:text-white" href="/about">About</Link></li>
              <li><Link className="hover:text-white" href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="md:col-span-4">
            <div className="eyebrow text-paper/60">Categories</div>
            <ul className="mt-5 space-y-3 text-sm">
              {CATEGORIES.filter(c => c.slug !== 'blog').map(c => (
                <li key={c.slug}><Link className="hover:text-white" href={`/wisdom/${c.slug}`}>{c.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-paper/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs uppercase tracking-[0.24em] text-paper/50">
          <div>&copy; {year} FailureSays. All rights reserved.</div>
          <div>Made with intent, not urgency.</div>
        </div>
      </div>
    </footer>
  )
}
