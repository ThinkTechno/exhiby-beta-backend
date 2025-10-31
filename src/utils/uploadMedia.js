import fs from "fs/promises"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null

  try {
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })

    // Always delete local file safely
    await fs.unlink(localFilePath).catch(() => {})

    const mediaUri = uploadResult.secure_url
    const mediaType = uploadResult.resource_type
    const mediaDuration = uploadResult.duration || null

    return { mediaUri, mediaType, mediaDuration }
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message)
    await fs.unlink(localFilePath).catch(() => {})
    throw new Error("Cloudinary upload error")
  }
}

export default uploadOnCloudinary
