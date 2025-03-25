import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: 'raimul',
    api_key: "962331596784271",
    api_secret: "RFzWqOL4FU2vicdhKhVomcb_sGY"
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