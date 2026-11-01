import { prisma } from '../../config/database';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

export class AttachmentsService {
  /**
   * Créer une pièce jointe
   */
  async create(data: {
    ticketId: string;
    uploadedById: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
  }) {
    // Validation taille
    if (data.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of 25 MB`);
    }

    // Validation type MIME
    if (!ALLOWED_MIME_TYPES.includes(data.mimeType)) {
      throw new Error(`File type ${data.mimeType} is not allowed`);
    }

    return await prisma.attachment.create({
      data,
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Récupérer les pièces jointes d'un ticket
   */
  async getByTicketId(ticketId: string) {
    return await prisma.attachment.findMany({
      where: { ticketId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Récupérer une pièce jointe par ID
   */
  async getById(id: string) {
    return await prisma.attachment.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        ticket: {
          select: {
            id: true,
            ticketNumber: true,
          },
        },
      },
    });
  }

  /**
   * Supprimer une pièce jointe
   */
  async delete(id: string) {
    return await prisma.attachment.delete({
      where: { id },
    });
  }
}

export const attachmentsService = new AttachmentsService();
