import {redirect} from 'next/navigation';
import Link from 'next/link';
import {supabaseServer} from '@/lib/supabase/server';
import ReviewContributions from './ReviewContributions';

export default async function ContributionsPage(){
  const db=supabaseServer();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/admin/login');
  const {data:profile}=await db.from('profiles').select('role').eq('id',user.id).maybeSingle();if(profile?.role!=='admin')redirect('/admin');
  const {data:submissions,error}=await db.from('contributor_submissions').select('*').order('created_at',{ascending:false});
  return <main className="wrap"><div className="adminbar"><div><div className="eyebrow">Redazione</div><h1>Contributi da revisionare</h1></div><Link className="btn" href="/admin">Torna all’area admin</Link></div>
  <p>Gli articoli inviati dai collaboratori non sono pubblici finché non li approvi.</p>
  {error?<p role="alert">Impossibile caricare i contributi. Verifica di aver eseguito lo script SQL in Supabase.</p>:<ReviewContributions submissions={submissions||[]}/>}</main>;
}
