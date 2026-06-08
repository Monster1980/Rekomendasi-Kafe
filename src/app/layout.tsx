import './globals.css';

export const metadata = {
  title: 'Kafe Surabaya - Rekomendasi Kafe Terbaik di Surabaya',
  description: 'Temukan WFC & Tempat Nongkrong Terbaik di Surabaya',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white min-h-screen antialiased">{children}</body>
    </html>
  )
}
