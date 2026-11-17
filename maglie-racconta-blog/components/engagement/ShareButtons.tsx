'use client';
import {useEffect, useState} from 'react';

// Pulsanti di condivisione con semplici link: nessuno script di Facebook, X o altri
// social viene caricato, quindi nessun tracciamento dei lettori e nessun cookie di terze parti.
export default function ShareButtons({title}: {title: string}) {
  const [url, setUrl] = useState('');
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href.split('#')[0]);
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    {name: 'WhatsApp', href: `https://wa.me/?text=${t}%20${u}`},
    {name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`},
    {name: 'X', href: `https://x.com/intent/post?text=${t}&url=${u}`},
    {name: 'Telegram', href: `https://t.me/share/url?url=${u}&text=${t}`},
    {name: 'Email', href: `mailto:?subject=${t}&body=${t}%0A${u}`}
  ];

  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch {}
  }
  async function nativeShare() {
    try { await navigator.share({title, url}); } catch {}
  }

  return <div className="share">
    <span className="share-label">Condividi</span>
    <div className="share-list">
      {canNativeShare && <button type="button" className="engage-btn" onClick={nativeShare}>Condividi…</button>}
      {links.map(l => <a key={l.name} className="engage-btn" href={url ? l.href : '#'} target="_blank" rel="noopener noreferrer" aria-label={`Condividi su ${l.name}`}>{l.name}</a>)}
      <button type="button" className="engage-btn" onClick={copy}>{copied ? 'Link copiato ✓' : 'Copia link'}</button>
    </div>
  </div>;
}
