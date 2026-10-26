import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import {supabaseServer} from '@/lib/supabase/server';

export const revalidate = 0;
const categories = ['Cronaca', 'Cultura', 'Sport', 'Persone', 'Eventi', 'Territorio'];

export default async function Home({searchParams}:{searchParams:{q?:string,categoria?:string}}) {
  const db = supabaseServer();
  let query = db.from('articles').select('id,title,slug,excerpt,cover_url,cover_alt,category,published_at,author_name').eq('status','published').lte('published_at',new Date().toISOString()).order('published_at',{ascending:false});
  if (searchParams?.categoria) query = query.eq('category',searchParams.categoria);
  if (searchParams?.q) query = query.or(`title.ilike.%${searchParams.q}%,excerpt.ilike.%${searchParams.q}%`);
  const {data:articles} = await query;
  const list = articles || [];
  const isFiltered = Boolean(searchParams?.q || searchParams?.categoria);
  const featured = !isFiltered ? list[0] : null;
  const latest = !isFiltered ? list.slice(1,7) : list;

  return <>
    <Header />
    <main className="wrap">
      <section className="hero">
        <div className="eyebrow">Il magazine di Maglie</div>
        <h1>Le storie della nostra città, raccontate da vicino.</h1>
        <p className="lead">Cronaca, cultura, iniziative, sport e persone: uno spazio per conoscere meglio Maglie e il territorio che ci unisce.</p>
      </section>
      {isFiltered ? <>
        <div className="section-heading"><div className="eyebrow">{searchParams?.categoria || 'Risultati della ricerca'}</div>{searchParams?.q && <p>Risultati per “{searchParams.q}”</p>}</div>
        {list.length ? <section className="grid">{list.map(a=><ArticleCard key={a.id} article={a}/>)}</section> : <p className="empty-state">Non ci sono articoli pubblicati in questa selezione.</p>}
      </> : <>
        {featured && <section className="featured-section"><div className="section-heading"><div className="eyebrow">In primo piano</div></div><ArticleCard article={featured} featured /></section>}
        <section className="latest-section">
          <div className="section-heading"><div className="eyebrow">Ultime notizie</div><span className="section-note">Le storie più recenti da Maglie</span></div>
          {latest.length ? <section className="grid">{latest.map(a=><ArticleCard key={a.id} article={a}/>)}</section> : !featured && <p className="empty-state">Non ci sono ancora articoli pubblicati. Le storie arriveranno qui.</p>}
        </section>
        {list.length>0 && <div className="category-sections">{categories.map(category => {
          const items = list.filter(article => (article.category || '').toLocaleLowerCase('it') === category.toLocaleLowerCase('it')).slice(0,3);
          if (!items.length) return null;
          return <section className="category-section" key={category}>
            <div className="section-heading"><div className="eyebrow">{category}</div><a className="section-link" href={`/?categoria=${encodeURIComponent(category)}`}>Tutte le notizie →</a></div>
            <div className="category-grid">{items.map(article=><ArticleCard key={article.id} article={article}/>)}</div>
          </section>;
        })}</div>}
        <section className="collab-banner"><div><div className="eyebrow">La città ha tante voci</div><h2>Anche tu hai una storia da raccontare?</h2><p>Segnalaci una notizia, racconta un'iniziativa o unisciti alla redazione di Maglie Racconta.</p></div><a className="btn" href="/collabora">Collabora con noi <span aria-hidden="true">→</span></a></section>
      </>}
    </main>
    <footer className="footer"><div className="wrap footer-inner"><div><strong>MAGLIE RACCONTA</strong><p>Un magazine indipendente dedicato alla città e alla sua comunità.</p></div><small>Contenuti e opinioni sono responsabilità dei rispettivi autori.</small></div></footer>
  </>;
}