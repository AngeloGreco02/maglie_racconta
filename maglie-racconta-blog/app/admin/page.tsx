import {redirect} from 'next/navigation';
import Link from 'next/link';
import {supabaseServer} from '@/lib/supabase/server';
import SignOut from './signout';

export default async function Admin(){
  const db=supabaseServer();
  const {data:{user}}=await db.auth.getUser();
  if(!user)redirect('/admin/login');
  const {data:profile}=await db.from('profiles').select('role').eq('id',user.id).maybeSingle();
  if(profile?.role!=='admin')return <main className="wrap"><h1>Accesso non autorizzato</h1><p>Il tuo account non ha il ruolo amministratore. Contatta chi gestisce il sito.</p><SignOut/></main>;
  const [{data:articles},{count:pendingCount}] = await Promise.all([
    db.from('articles').select('id,title,slug,status,updated_at,category').order('updated_at',{ascending:false}),
    db.from('contributor_submissions').select('id',{count:'exact',head:true}).eq('status','pending')
  ]);
  const pending = pendingCount || 0;
  return <main className="wrap">
    <div className="adminbar">
      <div><div className="eyebrow">Redazione</div><h1>Gestione articoli</h1></div>
      <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
        <Link className="btn" href="/admin/contributi" style={{position:'relative'}}>
          Contributi in attesa
          {pending>0&&<span aria-label={`${pending} contributi in attesa`} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',marginLeft:9,minWidth:23,height:23,padding:'0 6px',borderRadius:999,background:'#f6c453',color:'#172b38',fontSize:13,fontWeight:800}}>{pending}</span>}
        </Link>
        <Link className="btn" href="/admin/articoli/nuovo">+ Nuovo articolo</Link>
        <SignOut/>
      </div>
    </div>
    <p><Link href="/">← Visualizza il magazine</Link></p>
    <div style={{overflowX:'auto'}}><table className="table"><thead><tr><th>Titolo</th><th>Categoria</th><th>Stato</th><th>Modifica</th></tr></thead><tbody>{articles?.map(a=><tr key={a.id}><td>{a.title}</td><td>{a.category}</td><td className="status">{a.status==='published'?'PUBBLICATO':'BOZZA'}</td><td><Link href={'/admin/articoli/'+a.id}>Apri →</Link></td></tr>)}</tbody></table></div>
  </main>;
}
