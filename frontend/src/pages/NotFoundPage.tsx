import { useNavigate } from "react-router-dom";
import { PATHS } from "../routes/paths";

/**
 * Page 404 — route inconnue.
 */
function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1 style={{ fontSize: "6rem", margin: 0 }}>404</h1>
      <h2>Page introuvable</h2>
      <p>La page que vous cherchez n&apos;existe pas.</p>
      <button
        onClick={() => navigate(PATHS.HOME)}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1.5rem",
          cursor: "pointer",
          background: "#aa3bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "16px",
        }}
      >
        Retour à l&apos;accueil
      </button>
    </div>
  );
}

export default NotFoundPage;
