import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
  response.cookies.set({
    name: "cred",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
  return response;
}
