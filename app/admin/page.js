'use client'
import { useEffect, useState, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { CATEGORIES } from '@/lib/brand'
import {
  Plus, Edit3, Trash2, Eye, LogOut, Save, ChevronLeft, Copy, Archive, Send,
  ArrowUp, ArrowDown, LayoutDashboard, FileText, FileEdit, Tags, Search, Monitor, Tablet, Smartphone, Clock, X,
} from 'lucide-react'
import { LogoLockup } from '@/components/logo'
import ArticleView from '@/components/article/article-view'

const TOKEN_KEY = 'fs_admin_token'

function useAuthToken() {
  const [token, setToken] = useState(null)
  useEffect(() => { if (typeof window !== 'undefined') setToken(localStorage.getItem(TOKEN_KEY)) }, [])
  const save = (t) => { localStorage.setItem(TOKEN_KEY, t); setToken(t) }
  const clear = () => { localStorage.removeItem(TOKEN_KEY); setToken(null) }
  return { token, save, clear }
}

async function api(path, opts = {}, token) {
  const res = await fetch('/api' + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

/* ------------------------------- Block system ------------------------------- */
const BLOCK_TYPES = [
  { type: 'paragraph', label: 'Paragraph', make: () => ({ text: '' }) },
  { type: 'heading', label: 'Section heading', make: () => ({ label: '', text: '', level: 'h2', align: 'center' }) },
  { type: 'image', label: 'Image', make: () => ({ url: '', alt: '', caption: '', align: 'center' }) },
  { type: 'pullquote', label: 'Pull quote', make: () => ({ text: '', cite: '' }) },
  { type: 'keytakeaway', label: 'Key takeaway', make: () => ({ title: 'Key takeaway', items: [''] }) },
  { type: 'stat', label: 'Statistic', make: () => ({ number: '', label: '', text: '' }) },
  { type: 'list', label: 'List', make: () => ({ ordered: false, items: [''] }) },
  { type: 'table', label: 'Table', make: () => ({ header: ['', ''], rows: [['', '']] }) },
  { type: 'cta', label: 'Call to action', make: () => ({ title: '', text: '', buttonLabel: '', buttonUrl: '' }) },
  { type: 'divider', label: 'Divider', make: () => ({}) },
  { type: 'embed', label: 'Video / embed', make: () => ({ url: '' }) },
  { type: 'newsletter', label: 'Newsletter', make: () => ({ title: 'Newsletter', text: '' }) },
  { type: 'related', label: 'Related article', make: () => ({ articleId: '' }) },
  { type: 'metrics', label: 'Metrics visual', make: () => ({ metric: '', metricLabel: 'Total Revenue', changePct: '', chartTitle: 'Revenue', line: '', bars: [{ label: '', value: '' }], kpis: [{ label: '', value: '', sub: '' }], runwayLabel: 'Runway', runwayValue: '', runwayPct: '', notes: [''], bgImage: '' }) },
]
const uid = () => Math.random().toString(36).slice(2, 10)

/* ------------------------------- Root ------------------------------- */
export default function AdminPage() {
  const { token, save, clear } = useAuthToken()
  const [checked, setChecked] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    if (!token) { setChecked(true); return }
    api('/admin/verify', {}, token).then(d => { setAuthed(!!d.ok); setChecked(true) }).catch(() => { clear(); setChecked(true) })
  }, [token])

  if (!checked) return <div className="min-h-screen grid place-items-center text-gray-500">Loading admin…</div>
  if (!authed) return <Login onLogin={t => { save(t); setAuthed(true) }} />
  return <Shell token={token} onLogout={() => { clear(); setAuthed(false) }} />
}

function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(e) {
    e.preventDefault(); setLoading(true)
    try { const d = await api('/admin/login', { method: 'POST', body: JSON.stringify({ password }) }); onLogin(d.token); toast.success('Welcome back.') }
    catch (e) { toast.error(e.message) } finally { setLoading(false) }
  }
  return (
    <div className="min-h-screen grid place-items-center bg-[#0B0B0B] p-6">
      <div className="w-full max-w-sm">
        <LogoLockup invert />
        <div className="mt-8 bg-white p-8 border border-gray-200">
          <div className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Admin</div>
          <h1 className="text-2xl font-semibold mt-1">Editor login</h1>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <input autoFocus type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black" placeholder="Admin password" />
            <button disabled={loading} className="w-full bg-black text-white py-3 text-sm uppercase tracking-[0.18em] hover:bg-gray-800">{loading ? 'Verifying…' : 'Enter'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- Shell with sidebar ------------------------------- */
function Shell({ token, onLogout }) {
  const [tab, setTab] = useState('overview') // overview | articles | categories | pages
  const [editing, setEditing] = useState(null) // null | {id?}
  const [pageSlug, setPageSlug] = useState(null) // 'about' | 'contact' | null
  const [posts, setPosts] = useState([])
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([api('/admin/posts', {}, token), api('/admin/categories', {}, token)])
      setPosts(p.posts || []); setCats(c.categories || [])
    } catch (e) { toast.error(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { refresh() }, [])

  if (pageSlug) {
    return <PageEditor token={token} slug={pageSlug} onClose={() => setPageSlug(null)} />
  }
  if (editing !== null) {
    return <Editor token={token} id={editing.id} cats={cats} posts={posts} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh() }} />
  }

  const nav = [
    { key: 'overview', label: 'Overview', Icon: LayoutDashboard },
    { key: 'articles', label: 'Articles', Icon: FileText },
    { key: 'pages', label: 'Pages', Icon: FileEdit },
    { key: 'categories', label: 'Categories & Tags', Icon: Tags },
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <aside className="w-60 shrink-0 bg-[#0B0B0B] text-white min-h-screen sticky top-0 hidden md:flex flex-col">
        <div className="p-5 border-b border-white/10"><LogoLockup invert size={26} /></div>
        <nav className="p-3 flex-1">
          {nav.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key)} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded ${tab === key ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </nav>
        <button onClick={onLogout} className="m-3 flex items-center gap-2 px-3 py-2.5 text-sm text-white/60 hover:text-white"><LogOut className="w-4 h-4" /> Logout</button>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="text-lg font-semibold capitalize">{nav.find(n => n.key === tab)?.label}</div>
          <button onClick={() => setEditing({})} className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 text-sm"><Plus className="w-4 h-4" /> Create article</button>
        </header>
        <div className="p-6">
          {tab === 'overview' && <Overview posts={posts} loading={loading} onNew={() => setEditing({})} onEdit={(id) => setEditing({ id })} goArticles={() => setTab('articles')} goCats={() => setTab('categories')} />}
          {tab === 'articles' && <Articles token={token} posts={posts} cats={cats} loading={loading} onEdit={(id) => setEditing({ id })} onNew={() => setEditing({})} refresh={refresh} />}
          {tab === 'pages' && <Pages onEdit={setPageSlug} />}
          {tab === 'categories' && <Categories token={token} cats={cats} refresh={refresh} />}
        </div>
      </main>
    </div>
  )
}

/* ------------------------------- Overview ------------------------------- */
function statusOf(p) { return p.status || (p.published ? 'published' : 'draft') }
function Stat({ n, label, tone, loading }) {
  return (
    <div className="bg-white border border-gray-200 p-5">
      <div className={`text-3xl font-bold ${tone}`}>{loading ? '—' : n}</div>
      <div className="text-xs uppercase tracking-[0.18em] text-gray-500 mt-1">{label}</div>
    </div>
  )
}
function Overview({ posts, loading, onNew, goArticles, goCats, onEdit }) {
  const counts = useMemo(() => {
    const c = { published: 0, draft: 0, scheduled: 0, archived: 0 }
    posts.forEach(p => { c[statusOf(p)] = (c[statusOf(p)] || 0) + 1 })
    return c
  }, [posts])
  const recent = [...posts].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)).slice(0, 6)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat n={counts.published} label="Published" tone="text-black" loading={loading} />
        <Stat n={counts.draft} label="Drafts" tone="text-gray-500" loading={loading} />
        <Stat n={counts.scheduled} label="Scheduled" tone="text-black" loading={loading} />
        <Stat n={counts.archived} label="Archived" tone="text-gray-400" loading={loading} />
      </div>
      <div className="flex flex-wrap gap-3">
        <button onClick={onNew} className="inline-flex items-center gap-2 bg-black text-white px-4 py-2.5 text-sm"><Plus className="w-4 h-4" /> Create article</button>
        <button onClick={goArticles} className="inline-flex items-center gap-2 border border-gray-300 bg-white px-4 py-2.5 text-sm"><FileText className="w-4 h-4" /> Manage articles</button>
        <button onClick={goCats} className="inline-flex items-center gap-2 border border-gray-300 bg-white px-4 py-2.5 text-sm"><Tags className="w-4 h-4" /> Categories</button>
      </div>
      <div className="bg-white border border-gray-200">
        <div className="px-5 py-3 border-b border-gray-200 text-xs uppercase tracking-[0.18em] text-gray-500">Recent edits</div>
        {recent.length === 0 ? <div className="p-8 text-center text-gray-400 text-sm">No articles yet.</div> : recent.map(p => (
          <button key={p.id} onClick={() => onEdit(p.id)} className="w-full flex items-center justify-between px-5 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 text-left">
            <div><div className="font-medium text-sm">{p.title}</div><div className="text-xs text-gray-400">/{p.slug}</div></div>
            <StatusPill status={statusOf(p)} />
          </button>
        ))}
      </div>
    </div>
  )
}

