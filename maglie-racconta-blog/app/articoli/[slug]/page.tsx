import Header from '@/components/Header';
import { supabaseServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import sanitizeHtml from 'sanitize-html';

const cleanArticleHtml = (html: string) => sanitizeHtml(html, {
  allowedTags: [
    'p', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li',
    'blockquote', 'a', 'br', 'hr'
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'nofollow noopener noreferrer', target: '_blank' }, true)
  }
});

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: article } = await supabaseServer()
    .from('articles')
    .select('title,seo_title,seo_description,excerpt')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .maybeSingle();

  return {
    title: article?.seo_title || article?.title || 'Articolo | Maglie Racconta',
    description: article?.seo_description || article?.excerpt || ''
  };
}

export default async function Article({ params }: { params: { slug: string } }) {
  const { data: article } = await supabaseServer()
    .from('articles')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!article) notFound();

  const safeBody = cleanArticleHtml(article.body_html || '');

  return (
    <>
      <Header />
      <main className="wrap">
        <article className="content">
          <div className="eyebrow">
            {article.category} · {new Date(article.published_at).toLocaleDateString('it-IT')}
          </div>
          <h1>{article.title}</h1>
          <p className="lead">{article.excerpt}</p>
          {article.author_name && <p style={{fontSize:14,color:"var(--muted)",marginTop:-6}}>Di {article.author_name}</p>}
          {article.cover_url && (
            <img
              src={article.cover_url}
              alt={article.cover_alt || article.title}
              style={{ width: '100%', margin: '18px 0' }}
            />
          )}
          <div dangerouslySetInnerHTML={{ __html: safeBody }} />
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            Maglie Racconta · La città, le persone, le storie.
          </p>
        </article>
      </main>
      <footer className="footer">
        <div className="wrap"><a href="/">← Torna alla home</a></div>
      </footer>
    </>
  );
}
