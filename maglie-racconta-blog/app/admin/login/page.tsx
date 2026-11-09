
'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function Login() {
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

    const { error } = await supabaseBrowser().auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError('Accesso non riuscito. Controlla le credenziali.');
      setBusy(false);
      return;
    }

    window.location.href = '/admin';
  }

  async function recoverPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');

    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/admin/nuova-password`
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
    <main className="wrap">
      <div style={{ maxWidth: 430, margin: '12vh auto' }}>
        <a className="brand" href="/">MAGLIE RACCONTA</a>

        <h1>{forgot ? 'Recupera password' : 'Area redazione'}</h1>

        <p>
          {forgot
            ? 'Inserisci la tua email per ricevere il link di recupero.'
            : 'Accesso riservato agli amministratori autorizzati.'}
        </p>

        <form
          className="form"
          onSubmit={forgot ? recoverPassword : submit}
        >
          <label className="label">
            Email
            <input
              className="input"
              type="email"
              required
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
              ← Torna al login
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

        <p><a href="/">← Torna al magazine</a></p>
      </div>
    </main>
  );
}
