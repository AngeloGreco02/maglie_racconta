'use client';
import {useEffect, useState} from 'react';
import {supabaseBrowser} from '@/lib/supabase/client';

// Il "mi piace" non usa cookie né dati personali: il browser ricorda solo localmente
// (localStorage) che il lettore ha già messo mi piace, per evitare doppi clic.
const storageKey = (id: string) => `mr-like-${id}`;

export default function LikeButton({articleId, initialCount}: {articleId: string; initialCount: number}) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try { setLiked(localStorage.getItem(storageKey(articleId)) === '1'); } catch {}
  }, [articleId]);

  async function toggle() {
    if (busy) return;
    setBusy(true); setError('');
    const next = !liked;
    const {data, error} = await supabaseBrowser().rpc('toggle_article_like', {p_article_id: articleId, p_like: next});
    if (error) { setError('Non è stato possibile registrare il tuo mi piace. Riprova più tardi.'); setBusy(false); return; }
    setCount(typeof data === 'number' ? data : count + (next ? 1 : -1));
    setLiked(next);
    try { next ? localStorage.setItem(storageKey(articleId), '1') : localStorage.removeItem(storageKey(articleId)); } catch {}
    setBusy(false);
  }

  return <div>
    <button type="button" className={'engage-btn' + (liked ? ' is-active' : '')} onClick={toggle} disabled={busy} aria-pressed={liked}>
      <span aria-hidden="true">{liked ? '♥' : '♡'}</span>
      {liked ? 'Ti piace' : 'Mi piace'}
      <span className="engage-count" aria-label={`${count} mi piace`}>{count}</span>
    </button>
    {error && <p role="alert" className="engage-error">{error}</p>}
  </div>;
}
