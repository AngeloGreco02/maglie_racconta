import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';

// I font sono salvati nel progetto (app/fonts, licenza OFL) e serviti dal sito stesso:
// i browser dei lettori non contattano i server di Google e la build non dipende da internet.
const dmSans = localFont({ src: './fonts/dm-sans-latin-wght-normal.woff2', weight: '100 1000', variable: '--font-dm', display: 'swap' });
const playfair = localFont({ src: './fonts/playfair-display-latin-wght-normal.woff2', weight: '400 900', variable: '--font-playfair', display: 'swap' });

export const metadata: Metadata = { title: 'Maglie Racconta | La città, le persone, le storie', description: 'Il magazine digitale dedicato a Maglie e al territorio: cronaca, cultura, eventi, sport e comunità.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="it" className={`${dmSans.variable} ${playfair.variable}`}><body>{children}<Analytics /></body></html>; }
