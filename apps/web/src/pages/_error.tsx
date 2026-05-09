import Link from 'next/link';

// Custom Pages Router error page — prevents the auto-generated
// _error.js from bundling framer-motion and crashing during SSG.
function CustomError({ statusCode }: { statusCode?: number }) {
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
        fontSize: '4rem',
        fontWeight: 900,
        color: '#818cf8',
        margin: 0,
      }}>
        {statusCode || 'Error'}
      </h1>
      <p style={{ color: '#a1a1aa', marginTop: '1rem' }}>
        {statusCode === 404
          ? 'The page you\'re looking for doesn\'t exist.'
          : 'An unexpected error occurred.'}
      </p>
      <Link
        href="/"
        style={{
          marginTop: '2rem',
          padding: '0.75rem 2rem',
          background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
          color: '#fff',
          borderRadius: '9999px',
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        Go Home
      </Link>
    </div>
  );
}

CustomError.getInitialProps = ({ res, err }: { res?: { statusCode: number }; err?: { statusCode: number } }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default CustomError;
