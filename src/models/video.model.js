import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    videoFile:{
        type: String,
        require: true,
    },
    thumbnail:{
        type: String,
        require: true,
    },
    tittle:{
        type : String,
        require: true,
    },
    description:{
        type: String,
        require: true,
    },
    duration:{
        type: String,
        require: true,
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    published:{
        type: Boolean,
        default: false,
    },
    views:{
        type: Number,
        default: 0,
    }
}, { timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.models('Video', videoSchema);