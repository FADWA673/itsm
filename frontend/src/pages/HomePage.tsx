/**
 * Page d'accueil publique.
 * Redirigera vers /dashboard après l'implémentation de l'auth (ITSM-004).
 */
function HomePage() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>ITSM Platform</h1>
      <p>Bienvenue sur la plateforme de gestion de tickets IT.</p>
      <a href="/login" style={{ color: "#aa3bff" }}>
        Se connecter
      </a>
    </div>
  );
}

export default HomePage;
