const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "tastygoon_videos", // Folder in Cloudinary
    resource_type: "video", // Ensure videos are stored correctly
    format: async (req, file) => "mp4", // Convert all videos to MP4
  },
});

module.exports = { cloudinary, storage };
