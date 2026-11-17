import './globals.css';
import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';

// I font vengono scaricati in fase di build e serviti dal sito stesso:
// i browser dei lettori non contattano i server di Google (nessun invio dell'IP a terzi).
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-dm', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-playfair', display: 'swap' });

export const metadata: Metadata = { title: 'Maglie Racconta | La città, le persone, le storie', description: 'Il magazine digitale dedicato a Maglie e al territorio: cronaca, cultura, eventi, sport e comunità.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="it" className={`${dmSans.variable} ${playfair.variable}`}><body>{children}</body></html>; }
