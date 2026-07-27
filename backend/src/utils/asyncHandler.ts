import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wrapper pour les route handlers async.
 * Évite les try/catch répétitifs — toute erreur Promise est forwarded à Express.
 *
 * Exemple :
 *   router.get("/tickets", asyncHandler(async (req, res) => {
 *     const tickets = await ticketService.findAll();
 *     res.json(tickets);
 *   }));
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
