'use client';

import {useState} from 'react';
import {supabaseBrowser} from '@/lib/supabase/client';

export default function ArticleEditor({article}:{article?:any}){
  const [title,S]=useState(article?.title||'');
  const [slug,SS]=useState(article?.slug||'');
  const [excerpt,SE]=useState(article?.excerpt||'');
  const [body,SB]=useState(article?.body_html||'');
  const [category,SC]=useState(article?.category||'Cronaca');
  const [status,ST]=useState(article?.status||'draft');
  const [cover,SU]=useState(article?.cover_url||'');
  const [alt,SA]=useState(article?.cover_alt||'');
  const [seoTitle,SET]=useState(article?.seo_title||'');
  const [seoDesc,SED]=useState(article?.seo_description||'');
  const [message,SM]=useState('');
  const [busy,B]=useState(false);

  function slugify(v:string){
    return v.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  }

  async function upload(file?:File){
    if(!file)return;
    const allowedTypes=['image/jpeg','image/png','image/webp'];
    if(!allowedTypes.includes(file.type)){SM('Formato non consentito. Usa JPG, PNG o WebP.');return;}
    if(file.size>5*1024*1024){SM('Immagine troppo grande: il limite è 5 MB.');return;}
    const db=supabaseBrowser();
    const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
    const path=`${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const {error}=await db.storage.from('article-covers').upload(path,file,{upsert:false});
    if(error){SM('Caricamento non riuscito: '+error.message);return;}
    const {data}=db.storage.from('article-covers').getPublicUrl(path);
    SU(data.publicUrl);SM('Copertina caricata.');
  }

  async function save(publish:boolean){
    B(true);SM('Salvataggio…');
    const db=supabaseBrowser();
    const payload={
      title,slug:slug||slugify(title),excerpt,body_html:body,category,
      status:publish?'published':status,cover_url:cover||null,cover_alt:alt||null,
      seo_title:seoTitle||null,seo_description:seoDesc||null,
      published_at:publish?(article?.published_at||new Date().toISOString()):(status==='published'?(article?.published_at||new Date().toISOString()):null),
      updated_at:new Date().toISOString()
    };
    const result=article?.id
      ?await db.from('articles').update(payload).eq('id',article.id)
      :await db.from('articles').insert(payload).select('id').single();
    if(result.error){SM('Errore: '+result.error.message);B(false);return;}
    SM('Salvato.');window.location.href='/admin';
  }

  async function removeArticle(){
    if(!article?.id)return;
    if(!window.confirm('Vuoi eliminare definitivamente questo articolo? Questa operazione non può essere annullata.'))return;
    B(true);SM('Eliminazione in corso…');
    const db=supabaseBrowser();
    const {error}=await db.from('articles').delete().eq('id',article.id);
    if(error){SM('Eliminazione non riuscita: '+error.message);B(false);return;}
    window.location.href='/admin';
  }

  return <form className="form" onSubmit={e=>{e.preventDefault();save(false)}}>
    <label className="label">Titolo<input className="input" required value={title} onChange={e=>{S(e.target.value);if(!article)SS(slugify(e.target.value));}}/></label>
    <label className="label">Slug URL<input className="input" required value={slug} onChange={e=>SS(slugify(e.target.value))}/></label>
    <label className="label">Categoria<select className="input" value={category} onChange={e=>SC(e.target.value)}>{['Cronaca','Cultura','Eventi','Sport','Comunità','Scuola','Territorio','Opinioni'].map(x=><option key={x}>{x}</option>)}</select></label>
    <label className="label">Sommario / excerpt<textarea className="input" rows={3} value={excerpt} onChange={e=>SE(e.target.value)}/></label>
    <label className="label">Testo articolo (HTML consentito)<textarea className="input" rows={12} required value={body} onChange={e=>SB(e.target.value)} placeholder="Scrivi il testo. Puoi usare paragrafi HTML come <p>...</p>, <h2>...</h2> e <strong>...</strong>."/></label>
    <label className="label">Carica copertina<input className="input" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>upload(e.target.files?.[0])}/></label>
    {cover&&<img src={cover} alt={alt} style={{maxWidth:260,borderRadius:8}}/>}
    <label className="label">URL copertina (facoltativo)<input className="input" value={cover} onChange={e=>SU(e.target.value)}/></label>
    <label className="label">Testo alternativo immagine<input className="input" value={alt} onChange={e=>SA(e.target.value)}/></label>
    <label className="label">Titolo SEO<input className="input" maxLength={70} value={seoTitle} onChange={e=>SET(e.target.value)}/></label>
    <label className="label">Descrizione SEO<textarea className="input" rows={2} maxLength={170} value={seoDesc} onChange={e=>SED(e.target.value)}/></label>
    <label className="label">Stato<select className="input" value={status} onChange={e=>ST(e.target.value)}><option value="draft">Bozza</option><option value="published">Pubblicato</option></select></label>
    {message&&<p role="status">{message}</p>}
    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
      <button className="btn" disabled={busy}>Salva modifiche</button>
      <button className="btn" type="button" disabled={busy} onClick={()=>save(true)}>Pubblica ora</button>
      {article?.id&&<button className="btn" type="button" disabled={busy} onClick={removeArticle} style={{background:'#9f2d1d'}}>Elimina articolo</button>}
      <a className="btn" style={{background:'#66737c'}} href="/admin">Annulla</a>
    </div>
  </form>;
}
