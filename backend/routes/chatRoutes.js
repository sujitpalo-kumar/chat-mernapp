const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const {
  sendMessage,
  getMessages,
} = require("../controllers/chatController");

// Multer setup - save uploads to ./uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({ storage });

// Upload image endpoint (protected) - saves file to disk and returns URL
router.post(
  "/upload",
  auth,
  upload.single("file"),
  (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      return res.json({ url });
    } catch (err) {
      next(err);
    }
  }
);

// Upload and store in DB directly (protected)
const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({ storage: memoryStorage });

router.post(
  "/upload-db",
  auth,
  uploadMemory.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const Message = require("../models/Message");
      const { receiver, message } = req.body;

      const msg = await Message.create({
        sender: req.user.id,
        receiver,
        message: message || undefined,
        imageData: req.file.buffer,
        imageType: req.file.mimetype,
      });

      await msg.populate("sender receiver", "name");
      const out = msg.toObject();
      if (out.imageData) out.imageData = `data:${msg.imageType};base64,${msg.imageData.toString("base64")}`;
      res.json(out);
    } catch (err) {
      next(err);
    }
  }
);

router.post("/send", auth, sendMessage);
router.get("/:userId", auth, getMessages);

module.exports = router;
