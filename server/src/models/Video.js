const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true }, // Cloudinary video URL
  thumbnailUrl: { type: String }, // Auto-generated Cloudinary thumbnail
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true, enum: ["hardcore", "softcore", "solo", "fetish", "couple", "other"] },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 }, // Track video views
  duration: { type: Number, default: 0 }, // Video duration in seconds
  resolution: { type: String, default: "720p" }, // Default resolution
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Video", videoSchema);
