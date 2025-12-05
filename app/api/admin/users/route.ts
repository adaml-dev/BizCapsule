import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { sendApprovalNotificationEmail } from "@/lib/email";

// GET - List all users
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        isApproved: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    // Return as array of users with createdAt as ISO string
    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      isApproved: user.isApproved,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    if ((error as Error).message === "Admin access required") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("List users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update user (approve, make admin, etc.)
const updateUserSchema = z.object({
  id: z.string(),
  action: z.enum(["approve"]),
});

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { id, action } = updateUserSchema.parse(body);

    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle approve action
    if (action === "approve") {
      const updatedUser = await db.user.update({
        where: { id },
        data: { isApproved: true },
        select: {
          id: true,
          email: true,
          isApproved: true,
          isAdmin: true,
          createdAt: true,
        },
      });

      // Send approval notification if user was just approved
      if (!user.isApproved) {
        await sendApprovalNotificationEmail(user.email);
      }

      return NextResponse.json({
        id: updatedUser.id,
        email: updatedUser.email,
        isApproved: updatedUser.isApproved,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt.toISOString(),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if ((error as Error).message === "Admin access required") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
const deleteUserSchema = z.object({
  id: z.string(),
});

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    // Support both query param and JSON body
    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get("id");

    let userId: string;

    if (queryId) {
      userId = queryId;
    } else {
      const body = await req.json();
      const { id } = deleteUserSchema.parse(body);
      userId = id;
    }

    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === "Admin access required") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
