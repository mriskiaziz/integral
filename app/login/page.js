import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Logo from "@/components/Logo";
import SubmitButton from "@/components/SubmitButton";
import bcrypt from "bcryptjs";

async function login(formData) {
  "use server";

  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) redirect("/login?error=1");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) redirect("/login?error=1");
  if (user.role === "ADMIN") redirect("/admin");
  redirect(`/user?userId=${user.id}`);
}

export default function LoginPage({ searchParams }) {
  return (
    <main className="shell flex min-h-screen items-start justify-center px-4 py-16">
      <div className="card w-full max-w-md px-8 py-10 shadow-xl">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <Logo className="h-20 w-auto" />
          </div>
          <h1 className="mt-7 text-2xl font-black">Login</h1>
          <p className="mt-3 text-sm text-slate-500">
            Masuk untuk mengikuti ujian
          </p>
        </div>

        {searchParams?.error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Username atau password salah.
          </div>
        )}

        {searchParams?.registered && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Akun berhasil dibuat. Silakan login untuk mengikuti ujian.
          </div>
        )}

        <form action={login} className="space-y-4">
          <input
            name="username"
            className="input"
            placeholder="Email atau Username"
            autoComplete="username"
            required
          />
          <div className="relative">
            <input
              name="password"
              type="password"
              className="input pr-11"
              placeholder="Password"
              autoComplete="current-password"
              required
            />
            <Eye
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
          <SubmitButton
            className="btn-primary w-full gap-2 py-3"
            pendingText="Masuk..."
          >
            Login
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-blue-600">
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
