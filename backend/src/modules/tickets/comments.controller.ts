import { Request, Response } from "express";
import { commentsService } from "./comments.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";

/**
 * GET /tickets/:id/comments
 */
export const getComments = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const ticketId = req.params["id"] as string;
  const comments = await commentsService.findByTicket(ticketId, req.user.id);
  res.json({ success: true, message: "Comments retrieved", data: comments });
});

/**
 * POST /tickets/:id/comments
 */
export const addComment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const ticketId = req.params["id"] as string;
  const { content } = req.body as { content: string };
  if (!content?.trim()) throw new ApiError(400, "Content is required");

  const comment = await commentsService.create(ticketId, req.user.id, content);
  res.status(201).json({ success: true, message: "Comment added", data: comment });
});
