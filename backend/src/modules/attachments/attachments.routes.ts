import { Router } from 'express';
import multer from 'multer';
import { attachmentsController } from './attachments.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Configuration multer pour upload en mémoire
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },
});

// Routes pour les pièces jointes d'un ticket
router.post(
  '/tickets/:ticketId/attachments',
  authenticate,
  upload.single('file'),
  (req, res) => attachmentsController.upload(req, res)
);

router.get(
  '/tickets/:ticketId/attachments',
  authenticate,
  (req, res) => attachmentsController.getByTicket(req, res)
);

// Routes pour une pièce jointe spécifique
router.get(
  '/attachments/:id/download',
  authenticate,
  (req, res) => attachmentsController.download(req, res)
);

router.delete(
  '/attachments/:id',
  authenticate,
  (req, res) => attachmentsController.delete(req, res)
);

export default router;
