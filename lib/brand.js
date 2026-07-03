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
  { slug: 'company-analyses', label: 'Company Analyses', desc: 'Deep dives into how successful companies operate and compete.' },
  { slug: 'business-strategy', label: 'Business Strategy', desc: 'Analysis of strategic decisions and competitive positioning.' },
  { slug: 'industry-research', label: 'Industry Research', desc: 'Market trends, dynamics, and sector-specific insights.' },
  { slug: 'founder-perspectives', label: 'Founder Perspectives', desc: 'Leadership lessons and founder decision-making frameworks.' },
  { slug: 'venture-capital', label: 'Venture Capital', desc: 'Investment trends, funding rounds, and VC ecosystem coverage.' },
  { slug: 'lessons-from-failure', label: 'Lessons from Failure', desc: 'What went wrong, why it happened, and what we can learn.' },
  { slug: 'blog', label: 'Blog', desc: 'Essays on business, innovation, and entrepreneurial thinking.' },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.slug, c]))
