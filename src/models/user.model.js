import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true,
        trim: true,
        index: true,
        lowercase: true,
    },
    email:{
        type: String,
        require: true,
        unique: true,
        trim: true,
        index: true,
        lowercase: true,
    },
    fullname:{
        type:String,
        require: true,
        trim: true,
        index: true
    },
    password:{
        type: String,
        require: true,
        trim: true,
    },
    avatar:{
        type: String,
        
    },
    coverphoto:{
        type: String,
        
    },
    watchlist:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Videos"
    }
}, { timestamps: true });

userSchema.pre('save', async function(next){
    if (this.isModified('password')) 
    {
       this.password = await bcrypt.hash(this.password, 10);
    next();
    }
        
});

userSchema.methods.isValidPassword = async function(password){
    return await bcrypt.compare(password, this.password);
}


userSchema.methods.genarateAccessToken = function(){
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
}
userSchema.methods.genarateRefreshToken = function(){
    return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

export const User = mongoose.model('User', userSchema);