function StatusPill({ status }) {
  const map = { published: 'bg-lime text-black', scheduled: 'bg-blue-100 text-blue-700', draft: 'bg-gray-100 text-gray-600', archived: 'bg-gray-200 text-gray-500' }
  return <span className={`text-[10px] uppercase tracking-[0.14em] px-2 py-1 ${map[status] || map.draft}`}>{status}</span>
}

/* ------------------------------- Articles list ------------------------------- */
function Articles({ token, posts, cats, loading, onEdit, onNew, refresh }) {
  const [q, setQ] = useState('')
  const [fStatus, setFStatus] = useState('all')
  const [fCat, setFCat] = useState('all')
  const catList = cats.length ? cats : CATEGORIES

  const filtered = useMemo(() => posts.filter(p => {
    if (fStatus !== 'all' && statusOf(p) !== fStatus) return false
    if (fCat !== 'all' && p.category !== fCat) return false
    if (q) { const s = (p.title + ' ' + p.slug + ' ' + (p.author?.name || '')).toLowerCase(); if (!s.includes(q.toLowerCase())) return false }
    return true
  }), [posts, q, fStatus, fCat])

  const act = async (fn, msg) => { try { await fn(); toast.success(msg); refresh() } catch (e) { toast.error(e.message) } }
  const setStatus = (p, status) => act(() => api(`/admin/posts/${p.id}`, { method: 'PUT', body: JSON.stringify({ status }) }, token), `Marked ${status}`)
  const duplicate = (p) => act(() => api(`/admin/posts/${p.id}/duplicate`, { method: 'POST' }, token), 'Duplicated')
  const del = (p) => { if (confirm('Delete permanently?')) act(() => api(`/admin/posts/${p.id}`, { method: 'DELETE' }, token), 'Deleted') }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 border border-gray-300 bg-white px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search articles…" className="flex-1 outline-none text-sm" />
        </div>
        <select value={fStatus} onChange={e => setFStatus(e.target.value)} className="border border-gray-300 bg-white px-3 py-2 text-sm">
          {['all', 'draft', 'scheduled', 'published', 'archived'].map(s => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>)}
        </select>
        <select value={fCat} onChange={e => setFCat(e.target.value)} className="border border-gray-300 bg-white px-3 py-2 text-sm">
          <option value="all">All categories</option>
          {catList.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-200">
        {loading ? <div className="p-8 text-center text-gray-400">Loading…</div> :
          filtered.length === 0 ? <div className="p-10 text-center text-gray-400 text-sm">No articles. <button onClick={onNew} className="underline">Create one</button>.</div> :
            filtered.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{p.title}</div>
                  <div className="text-xs text-gray-400">/{p.slug} · {catList.find(c => c.slug === p.category)?.label || p.category} · {p.readingTime}m{p.author?.name ? ` · ${p.author.name}` : ''}</div>
                </div>
                <StatusPill status={statusOf(p)} />
                <div className="flex items-center gap-1 text-gray-500">
                  {statusOf(p) === 'published' && <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:text-black" title="View"><Eye className="w-4 h-4" /></a>}
                  <button onClick={() => onEdit(p.id)} className="p-1.5 hover:text-black" title="Edit"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => duplicate(p)} className="p-1.5 hover:text-black" title="Duplicate"><Copy className="w-4 h-4" /></button>
                  {statusOf(p) !== 'published' ? <button onClick={() => setStatus(p, 'published')} className="p-1.5 hover:text-black" title="Publish"><Send className="w-4 h-4" /></button>
                    : <button onClick={() => setStatus(p, 'draft')} className="p-1.5 hover:text-black" title="Unpublish"><ChevronLeft className="w-4 h-4" /></button>}
                  {statusOf(p) !== 'archived' && <button onClick={() => setStatus(p, 'archived')} className="p-1.5 hover:text-black" title="Archive"><Archive className="w-4 h-4" /></button>}
                  <button onClick={() => del(p)} className="p-1.5 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}

/* ------------------------------- Categories ------------------------------- */
function Categories({ token, cats, refresh }) {
  const [label, setLabel] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editLabel, setEditLabel] = useState('')
  const add = async () => { if (!label.trim()) return; try { await api('/admin/categories', { method: 'POST', body: JSON.stringify({ label }) }, token); setLabel(''); toast.success('Added'); refresh() } catch (e) { toast.error(e.message) } }
  const saveEdit = async (c) => { try { await api(`/admin/categories/${c.id}`, { method: 'PUT', body: JSON.stringify({ label: editLabel }) }, token); setEditingId(null); toast.success('Saved'); refresh() } catch (e) { toast.error(e.message) } }
  const del = async (c) => { if (!confirm('Delete category?')) return; try { await api(`/admin/categories/${c.id}`, { method: 'DELETE' }, token); toast.success('Deleted'); refresh() } catch (e) { toast.error(e.message) } }
  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex gap-2">
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="New category name" className="flex-1 border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-black text-sm" />
        <button onClick={add} className="bg-black text-white px-4 text-sm">Add</button>
      </div>
      <div className="bg-white border border-gray-200">
        {cats.map(c => (
          <div key={c.id || c.slug} className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 last:border-0">
            {editingId === c.id ? (
              <><input value={editLabel} onChange={e => setEditLabel(e.target.value)} className="flex-1 border border-gray-300 px-3 py-1.5 text-sm" />
                <button onClick={() => saveEdit(c)} className="text-sm text-black font-medium">Save</button>
                <button onClick={() => setEditingId(null)} className="text-sm text-gray-400">Cancel</button></>
            ) : (
              <><div className="flex-1"><div className="font-medium text-sm">{c.label}</div><div className="text-xs text-gray-400">/{c.slug}</div></div>
                <button onClick={() => { setEditingId(c.id); setEditLabel(c.label) }} className="p-1.5 text-gray-500 hover:text-black"><Edit3 className="w-4 h-4" /></button>
                {c.id && <button onClick={() => del(c)} className="p-1.5 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}</>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">Tags are added per-article in the article editor.</p>
    </div>
  )
}

/* ------------------------------- Pages (About / Contact) ------------------------------- */
const PAGE_DEFS = [
  { slug: 'about', name: 'About', desc: 'Hero + editorial content blocks.' },
  { slug: 'contact', name: 'Contact', desc: 'Hero, email, socials, contact form + blocks.' },
]
function Pages({ onEdit }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
      {PAGE_DEFS.map(p => (
        <div key={p.slug} className="bg-white border border-gray-200 p-6">
          <div className="text-lg font-semibold">{p.name} page</div>
          <div className="text-sm text-gray-400 mt-1">{p.desc}</div>
          <div className="mt-5 flex gap-2">
            <button onClick={() => onEdit(p.slug)} className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 text-sm"><Edit3 className="w-4 h-4" /> Edit</button>
            <a href={`/${p.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-gray-300 px-4 py-2 text-sm"><Eye className="w-4 h-4" /> View</a>
          </div>
        </div>
      ))}
    </div>
  )
}

function PageEditor({ token, slug, onClose }) {
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const isContact = slug === 'contact'

  useEffect(() => {
    api(`/admin/pages/${slug}`, {}, token).then(d => setForm({ eyebrow: '', title: '', subtitle: '', email: '', socials: [], showForm: true, blocks: [], ...d.page })).catch(e => toast.error(e.message))
  }, [slug])

  useEffect(() => {
    const h = (e) => { if (dirty) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  if (!form) return <div className="min-h-screen grid place-items-center text-gray-500">Loading…</div>
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setDirty(true) }

  const addBlock = (type) => { const def = BLOCK_TYPES.find(b => b.type === type); set('blocks', [...form.blocks, { id: uid(), type, data: def.make() }]) }
  const updBlock = (bid, data) => set('blocks', form.blocks.map(b => b.id === bid ? { ...b, data } : b))
  const moveBlock = (i, dir) => { const arr = [...form.blocks]; const j = i + dir; if (j < 0 || j >= arr.length) return;[arr[i], arr[j]] = [arr[j], arr[i]]; set('blocks', arr) }
  const dupBlock = (i) => { const arr = [...form.blocks]; arr.splice(i + 1, 0, { ...arr[i], id: uid() }); set('blocks', arr) }
  const delBlock = (bid) => set('blocks', form.blocks.filter(b => b.id !== bid))

  const socials = form.socials || []
  const setSocial = (i, k, v) => { const a = socials.map(x => ({ ...x })); a[i][k] = v; set('socials', a) }

  async function save() {
    setSaving(true)
    try { await api(`/admin/pages/${slug}`, { method: 'PUT', body: JSON.stringify(form) }, token); setDirty(false); toast.success('Page saved.') }
    catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => { if (!dirty || confirm('Discard unsaved changes?')) onClose() }} className="p-2 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5" /></button>
          <div><div className="font-semibold capitalize">{slug} page</div>{dirty && <div className="text-xs text-amber-600">Unsaved changes</div>}</div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/${slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-gray-300 bg-white px-3 py-2 text-sm"><Eye className="w-4 h-4" /> View</a>
          <button disabled={saving} onClick={save} className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 text-sm"><Save className="w-4 h-4" /> Save</button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_360px]">
        <div className="p-4 md:p-8 max-w-3xl w-full mx-auto">
          <div className="text-[11px] uppercase tracking-[0.14em] text-gray-500 mb-2">Content blocks</div>
          <div className="space-y-3">
            {form.blocks.map((b, i) => (
              <BlockCard key={b.id} block={b} index={i} total={form.blocks.length} posts={[]}
                onChange={(data) => updBlock(b.id, data)} onMove={(dir) => moveBlock(i, dir)} onDup={() => dupBlock(i)} onDel={() => delBlock(b.id)} />
            ))}
          </div>
          <AddBlock onAdd={addBlock} />
        </div>

        <aside className="border-l border-gray-200 bg-white p-5 space-y-4 lg:h-[calc(100vh-57px)] lg:overflow-y-auto lg:sticky lg:top-[57px]">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Page hero</div>
          <Field label="Eyebrow label"><input value={form.eyebrow} onChange={e => set('eyebrow', e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" /></Field>
          <Field label="Title"><input value={form.title} onChange={e => set('title', e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" /></Field>
          <Field label="Subtitle"><textarea rows={3} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" /></Field>

          {isContact && (
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact details</div>
              <Field label="Email"><input value={form.email} onChange={e => set('email', e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" /></Field>
              <Toggle label="Show contact form" v={form.showForm} on={() => set('showForm', !form.showForm)} />
              <div>
                <span className="text-xs font-medium text-gray-500 block mb-1.5">Social links</span>
                {socials.map((s, i) => (
                  <div key={i} className="flex gap-1 mb-1">
                    <input value={s.label} onChange={e => setSocial(i, 'label', e.target.value)} placeholder="Label" className="w-24 border border-gray-300 px-2 py-1.5 text-sm" />
                    <input value={s.href} onChange={e => setSocial(i, 'href', e.target.value)} placeholder="URL" className="flex-1 border border-gray-300 px-2 py-1.5 text-sm" />
                    <button onClick={() => set('socials', socials.filter((_, x) => x !== i))} className="px-1 text-gray-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => set('socials', [...socials, { label: '', href: '' }])} className="text-xs text-gray-500 hover:text-black">+ Add social link</button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

/* ------------------------------- Editor ------------------------------- */
const EMPTY = {
  title: '', slug: '', category: 'startup-analyses', articleLabel: '', subtitle: '', tags: '',
  author: { name: '', photo: '', bio: '' }, coverImage: '', coverImageAlt: '',
  seo: { title: '', description: '', socialImage: '', canonicalUrl: '' },
  relatedIds: [], featured: false, showToc: true, showShare: true,
  status: 'draft', scheduledAt: '', blocks: [],
}

function Editor({ token, id, cats, posts, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [preview, setPreview] = useState(false)
  const [device, setDevice] = useState('desktop')
  const [side, setSide] = useState('content') // content | settings | seo
  const catList = cats.length ? cats : CATEGORIES
  const savedId = useRef(id || null)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    api(`/admin/posts/${id}`, {}, token).then(d => {
      const p = d.post
      setForm({ ...EMPTY, ...p, tags: (p.tags || []).join(', '), author: { ...EMPTY.author, ...(p.author || {}) }, seo: { ...EMPTY.seo, ...(p.seo || {}) }, scheduledAt: p.scheduledAt ? p.scheduledAt.slice(0, 16) : '', blocks: p.blocks || [] })
      setLoading(false)
    }).catch(e => { toast.error(e.message); setLoading(false) })
  }, [id])

  // unsaved changes warning
  useEffect(() => {
    const h = (e) => { if (dirty) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setDirty(true) }
  const setAuthor = (k, v) => { setForm(f => ({ ...f, author: { ...f.author, [k]: v } })); setDirty(true) }
  const setSeo = (k, v) => { setForm(f => ({ ...f, seo: { ...f.seo, [k]: v } })); setDirty(true) }

  // blocks ops
  const addBlock = (type) => { const def = BLOCK_TYPES.find(b => b.type === type); set('blocks', [...form.blocks, { id: uid(), type, data: def.make() }]) }
  const updBlock = (bid, data) => set('blocks', form.blocks.map(b => b.id === bid ? { ...b, data } : b))
  const moveBlock = (i, dir) => { const arr = [...form.blocks]; const j = i + dir; if (j < 0 || j >= arr.length) return;[arr[i], arr[j]] = [arr[j], arr[i]]; set('blocks', arr) }
  const dupBlock = (i) => { const arr = [...form.blocks]; arr.splice(i + 1, 0, { ...arr[i], id: uid() }); set('blocks', arr) }
  const delBlock = (bid) => set('blocks', form.blocks.filter(b => b.id !== bid))

  function payload(overrideStatus) {
    return {
      ...form,
      tags: String(form.tags).split(',').map(s => s.trim()).filter(Boolean),
      status: overrideStatus || form.status,
      scheduledAt: (overrideStatus || form.status) === 'scheduled' && form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
    }
  }

  async function persist(status, closeAfter = false) {
    if (!form.title.trim()) { toast.error('Title is required'); setSide('settings'); return }
    if (!form.category) { toast.error('Category is required'); return }
    if (status === 'published' && form.blocks.length === 0 && !form.content) { toast.error('Add some content before publishing'); return }
    if (status === 'scheduled' && !form.scheduledAt) { toast.error('Pick a schedule date'); setSide('settings'); return }
    setSaving(true)
    try {
      const body = payload(status)
      let res
      if (savedId.current) res = await api(`/admin/posts/${savedId.current}`, { method: 'PUT', body: JSON.stringify(body) }, token)
      else res = await api('/admin/posts', { method: 'POST', body: JSON.stringify(body) }, token)
      savedId.current = res.post.id
      setForm(f => ({ ...f, status: res.post.status, slug: res.post.slug }))
      setDirty(false)
      toast.success(status === 'published' ? 'Published' : status === 'scheduled' ? 'Scheduled' : 'Saved')
      if (closeAfter) onSaved()
    } catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }

  if (loading) return <div className="min-h-screen grid place-items-center text-gray-500">Loading…</div>

  const previewArticle = {
    ...form, id: savedId.current || 'preview', publishedAt: form.status === 'published' ? new Date().toISOString() : null,
    readingTime: Math.max(1, Math.round((form.blocks.map(b => Object.values(b.data || {}).join(' ')).join(' ').split(/\s+/).length) / 220)),
    tags: String(form.tags).split(',').map(s => s.trim()).filter(Boolean),
  }
  const dw = device === 'mobile' ? 390 : device === 'tablet' ? 768 : 1280

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => { if (!dirty || confirm('Discard unsaved changes?')) onClose() }} className="p-2 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5" /></button>
          <div className="min-w-0">
            <div className="font-semibold truncate max-w-[40vw]">{form.title || 'Untitled article'}</div>
            <div className="text-xs text-gray-400 flex items-center gap-2"><StatusPill status={form.status} />{dirty && <span className="text-amber-600">Unsaved</span>}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreview(p => !p)} className={`inline-flex items-center gap-2 border px-3 py-2 text-sm ${preview ? 'bg-black text-white border-black' : 'border-gray-300 bg-white'}`}><Eye className="w-4 h-4" /> Preview</button>
          <button disabled={saving} onClick={() => persist('draft')} className="inline-flex items-center gap-2 border border-gray-300 bg-white px-3 py-2 text-sm"><Save className="w-4 h-4" /> Save draft</button>
          <button disabled={saving} onClick={() => persist('published', true)} className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 text-sm"><Send className="w-4 h-4" /> Publish</button>
        </div>
      </header>

      {preview ? (
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]].map(([d, Icon]) => (
              <button key={d} onClick={() => setDevice(d)} className={`p-2 border ${device === d ? 'bg-black text-white border-black' : 'border-gray-300 bg-white'}`}><Icon className="w-4 h-4" /></button>
            ))}
          </div>
          <div className="mx-auto bg-paper border border-gray-300 overflow-hidden" style={{ width: dw, maxWidth: '100%' }}>
            <div style={{ transformOrigin: 'top center' }}>
              <ArticleView article={previewArticle} related={[]} />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px]">
          {/* CONTENT / BLOCKS */}
          <div className="p-4 md:p-8 max-w-3xl w-full mx-auto">
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Article title" className="w-full text-3xl font-bold outline-none bg-transparent placeholder:text-gray-300" />
            <input value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Short summary / deck" className="w-full mt-3 text-lg text-gray-600 outline-none bg-transparent placeholder:text-gray-300" />

            <div className="mt-6 space-y-3">
              {form.blocks.map((b, i) => (
                <BlockCard key={b.id} block={b} index={i} total={form.blocks.length} posts={posts}
                  onChange={(data) => updBlock(b.id, data)} onMove={(dir) => moveBlock(i, dir)} onDup={() => dupBlock(i)} onDel={() => delBlock(b.id)} />
              ))}
            </div>

            <AddBlock onAdd={addBlock} />
          </div>

          {/* SETTINGS SIDEBAR */}
          <aside className="border-l border-gray-200 bg-white p-5 space-y-5 lg:h-[calc(100vh-57px)] lg:overflow-y-auto lg:sticky lg:top-[57px]">
            <div className="flex gap-1 text-xs border-b border-gray-200">
              {['content', 'settings', 'seo'].map(s => <button key={s} onClick={() => setSide(s)} className={`px-3 py-2 capitalize ${side === s ? 'border-b-2 border-black font-medium' : 'text-gray-500'}`}>{s}</button>)}
            </div>

            {side === 'content' && (
              <div className="space-y-4">
                <Field label="Category *"><select value={form.category} onChange={e => set('category', e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm">{catList.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}</select></Field>
                <Field label="Article label (e.g. 01 — CUSTOMER TRUST)"><input value={form.articleLabel} onChange={e => set('articleLabel', e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" /></Field>
                <Field label="Slug"><input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto from title" className="w-full border border-gray-300 px-3 py-2 text-sm" /></Field>
                <Field label="Tags (comma separated)"><input value={form.tags} onChange={e => set('tags', e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" /></Field>
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Author</div>
                  <input value={form.author.name} onChange={e => setAuthor('name', e.target.value)} placeholder="Name" className="w-full border border-gray-300 px-3 py-2 text-sm mb-2" />
                  <input value={form.author.photo} onChange={e => setAuthor('photo', e.target.value)} placeholder="Photo URL" className="w-full border border-gray-300 px-3 py-2 text-sm mb-2" />
                  <textarea value={form.author.bio} onChange={e => setAuthor('bio', e.target.value)} placeholder="Bio" rows={2} className="w-full border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <Field label="Featured image URL"><input value={form.coverImage} onChange={e => set('coverImage', e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" /></Field>
                <Field label="Image alt text"><input value={form.coverImageAlt} onChange={e => set('coverImageAlt', e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" /></Field>
                <Toggle label="Featured article" v={form.featured} on={() => set('featured', !form.featured)} />
                <Toggle label="Show table of contents" v={form.showToc} on={() => set('showToc', !form.showToc)} />
                <Toggle label="Show share buttons" v={form.showShare} on={() => set('showShare', !form.showShare)} />
              </div>
            )}

            {side === 'settings' && (
              <div className="space-y-4">
                <Field label="Status">
                  <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm">
                    {['draft', 'scheduled', 'published', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                {form.status === 'scheduled' && (
                  <Field label="Publish at"><input type="datetime-local" value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" /></Field>
                )}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => persist('scheduled')} className="inline-flex items-center gap-1.5 border border-gray-300 px-3 py-2 text-sm"><Clock className="w-3.5 h-3.5" /> Schedule</button>
                  <button onClick={() => persist('archived')} className="inline-flex items-center gap-1.5 border border-gray-300 px-3 py-2 text-sm"><Archive className="w-3.5 h-3.5" /> Archive</button>
                </div>
                <Field label="Related articles">
                  <div className="border border-gray-300 max-h-52 overflow-y-auto">
                    {posts.filter(p => p.id !== savedId.current).map(p => {
                      const on = form.relatedIds.includes(p.id)
                      return <label key={p.id} className="flex items-center gap-2 px-3 py-2 text-sm border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" checked={on} onChange={() => set('relatedIds', on ? form.relatedIds.filter(x => x !== p.id) : [...form.relatedIds, p.id])} />
                        <span className="truncate">{p.title}</span></label>
                    })}
                    {posts.length === 0 && <div className="px-3 py-4 text-xs text-gray-400">No other articles yet.</div>}
                  </div>
                </Field>
              </div>
            )}

            {side === 'seo' && (
              <div className="space-y-4">
                <Field label="SEO title"><input value={form.seo.title} onChange={e => setSeo('title', e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" /></Field>
                <Field label="SEO description"><textarea rows={3} value={form.seo.description} onChange={e => setSeo('description', e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" /></Field>
                <Field label="Social sharing image URL"><input value={form.seo.socialImage} onChange={e => setSeo('socialImage', e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" /></Field>
                <Field label="Canonical URL"><input value={form.seo.canonicalUrl} onChange={e => setSeo('canonicalUrl', e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" /></Field>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }) { return <label className="block"><span className="text-xs font-medium text-gray-500 block mb-1.5">{label}</span>{children}</label> }
function Toggle({ label, v, on }) {
  return <button onClick={on} className="w-full flex items-center justify-between text-sm py-1"><span>{label}</span><span className={`w-9 h-5 rounded-full relative transition-colors ${v ? 'bg-lime' : 'bg-gray-300'}`}><span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${v ? 'left-[18px]' : 'left-0.5'}`} /></span></button>
}

/* ------------------------------- Block edit cards ------------------------------- */
function AddBlock({ onAdd }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-4">
      <button onClick={() => setOpen(o => !o)} className="w-full border-2 border-dashed border-gray-300 py-3 text-sm text-gray-500 hover:border-black hover:text-black inline-flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add block</button>
      {open && (
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white border border-gray-200 p-3">
          {BLOCK_TYPES.map(b => <button key={b.type} onClick={() => { onAdd(b.type); setOpen(false) }} className="text-left text-sm px-3 py-2 border border-gray-200 hover:border-black hover:bg-gray-50">{b.label}</button>)}
        </div>
      )}
    </div>
  )
}

function BlockCard({ block, index, total, posts, onChange, onMove, onDup, onDel }) {
  const d = block.data || {}
  const meta = BLOCK_TYPES.find(b => b.type === block.type)
  const arr = (key, def = '') => (Array.isArray(d[key]) ? d[key] : [])
  const setArr = (key, i, val) => { const a = [...arr(key)]; a[i] = val; onChange({ ...d, [key]: a }) }
  const addItem = (key, val = '') => onChange({ ...d, [key]: [...arr(key), val] })
  const delItem = (key, i) => onChange({ ...d, [key]: arr(key).filter((_, x) => x !== i) })

  return (
    <div className="border border-gray-200 bg-white">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200">
        <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">{meta?.label}</span>
        <div className="flex items-center gap-0.5 text-gray-400">
          <button disabled={index === 0} onClick={() => onMove(-1)} className="p-1 hover:text-black disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
          <button disabled={index === total - 1} onClick={() => onMove(1)} className="p-1 hover:text-black disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
          <button onClick={onDup} className="p-1 hover:text-black"><Copy className="w-3.5 h-3.5" /></button>
          <button onClick={onDel} className="p-1 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {block.type === 'paragraph' && <textarea value={d.text} onChange={e => onChange({ ...d, text: e.target.value })} rows={4} placeholder="Write paragraph… (supports **bold**, *italic*, [link](url))" className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black" />}
        {block.type === 'heading' && (<>
          <input value={d.label} onChange={e => onChange({ ...d, label: e.target.value })} placeholder="Eyebrow label (e.g. 01 — CUSTOMER TRUST)" className="w-full border border-gray-200 px-3 py-2 text-sm" />
          <input value={d.text} onChange={e => onChange({ ...d, text: e.target.value })} placeholder="Heading text" className="w-full border border-gray-200 px-3 py-2 text-base font-semibold" />
          <div className="flex gap-2">
            <select value={d.level} onChange={e => onChange({ ...d, level: e.target.value })} className="border border-gray-200 px-2 py-1.5 text-sm"><option value="h2">H2</option><option value="h3">H3</option><option value="h4">H4</option></select>
            <select value={d.align} onChange={e => onChange({ ...d, align: e.target.value })} className="border border-gray-200 px-2 py-1.5 text-sm"><option value="center">Centered</option><option value="left">Left</option></select>
          </div>
        </>)}
        {block.type === 'image' && (<>
          <input value={d.url} onChange={e => onChange({ ...d, url: e.target.value })} placeholder="Image URL" className="w-full border border-gray-200 px-3 py-2 text-sm" />
          <input value={d.alt} onChange={e => onChange({ ...d, alt: e.target.value })} placeholder="Alt text" className="w-full border border-gray-200 px-3 py-2 text-sm" />
          <input value={d.caption} onChange={e => onChange({ ...d, caption: e.target.value })} placeholder="Caption (optional)" className="w-full border border-gray-200 px-3 py-2 text-sm" />
        </>)}
        {block.type === 'pullquote' && (<>
          <textarea value={d.text} onChange={e => onChange({ ...d, text: e.target.value })} rows={2} placeholder="Quote text" className="w-full border border-gray-200 px-3 py-2 text-sm" />
          <input value={d.cite} onChange={e => onChange({ ...d, cite: e.target.value })} placeholder="Attribution (optional)" className="w-full border border-gray-200 px-3 py-2 text-sm" />
        </>)}
        {block.type === 'stat' && (<>
          <input value={d.number} onChange={e => onChange({ ...d, number: e.target.value })} placeholder="71%" className="w-full border border-gray-200 px-3 py-2 text-sm" />
          <input value={d.label} onChange={e => onChange({ ...d, label: e.target.value })} placeholder="Label" className="w-full border border-gray-200 px-3 py-2 text-sm" />
          <input value={d.text} onChange={e => onChange({ ...d, text: e.target.value })} placeholder="Supporting insight" className="w-full border border-gray-200 px-3 py-2 text-sm" />
        </>)}
        {(block.type === 'keytakeaway' || block.type === 'list') && (<>
          {block.type === 'keytakeaway' && <input value={d.title} onChange={e => onChange({ ...d, title: e.target.value })} placeholder="Title" className="w-full border border-gray-200 px-3 py-2 text-sm" />}
          {block.type === 'list' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={d.ordered} onChange={e => onChange({ ...d, ordered: e.target.checked })} /> Numbered</label>}
          {arr('items').map((it, i) => <div key={i} className="flex gap-1"><input value={it} onChange={e => setArr('items', i, e.target.value)} placeholder={`Item ${i + 1}`} className="flex-1 border border-gray-200 px-3 py-1.5 text-sm" /><button onClick={() => delItem('items', i)} className="px-2 text-gray-400 hover:text-red-600"><X className="w-4 h-4" /></button></div>)}
          <button onClick={() => addItem('items')} className="text-xs text-gray-500 hover:text-black">+ Add item</button>
        </>)}
        {block.type === 'table' && <TableEditor d={d} onChange={onChange} />}
        {block.type === 'cta' && (<>
          <input value={d.title} onChange={e => onChange({ ...d, title: e.target.value })} placeholder="Title" className="w-full border border-gray-200 px-3 py-2 text-sm" />
          <input value={d.text} onChange={e => onChange({ ...d, text: e.target.value })} placeholder="Text" className="w-full border border-gray-200 px-3 py-2 text-sm" />
          <div className="flex gap-2"><input value={d.buttonLabel} onChange={e => onChange({ ...d, buttonLabel: e.target.value })} placeholder="Button label" className="flex-1 border border-gray-200 px-3 py-2 text-sm" /><input value={d.buttonUrl} onChange={e => onChange({ ...d, buttonUrl: e.target.value })} placeholder="Button URL" className="flex-1 border border-gray-200 px-3 py-2 text-sm" /></div>
        </>)}
        {block.type === 'embed' && <input value={d.url} onChange={e => onChange({ ...d, url: e.target.value })} placeholder="YouTube / video URL" className="w-full border border-gray-200 px-3 py-2 text-sm" />}
        {block.type === 'newsletter' && (<>
          <input value={d.title} onChange={e => onChange({ ...d, title: e.target.value })} placeholder="Title" className="w-full border border-gray-200 px-3 py-2 text-sm" />
          <input value={d.text} onChange={e => onChange({ ...d, text: e.target.value })} placeholder="Text" className="w-full border border-gray-200 px-3 py-2 text-sm" />
        </>)}
        {block.type === 'divider' && <div className="text-xs text-gray-400 text-center py-1">— divider —</div>}
        {block.type === 'related' && (
          <select value={d.articleId} onChange={e => onChange({ ...d, articleId: e.target.value })} className="w-full border border-gray-200 px-3 py-2 text-sm">
            <option value="">Select an article…</option>
            {posts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        )}
        {block.type === 'metrics' && <MetricsEditor d={d} onChange={onChange} />}
      </div>
    </div>
  )
}

function TableEditor({ d, onChange }) {
  const header = d.header || []
  const rows = d.rows || []
  const setHeader = (i, v) => { const h = [...header]; h[i] = v; onChange({ ...d, header: h }) }
  const setCell = (r, c, v) => { const rr = rows.map(x => [...x]); rr[r][c] = v; onChange({ ...d, rows: rr }) }
  const addCol = () => onChange({ ...d, header: [...header, ''], rows: rows.map(r => [...r, '']) })
  const addRow = () => onChange({ ...d, rows: [...rows, header.map(() => '')] })
  return (
    <div className="space-y-1">
      <div className="flex gap-1">{header.map((h, i) => <input key={i} value={h} onChange={e => setHeader(i, e.target.value)} placeholder={`Col ${i + 1}`} className="flex-1 border border-gray-300 px-2 py-1 text-xs font-semibold bg-gray-50" />)}</div>
      {rows.map((row, r) => <div key={r} className="flex gap-1">{row.map((c, ci) => <input key={ci} value={c} onChange={e => setCell(r, ci, e.target.value)} className="flex-1 border border-gray-200 px-2 py-1 text-xs" />)}</div>)}
      <div className="flex gap-2 pt-1"><button onClick={addCol} className="text-xs text-gray-500 hover:text-black">+ Column</button><button onClick={addRow} className="text-xs text-gray-500 hover:text-black">+ Row</button></div>
    </div>
  )
}

function MetricsEditor({ d, onChange }) {
  const set = (k, v) => onChange({ ...d, [k]: v })
  const kpis = d.kpis || []
  const bars = d.bars || []
  const notes = d.notes || []
  const setKpi = (i, k, v) => { const a = kpis.map(x => ({ ...x })); a[i][k] = v; set('kpis', a) }
  const setBar = (i, k, v) => { const a = bars.map(x => ({ ...x })); a[i][k] = v; set('bars', a) }
  return (
    <div className="space-y-2 text-sm">
      <div className="flex gap-2"><input value={d.metric} onChange={e => set('metric', e.target.value)} placeholder="$482K" className="flex-1 border border-gray-200 px-2 py-1.5" /><input value={d.metricLabel} onChange={e => set('metricLabel', e.target.value)} placeholder="Total Revenue" className="flex-1 border border-gray-200 px-2 py-1.5" /></div>
      <div className="flex gap-2"><input value={d.changePct} onChange={e => set('changePct', e.target.value)} placeholder="+24% or -8%" className="flex-1 border border-gray-200 px-2 py-1.5" /><input value={d.chartTitle} onChange={e => set('chartTitle', e.target.value)} placeholder="Chart title" className="flex-1 border border-gray-200 px-2 py-1.5" /></div>
      <input value={d.line} onChange={e => set('line', e.target.value.split(',').map(s => s.trim()))} placeholder="Line chart values: 10, 22, 18, 40, 55" className="w-full border border-gray-200 px-2 py-1.5" />
      <div className="pt-1 text-xs font-semibold text-gray-500">Bars</div>
      {bars.map((b, i) => <div key={i} className="flex gap-1"><input value={b.label} onChange={e => setBar(i, 'label', e.target.value)} placeholder="Label" className="flex-1 border border-gray-200 px-2 py-1" /><input value={b.value} onChange={e => setBar(i, 'value', e.target.value)} placeholder="Value" className="w-20 border border-gray-200 px-2 py-1" /><button onClick={() => set('bars', bars.filter((_, x) => x !== i))} className="px-1 text-gray-400"><X className="w-4 h-4" /></button></div>)}
      <button onClick={() => set('bars', [...bars, { label: '', value: '' }])} className="text-xs text-gray-500 hover:text-black">+ Bar</button>
      <div className="pt-1 text-xs font-semibold text-gray-500">KPI cards</div>
      {kpis.map((k, i) => <div key={i} className="flex gap-1"><input value={k.label} onChange={e => setKpi(i, 'label', e.target.value)} placeholder="Label" className="flex-1 border border-gray-200 px-2 py-1" /><input value={k.value} onChange={e => setKpi(i, 'value', e.target.value)} placeholder="Value" className="w-24 border border-gray-200 px-2 py-1" /><button onClick={() => set('kpis', kpis.filter((_, x) => x !== i))} className="px-1 text-gray-400"><X className="w-4 h-4" /></button></div>)}
      <button onClick={() => set('kpis', [...kpis, { label: '', value: '', sub: '' }])} className="text-xs text-gray-500 hover:text-black">+ KPI</button>
      <div className="flex gap-2 pt-1"><input value={d.runwayLabel} onChange={e => set('runwayLabel', e.target.value)} placeholder="Runway label" className="flex-1 border border-gray-200 px-2 py-1.5" /><input value={d.runwayValue} onChange={e => set('runwayValue', e.target.value)} placeholder="18 months" className="flex-1 border border-gray-200 px-2 py-1.5" /><input value={d.runwayPct} onChange={e => set('runwayPct', e.target.value)} placeholder="%" className="w-16 border border-gray-200 px-2 py-1.5" /></div>
      <div className="pt-1 text-xs font-semibold text-gray-500">Notes</div>
      {notes.map((n, i) => <div key={i} className="flex gap-1"><input value={n} onChange={e => { const a = [...notes]; a[i] = e.target.value; set('notes', a) }} placeholder="Note" className="flex-1 border border-gray-200 px-2 py-1" /><button onClick={() => set('notes', notes.filter((_, x) => x !== i))} className="px-1 text-gray-400"><X className="w-4 h-4" /></button></div>)}
      <button onClick={() => set('notes', [...notes, ''])} className="text-xs text-gray-500 hover:text-black">+ Note</button>
      <input value={d.bgImage} onChange={e => set('bgImage', e.target.value)} placeholder="Background image URL (optional)" className="w-full border border-gray-200 px-2 py-1.5 mt-1" />
    </div>
  )
}
