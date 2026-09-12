import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { isAuthed, signToken } from '@/lib/auth'
import { slugify, readingTime } from '@/lib/slug'
import { v4 as uuid } from 'uuid'
import { CATEGORY_MAP } from '@/lib/brand'

// Prevent static analysis at build time — this route must run per-request
// so env vars (MONGO_URL, JWT_SECRET, ADMIN_PASSWORD) are available.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

function json(data, init = {}) { return NextResponse.json(data, init) }
function bad(msg, code = 400) { return json({ error: msg }, { status: code }) }

const DEFAULT_CATEGORIES = [
  { slug: 'startup-analyses', label: 'Startup Analyses', desc: 'Breakdowns of how startups grow, stall, or break.' },
  { slug: 'company-analyses', label: 'Company Analyses', desc: 'Deep dives into how successful companies operate and compete.' },
  { slug: 'business-strategy', label: 'Business Strategy', desc: 'Analysis of strategic decisions and competitive positioning.' },
  { slug: 'industry-research', label: 'Industry Research', desc: 'Market trends, dynamics, and sector-specific insights.' },
  { slug: 'founder-perspectives', label: 'Founder Perspectives', desc: 'Leadership lessons and founder decision-making frameworks.' },
  { slug: 'venture-capital', label: 'Venture Capital', desc: 'Investment trends, funding rounds, and VC ecosystem coverage.' },
  { slug: 'lessons-from-failure', label: 'Lessons from Failure', desc: 'What went wrong, why it happened, and what we can learn.' },
  { slug: 'blog', label: 'Blog', desc: 'Essays on business, innovation, and entrepreneurial thinking.' },
]

// Visibility filter for public reads: published, or scheduled whose time passed, or legacy published:true
function visibilityFilter() {
  const now = new Date().toISOString()
  return { $or: [
    { status: 'published' },
    { status: 'scheduled', scheduledAt: { $lte: now } },
    { status: { $exists: false }, published: true },
  ] }
}

async function ensureCategories(categories) {
  const count = await categories.countDocuments()
  if (count === 0) {
    await categories.insertMany(DEFAULT_CATEGORIES.map(c => ({ id: uuid(), ...c })))
  }
}

const DEFAULT_PAGES = {
  about: {
    slug: 'about', eyebrow: 'Our Mission', title: 'ABOUT.',
    subtitle: 'An independent editorial publication on startups, strategy, and the lessons hidden inside failure.',
    blocks: [
      { id: 'ab1', type: 'paragraph', data: { text: 'Failure Says is an independent editorial publication dedicated to startups, entrepreneurship, venture capital, technology, innovation, and modern business.' } },
      { id: 'ab2', type: 'paragraph', data: { text: 'We produce original reporting, editorial analysis, long-form features, company case studies, founder profiles, market intelligence, and data-driven insights that help readers understand the forces shaping the global startup ecosystem.' } },
      { id: 'ab3', type: 'heading', data: { label: '01 — Philosophy', text: 'Understanding a company requires more than following its milestones.', level: 'h2', align: 'center' } },
      { id: 'ab4', type: 'paragraph', data: { text: 'Behind every product launch, funding round, acquisition, or breakthrough lies a series of decisions, assumptions, and moments of uncertainty that rarely receive the attention they deserve. Those are the stories we choose to examine.' } },
      { id: 'ab5', type: 'paragraph', data: { text: 'Every article is developed through research, verification, and analysis with an emphasis on accuracy, clarity, and context — connecting individual developments to the larger patterns that shape industries.' } },
      { id: 'ab6', type: 'pullquote', data: { text: 'The future of business is written not only by the companies that succeed, but by the ideas, decisions, and lessons that shape them.', cite: '' } },
    ],
  },
  contact: {
    slug: 'contact', eyebrow: 'Say Hello', title: 'CONTACT.',
    subtitle: 'For ideas, essays, collaborations, or just a conversation about failure and what it teaches.',
    email: 'founder@failuresays.com',
    socials: [
      { label: 'Twitter', href: '#' },
      { label: 'LinkedIn', href: '#' },
      { label: 'GitHub', href: '#' },
    ],
    showForm: true,
    blocks: [],
  },
}

