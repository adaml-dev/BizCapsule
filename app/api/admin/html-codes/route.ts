import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";

// GET - List all HTML codes
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const htmlCodes = await db.htmlCode.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(htmlCodes);
  } catch (error) {
    console.error("Error fetching HTML codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch HTML codes" },
      { status: 500 }
    );
  }
}

// POST - Create new HTML code
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    if (content.length > 100000) {
      return NextResponse.json(
        { error: "Content exceeds 100,000 characters limit" },
        { status: 400 }
      );
    }

    const htmlCode = await db.htmlCode.create({
      data: {
        title,
        content,
      },
    });

    // Create an experiment for this HTML code
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if slug exists, add unique identifier if needed
    const existingExperiment = await db.experiment.findUnique({
      where: { slug },
    });

    const finalSlug = existingExperiment
      ? `${slug}-${htmlCode.id.slice(0, 6)}`
      : slug;

    // Create the HTML file
    const filePath = `experiments_raw/html-editor-${htmlCode.id}.html`;
    const fs = require("fs").promises;
    const path = require("path");
    const fullPath = path.join(process.cwd(), filePath);

    await fs.writeFile(fullPath, content);

    // Create experiment entry
    await db.experiment.create({
      data: {
        slug: finalSlug,
        title,
        description: `HTML Editor: Created on ${new Date().toLocaleDateString()}`,
        filePath,
        isPublic: false,
      },
    });

    return NextResponse.json(htmlCode, { status: 201 });
  } catch (error) {
    console.error("Error creating HTML code:", error);
    return NextResponse.json(
      { error: "Failed to create HTML code" },
      { status: 500 }
    );
  }
}

// DELETE - Delete HTML code
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    // Get the HTML code to find the associated file
    const htmlCode = await db.htmlCode.findUnique({
      where: { id },
    });

    if (!htmlCode) {
      return NextResponse.json(
        { error: "HTML code not found" },
        { status: 404 }
      );
    }

    // Delete the associated experiment and file
    const filePath = `experiments_raw/html-editor-${id}.html`;
    const experiment = await db.experiment.findFirst({
      where: { filePath },
    });

    if (experiment) {
      await db.experiment.delete({
        where: { id: experiment.id },
      });

      // Delete the file
      const fs = require("fs").promises;
      const path = require("path");
      const fullPath = path.join(process.cwd(), filePath);

      try {
        await fs.unlink(fullPath);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }

    // Delete the HTML code
    await db.htmlCode.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting HTML code:", error);
    return NextResponse.json(
      { error: "Failed to delete HTML code" },
      { status: 500 }
    );
  }
}
