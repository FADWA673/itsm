// Types pour WhatsApp Business API (Meta)

export interface WhatsAppMetaConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  verifyToken: string;
  graphApiVersion: string;
}

export interface SendMessageRequest {
  to: string;
  message: string;
  type?: 'text' | 'template';
}

export interface SendTemplateRequest {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: TemplateComponent[];
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters: TemplateParameter[];
}

export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
  text?: string;
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
  image?: {
    link: string;
  };
  document?: {
    link: string;
    filename?: string;
  };
  video?: {
    link: string;
  };
}

export interface SendMediaRequest {
  to: string;
  mediaType: 'image' | 'document' | 'audio' | 'video';
  mediaUrl: string;
  caption?: string;
  filename?: string;
}

// Types pour les webhooks Meta
export interface MetaWebhookPayload {
  object: string;
  entry: WebhookEntry[];
}

export interface WebhookEntry {
  id: string;
  changes: WebhookChange[];
}

export interface WebhookChange {
  value: WebhookValue;
  field: string;
}

export interface WebhookValue {
  messaging_product: string;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: WebhookContact[];
  messages?: WebhookMessage[];
  statuses?: MessageStatus[];
}

export interface WebhookContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface WebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'contacts';
  text?: {
    body: string;
  };
  image?: MediaObject;
  document?: MediaObject;
  audio?: MediaObject;
  video?: MediaObject;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  contacts?: ContactObject[];
}

export interface MediaObject {
  caption?: string;
  mime_type?: string;
  sha256?: string;
  id: string;
  filename?: string;
}

export interface ContactObject {
  addresses?: any[];
  emails?: any[];
  name: {
    formatted_name: string;
    first_name?: string;
    last_name?: string;
  };
  org?: any;
  phones?: any[];
  urls?: any[];
}

export interface MessageStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: StatusError[];
}

export interface StatusError {
  code: number;
  title: string;
  message?: string;
  error_data?: {
    details: string;
  };
}

// Types pour les réponses de l'API Graph
export interface GraphApiResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

export interface GraphApiError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

// Types pour la gestion des contacts
export interface WhatsAppContact {
  id: string;
  phoneNumber: string;
  name?: string;
  lastMessageAt?: Date;
  isBlocked: boolean;
  notes?: string;
}

// Type pour le statut du service
export interface WhatsAppMetaStatus {
  configured: boolean;
  phoneNumberId?: string;
  businessAccountId?: string;
  webhookConfigured: boolean;
  lastError?: string;
  messagesCount?: number;
  webhooksCount?: number;
}

// Type pour les statistiques
export interface WhatsAppMetaStats {
  totalMessagesSent: number;
  totalMessagesReceived: number;
  totalTicketsCreated: number;
  totalContacts: number;
  lastMessageDate?: Date;
  errorCount: number;
}
