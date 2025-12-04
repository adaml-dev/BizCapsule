import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";

export default async function HubPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  // Get user's experiments
  const experiments = await db.experiment.findMany({
    where: {
      OR: [
        { isPublic: true },
        {
          users: {
            some: {
              userId: user.id,
            },
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

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
              <h1 className="text-2xl font-bold text-gray-900">Vibe Lab</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.email}</span>
              {user.isAdmin && (
                <a
                  href="/admin"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Admin Panel
                </a>
              )}
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Your Experiments
          </h2>

          {experiments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No experiments available yet. Please contact an administrator to
                get access.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {experiments.map((experiment: any) => (
                <div
                  key={experiment.id}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {experiment.title}
                    </h3>
                    {experiment.description && (
                      <p className="mt-2 text-sm text-gray-500">
                        {experiment.description}
                      </p>
                    )}
                    {experiment.isPublic && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                        Public
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <a
                      href={`/experiments/${experiment.slug}`}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      View Experiment →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
