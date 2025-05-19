// src/app/api/flows/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Récupère tous les flows (liste d'accueil)
export async function GET() {
  const flows = await prisma.flow.findMany({
    select: { id: true, name: true, createdAt: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(flows);
}

// Crée un nouveau flow
export async function POST(req: Request) {
  const { name } = await req.json();           // ex. { "name": "Nouveau flow" }
  const flow = await prisma.flow.create({
    data: { name, json: {} },
  });
  return NextResponse.json({ id: flow.id }, { status: 201 });
}