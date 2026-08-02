import { NextResponse } from "next/server";
import { db } from "@/db";
import { buyers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await db.select().from(buyers).where(eq(buyers.id, id));
    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Buyer not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.select().from(buyers).where(eq(buyers.id, id));
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Buyer not found" }, { status: 404 });
    }

    const updateData = {
      ...body,
      budget_min: body.budget_min !== undefined ? parseFloat(body.budget_min) : existing[0].budget_min,
      budget_max: body.budget_max !== undefined ? parseFloat(body.budget_max) : existing[0].budget_max,
      lt_min: body.lt_min !== undefined ? parseInt(body.lt_min) : existing[0].lt_min,
      lb_min: body.lb_min !== undefined ? parseInt(body.lb_min) : existing[0].lb_min,
      kt_min: body.kt_min !== undefined ? parseInt(body.kt_min) : existing[0].kt_min,
      updatedAt: new Date().toISOString(),
    };

    await db.update(buyers).set(updateData).where(eq(buyers.id, id));

    return NextResponse.json({ success: true, data: { ...existing[0], ...updateData } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(buyers).where(eq(buyers.id, id));
    return NextResponse.json({ success: true, message: "Buyer deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
