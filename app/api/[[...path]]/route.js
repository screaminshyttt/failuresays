import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { isAuthed, signToken } from '@/lib/auth'
import { slugify, readingTime } from '@/lib/slug'
import { v4 as uuid } from 'uuid'
import { CATEGORY_MAP } from '@/lib/brand'

function json(data, init = {}) { return NextResponse.json(data, init) }
function bad(msg, code = 400) { return json({ error: msg }, { status: code }) }

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
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100)
      const q = { published: true }
      if (category) q.category = category
      if (tag) q.tags = tag
      if (featured === '1') q.featured = true
      const items = await posts.find(q, { projection: { content: 0 } }).sort({ publishedAt: -1, createdAt: -1 }).limit(limit).toArray()
      const clean = items.map(({ _id, ...rest }) => rest)
      return json({ articles: clean })
    }

    // ---------- Public: single article by slug ----------
    if (parts[0] === 'articles' && parts[1] && method === 'GET') {
      const slug = parts[1]
      const item = await posts.findOne({ slug, published: true })
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
      const items = await posts.find({}, { projection: { content: 0 } }).sort({ createdAt: -1 }).toArray()
      return json({ posts: items.map(({ _id, ...r }) => r) })
    }

    // ---------- Admin: create post ----------
    if (path === '/admin/posts' && method === 'POST') {
      if (!isAuthed(request)) return bad('Unauthorized', 401)
      const body = await request.json().catch(() => ({}))
      const { title, category, tags = [], coverImage = '', excerpt = '', content = '', featured = false, published = false, seo = {}, slug: providedSlug } = body
      if (!title || !category) return bad('title and category required')
      let slug = (providedSlug ? slugify(providedSlug) : slugify(title))
      // ensure unique slug
      let base = slug, i = 1
      while (await posts.findOne({ slug })) { slug = `${base}-${i++}` }
      const now = new Date().toISOString()
      const doc = {
        id: uuid(), slug, title, category, tags: Array.isArray(tags) ? tags : String(tags).split(',').map(s=>s.trim()).filter(Boolean),
        coverImage, excerpt, content, featured: !!featured, published: !!published, seo,
        readingTime: readingTime(content),
        createdAt: now, updatedAt: now, publishedAt: published ? now : null,
      }
      await posts.insertOne(doc)
      const { _id, ...rest } = doc
      return json({ post: rest })
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
        // recompute derived fields
        if (update.content !== undefined) update.readingTime = readingTime(update.content)
        if (update.slug) update.slug = slugify(update.slug)
        if (update.tags && !Array.isArray(update.tags)) update.tags = String(update.tags).split(',').map(s=>s.trim()).filter(Boolean)
        const now = new Date().toISOString()
        update.updatedAt = now
        if (update.published === true && !current.publishedAt) update.publishedAt = now
        if (update.published === false) update.publishedAt = null
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
