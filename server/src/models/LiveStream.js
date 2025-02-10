const mongoose = require("mongoose");

const liveStreamSchema = new mongoose.Schema({
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  streamKey: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  viewers: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LiveStream", liveStreamSchema);
