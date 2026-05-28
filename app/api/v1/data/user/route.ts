import { connectDB } from "@/app/lib/connect";
import userModel from "@/app/models/userModel";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
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


export async function POST(req: NextRequest){
  const { id }  = await req.json();
  const secret = new TextEncoder().encode(process.env.SECRET_KEY);
  const cookieStore = await cookies();
  const token = cookieStore.get("cred")?.value;
  try {
    if(!id) return NextResponse.json({success: false, message: "Invalid Params"}, {status: 400});
    const { payload } = await jwtVerify(token as string, secret);
    if(payload.id !== id || payload.role !== "admin") return NextResponse.json({success: false, message: "Unauthorized"}, {status: 401});
    const user = await userModel.find({}).select("-password -recoveryKey");
    return NextResponse.json({success: true, user});
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Sever Unreachable';
    return NextResponse.json({success: false, message: err}, {status: 500});
  }
}