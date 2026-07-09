import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/apiCrud";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    const valid = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !valid) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    return NextResponse.json({
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return errorResponse(error, "Login");
  }
}
