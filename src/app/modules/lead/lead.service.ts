import { Request } from "express";
import AppError from "@app/errors/AppError";
import prisma from "@app/lib/prisma";
import httpStatus from "http-status";

const createLead = async (req: Request) => {
  let { name, mobile, address, ebookId } = req.body;

  const ipAddress =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    req.ip ||
    "";
  const userAgent = req.headers["user-agent"] || "";

  // Normalize mobile number
  const normalizeMobile = (number?: string) => {
    if (!number) return null;
    let cleaned = number.replace(/\s+/g, ""); // remove spaces
    if (cleaned.startsWith("+880")) {
      return "0" + cleaned.slice(4); // +8801XXXX -> 01XXXX
    } else if (cleaned.startsWith("880")) {
      return "0" + cleaned.slice(3); // 8801XXXX -> 01XXXX
    } else if (cleaned.startsWith("01")) {
      return cleaned; // already correct
    }
    return null; // invalid format
  };

  const normalizedMobile = normalizeMobile(mobile);

  if (!normalizedMobile || normalizedMobile.length !== 11) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Mobile must be a valid Bangladeshi number (11 digits, starting with 01)"
    );
  }

  // Helper: must be at least 2 characters
  const hasTwoLetters = (str?: string) => {
    if (!str) return false;
    return str.trim().length >= 2;
  };

  const newLead = await prisma.lead.upsert({
    where: { mobile: normalizedMobile },
    update: {
      name: hasTwoLetters(name) ? name.trim() : undefined,
      address: hasTwoLetters(address) ? address.trim() : undefined,
      ip: ipAddress,
      userAgent,
      ebookId,
    },
    create: {
      name: hasTwoLetters(name) ? name.trim() : undefined,
      address: hasTwoLetters(address) ? address.trim() : undefined,
      mobile: normalizedMobile,
      ip: ipAddress,
      userAgent,
      ebookId,
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
  const leads = await prisma.$queryRaw<
    {
      id: string;
      name: string | null;
      mobile: string;
      ip: string | null;
      userAgent: string | null;
      address: string | null;
      ebookId: string | null;
      createdAt: Date;
      updatedAt: Date;
      ebook_title: string | null;
      ebook_url: string | null;
      ebook_slug: string | null;
      ebook_imgUrl: string | null;
    }[]
  >`
    SELECT
      l.id,
      l.name,
      l.mobile,
      l.ip,
      l."userAgent",
      l.address,
      l."ebookId",
      l."createdAt",
      l."updatedAt",
      e.title AS ebook_title,
      e.url AS ebook_url,
      e.slug AS ebook_slug,
      e."imgUrl" AS ebook_imgUrl
    FROM "Lead" l
    LEFT JOIN "EBook" e
    ON l."ebookId" = e.id
  `;

  // Map and only keep ebook object
  return leads.map((lead) => {
    const { ebook_title, ebook_url, ebook_slug, ebook_imgUrl, ...rest } = lead;
    return {
      ...rest,
      ebook: ebook_title
        ? {
            title: ebook_title,
            url: ebook_url,
            slug: ebook_slug,
            imgUrl: ebook_imgUrl,
          }
        : null,
    };
  });
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
};
const deleteLead = async (req: Request) => {
  const { id } = req.params;
  const existingLead = await prisma.lead.findUnique({
    where: { id },
  });
  if (!existingLead) {
    throw new AppError(httpStatus.NOT_FOUND, "Lead not found");
  }

  const deletedLead = await prisma.lead.delete({
    where: { id },
  });
  return deletedLead;
};

export const leadService = {
  createLead,
  getLeadById,
  getAllLeads,
  updateLead,
  deleteLead,
};
