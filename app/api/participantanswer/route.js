import {
  createCrudHandlers,
  normalizeData,
  toBoolean,
  toDate,
  toFloat,
  toNullableString,
  whereFromSearch,
} from "@/lib/apiCrud";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fields = [
  "sessionId",
  "userId",
  "questionId",
  "selectedOptionId",
  "isCorrect",
  "score",
  "answeredAt",
];

const transforms = {
  selectedOptionId: toNullableString,
  isCorrect: toBoolean,
  score: toFloat,
  answeredAt: toDate,
};

const dataFromBody = (body) => normalizeData(body, fields, transforms);

const handlers = createCrudHandlers({
  model: prisma.participantAnswer,
  entityName: "ParticipantAnswer",
  createData: dataFromBody,
  updateData: dataFromBody,
  getWhere: (searchParams) =>
    whereFromSearch(searchParams, {
      sessionId: String,
      userId: String,
      questionId: String,
    }),
});

export const { GET, POST, PUT, DELETE } = handlers;
