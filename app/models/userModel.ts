import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    fullName: {type:String, required: true},
    email: {type:String, required: true},
    social: {type:String, required: true},
    password: {type:String, required: true},
    profile: {type:String, required: true},
    profileId: {type:String, required: true},
    postedItems: [{type:mongoose.Schema.Types.ObjectId, default: [], ref: "items"}]
}, {timestamps: true});


const userModel = mongoose.models.users || mongoose.model("users", userSchema);

export default userModel;