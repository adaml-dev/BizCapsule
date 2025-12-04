import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { slug } = await params;

    // Find experiment by slug
    const experiment = await db.experiment.findUnique({
      where: { slug },
      include: {
        users: {
          where: { userId: user.id },
        },
      },
    });

    if (!experiment) {
      return new NextResponse("Experiment not found", { status: 404 });
    }

    // Check if user has access (admins have access to all, or check if public, or check user-experiment relation)
    const hasAccess =
      user.isAdmin || experiment.isPublic || experiment.users.length > 0;

    if (!hasAccess) {
      return new NextResponse(
        "Forbidden - You don't have access to this experiment",
        {
          status: 403,
        }
      );
    }

    // Read HTML file
    const filePath = join(process.cwd(), experiment.filePath);
    const htmlContent = await readFile(filePath, "utf-8");

    // Return HTML with proper content type
    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Experiment serving error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
