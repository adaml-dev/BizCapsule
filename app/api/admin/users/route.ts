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
        experiments: {
          include: {
            experiment: {
              select: {
                slug: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ users });
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
  userId: z.string(),
  isApproved: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { userId, isApproved, isAdmin } = updateUserSchema.parse(body);

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: { isApproved?: boolean; isAdmin?: boolean } = {};
    if (isApproved !== undefined) updateData.isApproved = isApproved;
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        isApproved: true,
        isAdmin: true,
      },
    });

    // Send approval notification if user was just approved
    if (isApproved && !user.isApproved) {
      await sendApprovalNotificationEmail(user.email);
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
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
  userId: z.string(),
});

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { userId } = deleteUserSchema.parse(body);

    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
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
