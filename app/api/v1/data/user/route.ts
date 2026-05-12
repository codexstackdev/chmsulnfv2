import { connectDB } from "@/app/lib/connect";
import userModel from "@/app/models/userModel";
import { NextRequest, NextResponse } from "next/server";

const ALLOWEDORIGIN =
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : "";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const referrer = req.headers.get("referer");
  const id = params.get("id");
  try {
    if (!referrer?.startsWith(ALLOWEDORIGIN))
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    if (!id)
      return NextResponse.json(
        { success: false, message: "Invalid parameter" },
        { status: 400 },
      );
    await connectDB();
    const user = await userModel.findById(id).select("-password -recoveryKey");
    return NextResponse.json({ success: true, user });
  } catch (error) {
    const err = error instanceof Error ? error.message : "Server Unreachable";
    return NextResponse.json({ success: false, message: err }, { status: 500 });
  }
}
