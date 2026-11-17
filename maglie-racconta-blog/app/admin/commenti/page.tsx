import {redirect} from 'next/navigation';
import Link from 'next/link';
import {supabaseServer} from '@/lib/supabase/server';
import ModerateComments from './ModerateComments';

export default async function CommentsModerationPage(){
  const db=supabaseServer();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/admin/login');
  const {data:profile}=await db.from('profiles').select('role').eq('id',user.id).maybeSingle();if(profile?.role!=='admin')redirect('/admin');
  const {data:comments,error}=await db.from('article_comments').select('id,author_name,body,status,created_at,articles(title,slug)').order('created_at',{ascending:false}).limit(200);
  return <main className="wrap"><div className="adminbar"><div><div className="eyebrow">Redazione</div><h1>Commenti dei lettori</h1></div><Link className="btn" href="/admin">Torna all’area admin</Link></div>
  <p>I commenti non sono pubblici finché non li approvi. Puoi anche eliminarli definitivamente, per esempio su richiesta dell’autore.</p>
  {error?<p role="alert">Impossibile caricare i commenti. Verifica di aver eseguito lo script <code>supabase/engagement.sql</code> in Supabase.</p>:<ModerateComments comments={(comments as any[])||[]}/>}</main>;
}
