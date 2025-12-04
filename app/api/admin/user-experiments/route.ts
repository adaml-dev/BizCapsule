import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

// POST - Grant user access to experiment
const grantAccessSchema = z.object({
  userId: z.string(),
  experimentId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { userId, experimentId } = grantAccessSchema.parse(body);

    // Check if access already exists
    const existing = await db.userExperiment.findUnique({
      where: {
        userId_experimentId: {
          userId,
          experimentId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already has access to this experiment" },
        { status: 400 }
      );
    }

    await db.userExperiment.create({
      data: {
        userId,
        experimentId,
      },
    });

    return NextResponse.json(
      { message: "Access granted successfully" },
      { status: 201 }
    );
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

    console.error("Grant access error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Revoke user access to experiment
const revokeAccessSchema = z.object({
  userId: z.string(),
  experimentId: z.string(),
});

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { userId, experimentId } = revokeAccessSchema.parse(body);

    await db.userExperiment.delete({
      where: {
        userId_experimentId: {
          userId,
          experimentId,
        },
      },
    });

    return NextResponse.json({ message: "Access revoked successfully" });
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

    console.error("Revoke access error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
