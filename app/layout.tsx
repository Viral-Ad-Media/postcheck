import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'PostCheck — Viral Ad Media',description:'A clearer address step for Nigerian onboarding. NIPOST sandbox integration by Viral Ad Media.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
