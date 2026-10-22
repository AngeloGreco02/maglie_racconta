import Link from 'next/link';

export default function Collabora() {
  return <main className="wrap" style={{maxWidth:760,paddingTop:48,paddingBottom:64}}>
    <div className="eyebrow">Maglie Racconta · Partecipa</div>
    <h1>Racconta la tua città</h1>
    <p className="lead">Hai una notizia, una storia, un evento o un tema che merita attenzione? Invia il tuo contributo alla redazione di Maglie Racconta.</p>
    <div style={{border:'1px solid var(--border, #ddd)',borderRadius:14,padding:24,marginTop:24}}>
      <h2>Come funziona</h2>
      <ol style={{lineHeight:1.9,paddingLeft:22}}>
        <li>Accedi con l'account da collaboratore che ti è stato assegnato dalla redazione.</li>
        <li>Compila il modulo con titolo, categoria e testo dell'articolo.</li>
        <li>La redazione esaminerà il contributo prima di qualsiasi pubblicazione.</li>
      </ol>
      <p><strong>L'invio non garantisce la pubblicazione.</strong> Ogni contributo viene verificato e approvato dalla redazione.</p>
      <Link className="btn" href="/collabora/login">Accedi come collaboratore</Link>
    </div>
    <p style={{marginTop:24}}><Link href="/">← Torna al magazine</Link></p>
  </main>;
}
