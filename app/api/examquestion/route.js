import { createCrudHandlers, normalizeData, toFloat, toInt, whereFromSearch } from "@/lib/apiCrud";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fields = ["packageId", "content", "explanation", "score", "order"];
const transforms = {
  score: toFloat,
  order: toInt,
};

const dataFromBody = (body) => normalizeData(body, fields, transforms);

const handlers = createCrudHandlers({
  model: prisma.examQuestion,
  entityName: "ExamQuestion",
  createData: dataFromBody,
  updateData: dataFromBody,
  getWhere: (searchParams) =>
    whereFromSearch(searchParams, {
      packageId: String,
    }),
});

export const { GET, POST, PUT, DELETE } = handlers;
