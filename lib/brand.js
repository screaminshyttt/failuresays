export const LOGO_MARK = 'https://customer-assets.emergentagent.com/job_business-lessons/artifacts/75ww1p3w_3.png'
export const LOGO_WORDMARK = 'https://customer-assets.emergentagent.com/job_business-lessons/artifacts/jb87b2ec_2.png'
export const LOGO_LARGE = 'https://customer-assets.emergentagent.com/job_business-lessons/artifacts/75ww1p3w_3.png'
// Nav-specific: already white-on-black, no inversion needed.
export const NAV_MARK = 'https://customer-assets.emergentagent.com/job_business-lessons/artifacts/q5bl2u38_3.png'
export const NAV_WORDMARK = 'https://customer-assets.emergentagent.com/job_business-lessons/artifacts/48mrapin_2.jpg'

export const CATEGORIES = [
  { slug: 'startup-analyses', label: 'Startup Analyses', desc: 'Deep dives into how great companies actually work.' },
  { slug: 'company-improvement-ideas', label: 'Company Improvement Ideas', desc: 'Practical, opinionated ideas to make good companies great.' },
  { slug: 'case-studies', label: 'Case Studies', desc: 'Long-form investigations of rises, falls, and pivots.' },
  { slug: 'startup-ideas', label: 'Startup Ideas', desc: 'Overlooked problems worth building a company around.' },
  { slug: 'failures-lessons', label: 'Failures & Lessons', desc: 'What died, why it died, and what it taught us.' },
  { slug: 'blog', label: 'Blog', desc: 'Essays on philosophy, psychology, and the founder mind.' },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.slug, c]))
