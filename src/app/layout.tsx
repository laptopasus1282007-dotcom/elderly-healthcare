import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AyuCare - Smart Elderly Care & Medication Management Platform',
  description: 'Connected healthcare ecosystem for elderly individuals, caretakers, and family members with Gemini AI vision OCR and proactive alerts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mr" className="scroll-smooth">
      <body className="antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
