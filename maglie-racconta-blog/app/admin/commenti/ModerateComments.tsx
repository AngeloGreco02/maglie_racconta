'use client';
import {useState} from 'react';
import {supabaseBrowser} from '@/lib/supabase/client';

const label:Record<string,string>={pending:'IN ATTESA',approved:'PUBBLICATO',rejected:'RIFIUTATO'};

export default function ModerateComments({comments}:{comments:any[]}){
  const [items,setItems]=useState(comments);const [busy,setBusy]=useState<string|null>(null);const [message,setMessage]=useState('');
  const [filter,setFilter]=useState<'pending'|'all'>('pending');

  async function setStatus(id:string,status:'approved'|'rejected'){
    setBusy(id);setMessage('');
    const db=supabaseBrowser();
    const reviewer=(await db.auth.getUser()).data.user?.id;
    const {error}=await db.from('article_comments').update({status,reviewed_at:new Date().toISOString(),reviewed_by:reviewer}).eq('id',id);
    if(error){setMessage('Operazione non riuscita: '+error.message);setBusy(null);return;}
    setItems(prev=>prev.map(x=>x.id===id?{...x,status}:x));setMessage(status==='approved'?'Commento pubblicato.':'Commento rifiutato.');setBusy(null);
  }
  async function remove(id:string){
    if(!window.confirm('Eliminare definitivamente questo commento?'))return;
    setBusy(id);setMessage('');
    const {error}=await supabaseBrowser().from('article_comments').delete().eq('id',id);
    if(error){setMessage('Eliminazione non riuscita: '+error.message);setBusy(null);return;}
    setItems(prev=>prev.filter(x=>x.id!==id));setMessage('Commento eliminato.');setBusy(null);
  }

  const visible=filter==='pending'?items.filter(x=>x.status==='pending'):items;
  return <>
    <div style={{display:'flex',gap:10,flexWrap:'wrap',margin:'16px 0'}}>
      <button className="btn" style={filter==='pending'?{}:{background:'#66737c'}} onClick={()=>setFilter('pending')}>In attesa ({items.filter(x=>x.status==='pending').length})</button>
      <button className="btn" style={filter==='all'?{}:{background:'#66737c'}} onClick={()=>setFilter('all')}>Tutti ({items.length})</button>
    </div>
    {message&&<p role="status">{message}</p>}
    {!visible.length?<p>Nessun commento da mostrare.</p>:<div style={{display:'grid',gap:14}}>{visible.map(c=><article key={c.id} style={{background:'white',border:'1px solid var(--line)',borderRadius:12,padding:18}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
        <div><span className="eyebrow">{new Date(c.created_at).toLocaleString('it-IT')}</span><p style={{margin:'6px 0'}}><strong>{c.author_name}</strong> su {c.articles?.slug?<a href={'/articoli/'+c.articles.slug} target="_blank" rel="noreferrer" style={{textDecoration:'underline'}}>{c.articles.title}</a>:'articolo'}</p></div>
        <strong className="status">{label[c.status]||c.status}</strong>
      </div>
      <p style={{whiteSpace:'pre-wrap',lineHeight:1.6}}>{c.body}</p>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        {c.status!=='approved'&&<button className="btn" disabled={!!busy} onClick={()=>setStatus(c.id,'approved')}>{busy===c.id?'…':'Approva'}</button>}
        {c.status!=='rejected'&&<button className="btn" style={{background:'#66737c'}} disabled={!!busy} onClick={()=>setStatus(c.id,'rejected')}>{c.status==='approved'?'Nascondi':'Rifiuta'}</button>}
        <button className="btn" style={{background:'#3b3b3b'}} disabled={!!busy} onClick={()=>remove(c.id)}>Elimina</button>
      </div>
    </article>)}</div>}
  </>;
}
