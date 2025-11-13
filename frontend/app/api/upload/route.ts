import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Read the FormData from the request
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Send it to your FastAPI backend
    const backendRes = await fetch(`${process.env.BACKEND_URL}`, {
      method: "POST",
      body: formData,
    });

    if (!backendRes.ok) {
      const text = await backendRes.text();
      return NextResponse.json({ error: `Backend error: ${text}` }, { status: backendRes.status });
    }

    const data = await backendRes.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Error in BFF /api/upload:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
