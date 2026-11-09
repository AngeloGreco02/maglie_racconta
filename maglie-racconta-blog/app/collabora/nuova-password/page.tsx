
'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function ContributorNewPassword() {
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
        if (active) setError(authError);
        return;
      }

      const code = params.get('code');

      if (!code) {
        if (active) setError('Link di recupero mancante o non valido. Richiedi una nuova email.');
        return;
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!active) return;

      if (error || !data.session) {
        setError('Non è stato possibile verificare il link. Dettaglio: ' +
          (error?.message || 'Sessione non disponibile.'));
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

    const { error } = await supabaseBrowser().auth.updateUser({
      password
    });

    if (error) {
      setError('Errore: ' + error.message);
      setBusy(false);
      return;
    }

    await supabaseBrowser().auth.signOut();

    setSuccess(true);
    setBusy(false);
  }

  return (
    <main className="wrap" style={{ maxWidth: 520, paddingTop: 56, paddingBottom: 64 }}>
      <a className="brand" href="/">MAGLIE RACCONTA</a>

      <h1>Nuova password collaboratore</h1>

      {success ? (
        <>
          <p>Password aggiornata correttamente!</p>
          <p>Ora puoi accedere con la nuova password.</p>
          <a className="btn" href="/collabora/login">
            Torna all'accesso collaboratori
          </a>
        </>
      ) : !ready ? (
        <p role="alert">{error || 'Verifica del collegamento in corso…'}</p>
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
                autoComplete="new-password"
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
                autoComplete="new-password"
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

      <p><a href="/collabora">← Come collaborare</a></p>
    </main>
  );
}
