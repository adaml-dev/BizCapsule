import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

// GET - List all experiments
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const experiments = await db.experiment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        users: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ experiments });
  } catch (error) {
    if ((error as Error).message === "Admin access required") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("List experiments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new experiment
const createExperimentSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().optional(),
  filePath: z.string().min(1),
  isPublic: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const data = createExperimentSchema.parse(body);

    const experiment = await db.experiment.create({
      data,
    });

    return NextResponse.json(
      {
        message: "Experiment created successfully",
        experiment,
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

    console.error("Create experiment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update experiment
const updateExperimentSchema = z.object({
  experimentId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  filePath: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { experimentId, ...updateData } = updateExperimentSchema.parse(body);

    const experiment = await db.experiment.update({
      where: { id: experimentId },
      data: updateData,
    });

    return NextResponse.json({
      message: "Experiment updated successfully",
      experiment,
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

    console.error("Update experiment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete experiment
const deleteExperimentSchema = z.object({
  experimentId: z.string(),
});

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { experimentId } = deleteExperimentSchema.parse(body);

    await db.experiment.delete({
      where: { id: experimentId },
    });

    return NextResponse.json({ message: "Experiment deleted successfully" });
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

    console.error("Delete experiment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
