import { Request } from "express";
import AppError from "@app/errors/AppError";
import prisma from "@app/lib/prisma";
import httpStatus from "http-status";
import { Prisma } from "@prisma/client";

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

export const getAllLeads = async (req: Request) => {
  const {
    search = "",
    fromDate = "",
    toDate = "",
    ebookIds = [],
    page = "1",
    limit = "100",
  } = req.query as {
    search?: string;
    fromDate?: string;
    toDate?: string;
    ebookIds?: string | string[];
    page?: string;
    limit?: string;
  };

  const ebookIdsArr = Array.isArray(ebookIds)
    ? ebookIds
    : ebookIds
    ? [ebookIds]
    : [];

  const conditions: Prisma.Sql[] = [];

  // If search exists, only apply search filter
  if (search.trim() !== "") {
    const likeSearch = `%${search}%`;
    conditions.push(
      Prisma.sql`(l.name ILIKE ${likeSearch} OR l.mobile ILIKE ${likeSearch} OR l.address ILIKE ${likeSearch})`
    );
  } else {
    // Otherwise, apply date and ebook filters
    if (fromDate)
      conditions.push(Prisma.sql`l."createdAt" >= ${new Date(fromDate)}`);
    if (toDate)
      conditions.push(Prisma.sql`l."createdAt" <= ${new Date(toDate)}`);
    if (ebookIdsArr.length > 0) {
      const ebookConditions: Prisma.Sql[] = ebookIdsArr.map(
        (id) => Prisma.sql`l."ebookId" ILIKE ${`%${id}%`}`
      );
      conditions.push(Prisma.sql`(${Prisma.join(ebookConditions, " OR ")})`);
    }
  }

  const whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
      : Prisma.sql``;

  // Pagination only applies if search is empty
  const limitNum = search.trim() === "" ? Number(limit) : undefined;
  const offset =
    search.trim() === "" ? (Number(page) - 1) * Number(limit) : undefined;

  // Fetch leads
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
    }[]
  >(Prisma.sql`
    SELECT *
    FROM "Lead" l
    ${whereClause}
    ORDER BY l."createdAt" DESC
    ${
      limitNum !== undefined
        ? Prisma.sql`LIMIT ${limitNum} OFFSET ${offset}`
        : Prisma.sql``
    }
  `);

  // Count total leads
  const total =
    search.trim() === ""
      ? Number(
          (
            await prisma.$queryRaw<{ count: string }[]>`
        SELECT COUNT(*) as count
        FROM "Lead" l
        ${whereClause}
      `
          )[0]?.count ?? 0
        )
      : leads.length; // total = all matched leads when searching

  // Collect all ebook IDs
  const allEbookIds = leads
    .flatMap((l) => {
      if (!l.ebookId) return [];
      try {
        const ids = JSON.parse(l.ebookId);
        if (Array.isArray(ids)) return ids;
      } catch {
        return l.ebookId.split(",").map((id) => id.trim());
      }
      return [];
    })
    .filter(Boolean);

  const ebooks =
    allEbookIds.length > 0
      ? await prisma.eBook.findMany({
          where: { id: { in: allEbookIds } },
          select: {
            id: true,
            title: true,
            url: true,
            slug: true,
            imgUrl: true,
          },
        })
      : [];

  // Map ebooks to leads
  const formatted = leads.map((lead) => {
    let leadEbookIds: string[] = [];
    if (lead.ebookId) {
      try {
        const ids = JSON.parse(lead.ebookId);
        if (Array.isArray(ids)) leadEbookIds = ids;
      } catch {
        leadEbookIds = lead.ebookId.split(",").map((id) => id.trim());
      }
    }

    const leadEbooks = leadEbookIds
      .map((id) => ebooks.find((e) => e.id === id))
      .filter(Boolean);

    const { ebookId, ...rest } = lead;
    return { ...rest, ebook: leadEbooks };
  });

  return { data: formatted, total };
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
