import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    fullName: {type:String, required: true},
    email: {type:String, required: true},
    studentId: {type:Number, required: true},
    social: {type:String, required: true},
    password: {type:String, required: true},
    profile: {type:String, required: true},
    role: {type:String, default: "student", enum: ["student", "admin"]},
    profileId: {type:String, required: true},
    recoveryKey: {type:Number, required: true},
    postedItems: [{type:String, default: [], ref: "items"}]
}, {timestamps: true});


const userModel = mongoose.models.users || mongoose.model("users", userSchema);

export default userModel;