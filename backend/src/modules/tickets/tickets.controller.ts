import { Request, Response } from "express";
import { ticketsService } from "./tickets.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import type { CreateTicketRequest } from "./tickets.types";

export const createTicket = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const body = req.body as CreateTicketRequest;

  // Accepter categoryId (nouveau) OU category (ancien) pour compatibilité
  if ((!body.categoryId && !body.category) || !body.subject || !body.description || !body.priority || !body.impact) {
    throw new ApiError(400, "categoryId (or category), subject, description, priority and impact are required");
  }

  const ticket = await ticketsService.create(body, req.user.id, req.user.organizationId);
  res.status(201).json({ success: true, message: "Ticket created successfully", data: ticket });
});

export const getMyTickets = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const tickets = await ticketsService.findByUser(req.user.id);
  res.json({ success: true, message: "Tickets retrieved", data: tickets });
});

export const getAllTickets = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const tickets = await ticketsService.findByOrganization(req.user.organizationId);
  res.json({ success: true, message: "Tickets retrieved", data: tickets });
});

export const getTicketById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const ticket = await ticketsService.findById(id);
  res.json({ success: true, message: "Ticket retrieved", data: ticket });
});

export const updateTicketStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const { status } = req.body as { status: string };
  if (!status) throw new ApiError(400, "Status is required");
  const ticket = await ticketsService.updateStatus(id, status);
  res.json({ success: true, message: "Ticket status updated", data: ticket });
});

export const assignTicket = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const { technicianId } = req.body as { technicianId: string };
  if (!technicianId) throw new ApiError(400, "technicianId is required");
  const ticket = await ticketsService.assign(id, technicianId);
  res.json({ success: true, message: "Ticket assigned", data: ticket });
});

export const cancelTicket = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const id = req.params["id"] as string;
  const ticket = await ticketsService.cancel(id, req.user.id);
  res.json({ success: true, message: "Ticket cancelled successfully", data: ticket });
});

export const reopenTicket = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const id = req.params["id"] as string;
  const ticket = await ticketsService.reopen(id, req.user.id);
  res.json({ success: true, message: "Ticket reopened successfully", data: ticket });
});

export const confirmResolution = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const id = req.params["id"] as string;
  const ticket = await ticketsService.confirmResolution(id, req.user.id);
  res.json({ success: true, message: "Resolution confirmed, ticket closed", data: ticket });
});

export const getUnassignedTickets = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const tickets = await ticketsService.findUnassigned(req.user.organizationId);
  res.json({ success: true, message: "Unassigned tickets retrieved", data: tickets });
});

export const claimTicket = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const id = req.params["id"] as string;
  
  // Logs détaillés pour debug
  console.log("=== CLAIM TICKET REQUEST ===");
  console.log("Ticket ID:", id);
  console.log("User ID:", req.user.id);
  console.log("User Role:", req.user.role);
  console.log("User Email:", req.user.email);
  
  const ticket = await ticketsService.claim(id, req.user.id);
  
  console.log("=== CLAIM SUCCESSFUL ===");
  console.log("New Status:", ticket.status);
  console.log("Assigned To:", ticket.assignedToName);
  
  res.json({ success: true, message: "Ticket claimed successfully", data: ticket });
});

export const deleteTicket = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const id = req.params["id"] as string;
  await ticketsService.deleteTicket(id);
  res.json({ success: true, message: "Ticket deleted successfully" });
});

export const startWork = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const id = req.params["id"] as string;
  const ticket = await ticketsService.startWork(id, req.user.id);
  res.json({ success: true, message: "Started working on ticket", data: ticket });
});

export const putOnHold = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const id = req.params["id"] as string;
  const { reason } = req.body as { reason?: string };
  const ticket = await ticketsService.putOnHold(id, req.user.id, reason);
  res.json({ success: true, message: "Ticket put on hold", data: ticket });
});

export const resumeTicket = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const id = req.params["id"] as string;
  const ticket = await ticketsService.resumeTicket(id, req.user.id);
  res.json({ success: true, message: "Ticket resumed", data: ticket });
});

export const resolveTicket = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const id = req.params["id"] as string;
  const { resolution } = req.body as { resolution: string };
  if (!resolution) throw new ApiError(400, "Resolution message is required");
  const ticket = await ticketsService.resolveTicket(id, req.user.id, resolution);
  res.json({ success: true, message: "Ticket resolved", data: ticket });
});

export const getTicketHistory = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const id = req.params["id"] as string;
  const { historyService } = require("./history.service");
  const history = await historyService.getTicketHistory(id);
  res.json({ success: true, message: "Ticket history retrieved", data: history });
});
