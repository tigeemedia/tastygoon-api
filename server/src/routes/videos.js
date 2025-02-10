const express = require("express");
const authenticateToken = require("../middlewares/auth");
const Video = require("../models/Video");
const User = require("../models/User");
const { cloudinary, storage } = require("../config/cloudinary");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage }); // Cloudinary storage

// Upload Video to Cloudinary
router.post("/upload", authenticateToken, upload.single("video"), async (req, res) => {
  try {
    const { title, category } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({ message: "Title and category are required" });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    // Cloudinary video URL
    const videoUrl = req.file.path;
    const thumbnailUrl = videoUrl.replace("/upload/", "/upload/w_500,h_300,c_fill/"); // Auto-generated thumbnail

    // Save video in database
    const newVideo = new Video({
      title,
      videoUrl,
      thumbnailUrl,
      uploader: req.user.id,
      category,
    });

    await newVideo.save();
    res.status(201).json({ message: "Video uploaded successfully", video: newVideo });
  } catch (error) {
    res.status(500).json({ message: "Error uploading video", error });
  }
});

// Get Videos with Pagination & Sorting
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, category, sort } = req.query;
    const query = category ? { category } : {};

    let sortOption = { createdAt: -1 }; // Default: Newest first
    if (sort === "likes") sortOption = { likes: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };

    const videos = await Video.find(query)
      .populate("uploader", "username")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalVideos = await Video.countDocuments(query);
    const totalPages = Math.ceil(totalVideos / limit);

    res.status(200).json({ totalVideos, totalPages, currentPage: parseInt(page), videos });
  } catch (error) {
    res.status(500).json({ message: "Error fetching videos", error });
  }
});

// Get Trending Videos (Most Liked)
router.get("/trending", async (req, res) => {
  try {
    const { limit = 10, time } = req.query;

    let dateFilter = {};
    if (time === "week") {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (time === "month") {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    }

    const trendingVideos = await Video.find(dateFilter)
      .populate("uploader", "username")
      .sort({ likes: -1 })
      .limit(parseInt(limit));

    res.status(200).json({ trendingVideos });
  } catch (error) {
    res.status(500).json({ message: "Error fetching trending videos", error });
  }
});

// Get Recommended Videos for User
router.get("/recommended", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("likedVideos");

    if (!user || user.likedVideos.length === 0) {
      const trendingVideos = await Video.find().sort({ likes: -1 }).limit(10);
      return res.status(200).json({ recommended: trendingVideos });
    }

    const categories = user.likedVideos.map(video => video.category);
    const recommendedVideos = await Video.find({
      category: { $in: categories },
      _id: { $nin: user.likedVideos },
    })
      .sort({ likes: -1 })
      .limit(10);

    res.status(200).json({ recommended: recommendedVideos });
  } catch (error) {
    res.status(500).json({ message: "Error fetching recommendations", error });
  }
});

// Increment Video Views
router.post("/view/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    video.views += 1;
    await video.save();

    res.status(200).json({ message: "View count updated", views: video.views });
  } catch (error) {
    res.status(500).json({ message: "Error updating view count", error });
  }
});

// Like a Video
router.post("/like/:id", authenticateToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    video.likes += 1;
    await video.save();

    const user = await User.findById(req.user.id);
    if (!user.likedVideos.includes(video._id)) {
      user.likedVideos.push(video._id);
      await user.save();
    }

    res.status(200).json({ message: "Video liked", likes: video.likes });
  } catch (error) {
    res.status(500).json({ message: "Error liking video", error });
  }
});

// Bookmark (Save Video)
router.post("/save/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const videoId = req.params.id;

    if (user.savedVideos.includes(videoId)) {
      return res.status(400).json({ message: "Video already saved" });
    }

    user.savedVideos.push(videoId);
    await user.save();

    res.status(200).json({ message: "Video saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving video", error });
  }
});

// Get Saved Videos
router.get("/saved", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("savedVideos");
    res.status(200).json({ savedVideos: user.savedVideos });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving saved videos", error });
  }
});

// Add a Comment to a Video
router.post("/comment/:id", authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text required" });

    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    video.comments.push({ user: req.user.id, text });
    await video.save();

    res.status(201).json({ message: "Comment added", comments: video.comments });
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error });
  }
});

// Search Videos
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Search query required" });

    const videos = await Video.find({
      title: { $regex: query, $options: "i" },
    }).populate("uploader", "username");

    res.status(200).json({ results: videos });
  } catch (error) {
    res.status(500).json({ message: "Error searching videos", error });
  }
});

module.exports = router;
