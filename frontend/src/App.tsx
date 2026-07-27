import AppRouter from "./routes/AppRouter";

/**
 * Composant racine de l'application.
 * Délègue tout le routing à AppRouter.
 */
function App() {
  return <AppRouter />;
}

export default App;
