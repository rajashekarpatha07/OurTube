import { v2 as Cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const UploadOnCloudinary = async (localfilepath)=>{
    try {
        if(!localfilepath) return null
        const response = await Cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        });
        console.log("File has been uploaded successfully: ", response.url);
        return response
    } catch (error) {
        fs.unlinkSync(localfilepath)
        //remove the locally saved temp file as upload operation got failed
        return null
    }
}

export { UploadOnCloudinary }
