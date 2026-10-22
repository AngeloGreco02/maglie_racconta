'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {supabaseBrowser} from '@/lib/supabase/client';

const categories=['Cronaca','Cultura','Eventi','Sport','Comunità','Scuola','Territorio','Opinioni'];
function slugify(v:string){return v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}

export default function SubmitArticle(){
  const router=useRouter();
  const [ready,setReady]=useState(false);const [author,setAuthor]=useState('');const [title,setTitle]=useState('');const [slug,setSlug]=useState('');const [excerpt,setExcerpt]=useState('');const [body,setBody]=useState('');const [category,setCategory]=useState('Cronaca');const [cover,setCover]=useState('');const [alt,setAlt]=useState('');const [seoTitle,setSeoTitle]=useState('');const [seoDescription,setSeoDescription]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
  useEffect(()=>{(async()=>{const db=supabaseBrowser();const {data:{user}}=await db.auth.getUser();if(!user){router.replace('/collabora/login');return;}const {data:p}=await db.from('profiles').select('role').eq('id',user.id).maybeSingle();if(!p||!['admin','contributor'].includes(p.role)){await db.auth.signOut();router.replace('/collabora/login');return;}setAuthor(user.user_metadata?.full_name||user.email?.split('@')[0]||'');setReady(true);})();},[router]);
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('Invio in corso…');const db=supabaseBrowser();const {data:{user}}=await db.auth.getUser();if(!user){router.replace('/collabora/login');return;}
    const {error}=await db.from('contributor_submissions').insert({user_id:user.id,author_name:author.trim(),title:title.trim(),slug:slug||slugify(title),excerpt:excerpt.trim(),body_html:body,category,cover_url:cover.trim()||null,cover_alt:alt.trim()||null,seo_title:seoTitle.trim()||null,seo_description:seoDescription.trim()||null,status:'pending'});
    if(error){setMessage('Invio non riuscito: '+error.message);setBusy(false);return;}setMessage('Contributo inviato alla redazione. Non sarà pubblicato prima dell’approvazione.');setTitle('');setSlug('');setExcerpt('');setBody('');setCover('');setAlt('');setSeoTitle('');setSeoDescription('');setBusy(false);
  }
  if(!ready)return <main className="wrap"><p>Verifica dell’accesso…</p></main>;
  return <main className="wrap" style={{maxWidth:820,paddingTop:36,paddingBottom:64}}>
    <div className="eyebrow">Area collaboratori</div><h1>Invia un articolo</h1><p>Il contributo sarà inviato alla redazione e resterà in attesa di revisione.</p>
    <form className="form" onSubmit={submit}>
      <label className="label">Nome e cognome dell’autore<input className="input" required maxLength={100} value={author} onChange={e=>setAuthor(e.target.value)}/></label>
      <label className="label">Titolo<input className="input" required maxLength={180} value={title} onChange={e=>{setTitle(e.target.value);setSlug(slugify(e.target.value));}}/></label>
      <label className="label">Categoria<select className="input" value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
      <label className="label">Sommario<textarea className="input" rows={3} maxLength={500} value={excerpt} onChange={e=>setExcerpt(e.target.value)}/></label>
      <label className="label">Testo dell’articolo<textarea className="input" rows={14} required minLength={80} maxLength={40000} value={body} onChange={e=>setBody(e.target.value)} placeholder="Scrivi il testo in formato HTML semplice oppure testo con paragrafi."/></label>
      <label className="label">URL della copertina (facoltativo)<input className="input" type="url" value={cover} onChange={e=>setCover(e.target.value)}/></label>
      <label className="label">Testo alternativo della copertina<input className="input" maxLength={250} value={alt} onChange={e=>setAlt(e.target.value)}/></label>
      <details><summary>Opzioni SEO (facoltative)</summary><label className="label">Titolo SEO<input className="input" maxLength={70} value={seoTitle} onChange={e=>setSeoTitle(e.target.value)}/></label><label className="label">Descrizione SEO<textarea className="input" rows={2} maxLength={170} value={seoDescription} onChange={e=>setSeoDescription(e.target.value)}/></label></details>
      {message&&<p role="status">{message}</p>}
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button className="btn" disabled={busy}>{busy?'Invio…':'Invia alla redazione'}</button><a className="btn" style={{background:'#66737c'}} href="/collabora">Annulla</a></div>
    </form>
  </main>;
}
