import { createCrudHandlers, normalizeData, toBoolean, toInt, whereFromSearch } from "@/lib/apiCrud";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fields = ["questionId", "label", "content", "isCorrect", "order"];
const transforms = {
  isCorrect: toBoolean,
  order: toInt,
};

const dataFromBody = (body) => normalizeData(body, fields, transforms);

const handlers = createCrudHandlers({
  model: prisma.answerOption,
  entityName: "AnswerOption",
  createData: dataFromBody,
  updateData: dataFromBody,
  getWhere: (searchParams) =>
    whereFromSearch(searchParams, {
      questionId: String,
      isCorrect: toBoolean,
    }),
});

export const { GET, POST, PUT, DELETE } = handlers;
