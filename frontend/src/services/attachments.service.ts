import { apiClient } from './api';

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
  ticketId: string;
  uploadedById: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

class AttachmentsService {
  /**
   * Upload une pièce jointe pour un ticket
   */
  async upload(ticketId: string, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/tickets/${ticketId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }

  /**
   * Récupérer les pièces jointes d'un ticket
   */
  async getByTicketId(ticketId: string): Promise<Attachment[]> {
    const response = await apiClient.get(`/tickets/${ticketId}/attachments`);
    return response.data.data;
  }

  /**
   * Télécharger une pièce jointe
   */
  getDownloadUrl(attachmentId: string): string {
    return `${apiClient.defaults.baseURL}/attachments/${attachmentId}/download`;
  }

  /**
   * Supprimer une pièce jointe
   */
  async delete(attachmentId: string): Promise<void> {
    await apiClient.delete(`/attachments/${attachmentId}`);
  }

  /**
   * Formater la taille du fichier
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Obtenir l'icône selon le type MIME
   */
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType === 'text/plain') return '📃';
    if (mimeType === 'text/csv') return '📋';
    return '📎';
  }
}

export const attachmentsService = new AttachmentsService();
