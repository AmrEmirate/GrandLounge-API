import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

const cloudName = process.env.CLOUD_NAME;
const apiKey = process.env.CLOUD_API_KEY;
const apiSecret = process.env.CLOUD_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Missing Cloudinary environment variables!");
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
});

export const cloudinaryUpload = (
    file: Express.Multer.File
): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            (err, result) => {
                if (err) {
                    return reject(new Error(`Cloudinary upload error: ${err.message || err}`));
                }
                if (!result) {
                    return reject(new Error("No result returned from Cloudinary."));
                }
                resolve(result);
            }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream)
    })
}