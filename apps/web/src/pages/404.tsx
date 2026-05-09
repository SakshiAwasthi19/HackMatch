// Custom Pages Router 404 — this prevents Next.js from using
// the auto-generated _error.js (which bundles framer-motion
// and crashes with useContext during static generation).
export default function Custom404() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center' as const,
      padding: '2rem',
    }}>
      <h1 style={{
        fontSize: '6rem',
        fontWeight: 900,
        background: 'linear-gradient(to right, #818cf8, #a78bfa, #f472b6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: 0,
      }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '1rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: '#a1a1aa', maxWidth: '28rem', marginTop: '1rem' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <a
        href="/"
        style={{
          marginTop: '2rem',
          padding: '0.75rem 2rem',
          background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
          color: '#fff',
          borderRadius: '9999px',
          fontWeight: 700,
          textDecoration: 'none',
          border: 'none',
        }}
      >
        Go Home
      </a>
    </div>
  );
}
