import { NextRequest } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // 1. Authentication check
    const user = await getCurrentUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. Get slug from params
    const { slug } = await params;

    // 3. Find experiment by slug
    const experiment = await db.experiment.findUnique({
      where: { slug },
      include: {
        users: {
          where: { userId: user.id },
        },
      },
    });

    if (!experiment) {
      return new Response("Experiment not found", { status: 404 });
    }

    // 4. Access control: admin OR user has UserExperiment entry
    const hasAccess = user.isAdmin || experiment.users.length > 0;

    if (!hasAccess) {
      return new Response("Forbidden", { status: 403 });
    }

    // 5. Determine HTML file name
    // If experiment has filePath field, extract just the filename
    // Otherwise, default to slug + ".html"
    let fileName: string;
    if (experiment.filePath) {
      // Extract filename from path like "experiments_raw/hello-vibe.html"
      fileName = path.basename(experiment.filePath);
    } else {
      fileName = `${slug}.html`;
    }

    // 6. Build absolute path to HTML file
    const filePath = path.join(process.cwd(), "experiments_raw", fileName);

    // 7. Read the HTML file
    let html: string;
    try {
      html = await fs.readFile(filePath, "utf8");
    } catch (error: any) {
      if (error.code === "ENOENT") {
        console.error(`HTML file not found: ${filePath}`);
        return new Response("Experiment HTML file not found", { status: 404 });
      }
      throw error; // Re-throw to outer catch for other file errors
    }

    // 8. Return HTML with proper headers
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Experiment failed to render:", error);
    return new Response("Experiment failed to render", { status: 500 });
  }
}
