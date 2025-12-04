import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  if (!user.isAdmin) {
    redirect("/hub");
  }

  async function handleLogout() {
    "use server";
    const { clearSessionCookie } = await import("@/lib/session");
    await clearSessionCookie();
    redirect("/");
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto w-full px-6 py-4 flex items-center justify-between">
          <h1 className="text-sm font-semibold text-slate-200">
            BizCapsule{" "}
            <span className="text-slate-500 font-normal">· Admin Panel</span>
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{user.email}</span>
            <a
              href="/hub"
              className="text-xs px-3 py-1.5 rounded-full border border-slate-700 hover:bg-slate-800/70 text-slate-300 transition-colors"
            >
              View Hub
            </a>
            <form action={handleLogout}>
              <button
                type="submit"
                className="text-xs px-3 py-1.5 rounded-full border border-slate-700 hover:bg-slate-800/70 text-slate-300 transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Cards grid for sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Manage Users card */}
          <div className="bg-slate-900/70 border border-slate-800/60 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-50 flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs">
                    👤
                  </span>
                  Manage Users
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  View all users, approve pending registrations, grant admin
                  access, or delete users.
                </p>
              </div>
            </div>

            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/60 px-3 py-1">
                <span className="rounded bg-emerald-500/20 px-2 py-[2px] text-[10px] font-semibold text-emerald-400">
                  GET
                </span>
                <span>/api/admin/users</span>
              </div>
            </div>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/60 px-3 py-1">
                <span className="rounded bg-amber-500/20 px-2 py-[2px] text-[10px] font-semibold text-amber-400">
                  PATCH
                </span>
                <span>/api/admin/users</span>
              </div>
            </div>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/60 px-3 py-1">
                <span className="rounded bg-red-500/20 px-2 py-[2px] text-[10px] font-semibold text-red-400">
                  DELETE
                </span>
                <span>/api/admin/users</span>
              </div>
            </div>
          </div>

          {/* Invite Users card */}
          <div className="bg-slate-900/70 border border-slate-800/60 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-50 flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs">
                    ✉️
                  </span>
                  Invite Users
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Send an invitation email to a new user. The invitation will
                  include a unique link that auto-approves their account.
                </p>
              </div>
            </div>

            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/60 px-3 py-1">
                <span className="rounded bg-blue-500/20 px-2 py-[2px] text-[10px] font-semibold text-blue-400">
                  POST
                </span>
                <span>/api/admin/invite</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">
              Params: email, maxUses, expiresInDays
            </p>
          </div>

          {/* Experiments card */}
          <div className="bg-slate-900/70 border border-slate-800/60 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-50 flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs">
                    🧪
                  </span>
                  Experiments
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Create new experiments, update existing ones, or delete
                  experiments. Configure which users have access.
                </p>
              </div>
            </div>

            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/60 px-3 py-1">
                <span className="rounded bg-emerald-500/20 px-2 py-[2px] text-[10px] font-semibold text-emerald-400">
                  GET
                </span>
                <span>/api/admin/experiments</span>
              </div>
            </div>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/60 px-3 py-1">
                <span className="rounded bg-blue-500/20 px-2 py-[2px] text-[10px] font-semibold text-blue-400">
                  POST
                </span>
                <span>/api/admin/experiments</span>
              </div>
            </div>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/60 px-3 py-1">
                <span className="rounded bg-amber-500/20 px-2 py-[2px] text-[10px] font-semibold text-amber-400">
                  PATCH
                </span>
                <span>/api/admin/experiments</span>
              </div>
            </div>
          </div>

          {/* Grant/Revoke Access card */}
          <div className="bg-slate-900/70 border border-slate-800/60 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-50 flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs">
                    🔑
                  </span>
                  Grant/Revoke Access
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Control which users can access specific experiments.
                </p>
              </div>
            </div>

            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/60 px-3 py-1">
                <span className="rounded bg-blue-500/20 px-2 py-[2px] text-[10px] font-semibold text-blue-400">
                  POST
                </span>
                <span>/api/admin/user-experiments</span>
              </div>
            </div>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/60 px-3 py-1">
                <span className="rounded bg-red-500/20 px-2 py-[2px] text-[10px] font-semibold text-red-400">
                  DELETE
                </span>
                <span>/api/admin/user-experiments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-4 rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/60 px-4 py-3 text-xs text-slate-400">
          <span className="font-semibold text-slate-200">Note:</span> This is a
          functional admin panel skeleton. All backend APIs are ready to use.
          You can integrate a full admin UI by making fetch requests to the API
          endpoints listed above, or use tools like Postman/curl for now.
        </div>
      </section>
    </main>
  );
}
