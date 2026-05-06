import { connectDB } from "@/app/lib/connect";
import userModel from "@/app/models/userModel";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid/non-secure";
import { NextRequest, NextResponse } from "next/server";

const ALLOWEDORIGIN = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "";

export async function POST(req:NextRequest){
    const { fullName, email, social, password,studentId, profile, profileId } = await req.json();
    const origin = req.headers.get("origin");
    try {
        if(!origin?.startsWith(ALLOWEDORIGIN)) return NextResponse.json({success: false, message: "Unauthorized"}, {status: 401});
        if(!fullName || !email || !social || !password || !profile || !profileId || !studentId) return NextResponse.json({success: false, message: "Invalid Params"}, {status: 400});
        await connectDB();
        const existingUser = await userModel.findOne({email: email});
        const existingStudentId = await userModel.findOne({studentId: studentId});
        if(existingStudentId) return NextResponse.json({success: false, message: "StudentId already exist"}, {status: 400});
        if(existingUser) return NextResponse.json({success: false, message: "Email already used"}, {status: 400});
        const hashedPassword = await bcrypt.hash(password, 10);
        const nanoid = customAlphabet("1234567890", 4);
        const recoveryKey = nanoid();
        const newUser = new userModel({fullName, email, social, password:hashedPassword, profile, profileId, studentId, recoveryKey});
        await newUser.save();
        return NextResponse.json({success: true, message: "Registered successfully"}, {status: 200});
    } catch (error) {
        const err = error instanceof Error ? error.message : "Server Unreachable";
        return NextResponse.json({success: false, message: err}, {status: 500});
    }
}