import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { whatsAppMetaService, WhatsAppMetaStatus, WhatsAppMetaStats, WhatsAppContact } from '../../services/whatsapp-meta.service';

export default function WhatsAppSettingsPage() {
  const [status, setStatus] = useState<WhatsAppMetaStatus | null>(null);
  const [stats, setStats] = useState<WhatsAppMetaStats | null>(null);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Test message form
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Hello from ITSM Platform! 👋');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusData, statsData, contactsData] = await Promise.all([
        whatsAppMetaService.getStatus(),
        whatsAppMetaService.getStats(),
        whatsAppMetaService.getContacts(),
      ]);
      setStatus(statusData);
      setStats(statsData);
      setContacts(contactsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSend = async () => {
    if (!testPhone || !testMessage) {
      setError('Veuillez remplir le numéro et le message');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await whatsAppMetaService.sendMessage({
        to: testPhone,
        message: testMessage,
      });
      setSuccess(`✅ Message envoyé avec succès à ${testPhone}`);
      setTestPhone('');
      loadData(); // Reload stats
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (contactId: string) => {
    setLoading(true);
    setError(null);
    try {
      await whatsAppMetaService.toggleBlockContact(contactId);
      setSuccess('Contact mis à jour');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <WhatsAppIcon sx={{ fontSize: 40, mr: 2, color: '#25D366' }} />
        <Typography variant="h4">WhatsApp Business API (Meta)</Typography>
        <IconButton onClick={loadData} disabled={loading} sx={{ ml: 'auto' }}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Status Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Statut de la connexion
              </Typography>
              {status && (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {status.configured ? (
                      <>
                        <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                        <Typography>Configuré</Typography>
                      </>
                    ) : (
                      <>
                        <ErrorIcon sx={{ color: 'error.main', mr: 1 }} />
                        <Typography>Non configuré</Typography>
                      </>
                    )}
                  </Box>

                  {status.phoneNumberId && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Phone Number ID:
                      </Typography>
                      <Typography variant="body1" fontFamily="monospace">
                        {status.phoneNumberId}
                      </Typography>
                    </Box>
                  )}

                  {status.apiVersion && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Graph API Version:
                      </Typography>
                      <Chip label={status.apiVersion} size="small" />
                    </Box>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Stats Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Statistiques
              </Typography>
              {stats && (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Messages envoyés:
                    </Typography>
                    <Typography variant="h4">{stats.totalMessagesSent}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Messages reçus:
                    </Typography>
                    <Typography variant="h4">{stats.totalMessagesReceived}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Contacts:
                    </Typography>
                    <Typography variant="h4">{stats.totalContacts}</Typography>
                  </Box>
                  {stats.lastMessageAt && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Dernier message:
                      </Typography>
                      <Typography variant="body2">
                        {new Date(stats.lastMessageAt).toLocaleString('fr-FR')}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Test Send Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🧪 Envoyer un message de test
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Numéro de téléphone"
                    placeholder="+33612345678"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Message"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleTestSend}
                    disabled={loading || !status?.configured}
                    sx={{ height: '56px' }}
                  >
                    Envoyer
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Webhook Info */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔗 Configuration du Webhook
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>URL du Webhook:</strong>
                </Typography>
                <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                  {window.location.origin.replace('5173', '3000')}/api/v1/whatsapp-meta/webhook
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Verify Token:</strong> mySecureWebhookToken123
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  ⚠️ <strong>Important:</strong> Si vous utilisez ngrok, remplacez l'URL par votre URL ngrok.
                  <br />
                  Exemple: <code>https://xxxxx.ngrok-free.app/api/v1/whatsapp-meta/webhook</code>
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Contacts List */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                👥 Contacts récents ({contacts.length})
              </Typography>
              <Divider sx={{ my: 2 }} />
              {contacts.length > 0 ? (
                <List>
                  {contacts.slice(0, 10).map((contact) => (
                    <ListItem
                      key={contact.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleToggleBlock(contact.id)}
                          disabled={loading}
                        >
                          <BlockIcon color={contact.isBlocked ? 'error' : 'inherit'} />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={contact.name || contact.phoneNumber}
                        secondary={
                          <>
                            {contact.phoneNumber}
                            {contact.isBlocked && (
                              <Chip label="Bloqué" size="small" color="error" sx={{ ml: 1 }} />
                            )}
                            <br />
                            Dernier message:{' '}
                            {contact.lastMessageAt
                              ? new Date(contact.lastMessageAt).toLocaleString('fr-FR')
                              : 'Aucun'}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" align="center">
                  Aucun contact pour le moment
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
