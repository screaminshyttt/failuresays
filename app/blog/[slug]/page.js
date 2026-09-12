import { getDb } from '@/lib/mongodb'
import ArticleView from '@/components/article/article-view'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function visibility() {
  const now = new Date().toISOString()
  return { $or: [
    { status: 'published' },
    { status: 'scheduled', scheduledAt: { $lte: now } },
    { status: { $exists: false }, published: true },
  ] }
}

async function fetchArticle(slug) {
  try {
    const db = await getDb()
    const posts = db.collection('posts')
    const item = await posts.findOne({ slug, ...visibility() })
    if (!item) return { article: null, related: [] }
    const { _id, ...article } = item
    // gather related ids (from field + related blocks)
    const ids = new Set([...(article.relatedIds || [])])
    ;(article.blocks || []).forEach(b => { if (b?.type === 'related' && b.data?.articleId) ids.add(b.data.articleId) })
    let related = []
    if (ids.size) {
      const rel = await posts.find({ id: { $in: [...ids] }, ...visibility() }, { projection: { content: 0, blocks: 0 } }).toArray()
      related = rel.map(({ _id, ...r }) => r)
    }
    return { article, related }
  } catch (e) {
    return { article: null, related: [] }
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const { article } = await fetchArticle(slug)
  if (!article) return { title: 'Not found · FailureSays' }
  const title = article.seo?.title || `${article.title} · FailureSays`
  const description = article.seo?.description || article.subtitle || article.excerpt || ''
  const ogImage = article.seo?.socialImage || article.coverImage || undefined
  return {
    title,
    description,
    alternates: article.seo?.canonicalUrl ? { canonical: article.seo.canonicalUrl } : undefined,
    openGraph: { title, description, images: ogImage ? [ogImage] : undefined, type: 'article' },
    twitter: { card: 'summary_large_image', title, description, images: ogImage ? [ogImage] : undefined },
  }
}

export default async function Page({ params }) {
  const { slug } = await params
  const { article, related } = await fetchArticle(slug)
  return <ArticleView article={article} related={related} slug={slug} />
}
