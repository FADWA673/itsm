import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tab,
  Tabs,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Block as BlockIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Info as InfoIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { whatsAppMetaService, WhatsAppMetaStatus, WhatsAppContact } from '../../services/whatsapp-meta.service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const WhatsAppMetaSettingsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [status, setStatus] = useState<WhatsAppMetaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testPhone, setTestPhone] = useState('+212639927821');
  const [testMessage, setTestMessage] = useState('');
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendToPhone, setSendToPhone] = useState('');
  const [sendMessageContent, setSendMessageContent] = useState('');

  useEffect(() => {
    loadStatus();
    loadContacts();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const statusData = await whatsAppMetaService.getStatus();
      setStatus(statusData);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du statut');
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const contactsData = await whatsAppMetaService.getContacts();
      setContacts(contactsData);
    } catch (err: any) {
      console.error('Erreur lors du chargement des contacts:', err);
    }
  };

  const handleRefreshStatus = async () => {
    setRefreshLoading(true);
    await loadStatus();
    await loadContacts();
    setRefreshLoading(false);
  };

  const handleTestSend = async () => {
    if (!testPhone) {
      setError('Veuillez entrer un numéro de téléphone');
      return;
    }

    try {
      setTestLoading(true);
      setError(null);
      setSuccess(null);

      await whatsAppMetaService.testSend(testPhone);
      setSuccess('Message de test envoyé avec succès !');
      await loadStatus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du message de test');
    } finally {
      setTestLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!sendToPhone || !sendMessageContent) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setTestLoading(true);
      setError(null);
      setSuccess(null);

      await whatsAppMetaService.sendMessage({
        to: sendToPhone,
        message: sendMessageContent,
      });

      setSuccess('Message envoyé avec succès !');
      setSendDialogOpen(false);
      setSendToPhone('');
      setSendMessageContent('');
      await loadStatus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setTestLoading(false);
    }
  };

  const handleToggleBlock = async (contactId: string) => {
    try {
      await whatsAppMetaService.toggleBlockContact(contactId);
      setSuccess('Statut du contact mis à jour');
      await loadContacts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du contact');
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <WhatsAppIcon sx={{ fontSize: 40, color: '#25D366' }} />
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                WhatsApp Business API (Meta)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Intégration officielle Meta - Stable et sans QR Code
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshStatus}
            disabled={refreshLoading}
          >
            Actualiser
          </Button>
        </Box>

        {/* Alerts */}
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

        {/* Status Card */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Statut de la Configuration
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={1}>
                {status?.configured ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <ErrorIcon color="error" />
                )}
                <Typography>
                  Configuration: {status?.configured ? 'Complète' : 'Incomplète'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={1}>
                {status?.webhookConfigured ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <ErrorIcon color="warning" />
                )}
                <Typography>
                  Webhook: {status?.webhookConfigured ? 'Configuré' : 'Non configuré'}
                </Typography>
              </Box>
            </Grid>
            {status?.phoneNumberId && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Phone Number ID: {status.phoneNumberId}
                </Typography>
              </Grid>
            )}
            {status?.businessAccountId && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Business Account ID: {status.businessAccountId}
                </Typography>
              </Grid>
            )}
            {status?.messagesCount !== undefined && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  Messages envoyés: {status.messagesCount}
                </Typography>
              </Grid>
            )}
            {status?.webhooksCount !== undefined && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  Messages reçus: {status.webhooksCount}
                </Typography>
              </Grid>
            )}
          </Grid>
          {status?.lastError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {status.lastError}
            </Alert>
          )}
        </Paper>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Test d'envoi" />
            <Tab label="Contacts" />
            <Tab label="Configuration" />
            <Tab label="Documentation" />
          </Tabs>

          {/* Tab 0: Test d'envoi */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tester l'envoi de message
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Envoyez un message de test pour vérifier que l'intégration fonctionne correctement.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Numéro de téléphone"
                    placeholder="+212639927821"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    helperText="Format international avec + (ex: +212639927821)"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={2} sx={{ height: '100%' }}>
                    <Button
                      variant="contained"
                      startIcon={<SendIcon />}
                      onClick={handleTestSend}
                      disabled={testLoading || !status?.configured}
                      fullWidth
                    >
                      {testLoading ? 'Envoi...' : 'Envoyer un test'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<SendIcon />}
                      onClick={() => setSendDialogOpen(true)}
                      disabled={!status?.configured}
                      fullWidth
                    >
                      Message personnalisé
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              {!status?.configured && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  L'API Meta n'est pas configurée. Vérifiez les variables d'environnement dans le backend.
                </Alert>
              )}
            </Box>
          </TabPanel>

          {/* Tab 1: Contacts */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ px: 3 }}>
              <Typography variant="h6" gutterBottom>
                Contacts WhatsApp
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Liste des contacts qui ont interagi avec le système via WhatsApp.
              </Typography>

              {contacts.length === 0 ? (
                <Alert severity="info">
                  Aucun contact pour le moment. Les contacts apparaîtront automatiquement lorsque des messages seront reçus.
                </Alert>
              ) : (
                <List>
                  {contacts.map((contact) => (
                    <ListItem
                      key={contact.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            {contact.name || 'Utilisateur WhatsApp'}
                            {contact.isBlocked && <Chip label="Bloqué" size="small" color="error" />}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {contact.phoneNumber}
                            </Typography>
                            {contact.lastMessageAt && (
                              <>
                                {' • '}
                                <Typography variant="caption" component="span">
                                  Dernier message: {new Date(contact.lastMessageAt).toLocaleString('fr-FR')}
                                </Typography>
                              </>
                            )}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleToggleBlock(contact.id)}
                          title={contact.isBlocked ? 'Débloquer' : 'Bloquer'}
                        >
                          {contact.isBlocked ? <CheckCircleOutlineIcon /> : <BlockIcon />}
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </TabPanel>

          {/* Tab 2: Configuration */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ px: 3 }}>
              <Typography variant="h6" gutterBottom>
                Variables d'environnement
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Configuration dans le fichier <code>backend/.env</code>
              </Typography>

              <Card sx={{ bgcolor: 'grey.100', mb: 2 }}>
                <CardContent>
                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`# WhatsApp Business API (Meta)
WHATSAPP_META_ACCESS_TOKEN=EAAV96KYUgABSfhk57FZAcs1AM2WdCnWucYZAWoEEoY9i
WHATSAPP_META_PHONE_NUMBER_ID=121355936517317
WHATSAPP_META_BUSINESS_ACCOUNT_ID=411458578940127
WHATSAPP_META_VERIFY_TOKEN=mySecureWebhookToken123
WHATSAPP_META_GRAPH_API_VERSION=v18.0
WHATSAPP_META_APP_SECRET=`}
                  </Typography>
                </CardContent>
              </Card>

              <Alert severity="info" icon={<InfoIcon />}>
                Après modification des variables d'environnement, redémarrez le backend avec:
                <br />
                <code>docker-compose restart backend</code>
              </Alert>
            </Box>
          </TabPanel>

          {/* Tab 3: Documentation */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ px: 3 }}>
              <Typography variant="h6" gutterBottom>
                Guide d'utilisation
              </Typography>

              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
                1. Configuration du Webhook
              </Typography>
              <Typography variant="body2" paragraph>
                Dans le Meta Developer Dashboard, configurez l'URL du webhook:
              </Typography>
              <Card sx={{ bgcolor: 'grey.100', mb: 2 }}>
                <CardContent>
                  <Typography variant="body2" component="pre">
                    https://votre-domaine.com/api/v1/whatsapp-meta/webhook
                  </Typography>
                </CardContent>
              </Card>

              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
                2. Verify Token
              </Typography>
              <Typography variant="body2" paragraph>
                Utilisez le même token que dans votre fichier .env:
              </Typography>
              <Card sx={{ bgcolor: 'grey.100', mb: 2 }}>
                <CardContent>
                  <Typography variant="body2" component="pre">
                    mySecureWebhookToken123
                  </Typography>
                </CardContent>
              </Card>

              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
                3. Fonctionnalités
              </Typography>
              <List>
                <ListItem>
                  <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                  <ListItemText
                    primary="Envoi de messages"
                    secondary="Envoyez des messages texte, templates et médias"
                  />
                </ListItem>
                <ListItem>
                  <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                  <ListItemText
                    primary="Réception automatique"
                    secondary="Les messages reçus créent automatiquement des tickets"
                  />
                </ListItem>
                <ListItem>
                  <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                  <ListItemText
                    primary="AI Filtering"
                    secondary="Détection automatique des mots-clés en français"
                  />
                </ListItem>
                <ListItem>
                  <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                  <ListItemText
                    primary="Gestion des contacts"
                    secondary="Base de données des contacts WhatsApp"
                  />
                </ListItem>
              </List>

              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
                4. Ressources
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Documentation Meta"
                    secondary={
                      <a
                        href="https://developers.facebook.com/docs/whatsapp/cloud-api"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        https://developers.facebook.com/docs/whatsapp/cloud-api
                      </a>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Meta Developer Dashboard"
                    secondary={
                      <a
                        href="https://developers.facebook.com/apps/1545811923587584"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        https://developers.facebook.com/apps/1545811923587584
                      </a>
                    }
                  />
                </ListItem>
              </List>
            </Box>
          </TabPanel>
        </Paper>
      </Box>

      {/* Dialog pour envoyer un message personnalisé */}
      <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Envoyer un message personnalisé</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Numéro de téléphone"
              placeholder="+212639927821"
              value={sendToPhone}
              onChange={(e) => setSendToPhone(e.target.value)}
              helperText="Format international avec +"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message"
              placeholder="Entrez votre message..."
              value={sendMessageContent}
              onChange={(e) => setSendMessageContent(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={testLoading || !sendToPhone || !sendMessageContent}
            startIcon={<SendIcon />}
          >
            {testLoading ? 'Envoi...' : 'Envoyer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WhatsAppMetaSettingsPage;
