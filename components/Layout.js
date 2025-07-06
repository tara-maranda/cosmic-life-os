import Head from 'next/head'

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Cosmic Life OS - Your Second Brain</title>
        <meta name="description" content="AI-powered life management system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧠</text></svg>" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cosmic Life OS" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {children}
      </main>
    </>
  )
}
