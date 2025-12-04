import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { sendAdminNotificationEmail } from "@/lib/email";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password, inviteToken } = registerSchema.parse(body);

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

    let isApproved = false;
    let invitation = null;

    // Check if registering with invitation token
    if (inviteToken) {
      invitation = await db.invitation.findUnique({
        where: { token: inviteToken },
      });

      if (!invitation) {
        return NextResponse.json(
          { error: "Invalid invitation token" },
          { status: 400 }
        );
      }

      if (invitation.expiresAt < new Date()) {
        return NextResponse.json(
          { error: "Invitation token has expired" },
          { status: 400 }
        );
      }

      if (invitation.usedCount >= invitation.maxUses) {
        return NextResponse.json(
          { error: "Invitation token has been fully used" },
          { status: 400 }
        );
      }

      if (invitation.email !== email) {
        return NextResponse.json(
          { error: "This invitation is for a different email address" },
          { status: 400 }
        );
      }

      isApproved = invitation.autoApprove;
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        isApproved,
      },
    });

    // Update invitation usage if applicable
    if (invitation) {
      await db.invitation.update({
        where: { id: invitation.id },
        data: { usedCount: invitation.usedCount + 1 },
      });
    }

    // Notify admin if user needs approval
    if (!isApproved) {
      // Find first admin to notify
      const admin = await db.user.findFirst({
        where: { isAdmin: true },
      });

      if (admin) {
        await sendAdminNotificationEmail(admin.email, email);
      }
    }

    return NextResponse.json(
      {
        message: isApproved
          ? "Registration successful! You can now log in."
          : "Registration successful! Your account is pending admin approval.",
        requiresApproval: !isApproved,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
