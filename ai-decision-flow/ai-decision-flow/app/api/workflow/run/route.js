import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";

export async function POST(req) {
  const { nodes, edges } = await req.json();

  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    return NextResponse.json({ error: "nodes and edges are required" }, { status: 400 });
  }

  const { ids } = await inngest.send({ name: "workflow/run", data: { nodes, edges } });
  return NextResponse.json({ status: "queued", eventId: ids[0] });
}