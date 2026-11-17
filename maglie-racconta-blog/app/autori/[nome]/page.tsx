import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import { supabaseServer } from '@/lib/supabase/server';
import { withViews } from '@/lib/views';

export const revalidate = 0;

const decodeName = (raw: string) => {
  try { return decodeURIComponent(raw).trim(); } catch { return raw.trim(); }
};

export async function generateMetadata({ params }: { params: { nome: string } }) {
  const name = decodeName(params.nome);
  return {
    title: `Articoli di ${name} | Maglie Racconta`,
    description: `Tutti gli articoli firmati da ${name} su Maglie Racconta.`
  };
}

export default async function AuthorPage({ params }: { params: { nome: string } }) {
  const name = decodeName(params.nome);
  const db = supabaseServer();
  const { data: articles } = await db
    .from('articles')
    .select('id,title,slug,excerpt,cover_url,cover_alt,category,published_at,author_name')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .eq('author_name', name)
    .order('published_at', { ascending: false });
  const list = await withViews(db, articles || []);

  return <>
    <Header />
    <main className="wrap">
      <section className="hero">
        <div className="eyebrow">Autore</div>
        <h1>{name}</h1>
        <p className="lead">
          {list.length === 1 ? '1 articolo pubblicato' : `${list.length} articoli pubblicati`} su Maglie Racconta.
        </p>
      </section>
      {list.length
        ? <section className="grid">{list.map(a => <ArticleCard key={a.id} article={a} />)}</section>
        : <p className="empty-state">Non ci sono articoli pubblicati con questa firma.</p>}
    </main>
    <footer className="footer">
      <div className="wrap footer-inner"><a href="/">← Torna alla home</a><a href="/privacy" style={{ textDecoration: 'underline' }}>Privacy</a></div>
    </footer>
  </>;
}
