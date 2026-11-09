
'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function NuovaPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    async function verifyLink() {
      const supabase = supabaseBrowser();
      const params = new URLSearchParams(window.location.search);

      const authError = params.get('error_description');
      if (authError) {
        if (active) setError(decodeURIComponent(authError.replace(/\+/g, ' ')));
        return;
      }

      const code = params.get('code');

      // Prima controlliamo se Supabase ha già creato la sessione.
      let { data, error } = await supabase.auth.getSession();

      if (!data.session && code) {
        const result = await supabase.auth.exchangeCodeForSession(code);

        if (result.error) {
          if (active) {
            setError('Errore Supabase: ' + result.error.message);
          }
          return;
        }

        ({ data, error } = await supabase.auth.getSession());
      }

      if (!active) return;

      if (error || !data.session) {
        setError('Sessione non valida. Dettaglio: ' +
          (error?.message || 'Nessuna sessione trovata.'));
        return;
      }

      setReady(true);
    }

    verifyLink();

    return () => {
      active = false;
    };
  }, []);

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La password deve contenere almeno 8 caratteri.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Le password non coincidono.');
      return;
    }

    setBusy(true);

    const supabase = supabaseBrowser();

    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      setError('Errore Supabase: ' + error.message);
      setBusy(false);
      return;
    }

    await supabase.auth.signOut();

    setSuccess(true);
    setBusy(false);
  }

  return (
    <main className="wrap">
      <div style={{ maxWidth: 430, margin: '12vh auto' }}>
        <a className="brand" href="/">MAGLIE RACCONTA</a>

        <h1>Nuova password</h1>

        {success ? (
          <>
            <p>Password aggiornata correttamente!</p>
            <p>Ora puoi accedere alla redazione con la nuova password.</p>
            <a className="btn" href="/admin/login">
              Torna al login
            </a>
          </>
        ) : !ready ? (
          <p role="alert">
            {error || 'Verifica del collegamento in corso…'}
          </p>
        ) : (
          <>
            <p>Inserisci e conferma la tua nuova password.</p>

            <form className="form" onSubmit={updatePassword}>
              <label className="label">
                Nuova password
                <input
                  className="input"
                  type="password"
                  minLength={8}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </label>

              <label className="label">
                Conferma password
                <input
                  className="input"
                  type="password"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </label>

              {error && <p role="alert">{error}</p>}

              <button className="btn" disabled={busy}>
                {busy ? 'Aggiornamento…' : 'Salva nuova password'}
              </button>
            </form>
          </>
        )}

        <p><a href="/">← Torna al magazine</a></p>
      </div>
    </main>
  );
}
