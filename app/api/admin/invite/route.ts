import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { sendInvitationEmail } from "@/lib/email";
import crypto from "crypto";

const inviteSchema = z.object({
  email: z.string().email(),
  maxUses: z.number().int().positive().default(1),
  expiresInDays: z.number().int().positive().default(7),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await req.json();
    const { email, maxUses, expiresInDays } = inviteSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create invitation
    const invitation = await db.invitation.create({
      data: {
        email,
        token,
        expiresAt,
        maxUses,
        autoApprove: true,
        createdById: admin.id,
      },
    });

    // Send invitation email
    await sendInvitationEmail(email, token);

    return NextResponse.json(
      {
        message: "Invitation sent successfully",
        invitation: {
          id: invitation.id,
          email: invitation.email,
          expiresAt: invitation.expiresAt,
          maxUses: invitation.maxUses,
        },
      },
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

    console.error("Invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - List all invitations
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const invitations = await db.invitation.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        expiresAt: true,
        maxUses: true,
        usedCount: true,
        createdAt: true,
        createdBy: {
          select: {
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    if ((error as Error).message === "Admin access required") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("List invitations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
