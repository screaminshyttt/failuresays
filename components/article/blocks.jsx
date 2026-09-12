'use client'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowUpRight } from 'lucide-react'

export function headingId(text, i) {
  const base = String(text || 'section').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60)
  return `${base || 'section'}-${i}`
}

export function buildToc(blocks = []) {
  const toc = []
  ;(blocks || []).forEach((b, i) => {
    if (b?.type === 'heading' && (b.data?.level === 'h2' || b.data?.level === 'h3') && b.data?.text) {
      toc.push({ id: headingId(b.data.text, i), text: b.data.text, level: b.data.level })
    }
  })
  return toc
}

function RelatedCard({ article }) {
  if (!article) return null
  return (
    <Link href={`/blog/${article.slug}`} className="group block border border-rule bg-white hover:border-black/30 transition-colors">
      {article.coverImage && (
        <div className="aspect-[16/9] overflow-hidden bg-cream">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.coverImage} alt={article.coverImageAlt || article.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
        </div>
      )}
      <div className="p-5">
        <span className="badge-cat">{article.category}</span>
        <h4 className="mt-3 text-lg font-semibold leading-tight">{article.title}</h4>
        <div className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em]">Read <ArrowUpRight className="w-3 h-3 text-lime" /></div>
      </div>
    </Link>
  )
}

function Block({ block, index, relatedMap, MetricsHero }) {
  const d = block?.data || {}
  switch (block?.type) {
    case 'paragraph':
      return <div className="prose-editorial max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{d.text || ''}</ReactMarkdown></div>
    case 'heading': {
      const id = headingId(d.text, index)
      const align = d.align === 'left' ? 'text-left' : 'text-center'
      const size = d.level === 'h3' ? 'text-2xl md:text-3xl' : d.level === 'h4' ? 'text-xl md:text-2xl' : 'text-3xl md:text-5xl'
      return (
        <div className={`${align} scroll-mt-28`} id={id}>
          {d.label && <div className="eyebrow-accent justify-center mb-3" style={d.align === 'left' ? { justifyContent: 'flex-start' } : {}}>{d.label}</div>}
          <h2 className={`display ${size} leading-[0.98]`}>{d.text}</h2>
        </div>
      )
    }
    case 'image':
      return (
        <figure className={d.align === 'left' ? 'text-left' : 'text-center'}>
          {d.url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={d.url} alt={d.alt || ''} className="w-full border border-rule" loading="lazy" />}
          {d.caption && <figcaption className="mt-3 text-sm text-subtle italic">{d.caption}</figcaption>}
        </figure>
      )
    case 'pullquote':
      return (
        <blockquote className="border-l-2 border-lime bg-limeSoft/20 pl-6 pr-4 py-5">
          <p className="display text-2xl md:text-3xl leading-tight text-ink not-italic">{d.text}</p>
          {d.cite && <cite className="mt-3 block text-sm text-muted not-italic">— {d.cite}</cite>}
        </blockquote>
      )
    case 'keytakeaway':
      return (
        <div className="border border-rule bg-white p-6">
          <div className="eyebrow-accent">{d.title || 'Key takeaway'}</div>
          <ul className="mt-4 space-y-2">
            {(d.items || []).filter(Boolean).map((it, i) => (
              <li key={i} className="flex gap-3 text-[15px]"><span className="text-lime mt-1">▪</span><span>{it}</span></li>
            ))}
          </ul>
        </div>
      )
    case 'stat':
      return (
        <div className="border border-rule bg-white p-6 md:p-8 flex items-center gap-6">
          <div className="display text-5xl md:text-7xl leading-none">{d.number}</div>
          <div>
            {d.label && <div className="eyebrow-accent">{d.label}</div>}
            {d.text && <p className="mt-2 text-muted max-w-md">{d.text}</p>}
          </div>
        </div>
      )
    case 'divider':
      return <hr className="border-t border-rule" />
    case 'list':
      return d.ordered ? (
        <ol className="list-decimal pl-6 space-y-2 marker:text-lime marker:font-semibold">{(d.items || []).filter(Boolean).map((it, i) => <li key={i} className="pl-1">{it}</li>)}</ol>
      ) : (
        <ul className="pl-1 space-y-2">{(d.items || []).filter(Boolean).map((it, i) => <li key={i} className="flex gap-3"><span className="text-lime mt-1.5 text-xs">■</span><span>{it}</span></li>)}</ul>
      )
    case 'table':
      return (
        <div className="overflow-x-auto border border-rule">
          <table className="w-full text-sm">
            {d.header?.length > 0 && <thead className="bg-cream"><tr>{d.header.map((h, i) => <th key={i} className="text-left px-4 py-3 border-b border-rule font-semibold">{h}</th>)}</tr></thead>}
            <tbody>{(d.rows || []).map((row, r) => <tr key={r} className="border-b border-rule last:border-b-0">{row.map((c, i) => <td key={i} className="px-4 py-3">{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )
    case 'cta':
      return (
        <div className="border border-black bg-black text-paper p-8 text-center">
          {d.title && <h3 className="display text-3xl">{d.title}</h3>}
          {d.text && <p className="mt-3 text-paper/70 max-w-lg mx-auto">{d.text}</p>}
          {d.buttonLabel && <a href={d.buttonUrl || '#'} className="btn-lime mt-6">{d.buttonLabel} <ArrowUpRight className="w-4 h-4" /></a>}
        </div>
      )
    case 'related':
      return <RelatedCard article={relatedMap?.[d.articleId]} />
    case 'embed': {
      const url = d.url || ''
      let embed = url
      const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/)
      if (yt) embed = `https://www.youtube.com/embed/${yt[1]}`
      return url ? <div className="aspect-video border border-rule"><iframe src={embed} className="w-full h-full" allowFullScreen title="embed" /></div> : null
    }
    case 'newsletter':
      return (
        <div className="border border-rule bg-cream p-8 text-center">
          <div className="eyebrow-accent justify-center">{d.title || 'Newsletter'}</div>
          <p className="mt-3 text-muted max-w-md mx-auto">{d.text || 'Get new essays in your inbox.'}</p>
          <form className="mt-5 flex max-w-sm mx-auto border border-black bg-white" onSubmit={e => e.preventDefault()}>
            <input placeholder="you@email.com" className="flex-1 px-4 py-3 bg-transparent outline-none text-sm" />
            <button className="bg-black text-paper px-5 text-xs uppercase tracking-[0.18em]">Join</button>
          </form>
        </div>
      )
    case 'metrics':
      return MetricsHero ? <MetricsHero data={d} /> : null
    default:
      return null
  }
}

export default function BlockRenderer({ blocks = [], relatedMap = {}, MetricsHero }) {
  return (
    <div className="space-y-8 md:space-y-10">
      {(blocks || []).map((b, i) => (
        <div key={b.id || i}>
          <Block block={b} index={i} relatedMap={relatedMap} MetricsHero={MetricsHero} />
        </div>
      ))}
    </div>
  )
}
