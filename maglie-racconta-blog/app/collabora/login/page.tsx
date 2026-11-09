
'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function ContributorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');

    const db = supabaseBrowser();

    const { error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError('Accesso non riuscito. Verifica le credenziali fornite dalla redazione.');
      setBusy(false);
      return;
    }

    const { data: { user } } = await db.auth.getUser();

    const { data: profile } = await db
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .maybeSingle();

    if (!profile || !['admin', 'contributor'].includes(profile.role)) {
      await db.auth.signOut();
      setError('Questo account non è abilitato come collaboratore. Contatta la redazione.');
      setBusy(false);
      return;
    }

    window.location.href = profile.role === 'admin'
      ? '/admin'
      : '/collabora/invia';
  }

  async function recoverPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');

    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/collabora/nuova-password`
      }
    );

    if (error) {
      setError('Non è stato possibile inviare l’email. Riprova.');
    } else {
      setNotice('Se l’indirizzo è associato a un account, riceverai un’email con le istruzioni per reimpostare la password.');
    }

    setBusy(false);
  }

  return (
    <main className="wrap" style={{ maxWidth: 520, paddingTop: 56, paddingBottom: 64 }}>
      <a className="brand" href="/">MAGLIE RACCONTA</a>

      <h1>{forgot ? 'Recupera password' : 'Accesso collaboratori'}</h1>

      <p>
        {forgot
          ? 'Inserisci la tua email per ricevere il link di recupero.'
          : 'Usa l’account autorizzato dalla redazione. Non è prevista la registrazione pubblica.'}
      </p>

      <form className="form" onSubmit={forgot ? recoverPassword : submit}>
        <label className="label">
          Email
          <input
            className="input"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>

        {!forgot && (
          <label className="label">
            Password
            <input
              className="input"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>
        )}

        {error && <p role="alert">{error}</p>}
        {notice && <p role="status">{notice}</p>}

        <button className="btn" disabled={busy}>
          {busy
            ? 'Attendere…'
            : forgot
              ? 'Invia link di recupero'
              : 'Accedi'}
        </button>
      </form>

      <p>
        {forgot ? (
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              setForgot(false);
              setError('');
              setNotice('');
            }}
          >
            ← Torna all'accesso
          </a>
        ) : (
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              setForgot(true);
              setError('');
              setNotice('');
            }}
          >
            Password dimenticata?
          </a>
        )}
      </p>

      <p><a href="/collabora">← Come collaborare</a></p>
    </main>
  );
}
