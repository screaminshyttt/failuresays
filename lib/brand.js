// Brand assets are served locally from /public/brand so they are never blocked
// by ad-blockers, corporate networks, or unreachable external CDNs.
export const LOGO_MARK = '/brand/logo-mark.png'
export const LOGO_WORDMARK = '/brand/logo-wordmark.png'
export const LOGO_LARGE = '/brand/logo-mark.png'
// Nav-specific: already white-on-black, no inversion needed.
export const NAV_MARK = '/brand/nav-mark.jpg'
export const NAV_WORDMARK = '/brand/nav-wordmark.jpg'
// Official brand mark uploaded by the client (used in the footer). White-on-black — do NOT invert.
export const FOOTER_MARK = '/brand/footer-mark.jpg'
export const FOOTER_WORDMARK = '/brand/footer-wordmark.jpg'

export const CATEGORIES = [
  { slug: 'startup-analyses', label: 'Startup Analyses', desc: 'Deep dives into how great companies actually work.' },
  { slug: 'company-improvement-ideas', label: 'Company Improvement Ideas', desc: 'Practical, opinionated ideas to make good companies great.' },
  { slug: 'case-studies', label: 'Case Studies', desc: 'Long-form investigations of rises, falls, and pivots.' },
  { slug: 'startup-ideas', label: 'Startup Ideas', desc: 'Overlooked problems worth building a company around.' },
  { slug: 'failures-lessons', label: 'Failures & Lessons', desc: 'What died, why it died, and what it taught us.' },
  { slug: 'blog', label: 'Blog', desc: 'Essays on philosophy, psychology, and the founder mind.' },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.slug, c]))
