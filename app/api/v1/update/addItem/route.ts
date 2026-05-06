import { connectDB } from "@/app/lib/connect";
import userModel from "@/app/models/userModel";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest){
    const { id, itemId } = await req.json();
    try {
        if(!id || !itemId) return NextResponse.json({success: false, message: "Missing parameter"}, {status: 401});
        await connectDB();
        const user = await userModel.findByIdAndUpdate(id, 
            {$push: {postedItems: itemId}},
            {returnDocument: "after"}
        );
        return NextResponse.json({success: true, message: "Posted successfully"});
    } catch (error) {
        const err = error instanceof Error ? error.message : 'Server Unreachable';
        return NextResponse.json({success: false, message: err}, {status: 500});
    }
}