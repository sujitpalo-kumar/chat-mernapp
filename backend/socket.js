const jwt = require("jsonwebtoken");
const Message = require("./models/Message");

module.exports = (io) => {
  // 🔐 AUTH MIDDLEWARE
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = {
        id: decoded._id || decoded.id,
        name: decoded.name,
      };

      next();
    } catch (err) {
      next(new Error("Auth failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.user.name);

    // ✅ JOIN USER ROOM
    socket.join(socket.user.id);

    // 📩 SEND MESSAGE
    socket.on("sendMessage", async (data) => {
      try {
        const { receiver, message, image } = data;

        const msg = {
          sender: socket.user.id,
          senderName: socket.user.name,
          receiver,
          message,
          image,
          createdAt: new Date(),
        };

        // ✅ SEND TO RECEIVER
        io.to(receiver).emit("receiveMessage", msg);

        // ✅ SEND BACK TO SENDER
        io.to(socket.user.id).emit("receiveMessage", msg);

      } catch (err) {
        console.error("Socket sendMessage error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.user.name);
    });
  });
};
