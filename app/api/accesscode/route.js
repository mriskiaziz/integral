import {
  createCrudHandlers,
  normalizeData,
  toBoolean,
  toInt,
  whereFromSearch,
} from "@/lib/apiCrud";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fields = [
  "code",
  "name",
  "packageId",
  "durationMinutes",
  "maxAttempts",
  "maxUsers",
  "isActive",
];

const transforms = {
  durationMinutes: toInt,
  maxAttempts: toInt,
  maxUsers: toInt,
  isActive: toBoolean,
};

const dataFromBody = (body) => normalizeData(body, fields, transforms);

const handlers = createCrudHandlers({
  model: prisma.accessCode,
  entityName: "AccessCode",
  createData: dataFromBody,
  updateData: dataFromBody,
  getWhere: (searchParams) =>
    whereFromSearch(searchParams, {
      code: String,
      packageId: String,
      isActive: toBoolean,
    }),
});

export const { GET, POST, PUT, DELETE } = handlers;
