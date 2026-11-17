'use client';
import {useEffect, useState} from 'react';
import {supabaseBrowser} from '@/lib/supabase/client';
import {EyeIcon, formatViews} from './views-shared';

// Contatore anonimo: nessun cookie, nessun IP. Il browser ricorda solo per la scheda aperta
// (sessionStorage, cancellato alla chiusura) che la visita è già stata contata, così
// ricaricare la pagina non gonfia il numero.
const storageKey = (id: string) => `mr-view-${id}`;
const sentThisLoad = new Set<string>();

export default function ViewCounter({articleId, initialCount}: {articleId: string; initialCount: number}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    let counted = false;
    try { counted = sessionStorage.getItem(storageKey(articleId)) === '1'; } catch {}
    if (counted || sentThisLoad.has(articleId)) return;
    sentThisLoad.add(articleId);
    supabaseBrowser().rpc('register_article_view', {p_article_id: articleId}).then(({data, error}) => {
      if (error) return; // se il contatore non è attivo, la pagina funziona comunque
      if (data != null && !Number.isNaN(Number(data))) setCount(Number(data));
      try { sessionStorage.setItem(storageKey(articleId), '1'); } catch {}
    });
  }, [articleId]);

  return <span className="view-count" title="Visualizzazioni">
    <EyeIcon />
    <span>{formatViews(count)} {count === 1 ? 'visualizzazione' : 'visualizzazioni'}</span>
  </span>;
}
