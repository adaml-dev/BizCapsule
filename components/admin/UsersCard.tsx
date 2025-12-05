"use client";

import { useEffect, useState } from "react";

type AdminUser = {
  id: string;
  email: string;
  isApproved: boolean;
  isAdmin: boolean;
  createdAt: string;
};

export default function UsersCard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/users");
      
      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.status}`);
      }
      
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    const newBusyIds = new Set(busyIds);
    newBusyIds.add(id);
    setBusyIds(newBusyIds);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, action: "approve" }),
      });

      if (!res.ok) {
        throw new Error(`Failed to approve user: ${res.status}`);
      }

      const updatedUser = await res.json();
      
      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, isApproved: updatedUser.isApproved } : user
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve user");
    } finally {
      const newBusyIds = new Set(busyIds);
      newBusyIds.delete(id);
      setBusyIds(newBusyIds);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    const newBusyIds = new Set(busyIds);
    newBusyIds.add(id);
    setBusyIds(newBusyIds);

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error(`Failed to delete user: ${res.status}`);
      }

      // Remove user from local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      const newBusyIds = new Set(busyIds);
      newBusyIds.delete(id);
      setBusyIds(newBusyIds);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-900/70 border border-slate-800/60 rounded-2xl p-6 shadow-lg">
        <h2 className="text-sm font-semibold text-slate-50 mb-4 flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs">
            👤
          </span>
          Users Management
        </h2>
        <div className="text-center py-8 text-slate-400 text-sm">
          Loading users...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900/70 border border-slate-800/60 rounded-2xl p-6 shadow-lg">
        <h2 className="text-sm font-semibold text-slate-50 mb-4 flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs">
            👤
          </span>
          Users Management
        </h2>
        <div className="text-center py-8 text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 border border-slate-800/60 rounded-2xl p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-50 flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs">
            👤
          </span>
          Users Management
        </h2>
        <span className="text-xs text-slate-400">{users.length} total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800/60">
              <th className="text-left py-3 px-3 font-semibold text-slate-300">
                Email
              </th>
              <th className="text-left py-3 px-3 font-semibold text-slate-300">
                Status
              </th>
              <th className="text-left py-3 px-3 font-semibold text-slate-300">
                Role
              </th>
              <th className="text-left py-3 px-3 font-semibold text-slate-300">
                Created
              </th>
              <th className="text-right py-3 px-3 font-semibold text-slate-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isBusy = busyIds.has(user.id);
              return (
                <tr
                  key={user.id}
                  className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-3 text-slate-200">{user.email}</td>
                  <td className="py-3 px-3">
                    {user.isApproved ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {user.isAdmin ? (
                      <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-500/20">
                        User
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!user.isApproved && (
                        <button
                          onClick={() => handleApprove(user.id)}
                          disabled={isBusy}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isBusy ? "..." : "Approve"}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isBusy}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isBusy ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}
