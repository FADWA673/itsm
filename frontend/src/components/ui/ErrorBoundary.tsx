import { type ReactNode, Component } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary React — capture les erreurs dans l'arbre de composants.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            gap: 2,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" sx={{ color: "error.main" }}>
            Une erreur est survenue
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            {this.state.error?.message || "Erreur inattendue"}
          </Typography>
          <Button variant="contained" onClick={this.handleReset}>
            Retour à l&apos;accueil
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
