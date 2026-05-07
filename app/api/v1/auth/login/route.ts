import { connectDB } from "@/app/lib/connect";
import userModel from "@/app/models/userModel";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"

const ALLOWEDORIGIN = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "";

export async function POST(req:NextRequest){
    const { email, password } = await req.json();
    const origin = req.headers.get("origin");
    try {
        if(!origin?.startsWith(ALLOWEDORIGIN))return NextResponse.json({success: false, message: "Unauthorized"}, {status: 401});
        if(!email || !password) return NextResponse.json({success: false, message: "Invalid params"}, {status: 400});
        await connectDB();
        const user = await userModel.findOne({email:email});
        if(!user) return NextResponse.json({success: false, message: "User doesn't exist"}, {status: 400});
        const checkPassword = await bcrypt.compare(password, user.password);
        if(!checkPassword) return NextResponse.json({success: false, message: "Invalid password"}, {status: 400});
        const token = await jwt.sign({id:user._id, role: user.role}, process.env.SECRET_KEY as string, {expiresIn: "1d"});
        const response = NextResponse.json({success: true, message: "Logged in successfully", id: user._id});
        response.cookies.set({
            name: "cred",
            value: token,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24
        });
        return response;
    } catch (error) {
        const err = error instanceof Error ? error.message : "Server Unreachable";
        return NextResponse.json({success: false, message: err}, {status: 500});
    }
}