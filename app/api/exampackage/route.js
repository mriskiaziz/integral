import {
  createCrudHandlers,
  normalizeData,
  toBoolean,
  toInt,
  toNullableString,
  whereFromSearch,
} from "@/lib/apiCrud";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fields = [
  "title",
  "slug",
  "level",
  "description",
  "price",
  "durationMinutes",
  "passingScore",
  "isActive",
  "creatorId",
];

const transforms = {
  description: toNullableString,
  price: toInt,
  durationMinutes: toInt,
  passingScore: toInt,
  isActive: toBoolean,
  creatorId: toNullableString,
};

const dataFromBody = (body) => normalizeData(body, fields, transforms);

const handlers = createCrudHandlers({
  model: prisma.examPackage,
  entityName: "ExamPackage",
  createData: dataFromBody,
  updateData: dataFromBody,
  getWhere: (searchParams) =>
    whereFromSearch(searchParams, {
      slug: String,
      level: String,
      creatorId: String,
      isActive: toBoolean,
    }),
});

export const { GET, POST, PUT, DELETE } = handlers;
