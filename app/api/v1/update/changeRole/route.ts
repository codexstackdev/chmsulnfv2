import { connectDB } from "@/app/lib/connect";
import userModel from "@/app/models/userModel";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    const { id, updateId, role } = await req.json();
    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const cookieStore = await cookies();
    const token = cookieStore.get("cred")?.value;
    try {
        if(!id || !updateId || !role) return NextResponse.json({success: false, message: "Missing params"}, {status: 400});
        const { payload } = await jwtVerify(token as string, secret);
        if(payload.id !== id && payload.role !== "admin") return NextResponse.json({success: false, message: "Unauthorized"}, {status: 401});
        const user = await userModel.findByIdAndUpdate(updateId, 
            {$set: {role: role}},
            {returnDocument: "after"}
        );
        return NextResponse.json({success: true, message: "Role updated successfully"}, {status: 200})
    } catch (error) {
        const err = error instanceof Error ? error.message : "Server Unreachable";
        return NextResponse.json({success: false, message: err}, {status: 500});
    }
}