import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Maglie Racconta | La città, le persone, le storie', description: 'Il magazine digitale dedicato a Maglie e al territorio: cronaca, cultura, eventi, sport e comunità.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="it"><body>{children}</body></html>; }
