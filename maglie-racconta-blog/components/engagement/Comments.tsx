import CommentForm from './CommentForm';

type Comment = {id: string; author_name: string; body: string; created_at: string};

// I commenti sono mostrati come testo semplice (React esegue l'escape): nessun HTML dei lettori.
export default function Comments({articleId, comments}: {articleId: string; comments: Comment[]}) {
  return <section className="comments" aria-labelledby="comments-title">
    <h2 id="comments-title">Commenti{comments.length ? ` (${comments.length})` : ''}</h2>
    {comments.length === 0
      ? <p className="comment-hint">Non ci sono ancora commenti. Scrivi il primo.</p>
      : <ol className="comment-list">{comments.map(c => <li key={c.id} className="comment">
          <div className="comment-meta"><strong>{c.author_name}</strong> · <time dateTime={c.created_at}>{new Date(c.created_at).toLocaleDateString('it-IT', {day: 'numeric', month: 'long', year: 'numeric'})}</time></div>
          <p className="comment-body">{c.body}</p>
        </li>)}</ol>}
    <h3>Lascia un commento</h3>
    <CommentForm articleId={articleId}/>
  </section>;
}
