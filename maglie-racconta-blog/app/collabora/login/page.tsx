'use client';
import {useState} from 'react';
import {supabaseBrowser} from '@/lib/supabase/client';

export default function ContributorLogin(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent){
    e.preventDefault();setBusy(true);setError('');
    const db=supabaseBrowser();
    const {error}=await db.auth.signInWithPassword({email,password});
    if(error){setError('Accesso non riuscito. Verifica le credenziali fornite dalla redazione.');setBusy(false);return;}
    const {data:{user}}=await db.auth.getUser();
    const {data:profile}=await db.from('profiles').select('role').eq('id',user?.id).maybeSingle();
    if(!profile || !['admin','contributor'].includes(profile.role)){
      await db.auth.signOut();setError('Questo account non è abilitato come collaboratore. Contatta la redazione.');setBusy(false);return;
    }
    window.location.href=profile.role==='admin'?'/admin':'/collabora/invia';
  }
  return <main className="wrap" style={{maxWidth:520,paddingTop:56,paddingBottom:64}}>
    <a className="brand" href="/">MAGLIE RACCONTA</a><h1>Accesso collaboratori</h1>
    <p>Usa l'account autorizzato dalla redazione. Non è prevista la registrazione pubblica.</p>
    <form className="form" onSubmit={submit}>
      <label className="label">Email<input className="input" type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label>
      <label className="label">Password<input className="input" type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
      {error&&<p role="alert">{error}</p>}
      <button className="btn" disabled={busy}>{busy?'Accesso…':'Accedi'}</button>
    </form>
    <p><a href="/collabora">← Come collaborare</a></p>
  </main>;
}
