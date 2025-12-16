const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // message text (optional if an image is provided)
    message: { type: String },
      image: { type: String },
    // Optional binary image stored directly in MongoDB
    imageData: { type: Buffer },
    imageType: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
