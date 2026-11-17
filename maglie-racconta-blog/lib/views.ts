// Aggiunge a ogni articolo il numero di visualizzazioni (tabella article_views).
// Se la tabella non esiste o la query fallisce, gli articoli restano visibili con 0.
export async function withViews<T extends { id: string }>(db: any, articles: T[]): Promise<(T & { view_count: number })[]> {
  const ids = articles.map(a => a.id);
  const { data: views } = ids.length
    ? await db.from('article_views').select('article_id,view_count').in('article_id', ids)
    : { data: [] };
  const viewsById = new Map<string, number>((views || []).map((v: any) => [v.article_id, Number(v.view_count)]));
  return articles.map(a => ({ ...a, view_count: viewsById.get(a.id) ?? 0 }));
}

export const authorHref = (name: string) => '/autori/' + encodeURIComponent(name.trim());
