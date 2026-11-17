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
  
Progetto web Maglie Racconta

## Mi piace, commenti e condivisione
1. In Supabase → SQL Editor esegui `supabase/engagement.sql` (una sola volta; è rieseguibile).
2. Sotto ogni articolo compaiono: pulsante "Mi piace", pulsanti di condivisione e commenti.
3. I commenti restano nascosti finché non li approvi da **Admin → Commenti da moderare** (`/admin/commenti`).

Privacy: i "mi piace" sono un contatore anonimo (nessun IP o cookie); i commenti salvano solo nome, testo e data; i pulsanti di condivisione sono semplici link e non caricano script dei social. Prima di andare online pubblica una pagina privacy con titolare del trattamento e contatti per chiedere la rimozione dei commenti.

## Visualizzazioni
1. In Supabase → SQL Editor esegui `supabase/views.sql` (una sola volta; è rieseguibile).
2. Accanto all'autore di ogni articolo compare l'icona a forma di occhio con il numero di visualizzazioni; nelle schede della home il numero appare dopo la data, quando è maggiore di zero.

Privacy: il contatore è anonimo (nessun IP, cookie o orario). Il browser ricorda solo per la scheda aperta, in `sessionStorage`, che l'articolo è già stato contato, così ricaricare la pagina non aumenta il numero. Finché lo script non è eseguito il sito funziona normalmente, senza contatore.
