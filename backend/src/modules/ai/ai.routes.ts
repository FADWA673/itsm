import { Router } from "express";
import { aiController } from "./ai.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// All AI routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/ai/suggest-solutions
 * Get AI-powered KB article suggestions
 */
router.post("/suggest-solutions", aiController.suggestSolutions.bind(aiController));

/**
 * POST /api/v1/ai/analyze-ticket
 * Analyze ticket and suggest improvements
 */
router.post("/analyze-ticket", aiController.analyzeTicket.bind(aiController));

/**
 * POST /api/v1/ai/chat
 * Interactive chat with AI assistant
 */
router.post("/chat", aiController.chat.bind(aiController));

export default router;
