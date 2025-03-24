import mongoose from "mongoose";
import { DB_Name } from "../constants.js";

const connectDB = async () => {
    try {
        const connct = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`)
        console.log(`database connected ${connct.connection.host}`);
        
    } catch (error) {
        console.log(`database connection failed ${error}`);
        process.exit(1);
        
    }
}
export default connectDB;