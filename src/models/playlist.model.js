import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    video: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }],
    name: {
        type: String,
        require: true
    },
    discription:{
        type: String,
        require: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, {timestamps: true})

export const Playlist = mongoose.model("Playlist", playlistSchema)