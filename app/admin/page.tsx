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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Vibe Lab - Admin Panel
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.email}</span>
              <a
                href="/hub"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                View Hub
              </a>
              <form action={handleLogout}>
                <button
                  type="submit"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Admin Dashboard
          </h2>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Invite New User
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">
                    Send an invitation email to a new user. The invitation will
                    include a unique link that auto-approves their account.
                  </p>
                  <p className="text-xs text-gray-400">
                    Use API: POST /api/admin/invite with email, maxUses, and
                    expiresInDays
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Manage Users
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">
                    View all users, approve pending registrations, grant admin
                    access, or delete users.
                  </p>
                  <p className="text-xs text-gray-400">
                    Use API: GET /api/admin/users, PATCH /api/admin/users,
                    DELETE /api/admin/users
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Manage Experiments
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">
                    Create new experiments, update existing ones, or delete
                    experiments. Configure which users have access.
                  </p>
                  <p className="text-xs text-gray-400">
                    Use API: POST /api/admin/experiments, GET
                    /api/admin/experiments, PATCH /api/admin/experiments, DELETE
                    /api/admin/experiments
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Grant/Revoke Experiment Access
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">
                    Control which users can access specific experiments.
                  </p>
                  <p className="text-xs text-gray-400">
                    Use API: POST /api/admin/user-experiments, DELETE
                    /api/admin/user-experiments
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              📝 Note: Admin UI Coming Soon
            </h3>
            <p className="text-sm text-blue-700">
              This is a functional admin panel skeleton. All backend APIs are
              ready to use. You can integrate a full admin UI by making fetch
              requests to the API endpoints listed above, or use tools like
              Postman/curl for now.
            </p>
          </div>

          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Available API Endpoints
              </h3>
              <div className="space-y-3">
                <div className="border-l-4 border-green-400 pl-4">
                  <code className="text-sm font-mono text-gray-800">
                    POST /api/admin/invite
                  </code>
                  <p className="text-xs text-gray-500 mt-1">
                    Send invitation to new user
                  </p>
                </div>
                <div className="border-l-4 border-blue-400 pl-4">
                  <code className="text-sm font-mono text-gray-800">
                    GET /api/admin/users
                  </code>
                  <p className="text-xs text-gray-500 mt-1">
                    List all users with their experiment access
                  </p>
                </div>
                <div className="border-l-4 border-yellow-400 pl-4">
                  <code className="text-sm font-mono text-gray-800">
                    PATCH /api/admin/users
                  </code>
                  <p className="text-xs text-gray-500 mt-1">
                    Update user (approve, make admin)
                  </p>
                </div>
                <div className="border-l-4 border-blue-400 pl-4">
                  <code className="text-sm font-mono text-gray-800">
                    GET /api/admin/experiments
                  </code>
                  <p className="text-xs text-gray-500 mt-1">
                    List all experiments
                  </p>
                </div>
                <div className="border-l-4 border-green-400 pl-4">
                  <code className="text-sm font-mono text-gray-800">
                    POST /api/admin/experiments
                  </code>
                  <p className="text-xs text-gray-500 mt-1">
                    Create new experiment
                  </p>
                </div>
                <div className="border-l-4 border-green-400 pl-4">
                  <code className="text-sm font-mono text-gray-800">
                    POST /api/admin/user-experiments
                  </code>
                  <p className="text-xs text-gray-500 mt-1">
                    Grant user access to experiment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
