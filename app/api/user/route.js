import bcrypt from "bcryptjs";
import { createCrudHandlers, normalizeData, whereFromSearch } from "@/lib/apiCrud";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fields = ["name", "username", "password", "role"];
const select = {
  id: true,
  name: true,
  username: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

async function dataFromBody(body) {
  const data = normalizeData(body, fields);

  if (Object.prototype.hasOwnProperty.call(data, "password")) {
    const password = String(data.password || "");
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    } else {
      delete data.password;
    }
  }

  return data;
}

const handlers = createCrudHandlers({
  model: prisma.user,
  entityName: "User",
  createData: dataFromBody,
  updateData: dataFromBody,
  select,
  getWhere: (searchParams) =>
    whereFromSearch(searchParams, {
      username: String,
      role: String,
    }),
});

export const { GET, POST, PUT, DELETE } = handlers;
