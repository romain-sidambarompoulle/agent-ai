import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/flows/:id  ➡️ récupérer un flow
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const flow = await prisma.flow.findUnique({ where: { id: params.id } });
  return NextResponse.json(flow);
}

// PUT /api/flows/:id  ➡️ mettre à jour le nom
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await req.json();           // { name?, json? }
  await prisma.flow.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true });
}

// DELETE /api/flows/:id  ➜ supprime le flow
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.flow.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
