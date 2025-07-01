// src/app/not-found.js
// Custom not-found page for App Router (if you use /app)

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '10vh' }}>
      <h2 style={{ fontSize: '2rem', color: '#e53e3e' }}>Page not found</h2>
      <p style={{ fontSize: '1.1rem', color: '#555' }}>
        Sorry, the page you are looking for does not exist.
      </p>
    </div>
  );
}
