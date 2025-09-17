import { Request } from "express";
import AppError from "@app/errors/AppError";
import prisma from "@app/lib/prisma";
import httpStatus from "http-status";

const createLead = async (req: Request) => {
  const { name, mobile, address } = req.body;

  if (!mobile) {
    throw new AppError(httpStatus.BAD_REQUEST, "Mobile is required");
  }

  const newLead = await prisma.lead.upsert({
    where: { mobile },
    update: {
      name: name ?? undefined, // update if provided
      address: address ?? undefined,
    },
    create: {
      name,
      mobile,
      address,
    },
  });

  return newLead;
};


const getLeadById = async (req: Request) => {
  const { id } = req.params;
  const lead = await prisma.lead.findUnique({
    where: { id },
  });
  if (!lead) {
    throw new AppError(httpStatus.NOT_FOUND, "Lead not found");
  }
  return lead;
};

const getAllLeads = async () => {
  const leads = await prisma.lead.findMany();
  console.log(leads)
  return leads;
};

const updateLead = async (req: Request) => {
  const { id } = req.params;
  const { name, mobile, address } = req.body;

  const existingLead = await prisma.lead.findUnique({
    where: { id },
  });
  if (!existingLead) {
    throw new AppError(httpStatus.NOT_FOUND, "Lead not found");
  }

  const updatedLead = await prisma.lead.update({
    where: { id },
    data: {
      name,
      mobile,
      address,
    },
  });
  return updatedLead;
}
const deleteLead = async (req: Request) => {
  const { id } = req.params;

  const existingLead = await prisma.lead.findUnique({
    where: { id },
  });
  if (!existingLead) {
    throw new AppError(httpStatus.NOT_FOUND, "Lead not found");
  }

  const deletedLead = await prisma.lead.delete({
    where: { id},
  });
  return deletedLead;
}

export const leadService = {
  createLead,
  getLeadById,
  getAllLeads,
  updateLead,
  deleteLead,
};
