import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notice from "@/models/Notice";

export async function GET() {
  try {
    await connectDB();
    const notices = await Notice.find().sort({ createdAt: -1 });
    return NextResponse.json(notices);
  } catch (error: any) {
    console.error("GET /api/notices error:", error);
    return NextResponse.json({ error: "Failed to fetch notices" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, category, date } = await req.json();
    if (!title || !category || !date)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    await connectDB();
    const notice = await Notice.create({ title, category, date });
    return NextResponse.json(notice, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/notices error:", error);
    return NextResponse.json({ error: "Failed to save notice" }, { status: 500 });
  }
}
