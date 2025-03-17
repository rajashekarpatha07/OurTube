import { v2 as Cloudinary } from "cloudinary";
import fs from "fs";

Cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const UploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await Cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // console.log("File has been uploaded successfully: ", response.url);

        // Delete the local file after successful upload
        fs.unlink(localFilePath, (err) => {
            if (err) {
                // console.error("Error deleting local file:", err);
            } else {
                // console.log("Local file deleted:", localFilePath);
            }
        });

        return response;
    } catch (error) {
        // Delete local file if the upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        // console.error("Cloudinary upload error:", error);
        return null;
    }
};

export { UploadOnCloudinary };
