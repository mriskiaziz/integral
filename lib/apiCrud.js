import { NextResponse } from "next/server";

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

function hasOwn(source, key) {
  return Object.prototype.hasOwnProperty.call(source, key);
}

async function readJson(request) {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? body : {};
  } catch {
    return {};
  }
}

function getId(request, body = {}) {
  const { searchParams } = new URL(request.url);
  return searchParams.get("id") || body.id || null;
}

function readOptions(select) {
  return select ? { select } : {};
}

function getDatabaseConfigMessage(error) {
  if (error?.name !== "PrismaClientInitializationError") return null;

  if (String(error.message || "").includes("Environment variable not found: DATABASE_URL")) {
    return "DATABASE_URL belum diatur. Buat file .env dan isi koneksi database PostgreSQL.";
  }

  return "Koneksi database gagal. Periksa DATABASE_URL dan pastikan database berjalan.";
}

export function errorResponse(error, entityName) {
  if (error?.code === "P2025") {
    return json({ error: `${entityName} tidak ditemukan` }, 404);
  }

  if (error?.code === "P2002") {
    const fields = Array.isArray(error.meta?.target) ? error.meta.target.join(", ") : "field unik";
    return json({ error: `${fields} sudah digunakan` }, 409);
  }

  if (error?.code === "P2003") {
    return json({ error: "Relasi data tidak valid" }, 400);
  }

  if (error?.name === "PrismaClientValidationError") {
    return json({ error: "Data request tidak valid" }, 400);
  }

  const databaseMessage = getDatabaseConfigMessage(error);
  if (databaseMessage) {
    console.error(`${entityName} API database error`, error);
    return json({ error: databaseMessage }, 500);
  }

  console.error(`${entityName} API error`, error);
  return json({ error: "Terjadi kesalahan server" }, 500);
}

export function normalizeData(source, fields, transforms = {}) {
  const data = {};

  for (const field of fields) {
    if (hasOwn(source, field)) {
      data[field] = hasOwn(transforms, field) ? transforms[field](source[field]) : source[field];
    }
  }

  return data;
}

export function whereFromSearch(searchParams, fields = {}) {
  const where = {};

  for (const [field, transform] of Object.entries(fields)) {
    const value = searchParams.get(field);
    if (value !== null && value !== "") {
      where[field] = transform ? transform(value) : value;
    }
  }

  return Object.keys(where).length ? where : undefined;
}

export function toBoolean(value) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}

export function toDate(value) {
  if (value === null || value === "") return null;
  if (value instanceof Date) return value;
  return new Date(value);
}

export function toFloat(value) {
  if (value === null || value === "") return null;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? value : parsed;
}

export function toInt(value) {
  if (value === null || value === "") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? value : parsed;
}

export function toNullableString(value) {
  return value === "" ? null : value;
}

export function createCrudHandlers({
  model,
  entityName,
  createData,
  updateData,
  select,
  getWhere,
  orderBy = { createdAt: "desc" },
}) {
  async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    try {
      if (id) {
        const data = await model.findUnique({
          where: { id },
          ...readOptions(select),
        });

        if (!data) return json({ error: `${entityName} tidak ditemukan` }, 404);
        return json({ data });
      }

      const data = await model.findMany({
        where: getWhere ? getWhere(searchParams) : undefined,
        orderBy,
        ...readOptions(select),
      });

      return json({ data });
    } catch (error) {
      return errorResponse(error, entityName);
    }
  }

  async function POST(request) {
    const body = await readJson(request);

    try {
      const data = await model.create({
        data: await createData(body),
        ...readOptions(select),
      });

      return json({ data }, 201);
    } catch (error) {
      return errorResponse(error, entityName);
    }
  }

  async function PUT(request) {
    const body = await readJson(request);
    const id = getId(request, body);

    if (!id) {
      return json({ error: "Parameter id wajib diisi" }, 400);
    }

    try {
      const data = await model.update({
        where: { id },
        data: await updateData(body),
        ...readOptions(select),
      });

      return json({ data });
    } catch (error) {
      return errorResponse(error, entityName);
    }
  }

  async function DELETE(request) {
    const body = await readJson(request);
    const id = getId(request, body);

    if (!id) {
      return json({ error: "Parameter id wajib diisi" }, 400);
    }

    try {
      const data = await model.delete({
        where: { id },
        ...readOptions(select),
      });

      return json({ message: `${entityName} berhasil dihapus`, data });
    } catch (error) {
      return errorResponse(error, entityName);
    }
  }

  return { GET, POST, PUT, DELETE };
}
