'use client';
import {FormEvent, useState} from 'react';
import {supabaseBrowser} from '@/lib/supabase/client';

export default function CommentForm({articleId}: {articleId: string}) {
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // campo esca anti-spam, invisibile alle persone
  const [state, setState] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (website) { setState('sent'); return; } // probabile bot: fingiamo successo
    const n = name.trim(), b = body.trim();
    if (n.length < 2 || n.length > 60) { setState('error'); setMessage('Il nome deve avere tra 2 e 60 caratteri.'); return; }
    if (b.length < 3 || b.length > 2000) { setState('error'); setMessage('Il commento deve avere tra 3 e 2.000 caratteri.'); return; }
    if (!consent) { setState('error'); setMessage('Per inviare il commento devi accettare le regole e l’informativa.'); return; }
    setState('sending'); setMessage('');
    const {error} = await supabaseBrowser().from('article_comments').insert({article_id: articleId, author_name: n, body: b});
    if (error) { setState('error'); setMessage('Invio non riuscito. Riprova più tardi.'); return; }
    setState('sent'); setName(''); setBody(''); setConsent(false);
  }

  if (state === 'sent') return <p role="status" className="comment-notice">Grazie! Il tuo commento è stato inviato e sarà visibile dopo l’approvazione della redazione.</p>;

  return <form className="form comment-form" onSubmit={submit} noValidate>
    <label className="label">Nome (anche solo il nome di battesimo o uno pseudonimo)
      <input className="input" value={name} onChange={e => setName(e.target.value)} maxLength={60} required autoComplete="nickname"/>
    </label>
    <label className="label">Commento
      <textarea value={body} onChange={e => setBody(e.target.value)} maxLength={2000} rows={5} required/>
      <span className="comment-hint">{body.length}/2000</span>
    </label>
    <div aria-hidden="true" style={{position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden'}}>
      <label>Lascia vuoto questo campo<input tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)}/></label>
    </div>
    <label className="comment-consent">
      <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}/>
      <span>Ho letto le regole: niente insulti, dati personali di altre persone o pubblicità. I commenti sono moderati prima della pubblicazione. Salviamo solo nome, testo e data del commento, per pubblicarlo sotto l’articolo; puoi chiederne la rimozione contattando la redazione.</span>
    </label>
    {state === 'error' && <p role="alert" className="engage-error">{message}</p>}
    <div><button className="btn" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Invio…' : 'Invia commento'}</button></div>
  </form>;
}
