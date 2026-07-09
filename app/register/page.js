import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, UserPlus } from "lucide-react";
import Logo from "@/components/Logo";
import SubmitButton from "@/components/SubmitButton";
import { apiGet, apiPost } from "@/lib/internalApi";

async function register(formData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!name || !username || !password) {
    redirect("/register?error=required");
  }

  if (password.length < 6) {
    redirect("/register?error=password");
  }

  if (password !== confirmPassword) {
    redirect("/register?error=confirm");
  }

  const existingUsers = await apiGet(`/api/user?username=${encodeURIComponent(username)}`);
  if (existingUsers.length > 0) {
    redirect("/register?error=username");
  }

  await apiPost("/api/user", {
    name,
    username,
    password,
    role: "PESERTA",
  });

  redirect("/login?registered=1");
}

function errorText(code) {
  if (code === "username") return "Username sudah digunakan.";
  if (code === "password") return "Password minimal 6 karakter.";
  if (code === "confirm") return "Konfirmasi password tidak sama.";
  if (code) return "Lengkapi semua data pendaftaran.";
  return null;
}

export default function RegisterPage({ searchParams }) {
  const message = errorText(searchParams?.error);

  return (
    <main className="shell flex min-h-screen items-start justify-center px-4 py-16">
      <div className="card w-full max-w-md px-8 py-10 shadow-xl">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <Logo className="h-20 w-auto" />
          </div>
          <div className="mx-auto mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <UserPlus size={28} />
          </div>
          <h1 className="mt-5 text-2xl font-black">Daftar Akun</h1>
          <p className="mt-3 text-sm text-slate-500">
            Buat akun peserta untuk mengikuti ujian.
          </p>
        </div>

        {message && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
          </div>
        )}

        <form action={register} className="space-y-4">
          <div>
            <label className="label">Nama Lengkap</label>
            <input
              name="name"
              className="input"
              placeholder="Nama peserta"
              autoComplete="name"
              required
            />
          </div>
          <div>
            <label className="label">Username</label>
            <input
              name="username"
              className="input"
              placeholder="Username untuk login"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                name="password"
                type="password"
                className="input pr-11"
                placeholder="Minimal 6 karakter"
                autoComplete="new-password"
                required
              />
              <Eye
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
          <div>
            <label className="label">Konfirmasi Password</label>
            <div className="relative">
              <input
                name="confirmPassword"
                type="password"
                className="input pr-11"
                placeholder="Ulangi password"
                autoComplete="new-password"
                required
              />
              <Eye
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
          <SubmitButton
            className="btn-primary w-full gap-2 py-3"
            pendingText="Membuat akun..."
          >
            Daftar
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
