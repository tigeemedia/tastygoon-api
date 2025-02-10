const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: "" },
  likedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  watchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  createdAt: { type: Date, default: Date.now },
  savedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
});

module.exports = mongoose.model("User", userSchema);
