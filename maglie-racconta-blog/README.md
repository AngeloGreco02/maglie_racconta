# Maglie Racconta — magazine digitale

Starter autonomo Next.js + Supabase per un magazine locale con articoli, categorie, ricerca, immagini, bozze e pubblicazione.

## Requisiti
- Node.js 20+
- Progetto Supabase
- Account hosting (ad esempio Vercel)

## Avvio
1. `npm install`
2. Copia `.env.example` in `.env.local` e inserisci URL e chiavi Supabase.
3. Esegui il contenuto di `supabase/schema.sql` in Supabase → SQL Editor.
4. In Supabase → Authentication → Users, crea il tuo utente amministratore.
5. In Supabase → SQL Editor, assegna il ruolo admin all'utente:
   `insert into public.profiles (id, role) values ('UUID-UTENTE', 'admin') on conflict (id) do update set role='admin';`
6. `npm run dev`

## Funzioni incluse nello starter
- Homepage magazine, categorie, ricerca e pagine articolo
- Pannello admin protetto da sessione Supabase e ruolo `admin`
- Creazione/modifica articoli, bozze/pubblicazione, slug, excerpt e metadati SEO
- Caricamento copertine su Supabase Storage
- Schema database con policy RLS

## Prima di andare online
- Configura un dominio e le variabili d'ambiente nell'hosting.
- In Supabase Storage crea il bucket `article-covers` pubblico per la visualizzazione delle copertine; limita gli upload agli utenti autenticati.
- Verifica privacy/cookie, accessibilità, backup e contatti editoriali.
- Questo pacchetto è una base applicativa da configurare e collaudare: non è ancora pubblicato e non include credenziali, dominio o account Supabase già configurati.
