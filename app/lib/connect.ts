import mongoose from "mongoose";

const MONGGOURI = process.env.MONGGODB_URI as string;
if(!MONGGOURI){
    console.log("Database url connection not found");
}


let cached = (global as any).mongoose;

if(!cached){
    cached = (global as any).mongoose = {conn:null, promise:null}
}


export async function connectDB(){
    if(cached.conn) return cached.conn;
    if(!cached.promise){
        cached.promise = mongoose.connect(MONGGOURI, {
            bufferCommands: false
        }).then((mongoose) => {
            console.log("Database connected");
            return mongoose;
        })
    }
    cached.conn = await cached.promise;
    return cached.conn;
}