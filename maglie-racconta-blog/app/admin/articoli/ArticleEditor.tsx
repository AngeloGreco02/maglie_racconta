'use client';

import {useState} from 'react';
import {supabaseBrowser} from '@/lib/supabase/client';

export default function ArticleEditor({article}:{article?:any}){
  const [title,S]=useState(article?.title||'');
  const [slug,SS]=useState(article?.slug||'');
  const [excerpt,SE]=useState(article?.excerpt||'');
  const [body,SB]=useState(article?.body_html||'');
  const [plainTextMode,SPT]=useState(!(article?.body_html||'').trim().startsWith('<'));
  const [category,SC]=useState(article?.category||'Cronaca');
  const [authorName,SAN]=useState(article?.author_name||'Angelo Greco');
  const [status,ST]=useState(article?.status||'draft');
  const [cover,SU]=useState(article?.cover_url||'');
  const [alt,SA]=useState(article?.cover_alt||'');
  const [seoTitle,SET]=useState(article?.seo_title||'');
  const [seoDesc,SED]=useState(article?.seo_description||'');
  const [message,SM]=useState('');
  const [busy,B]=useState(false);
  const [uploading,U]=useState(false);

  function slugify(v:string){
    return v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  }

  async function upload(file?:File){
    if(!file)return;
    const allowedTypes=['image/jpeg','image/png','image/webp'];
    if(!allowedTypes.includes(file.type)){SM('Formato non consentito. Usa JPG, PNG o WebP.');return;}
    if(file.size>5*1024*1024){SM('Immagine troppo grande: il limite è 5 MB.');return;}
    U(true);SM('Caricamento della copertina in corso…');
    try{
      const db=supabaseBrowser();
      const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
      const path=`${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const {data:uploaded,error}=await db.storage.from('article-covers').upload(path,file,{upsert:false,contentType:file.type});
      if(error)throw error;
      if(!uploaded?.path)throw new Error('Supabase non ha restituito il percorso del file.');
      const {data}=db.storage.from('article-covers').getPublicUrl(uploaded.path);
      if(!data?.publicUrl)throw new Error('Non è stato possibile generare l’URL pubblico.');
      SU(data.publicUrl);
      SM('Copertina caricata. URL inserito automaticamente: ricordati di salvare o pubblicare l’articolo.');
    }catch(error:any){
      console.error('Errore caricamento copertina:',error);
      const detail=error?.message||error?.error_description||'Errore sconosciuto';
      SM('Caricamento non riuscito: '+detail+'. Verifica che esista il bucket pubblico “article-covers” in Supabase Storage e che siano attive le policy di caricamento.');
    }finally{
      U(false);
    }
  }

  function escapeHtml(value:string){
    return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function formatBody(value:string){
    if(!plainTextMode)return value;
    return value.trim().split(/\n\\s*\n/).map(paragraph=>`<p>${escapeHtml(paragraph).replace(/\n/g,'<br />')}</p>`).join('');
  }

  async function save(publish:boolean){
    B(true);SM('Salvataggio…');
    const db=supabaseBrowser();
    const payload={
      title,slug:slug||slugify(title),excerpt,body_html:formatBody(body),category,author_name:authorName.trim(),
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
    <label className="label">Autore / autrice<input className="input" required value={authorName} onChange={e=>SAN(e.target.value)} placeholder="Nome e cognome" /></label>
    <label className="label">Categoria<select className="input" value={category} onChange={e=>SC(e.target.value)}>{['Cronaca','Cultura','Eventi','Sport','Comunità','Scuola','Territorio','Opinioni'].map(x=><option key={x}>{x}</option>)}</select></label>
    <label className="label">Sommario / excerpt<textarea className="input" rows={3} value={excerpt} onChange={e=>SE(e.target.value)}/></label>
    <label className="label">Formato del testo<select className="input" value={plainTextMode?'plain':'html'} onChange={e=>SPT(e.target.value==='plain')}><option value="plain">Testo normale (senza HTML)</option><option value="html">HTML (per formattazione avanzata)</option></select></label>\n    <label className="label">Testo articolo<textarea className="input" rows={12} required value={body} onChange={e=>SB(e.target.value)} placeholder={plainTextMode?'Scrivi normalmente. Lascia una riga vuota tra un paragrafo e l’altro.':'Puoi usare HTML come <p>, <h2>, <strong> e <ul>.'}/></label>\n    {plainTextMode&&<p className="muted">Il testo normale viene trasformato automaticamente in paragrafi. Non devi conoscere l’HTML.</p>}
    <label className="label">Carica copertina<input className="input" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={e=>{const file=e.target.files?.[0];void upload(file);e.currentTarget.value="";}}/>{uploading&&<span className="muted">Caricamento in corso…</span>}</label>
    {cover&&<img src={cover} alt={alt} style={{maxWidth:260,borderRadius:8}}/>}
    <label className="label">URL copertina (facoltativo)<input className="input" value={cover} onChange={e=>SU(e.target.value)}/></label>
    <label className="label">Testo alternativo immagine<input className="input" value={alt} onChange={e=>SA(e.target.value)}/></label>
    <label className="label">Titolo SEO<input className="input" maxLength={70} value={seoTitle} onChange={e=>SET(e.target.value)}/></label>
    <label className="label">Descrizione SEO<textarea className="input" rows={2} maxLength={170} value={seoDesc} onChange={e=>SED(e.target.value)}/></label>
    <label className="label">Stato<select className="input" value={status} onChange={e=>ST(e.target.value)}><option value="draft">Bozza</option><option value="published">Pubblicato</option></select></label>
    {message&&<p role="status">{message}</p>}
    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
      <button className="btn" disabled={busy||uploading}>Salva modifiche</button>
      <button className="btn" type="button" disabled={busy||uploading} onClick={()=>save(true)}>Pubblica ora</button>
      {article?.id&&<button className="btn" type="button" disabled={busy} onClick={removeArticle} style={{background:'#9f2d1d'}}>Elimina articolo</button>}
      <a className="btn" style={{background:'#66737c'}} href="/admin">Annulla</a>
    </div>
  </form>;
}
