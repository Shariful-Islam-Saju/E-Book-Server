import { Request, Response } from "express";
import catchAsync from "@app/shared/catchAsync";
import sendResponse from "@app/shared/sendResponse";
import httpStatus from "http-status";
import { leadService } from "./lead.service";

// ✅ Create a new lead
const createLead = catchAsync(async (req: Request, res: Response) => {
  const result = await leadService.createLead(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Lead created successfully!",
    data: result,
  });
});

// ✅ Get a lead by ID
const getLeadById = catchAsync(async (req: Request, res: Response) => {
  const result = await leadService.getLeadById(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Lead retrieved successfully!",
    data: result,
  });
});

// ✅ Get all leads
const getAllLeads = catchAsync(async (req: Request, res: Response) => {
  console.log("Fetching all leads");
  const result = await leadService.getAllLeads(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Leads retrieved successfully!",
    data: result,
  });
});

// ✅ Update a lead by ID
const updateLead = catchAsync(async (req: Request, res: Response) => {
  const result = await leadService.updateLead(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Lead updated successfully!",
    data: result,
  });
});

// ✅ Delete a lead by ID
const deleteLead = catchAsync(async (req: Request, res: Response) => {
  const result = await leadService.deleteLead(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Lead deleted successfully!",
    data: result,
  });
});

export const leadController = {
  createLead,
  getLeadById,
  getAllLeads,
  updateLead,
  deleteLead,
};