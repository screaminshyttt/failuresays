'use client'
import { useEffect, useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { CATEGORIES } from '@/lib/brand'
import { Plus, Edit3, Trash2, Eye, LogOut, Save, ChevronLeft } from 'lucide-react'
import { LogoLockup } from '@/components/logo'

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

export default function AdminPage() {
  const { token, save, clear } = useAuthToken()
  const [checked, setChecked] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    if (!token) { setChecked(true); return }
    api('/admin/verify', {}, token).then(d => { setAuthed(!!d.ok); setChecked(true) }).catch(() => { clear(); setChecked(true) })
  }, [token])

  if (!checked) return <div className="container-editorial py-40 text-center text-muted">Loading admin…</div>
  if (!authed) return <Login onLogin={t => { save(t); setAuthed(true) }} />
  return <Dashboard token={token} onLogout={() => { clear(); setAuthed(false) }} />
}

function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const d = await api('/admin/login', { method: 'POST', body: JSON.stringify({ password }) })
      onLogin(d.token)
      toast.success('Welcome back.')
    } catch (e) { toast.error(e.message) } finally { setLoading(false) }
  }
  return (
    <div className="container-editorial py-24 max-w-md">
      <LogoLockup />
      <div className="eyebrow mt-10">Admin</div>
      <h1 className="display mt-3 text-5xl">Editor Login.</h1>
      <form onSubmit={submit} className="mt-10 bg-white border border-rule p-8 space-y-6">
        <label className="block">
          <span className="eyebrow block mb-2">Password</span>
          <input autoFocus type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-transparent border-0 border-b border-rule py-3 outline-none focus:border-black text-lg" placeholder="Enter admin password" />
        </label>
        <button disabled={loading} className="btn-primary w-full justify-center">{loading ? 'Verifying…' : 'Enter'}</button>
      </form>
    </div>
  )
}

