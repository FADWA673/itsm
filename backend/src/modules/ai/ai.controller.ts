import { Request, Response, NextFunction } from "express";
import { aiService } from "./ai.service";
import { ApiError } from "../../middlewares/error.middleware";

export class AIController {
  /**
   * POST /api/v1/ai/suggest-solutions
   * Get AI-powered KB article suggestions
   */
  async suggestSolutions(req: Request, res: Response, next: NextFunction) {
    try {
      const { problem, category } = req.body;

      if (!problem) {
        throw new ApiError(400, "Problem description is required");
      }

      const organizationId = req.user?.organizationId;
      if (!organizationId) {
        throw new ApiError(401, "Organization not found");
      }

      const result = await aiService.suggestSolutions(
        { problem, category },
        organizationId
      );

      res.json({
        success: true,
        message: "Solutions suggested successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/ai/analyze-ticket
   * Analyze ticket and suggest improvements
   */
  async analyzeTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description, category } = req.body;

      if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
      }

      const result = await aiService.analyzeTicket({
        title,
        description,
        category,
      });

      res.json({
        success: true,
        message: "Ticket analyzed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/ai/chat
   * Interactive chat with AI assistant
   */
  async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, conversationHistory } = req.body;

      if (!message) {
        throw new ApiError(400, "Message is required");
      }

      const response = await aiService.chat(message, conversationHistory || []);

      res.json({
        success: true,
        message: "Chat response generated",
        data: { response },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();
