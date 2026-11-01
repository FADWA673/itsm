/**
 * Page de Test IA
 * Pour tester rapidement les fonctionnalités IA
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AdminLayout from '../../layouts/AdminLayout';
import apiClient from '../../services/api';

function TestAIPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testText, setTestText] = useState('Mon PC ne démarre plus depuis ce matin');

  // Test connexion IA
  const testAIConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.get('/ai/test');
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Test analyse ticket
  const testAnalyzeTicket = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.post('/ai/analyze-ticket-text', {
        text: testText,
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Test chat IA
  const testChat = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.post('/ai/chat', {
        messages: [
          { role: 'user', content: 'Comment me connecter au VPN?' }
        ],
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Test IA">
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          🤖 Test Intelligence Artificielle
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            1. Test Connexion IA
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Vérifie que le provider IA (Groq) est connecté et fonctionne.
          </Typography>
          <Button
            variant="contained"
            onClick={testAIConnection}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Tester Connexion
          </Button>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            2. Test Analyse Ticket
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Analyse un texte libre et extrait catégorie, priorité, langue.
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Texte à analyser"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={testAnalyzeTicket}
              disabled={loading || !testText}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Analyser
            </Button>
            <Button
              variant="outlined"
              onClick={() => setTestText('Mon PC ne démarre plus')}
            >
              Exemple FR
            </Button>
            <Button
              variant="outlined"
              onClick={() => setTestText('wifi ma khdamch f bureau')}
            >
              Exemple Darija
            </Button>
            <Button
              variant="outlined"
              onClick={() => setTestText('I cannot connect to VPN')}
            >
              Exemple EN
            </Button>
          </Box>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            3. Test Chat IA
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Teste l'assistant conversationnel.
          </Typography>
          <Button
            variant="contained"
            onClick={testChat}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Poser Question
          </Button>
        </Paper>

        {/* Résultats */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <strong>Erreur:</strong> {error}
          </Alert>
        )}

        {result && (
          <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              📊 Résultat
            </Typography>
            <Box
              component="pre"
              sx={{
                bgcolor: 'white',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                fontSize: 14,
                fontFamily: 'monospace',
              }}
            >
              {JSON.stringify(result, null, 2)}
            </Box>
          </Paper>
        )}
      </Box>
    </AdminLayout>
  );
}

export default TestAIPage;
