import Header from '@/components/Header';

export const metadata = {
  title: 'Informativa privacy | Maglie Racconta',
  description: 'Come Maglie Racconta tratta i dati personali di lettori, commentatori e collaboratori.'
};

// Dati del titolare. Per cambiarli basta modificare queste righe.
const TITOLARE = 'Angelo Greco';
const EMAIL = 'grecoangelo50@gmail.com';
const CONSERVAZIONE_COMMENTI_NON_APPROVATI = '30 giorni';
const ULTIMO_AGGIORNAMENTO = '17 novembre 2026';

const isPlaceholder = (v: string) => v.startsWith('[DA COMPLETARE');
const Val = ({ v }: { v: string }) =>
  isPlaceholder(v) ? <mark>{v}</mark> : <>{v}</>;

export default function Privacy() {
  return (
    <>
      <Header />
      <main className="wrap">
        <article className="content">
          <div className="eyebrow">Informativa ai sensi degli artt. 13 e 14 del Regolamento (UE) 2016/679</div>
          <h1>Informativa privacy</h1>
          <p className="lead">
            Questa pagina spiega quali dati personali raccoglie Maglie Racconta, perché, per quanto tempo e quali sono i tuoi diritti.
            Abbiamo scelto di raccogliere il minimo indispensabile.
          </p>

          <h2>1. Titolare del trattamento</h2>
          <p>
            Titolare del trattamento è <Val v={TITOLARE} />.
            Per qualsiasi richiesta sulla privacy puoi scrivere a <a href={`mailto:${EMAIL}`} style={{ textDecoration: 'underline' }}>{EMAIL}</a>.
          </p>

          <h2>2. Quali dati trattiamo e perché</h2>

          <h3>Navigazione del sito</h3>
          <p>
            Quando visiti il sito, il fornitore di hosting registra automaticamente alcuni dati tecnici (indirizzo IP, tipo di browser,
            pagina richiesta, data e ora) necessari per far funzionare il sito e proteggerlo da abusi. Questi dati non vengono usati per
            identificarti né per profilarti. Base giuridica: legittimo interesse al funzionamento e alla sicurezza del sito
            (art. 6, par. 1, lett. f GDPR). Sono conservati per il tempo tecnico previsto dal fornitore di hosting.
          </p>
          <p>
            Oltre al contatore anonimo delle visualizzazioni descritto più sotto, il sito non usa strumenti di statistica, pubblicità o profilazione. I caratteri tipografici sono ospitati direttamente
            sul sito: il tuo browser non contatta server di terze parti per scaricarli.
          </p>

          <h3>Pulsante “Mi piace”</h3>
          <p>
            Il “Mi piace” è un contatore anonimo: non registriamo chi lo mette, né il suo indirizzo IP. Per evitare che tu lo conti due
            volte per errore, il tuo browser memorizza localmente (nel cosiddetto <em>localStorage</em>) un’indicazione che hai già messo
            “Mi piace” a quell’articolo. Questa informazione resta sul tuo dispositivo, non ci viene inviata e puoi cancellarla in qualsiasi
            momento dalle impostazioni del browser.
          </p>

          <h3>Contatore delle visualizzazioni</h3>
          <p>
            Su ogni articolo mostriamo quante volte è stato letto. È un contatore anonimo: non registriamo chi legge, il suo
            indirizzo IP né l’orario della lettura, ma solo un numero totale per articolo. Per non contare più volte la stessa lettura
            quando ricarichi la pagina, il tuo browser memorizza localmente (nel <em>sessionStorage</em>) che hai già aperto
            quell’articolo; questa informazione resta sul tuo dispositivo, non ci viene inviata e si cancella da sola quando chiudi la
            scheda. Non si tratta di un cookie e non serve a profilarti.
          </p>

          <h3>Commenti</h3>
          <p>
            Se lasci un commento raccogliamo solo il <strong>nome</strong> che scegli di indicare (anche uno pseudonimo), il
            <strong> testo</strong> del commento e la <strong>data</strong> di invio. Non chiediamo email e non registriamo l’indirizzo IP.
          </p>
          <ul>
            <li><strong>Finalità:</strong> moderare il commento e, se approvato, pubblicarlo sotto l’articolo, visibile a chiunque.</li>
            <li><strong>Base giuridica:</strong> il tuo consenso, espresso spuntando la casella prima dell’invio (art. 6, par. 1, lett. a GDPR). Puoi revocarlo in qualsiasi momento chiedendo la rimozione del commento.</li>
            <li><strong>Conservazione:</strong> i commenti pubblicati restano online insieme all’articolo, salvo tua richiesta di rimozione; quelli non approvati sono conservati al massimo per <Val v={CONSERVAZIONE_COMMENTI_NON_APPROVATI} /> e poi eliminati.</li>
            <li><strong>Attenzione:</strong> non inserire nei commenti dati personali tuoi o di altre persone (numeri di telefono, indirizzi, informazioni sulla salute). La redazione può rifiutare o modificare i commenti che li contengono.</li>
          </ul>
          <p>I commenti sono riservati a chi ha compiuto 14 anni.</p>

          <h3>Area riservata di redazione e collaboratori</h3>
          <p>
            Redattori e collaboratori accedono con email e password. Trattiamo questi dati solo per gestire l’account e l’invio dei
            contributi (art. 6, par. 1, lett. b GDPR), per tutta la durata della collaborazione. Il nome indicato dall’autore viene
            pubblicato insieme ai suoi articoli.
          </p>

          <h3>Condivisione sui social</h3>
          <p>
            I pulsanti “Condividi” sono semplici collegamenti: finché non li clicchi, nessun dato viene inviato a WhatsApp, Facebook, X,
            Telegram o altri servizi. Se li usi, si applica l’informativa privacy del servizio che scegli.
          </p>

          <h2>3. Cookie</h2>
          <p>
            Il sito usa esclusivamente cookie tecnici, necessari a mantenere la sessione di chi accede all’area riservata. Non usiamo
            cookie di profilazione, pubblicitari o statistici di terze parti: per questo non è richiesto un banner di consenso.
          </p>

          <h2>4. Chi tratta i dati per nostro conto</h2>
          <p>I dati sono trattati con l’aiuto di fornitori nominati responsabili del trattamento (art. 28 GDPR):</p>
          <ul>
            <li><strong>Vercel Inc.</strong> – hosting del sito. I server possono trovarsi negli Stati Uniti; il trasferimento avviene sulla base dell’EU-U.S. Data Privacy Framework e/o delle clausole contrattuali standard della Commissione europea.</li>
            <li><strong>Supabase Inc.</strong> – database (articoli, commenti, account), con server nell’Unione europea (Irlanda).</li>
          </ul>
          <p>I dati non vengono venduti né ceduti a terzi per finalità commerciali.</p>

          <h2>5. I tuoi diritti</h2>
          <p>
            Puoi chiedere in qualsiasi momento l’accesso ai tuoi dati, la rettifica, la cancellazione (per esempio di un tuo commento),
            la limitazione del trattamento, la portabilità, e puoi opporti al trattamento o revocare il consenso, scrivendo a <Val v={EMAIL} />.
            Rispondiamo entro un mese. Hai anche il diritto di presentare reclamo al Garante per la protezione dei dati personali
            (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>www.garanteprivacy.it</a>).
          </p>

          <h2>6. Modifiche</h2>
          <p>
            Questa informativa può essere aggiornata, per esempio se aggiungiamo nuove funzioni al sito. La versione in vigore è sempre
            pubblicata su questa pagina. Ultimo aggiornamento: <Val v={ULTIMO_AGGIORNAMENTO} />.
          </p>
        </article>
      </main>
      <footer className="footer">
        <div className="wrap"><a href="/">← Torna alla home</a></div>
      </footer>
    </>
  );
}
