const jwt = require("jsonwebtoken");
const Message = require("./models/Message");

module.exports = (io) => {
  // 🔐 AUTH MIDDLEWARE
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        console.warn('Socket auth: no token provided');
        return next(new Error('No token'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = {
          id: decoded._id || decoded.id || decoded.id,
          name: decoded.name || decoded.name,
        };
        console.log('Socket auth success for user:', socket.user.id, socket.user.name);
        next();
      } catch (verifyErr) {
        console.warn('Socket auth verify failed:', verifyErr && verifyErr.message ? verifyErr.message : verifyErr);
        return next(new Error('Auth failed'));
      }
    } catch (err) {
      console.error('Socket auth unexpected error:', err && err.message ? err.message : err);
      next(new Error('Auth failed'));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.user.name);

    // ✅ JOIN USER ROOM
    socket.join(socket.user.id);

    // 📩 SEND MESSAGE
    socket.on("sendMessage", async (data) => {
      try {
        let { receiver, message, image } = data;

        // Normalize receiver to an id string (handle populated objects)
        try {
          if (receiver && (typeof receiver === 'object')) {
            receiver = receiver._id || receiver.id || (receiver.toString && receiver.toString());
          }
          receiver = String(receiver);
        } catch (e) {
          // fallback: stringify
          receiver = String(receiver);
        }

        const msg = {
          sender: socket.user.id,
          senderName: socket.user.name,
          receiver,
          message,
          image,
          createdAt: new Date(),
        };

        // Debug: show that server received the event and target room info
        try {
          const room = io.sockets.adapter.rooms.get(String(receiver));
          const roomSize = room ? room.size : 0;
          console.log(`sendMessage received from ${socket.user.id} -> receiver ${receiver} (roomSize=${roomSize})`);
        } catch (e) {
          console.log('sendMessage room check error', e && e.message ? e.message : e);
        }

        // ✅ SEND TO RECEIVER
        io.to(receiver).emit("receiveMessage", msg);

        // ✅ SEND BACK TO SENDER
        io.to(socket.user.id).emit("receiveMessage", msg);

        // If no sockets are in the receiver room, log a warning to help debug offline cases
        try {
          const roomAfter = io.sockets.adapter.rooms.get(String(receiver));
          if (!roomAfter || roomAfter.size === 0) {
            console.warn(`Recipient ${receiver} not connected (no sockets in room) — message saved but not delivered in real-time.`);
          }
        } catch (e) {
          // ignore
        }

      } catch (err) {
        console.error("Socket sendMessage error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.user.name);
    });
  });
};
