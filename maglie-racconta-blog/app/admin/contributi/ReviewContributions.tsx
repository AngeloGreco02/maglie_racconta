'use client';
import {useState} from 'react';
import {supabaseBrowser} from '@/lib/supabase/client';

export default function ReviewContributions({submissions}:{submissions:any[]}){
  const [items,setItems]=useState(submissions);const [busy,setBusy]=useState<string|null>(null);const [message,setMessage]=useState('');
  async function review(id:string,action:'approve'|'reject'){
    if(action==='reject'&&!window.confirm('Rifiutare questo contributo?'))return;
    setBusy(id);setMessage('');
    const db=supabaseBrowser();
    if(action==='approve'){
      const {error}=await db.rpc('approve_contribution',{submission_id:id});
      if(error){setMessage('Approvazione non riuscita: '+error.message);setBusy(null);return;}
      setItems(prev=>prev.map(x=>x.id===id?{...x,status:'approved'}:x));setMessage('Articolo approvato e pubblicato.');
    }else{
      const {error}=await db.from('contributor_submissions').update({status:'rejected',reviewed_at:new Date().toISOString(),reviewed_by:(await db.auth.getUser()).data.user?.id}).eq('id',id).eq('status','pending');
      if(error){setMessage('Rifiuto non riuscito: '+error.message);setBusy(null);return;}
      setItems(prev=>prev.map(x=>x.id===id?{...x,status:'rejected'}:x));setMessage('Contributo rifiutato.');
    }
    setBusy(null);
  }
  if(!items.length)return <p>Non ci sono ancora contributi.</p>;
  return <div style={{display:'grid',gap:18,marginTop:24}}>{items.map(item=><article key={item.id} style={{border:'1px solid var(--border, #ddd)',borderRadius:14,padding:20}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><div><span className="eyebrow">{item.category} · {new Date(item.created_at).toLocaleString('it-IT')}</span><h2 style={{margin:'8px 0'}}>{item.title}</h2><p>Autore: <strong>{item.author_name}</strong></p></div><strong>{item.status==='pending'?'IN ATTESA':item.status==='approved'?'APPROVATO':'RIFIUTATO'}</strong></div>
    {item.excerpt&&<p>{item.excerpt}</p>}<details><summary>Leggi il testo completo</summary><div style={{whiteSpace:'pre-wrap',marginTop:12}}>{item.body_html}</div></details>
    {item.cover_url&&<p><a href={item.cover_url} target="_blank" rel="noreferrer">Apri copertina</a></p>}
    {item.status==='pending'&&<div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:16}}><button className="btn" disabled={!!busy} onClick={()=>review(item.id,'approve')}>{busy===item.id?'Elaborazione…':'Approva e pubblica'}</button><button className="btn" style={{background:'#66737c'}} disabled={!!busy} onClick={()=>review(item.id,'reject')}>Rifiuta</button></div>}
  </article>)}</div>;
}
