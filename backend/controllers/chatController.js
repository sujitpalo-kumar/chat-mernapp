const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  try {
    const { receiver, message, image } = req.body;

    // Require at least text or image
    if ((!message || message.trim() === "") && !image) {
      return res.status(400).json({ message: "Message or image is required" });
    }

    const msg = await Message.create({
      sender: req.user.id,
      receiver,
      message: message || undefined,
      image: image || undefined,
    });

    // populate sender/receiver names for client
    await msg.populate("sender receiver", "name");

    // If stored binary image exists, convert to data URL for JSON transport
    const out = msg.toObject();
    if (out.imageData) {
      out.imageData = `data:${msg.imageType};base64,${msg.imageData.toString("base64")}`;
    }

    res.json(out);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id },
      ],
    }).populate("sender receiver", "name");

    const out = messages.map((m) => {
      const obj = m.toObject();
      if (obj.imageData) obj.imageData = `data:${m.imageType};base64,${m.imageData.toString("base64")}`;
      return obj;
    });

    res.json(out);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
