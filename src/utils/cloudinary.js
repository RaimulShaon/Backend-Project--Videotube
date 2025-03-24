import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

export const uploadOnCloudinary = async (file) => {
    try {
        if (!file) return null;
         const result = await cloudinary.uploader.upload(file, {resource_type: "auto"})
        console.log("cloudinary result:", result.url);
        console.log("cloudinary fullresult:", result);
        
        
        fs.unlinkSync(file);
        return result;   
        
    } catch (error) {
        fs.unlinkSync(file);

        console.log("cloudinary error:", error);
        
    }
}