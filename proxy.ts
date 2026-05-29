import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const adminRoutes = ["admin"];

export async function proxy(req: NextRequest) {
  const params = req.nextUrl.pathname;
  const id = params.split("/")[2];
  const path = params.split("/")[1];
  const token = await req.cookies.get("cred")?.value;
  const secret = new TextEncoder().encode(process.env.SECRET_KEY);
  try {
    if(!token) throw new Error("Not logged in");
    const { payload } = await jwtVerify(token as string, secret);
    if (payload.id !== id) {
      const response = NextResponse.redirect(new URL("/unauthorized", req.url));
      response.cookies.delete("cred");
      return response;
    }
    if (adminRoutes.includes(path) && payload.role !== "admin") {
      const response = NextResponse.redirect(new URL("/unauthorized", req.url));
      response.cookies.delete("cred");
      return response;
    }
    return NextResponse.next();
  } catch (error) {
    console.log(error);
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.delete("cred");
    return response;
  }
}

export const config = {
  matcher: ["/admin/:id*", "/browse/:id*", "/dashboard/:id*", "/addItem/:id*"],
};