function Dashboard({ token, onLogout }) {
  const [view, setView] = useState({ name: 'list' }) // {name:'list'} | {name:'edit',id?:string}
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try { const d = await api('/admin/posts', {}, token); setPosts(d.posts || []) } catch (e) { toast.error(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { refresh() }, [])

  return (
    <div className="bg-paper min-h-screen">
      <div className="container-editorial py-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="eyebrow">FailureSays CMS</div>
            <h1 className="display text-5xl mt-2">{view.name === 'list' ? 'Editorial Desk' : (view.id ? 'Edit Post' : 'New Post')}</h1>
          </div>
          <div className="flex items-center gap-3">
            {view.name === 'edit' && <button onClick={() => setView({ name:'list' })} className="btn-ghost"><ChevronLeft className="w-4 h-4" /> Back</button>}
            {view.name === 'list' && <button onClick={() => setView({ name:'edit' })} className="btn-primary"><Plus className="w-4 h-4" /> New post</button>}
            <button onClick={onLogout} className="btn-ghost"><LogOut className="w-4 h-4" /> Logout</button>
          </div>
        </div>

        <div className="mt-10">
          {view.name === 'list' ? <PostList loading={loading} posts={posts} onEdit={id => setView({ name:'edit', id })} onDeleted={refresh} token={token} /> : <PostEditor id={view.id} token={token} onSaved={() => { setView({ name:'list' }); refresh() }} onCancel={() => setView({ name:'list' })} />}
        </div>
      </div>
    </div>
  )
}

function PostList({ posts, loading, onEdit, onDeleted, token }) {
  async function del(id) {
    if (!confirm('Delete this post permanently?')) return
    try { await api(`/admin/posts/${id}`, { method: 'DELETE' }, token); toast.success('Deleted.'); onDeleted() } catch (e) { toast.error(e.message) }
  }
  if (loading) return <div className="text-muted">Loading…</div>
  if (!posts.length) return <div className="border border-dashed border-rule bg-white/50 p-16 text-center text-muted">No posts yet. Click <span className="font-medium text-ink">New post</span> to publish your first essay.</div>
  return (
    <div className="bg-white border border-rule">
      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-rule text-[11px] uppercase tracking-[0.22em] text-muted">
        <div className="col-span-6">Title</div>
        <div className="col-span-2">Category</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-2">Updated</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>
      {posts.map(p => (
        <div key={p.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-rule items-center hover:bg-cream/60">
          <div className="col-span-6">
            <div className="font-medium">{p.title}</div>
            <div className="text-xs text-subtle mt-1">/{p.slug}{p.featured ? ' · featured' : ''}</div>
          </div>
          <div className="col-span-2 text-sm text-muted">{CATEGORIES.find(c => c.slug === p.category)?.label || p.category}</div>
          <div className="col-span-1"><span className={`text-[10px] uppercase tracking-[0.2em] px-2 py-1 border ${p.published ? 'border-black text-ink' : 'border-rule text-subtle'}`}>{p.published ? 'Live' : 'Draft'}</span></div>
          <div className="col-span-2 text-xs text-muted">{new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</div>
          <div className="col-span-1 flex justify-end gap-2">
            {p.published && <a href={`/blog/${p.slug}`} target="_blank" rel="noopener" className="p-2 hover:bg-cream" title="View"><Eye className="w-4 h-4" /></a>}
            <button onClick={() => onEdit(p.id)} className="p-2 hover:bg-cream" title="Edit"><Edit3 className="w-4 h-4" /></button>
            <button onClick={() => del(p.id)} className="p-2 hover:bg-cream text-destructive" title="Delete"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
      ))}
    </div>
  )
}

function PostEditor({ id, token, onSaved }) {
  const empty = { title: '', slug: '', category: 'startup-analyses', tags: '', coverImage: '', excerpt: '', content: '', featured: false, published: false, seo: { title: '', description: '', keywords: '' } }
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('write') // write | preview

  useEffect(() => {
    if (!id) return
    api(`/admin/posts/${id}`, {}, token).then(d => {
      const p = d.post
      setForm({ ...empty, ...p, tags: (p.tags||[]).join(', '), seo: { title:'', description:'', keywords:'', ...(p.seo||{}) } })
      setLoading(false)
    }).catch(e => { toast.error(e.message); setLoading(false) })
  }, [id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setSeo = (k, v) => setForm(f => ({ ...f, seo: { ...f.seo, [k]: v } }))

  async function save(publish) {
    setSaving(true)
    try {
      const payload = { ...form, tags: form.tags.split(',').map(s=>s.trim()).filter(Boolean), published: publish !== undefined ? publish : form.published }
      if (id) await api(`/admin/posts/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, token)
      else await api('/admin/posts', { method: 'POST', body: JSON.stringify(payload) }, token)
      toast.success(id ? 'Post updated.' : 'Post created.')
      onSaved()
    } catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }

  if (loading) return <div className="text-muted">Loading post…</div>

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <Row label="Title">
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Untitled essay" className="w-full bg-white border border-rule px-4 py-3 outline-none focus:border-black text-2xl" />
        </Row>
        <Row label="Slug (optional)">
          <input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated from title" className="w-full bg-white border border-rule px-4 py-3 outline-none focus:border-black" />
        </Row>
        <Row label="Excerpt">
          <textarea rows={2} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="One-sentence summary shown in cards." className="w-full bg-white border border-rule px-4 py-3 outline-none focus:border-black" />
        </Row>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="eyebrow">Content (Markdown / MDX-lite)</span>
            <div className="flex text-[11px] uppercase tracking-[0.22em]">
              <button onClick={() => setTab('write')} className={`px-3 py-1 border ${tab==='write' ? 'bg-black text-paper border-black' : 'border-rule text-muted'}`}>Write</button>
              <button onClick={() => setTab('preview')} className={`px-3 py-1 border ${tab==='preview' ? 'bg-black text-paper border-black' : 'border-rule text-muted'}`}>Preview</button>
            </div>
          </div>
          {tab === 'write' ? (
            <textarea rows={26} value={form.content} onChange={e => set('content', e.target.value)} placeholder={`# My essay\n\nWrite in **Markdown**. GitHub-flavored tables, code, lists all supported.`} className="w-full bg-white border border-rule px-4 py-3 font-mono text-sm outline-none focus:border-black" />
          ) : (
            <div className="bg-white border border-rule p-8 prose-editorial">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content || '_Nothing to preview yet._'}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      <aside className="lg:col-span-4 space-y-6">
        <div className="bg-white border border-rule p-5 space-y-5">
          <div>
            <span className="eyebrow block mb-2">Category</span>
            <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full bg-transparent border border-rule px-3 py-2 outline-none">
              {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <span className="eyebrow block mb-2">Tags (comma separated)</span>
            <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="strategy, founders, growth" className="w-full bg-transparent border border-rule px-3 py-2 outline-none" />
          </div>
          <div>
            <span className="eyebrow block mb-2">Cover Image URL</span>
            <input value={form.coverImage} onChange={e => set('coverImage', e.target.value)} placeholder="https://…" className="w-full bg-transparent border border-rule px-3 py-2 outline-none" />
            {form.coverImage && /* eslint-disable-next-line @next/next/no-img-element */ <img src={form.coverImage} alt="cover" className="mt-3 w-full aspect-[16/9] object-cover border border-rule" />}
          </div>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={!!form.featured} onChange={e => set('featured', e.target.checked)} />
            <span className="text-sm">Feature on Blog</span>
          </label>
        </div>

        <div className="bg-white border border-rule p-5 space-y-4">
          <div className="eyebrow">SEO metadata</div>
          <input value={form.seo.title} onChange={e => setSeo('title', e.target.value)} placeholder="SEO title" className="w-full bg-transparent border border-rule px-3 py-2 outline-none" />
          <textarea rows={2} value={form.seo.description} onChange={e => setSeo('description', e.target.value)} placeholder="Meta description" className="w-full bg-transparent border border-rule px-3 py-2 outline-none" />
          <input value={form.seo.keywords} onChange={e => setSeo('keywords', e.target.value)} placeholder="Keywords" className="w-full bg-transparent border border-rule px-3 py-2 outline-none" />
        </div>

        <div className="bg-white border border-rule p-5 space-y-3">
          <button disabled={saving} onClick={() => save(false)} className="btn-ghost w-full justify-center"><Save className="w-4 h-4" /> Save draft</button>
          <button disabled={saving} onClick={() => save(true)} className="btn-primary w-full justify-center"><Save className="w-4 h-4" /> {form.published ? 'Save & keep live' : 'Publish now'}</button>
          {form.published && <div className="text-xs text-muted text-center">This post is currently live.</div>}
        </div>
      </aside>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      {children}
    </label>
  )
}
