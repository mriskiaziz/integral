import {
  createCrudHandlers,
  normalizeData,
  toDate,
  toFloat,
  toInt,
  whereFromSearch,
} from "@/lib/apiCrud";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fields = [
  "userId",
  "packageId",
  "accessCodeId",
  "startedAt",
  "endedAt",
  "status",
  "score",
  "correctCount",
  "wrongCount",
  "unansweredCount",
];

const transforms = {
  startedAt: toDate,
  endedAt: toDate,
  score: toFloat,
  correctCount: toInt,
  wrongCount: toInt,
  unansweredCount: toInt,
};

const dataFromBody = (body) => normalizeData(body, fields, transforms);

const handlers = createCrudHandlers({
  model: prisma.examSession,
  entityName: "ExamSession",
  createData: dataFromBody,
  updateData: dataFromBody,
  getWhere: (searchParams) =>
    whereFromSearch(searchParams, {
      userId: String,
      packageId: String,
      accessCodeId: String,
      status: String,
    }),
});

export const { GET, POST, PUT, DELETE } = handlers;
