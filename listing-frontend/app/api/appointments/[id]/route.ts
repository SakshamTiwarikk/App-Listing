import { NextRequest, NextResponse } from "next/server";

const BASE = "http://localhost:5000/api/appointments";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const res = await fetch(`${BASE}/${params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const res = await fetch(`${BASE}/${params.id}`, { method: "DELETE" });

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return new NextResponse("Error parsing response", { status: 500 });
  }
}
