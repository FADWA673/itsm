import { Request, Response } from 'express';
import { attachmentsService } from './attachments.service';
import path from 'path';
import fs from 'fs/promises';
import { randomBytes } from 'crypto';

const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

export class AttachmentsController {
  /**
   * Upload une pièce jointe pour un ticket
   * POST /api/v1/tickets/:ticketId/attachments
   */
  async upload(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;
      const userId = req.user?.id;

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const file = req.file;

      // Générer nom de fichier unique
      const fileExtension = path.extname(file.originalname);
      const uniqueFilename = `${randomBytes(16).toString('hex')}${fileExtension}`;
      const filePath = path.join(UPLOAD_DIR, uniqueFilename);

      // Créer le dossier uploads s'il n'existe pas
      await fs.mkdir(UPLOAD_DIR, { recursive: true });

      // Sauvegarder le fichier
      await fs.writeFile(filePath, file.buffer);

      // Créer l'entrée en base
      const attachment = await attachmentsService.create({
        ticketId,
        uploadedById: userId!,
        filename: uniqueFilename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${uniqueFilename}`,
      });

      return res.status(201).json({
        success: true,
        data: attachment,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload attachment',
      });
    }
  }

  /**
   * Récupérer les pièces jointes d'un ticket
   * GET /api/v1/tickets/:ticketId/attachments
   */
  async getByTicket(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;
      const attachments = await attachmentsService.getByTicketId(ticketId);

      return res.json({
        success: true,
        data: attachments,
      });
    } catch (error: any) {
      console.error('Get attachments error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch attachments',
      });
    }
  }

  /**
   * Télécharger une pièce jointe
   * GET /api/v1/attachments/:id/download
   */
  async download(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const attachment = await attachmentsService.getById(id);

      if (!attachment) {
        return res.status(404).json({ success: false, message: 'Attachment not found' });
      }

      const filePath = path.join(UPLOAD_DIR, attachment.filename);

      // Vérifier que le fichier existe
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({ success: false, message: 'File not found on server' });
      }

      // Envoyer le fichier
      res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
      res.setHeader('Content-Type', attachment.mimeType);
      res.sendFile(filePath);
    } catch (error: any) {
      console.error('Download error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to download attachment',
      });
    }
  }

  /**
   * Supprimer une pièce jointe
   * DELETE /api/v1/attachments/:id
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const attachment = await attachmentsService.getById(id);

      if (!attachment) {
        return res.status(404).json({ success: false, message: 'Attachment not found' });
      }

      // Vérifier que l'utilisateur est propriétaire ou admin
      const userId = req.user?.id;
      const isOwner = attachment.uploadedById === userId;
      const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this attachment' });
      }

      // Supprimer le fichier physique
      const filePath = path.join(UPLOAD_DIR, attachment.filename);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Failed to delete file:', error);
      }

      // Supprimer de la base
      await attachmentsService.delete(id);

      return res.json({
        success: true,
        message: 'Attachment deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete attachment',
      });
    }
  }
}

export const attachmentsController = new AttachmentsController();
