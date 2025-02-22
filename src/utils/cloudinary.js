import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process_params.env.CLOUDINARY_CLOUD_NAME,
    api_key: process_params.env.CLOUDINARY_API_KEY,
    api_secret: process_params.env.CLOUDINARY_API_SECRET, 
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        // upload thefile on cloudinary 
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto",
        })
        // file hasbeen uploaded successfully
        console.log("File uploaded successfully",response.url);
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temorary file as the upload operation got failed 
        return null;
    }
}

export {uploadOnCloudinary}