async function ensurePage(pages, slug) {
  let doc = await pages.findOne({ slug })
  if (!doc && DEFAULT_PAGES[slug]) {
    doc = { id: uuid(), ...DEFAULT_PAGES[slug], updatedAt: new Date().toISOString() }
    await pages.insertOne(doc)
  }
  return doc
}

// Extract plain text from structured blocks for reading-time calculation
function blocksToText(blocks) {
  if (!Array.isArray(blocks)) return ''
  return blocks.map(b => {
    const d = b?.data || {}
    return [d.text, d.title, d.label, d.caption, ...(Array.isArray(d.items) ? d.items : [])]
      .filter(Boolean).join(' ')
  }).join(' ')
}

async function handle(request, ctx) {
  const method = request.method
  const resolved = await (ctx?.params || Promise.resolve({}))
  const parts = (resolved?.path || [])
  const path = '/' + parts.join('/')
  const url = new URL(request.url)

  try {
    const db = await getDb()
    const posts = db.collection('posts')
    const messages = db.collection('messages')
    const categories = db.collection('categories')
    const pages = db.collection('pages')

    // ---------- Health ----------
    if (parts.length === 0 || path === '/') {
      return json({ ok: true, service: 'failuresays', message: 'FailureSays API' })
    }

    // ---------- Auth ----------
    if (path === '/admin/login' && method === 'POST') {
      const body = await request.json().catch(() => ({}))
      const { password } = body
      if (!password) return bad('Password required', 400)
      if (password !== process.env.ADMIN_PASSWORD) return bad('Invalid password', 401)
      const token = signToken({ role: 'admin', ts: Date.now() })
      return json({ token })
    }
    if (path === '/admin/verify' && method === 'GET') {
      const u = isAuthed(request)
      return json({ ok: !!u })
    }

    // ---------- Public: list articles ----------
    if (path === '/articles' && method === 'GET') {
      const category = url.searchParams.get('category')
      const tag = url.searchParams.get('tag')
      const featured = url.searchParams.get('featured')
      const ids = url.searchParams.get('ids')
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100)
      const q = { ...visibilityFilter() }
      if (category) q.category = category
      if (tag) q.tags = tag
      if (featured === '1') q.featured = true
      if (ids) q.id = { $in: ids.split(',').map(s => s.trim()).filter(Boolean) }
      const items = await posts.find(q, { projection: { content: 0, blocks: 0 } }).sort({ publishedAt: -1, createdAt: -1 }).limit(limit).toArray()
      const clean = items.map(({ _id, ...rest }) => rest)
      return json({ articles: clean })
    }

    // ---------- Public: categories ----------
    if (path === '/categories' && method === 'GET') {
      await ensureCategories(categories)
      const items = await categories.find({}).toArray()
      return json({ categories: items.map(({ _id, ...r }) => r) })
    }

    // ---------- Public: page content (about, contact, ...) ----------
    if (parts[0] === 'pages' && parts[1] && method === 'GET') {
      const doc = await ensurePage(pages, parts[1])
      if (!doc) return bad('Not found', 404)
      const { _id, ...rest } = doc
      return json({ page: rest })
    }

    // ---------- Admin: get / update page content ----------
    if (parts[0] === 'admin' && parts[1] === 'pages' && parts[2]) {
      if (!isAuthed(request)) return bad('Unauthorized', 401)
      const slug = parts[2]
      if (method === 'GET') {
        const doc = await ensurePage(pages, slug)
        if (!doc) return bad('Not found', 404)
        const { _id, ...rest } = doc
        return json({ page: rest })
      }
      if (method === 'PUT') {
        const body = await request.json().catch(() => ({}))
        const update = { ...body }
        delete update._id; delete update.id
        update.slug = slug
        update.updatedAt = new Date().toISOString()
        await pages.updateOne({ slug }, { $set: update }, { upsert: true })
        const doc = await pages.findOne({ slug })
        const { _id, ...rest } = doc
        return json({ page: rest })
      }
    }

    // ---------- Public: single article by slug ----------
    if (parts[0] === 'articles' && parts[1] && method === 'GET') {
      const slug = parts[1]
      const item = await posts.findOne({ slug, ...visibilityFilter() })
      if (!item) return bad('Not found', 404)
      const { _id, ...rest } = item
      return json({ article: rest })
    }

    // ---------- Public: search ----------
    if (path === '/search' && method === 'GET') {
      const q = (url.searchParams.get('q') || '').trim()
      if (!q) return json({ results: [] })
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      const items = await posts.find({
        published: true,
        $or: [{ title: rx }, { excerpt: rx }, { tags: rx }, { content: rx }],
      }, { projection: { content: 0 } }).sort({ publishedAt: -1 }).limit(20).toArray()
      const results = items.map(({ _id, category, ...rest }) => ({
        ...rest, category, categoryLabel: CATEGORY_MAP[category]?.label || category,
      }))
      return json({ results })
    }

    // ---------- Public: submit contact ----------
    if (path === '/contact' && method === 'POST') {
      const body = await request.json().catch(() => ({}))
      const { name, email, subject, message } = body
      if (!name || !email || !message) return bad('name, email, message required', 400)
      const doc = { id: uuid(), name, email, subject: subject || '', message, createdAt: new Date().toISOString(), read: false }
      await messages.insertOne(doc)
      return json({ ok: true })
    }

    // ---------- Admin: list all posts ----------
    if (path === '/admin/posts' && method === 'GET') {
      if (!isAuthed(request)) return bad('Unauthorized', 401)
      const items = await posts.find({}, { projection: { content: 0, blocks: 0 } }).sort({ createdAt: -1 }).toArray()
      return json({ posts: items.map(({ _id, ...r }) => r) })
    }

    // ---------- Admin: create post ----------
    if (path === '/admin/posts' && method === 'POST') {
      if (!isAuthed(request)) return bad('Unauthorized', 401)
      const body = await request.json().catch(() => ({}))
      const {
        title, category, tags = [], coverImage = '', coverImageAlt = '', excerpt = '', subtitle = '',
        articleLabel = '', content = '', blocks = [], featured = false, seo = {}, slug: providedSlug,
        author = {}, relatedIds = [], showToc = true, showShare = true,
        status = 'draft', scheduledAt = null, socialImage = '', canonicalUrl = '',
      } = body
      if (!title || !category) return bad('title and category required')
      let slug = (providedSlug ? slugify(providedSlug) : slugify(title))
      let base = slug, i = 1
      while (await posts.findOne({ slug })) { slug = `${base}-${i++}` }
      const now = new Date().toISOString()
      const isPub = status === 'published'
      const doc = {
        id: uuid(), slug, title, subtitle, articleLabel, category,
        tags: Array.isArray(tags) ? tags : String(tags).split(',').map(s=>s.trim()).filter(Boolean),
        coverImage, coverImageAlt, excerpt, content, blocks: Array.isArray(blocks) ? blocks : [],
        author: { name: author.name || '', photo: author.photo || '', bio: author.bio || '' },
        relatedIds: Array.isArray(relatedIds) ? relatedIds : [],
        showToc: showToc !== false, showShare: showShare !== false,
        featured: !!featured, seo: { ...seo, socialImage, canonicalUrl },
        status, scheduledAt: status === 'scheduled' ? scheduledAt : null,
        published: isPub,
        readingTime: readingTime(content + ' ' + blocksToText(blocks)),
        createdAt: now, updatedAt: now, publishedAt: isPub ? now : null,
      }
      await posts.insertOne(doc)
      const { _id, ...rest } = doc
      return json({ post: rest })
    }

    // ---------- Admin: duplicate post ----------
    if (parts[0] === 'admin' && parts[1] === 'posts' && parts[2] && parts[3] === 'duplicate' && method === 'POST') {
      if (!isAuthed(request)) return bad('Unauthorized', 401)
      const src = await posts.findOne({ id: parts[2] })
      if (!src) return bad('Not found', 404)
      const now = new Date().toISOString()
      let slug = `${src.slug}-copy`, base = slug, i = 1
      while (await posts.findOne({ slug })) { slug = `${base}-${i++}` }
      const { _id, id: _oldId, ...rest } = src
      const doc = { ...rest, id: uuid(), slug, title: `${src.title} (Copy)`, status: 'draft', published: false, publishedAt: null, scheduledAt: null, createdAt: now, updatedAt: now }
      await posts.insertOne(doc)
      const { _id: __, ...clean } = doc
      return json({ post: clean })
    }

    // ---------- Admin: get / update / delete single post ----------
    if (parts[0] === 'admin' && parts[1] === 'posts' && parts[2]) {
      if (!isAuthed(request)) return bad('Unauthorized', 401)
      const id = parts[2]
      if (method === 'GET') {
        const item = await posts.findOne({ id })
        if (!item) return bad('Not found', 404)
        const { _id, ...rest } = item
        return json({ post: rest })
      }
      if (method === 'PUT') {
        const body = await request.json().catch(() => ({}))
        const current = await posts.findOne({ id })
        if (!current) return bad('Not found', 404)
        const update = { ...body }
        delete update._id; delete update.id; delete update.createdAt
        // recompute derived fields
        if (update.content !== undefined || update.blocks !== undefined) {
          const c = update.content !== undefined ? update.content : (current.content || '')
          const b = update.blocks !== undefined ? update.blocks : (current.blocks || [])
          update.readingTime = readingTime(c + ' ' + blocksToText(b))
        }
        if (update.slug) update.slug = slugify(update.slug)
        if (update.tags && !Array.isArray(update.tags)) update.tags = String(update.tags).split(',').map(s=>s.trim()).filter(Boolean)
        const now = new Date().toISOString()
        update.updatedAt = now
        // status <-> published/publishedAt sync
        if (update.status !== undefined) {
          update.published = update.status === 'published'
          if (update.status === 'published' && !current.publishedAt) update.publishedAt = now
          if (update.status === 'draft' || update.status === 'archived') update.publishedAt = update.status === 'archived' ? current.publishedAt : null
          if (update.status !== 'scheduled') update.scheduledAt = update.scheduledAt || null
        } else if (update.published !== undefined) {
          update.status = update.published ? 'published' : 'draft'
          if (update.published === true && !current.publishedAt) update.publishedAt = now
          if (update.published === false) update.publishedAt = null
        }
        // avoid slug collision
        if (update.slug && update.slug !== current.slug) {
          const clash = await posts.findOne({ slug: update.slug, id: { $ne: id } })
          if (clash) return bad('Slug already exists', 409)
        }
        await posts.updateOne({ id }, { $set: update })
        const updated = await posts.findOne({ id })
        const { _id, ...rest } = updated
        return json({ post: rest })
      }
      if (method === 'DELETE') {
        await posts.deleteOne({ id })
        return json({ ok: true })
      }
    }

    // ---------- Admin: categories CRUD ----------
    if (path === '/admin/categories' && method === 'GET') {
      if (!isAuthed(request)) return bad('Unauthorized', 401)
      await ensureCategories(categories)
      const items = await categories.find({}).toArray()
      return json({ categories: items.map(({ _id, ...r }) => r) })
    }
    if (path === '/admin/categories' && method === 'POST') {
      if (!isAuthed(request)) return bad('Unauthorized', 401)
      const body = await request.json().catch(() => ({}))
      const { label, desc = '' } = body
      if (!label) return bad('label required')
      let slug = slugify(body.slug || label), base = slug, i = 1
      while (await categories.findOne({ slug })) { slug = `${base}-${i++}` }
      const doc = { id: uuid(), slug, label, desc }
      await categories.insertOne(doc)
      const { _id, ...rest } = doc
      return json({ category: rest })
    }
    if (parts[0] === 'admin' && parts[1] === 'categories' && parts[2]) {
      if (!isAuthed(request)) return bad('Unauthorized', 401)
      const cid = parts[2]
      if (method === 'PUT') {
        const body = await request.json().catch(() => ({}))
        const upd = {}
        if (body.label !== undefined) upd.label = body.label
        if (body.desc !== undefined) upd.desc = body.desc
        await categories.updateOne({ id: cid }, { $set: upd })
        const item = await categories.findOne({ id: cid })
        if (!item) return bad('Not found', 404)
        const { _id, ...rest } = item
        return json({ category: rest })
      }
      if (method === 'DELETE') {
        await categories.deleteOne({ id: cid })
        return json({ ok: true })
      }
    }

    // ---------- Admin: contact messages ----------
    if (path === '/admin/messages' && method === 'GET') {
      if (!isAuthed(request)) return bad('Unauthorized', 401)
      const items = await messages.find({}).sort({ createdAt: -1 }).toArray()
      return json({ messages: items.map(({ _id, ...r }) => r) })
    }

    return bad('Not found', 404)
  } catch (err) {
    console.error('API error', err)
    return json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const DELETE = handle
export const PATCH = handle
