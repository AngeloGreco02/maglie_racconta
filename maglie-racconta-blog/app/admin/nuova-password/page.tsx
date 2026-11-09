
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
    async function verifyLink() {
      const supabase = supabaseBrowser();
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setError('Il link di recupero non è valido o è scaduto. Richiedi una nuova email.');
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setError('Sessione di recupero non valida. Richiedi un nuovo link.');
        return;
      }

      setReady(true);
    }

    verifyLink();
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
      setError('Non è stato possibile aggiornare la password. Riprova.');
      setBusy(false);
      return;
    }

    await supabaseBrowser().auth.signOut();
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
          <p>
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
