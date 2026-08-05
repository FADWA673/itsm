import { Request, Response } from "express";
import { ticketsService } from "./tickets.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import type { CreateTicketRequest } from "./tickets.types";

export const createTicket = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const body = req.body as CreateTicketRequest;

  if (!body.category || !body.subject || !body.description || !body.priority || !body.impact) {
    throw new ApiError(400, "category, subject, description, priority and impact are required");
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
