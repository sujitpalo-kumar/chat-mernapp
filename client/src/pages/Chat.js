import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import io from "socket.io-client";
import axios from "axios";
import API_BASE_URL from "../utils/config";

const Chat = () => {
  const { user, logout } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // Already initialized as array
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* -------------------- FETCH USERS -------------------- */
  useEffect(() => {
    if (!user) return;

    axios
      .get(`${API_BASE_URL}/api/users`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`
        
        },
      })
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Fetch users error:", err);
        setUsers([]);
      });
  }, [user]);

  /* -------------------- FETCH MESSAGES -------------------- */
  useEffect(() => {
    if (!user || !selectedUser) return;

    axios
      .get(`${API_BASE_URL}/api/chat/${selectedUser._id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    })
      .then((res) => {
        // Ensure messages is always an array
        setMessages(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Fetch messages error:", err);
        setMessages([]); // Set to empty array on error
      });
  }, [user, selectedUser]);

  /* -------------------- SOCKET -------------------- */
useEffect(() => {
  if (!user) return;

  socketRef.current = io(API_BASE_URL, {
    auth: { token: localStorage.getItem("token") },
    transports: ["websocket"], // ✅ important
  });

  socketRef.current.on("receiveMessage", (data) => {
    setMessages((prev) => {
      if (!Array.isArray(prev)) return [data];

      // ❌ prevent duplicate insert
      const exists = prev.some(
        (m) =>
          m.createdAt === data.createdAt &&
          m.sender === data.sender &&
          m.message === data.message
      );

      if (exists) return prev;
      return [...prev, data];
    });
  });

  return () => socketRef.current.disconnect();
}, [user]);


// Separate effect to update messages when selectedUser changes
useEffect(() => {
  if (!user || !selectedUser) return;

  axios
    .get(`${API_BASE_URL}/api/chat/${selectedUser._id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    })
    .then((res) => {
      setMessages(Array.isArray(res.data) ? res.data : []);
    })
    .catch((err) => {
      console.error("Fetch messages error:", err);
      setMessages([]);
    });
}, [user, selectedUser]);

  /* -------------------- SEND MESSAGE -------------------- */
const sendMessage = async () => {
  if (!message.trim() || !selectedUser) return;

  try {
    await axios.post(
      `${API_BASE_URL}/api/chat/send`,
      { receiver: selectedUser._id, message },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    socketRef.current.emit("sendMessage", {
      receiver: selectedUser._id,
      message,
    });

    setMessage("");
  } catch (err) {
    console.error("Send message error:", err);
  }
};


  /* -------------------- UPLOAD IMAGE -------------------- */
  const uploadImage = async (file) => {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("receiver", selectedUser._id);

      const { data } = await axios.post(`${API_BASE_URL}/api/chat/upload-db`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        
        },
      });

      socketRef.current.emit("sendMessage", {
        receiver: selectedUser._id,
        message: data.message || "",
        image: data.imageData || data.image,
      });

      setMessages((prev) => [...prev, data]);
    } catch (err) {
      console.error("Upload image error:", err);
    }
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter((u) =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={styles.container}>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div style={styles.overlay} onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div style={{...styles.sidebar, ...(isSidebarOpen ? styles.sidebarOpen : {})}}>
        {/* Profile Header */}
        <div style={styles.sidebarHeader}>
          <div style={styles.profileSection}>
            <div style={styles.avatar}>
              {getInitials(user.name)}
            </div>
            <div style={styles.userInfo}>
              <h3 style={styles.userName}>{user.name}</h3>
              <p style={styles.userEmail}>{user.email}</p>
            </div>
          </div>
        </div>
  
        <div>
          <button onClick={logout} style={styles.logoutBtn} title="Logout">
            Logout
          </button>
        </div>

        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="🔍 Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Users List */}
        <div style={styles.usersList}>
          <h4 style={styles.usersTitle}>MESSAGES</h4>
          {filteredUsers.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u._id}
                onClick={() => {
                  setSelectedUser(u);
                  setIsSidebarOpen(false);
                }}
                style={{
                  ...styles.userItem,
                  ...(selectedUser?._id === u._id ? styles.userItemActive : {})
                }}
              >
                <div style={{
                  ...styles.userAvatar,
                  ...(selectedUser?._id === u._id ? styles.userAvatarActive : {})
                }}>
                  {getInitials(u.name)}
                </div>
                <div style={styles.userDetails}>
                  <h4 style={styles.userItemName}>{u.name}</h4>
                  <p style={styles.userItemEmail}>{u.email}</p>
                </div>
                {selectedUser?._id === u._id && (
                  <div style={styles.activeDot}></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div style={styles.chatHeader}>
              <button
                style={styles.menuBtn}
                onClick={() => setIsSidebarOpen(true)}
              >
                ☰
              </button>
              <div style={styles.chatHeaderUser}>
                <div style={styles.chatHeaderAvatar}>
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <h3 style={styles.chatHeaderName}>{selectedUser.name}</h3>
                  <p style={styles.onlineStatus}>🟢 Online</p>
                </div>
              </div>
              <div style={styles.chatActions}>
                <button style={styles.actionBtn} title="Voice Call">📞</button>
                <button style={styles.actionBtn} title="Video Call">📹</button>
                <button style={styles.actionBtn} title="More">⋮</button>
              </div>
            </div>

            {/* Messages */}
         <div style={styles.messagesContainer}>
  {Array.isArray(messages) && messages.map((m, i) => {
    const isMe = (m.sender?._id || m.sender) === (user._id || user.id);
    const showAvatar = i === 0 || messages[i - 1]?.sender !== m.sender;
    
    return (
      <div
        key={i}
        style={{
          ...styles.messageRow,
          ...(isMe ? styles.messageRowMe : {})
        }}
      >
        {!isMe && showAvatar && (
          <div style={styles.messageAvatar}>
            {getInitials(selectedUser.name)}
          </div>
        )}
        {!isMe && !showAvatar && <div style={{width: window.innerWidth <= 768 ? 24 : 32}} />}
        
        <div
          style={{
            ...styles.messageBubble,
            ...(isMe ? styles.messageBubbleMe : styles.messageBubbleThem)
          }}
        >
          {m.message && <p style={styles.messageText}>{m.message}</p>}
          {(m.image || m.imageData) && (
            <img
              src={m.image || m.imageData}
              alt="attachment"
              style={styles.messageImage}
            />
          )}
        </div>
      </div>
    );
  })}
  <div ref={messagesEndRef} />
</div>

            {/* Input Bar */}
            <div style={styles.inputBar}>
              <EmojiPicker
                onPick={(emoji) => setMessage((m) => m + emoji)}
                disabled={!selectedUser}
              />
              
              <label style={styles.attachBtn}>
                📎
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (!e.target.files || !e.target.files[0]) return;
                    uploadImage(e.target.files[0]);
                    e.target.value = null;
                  }}
                  style={{display: 'none'}}
                  disabled={!selectedUser}
                />
              </label>

              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message..."
                disabled={!selectedUser}
                rows="1"
                style={styles.messageInput}
              />

              <button
                onClick={sendMessage}
                disabled={!selectedUser || !message.trim()}
                style={{
                  ...styles.sendBtn,
                  ...((!selectedUser || !message.trim()) ? styles.sendBtnDisabled : {})
                }}
              >
                ✈️
              </button>
            </div>
          </>
        ) : (
          <div style={styles.emptyChat}>
            <div style={styles.emptyChatIcon}>💬</div>
            <h3 style={styles.emptyChatTitle}>Welcome to Chat</h3>
            <p style={styles.emptyChatText}>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ======================== STYLES ======================== */

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 40,
    display: 'none',
  },

  sidebar: {
    width: 320,
    backgroundColor: '#fff',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease',
  },

  sidebarOpen: {
    transform: 'translateX(0)',
  },

  sidebarHeader: {
    padding: 20,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  profileSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 600,
  },

  userInfo: {
    flex: 1,
    minWidth: 0,
  },

  userName: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
  },

  userEmail: {
    margin: '4px 0 0 0',
    fontSize: 12,
    opacity: 0.8,
  },

  logoutBtn: {
    background: 'rgba(39, 211, 105, 0.66)',
    border: 'none',
    color: '#282928ea',
    padding: 10,
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 18,
    transition: 'background 0.2s',
    margin: '0 20px 10px',
    width: 'calc(100% - 40px)',
  },

  searchContainer: {
    padding: 16,
  },

  searchInput: {
    width: '90%',
    padding: '12px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    fontSize: 14,
    outline: 'none',
    transition: 'all 0.2s',
  },

  usersList: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 12px',
  },

  usersTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#6b7280',
    letterSpacing: '0.05em',
    margin: '0 0 12px 12px',
  },

  emptyState: {
    textAlign: 'center',
    padding: 32,
    color: '#9ca3af',
  },

  userItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    cursor: 'pointer',
    marginBottom: 4,
    transition: 'all 0.2s',
  },

  userItemActive: {
    background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
  },

  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 600,
    flexShrink: 0,
  },

  userAvatarActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },

  userDetails: {
    flex: 1,
    minWidth: 0,
  },

  userItemName: {
    margin: 0,
    fontSize: 15,
    fontWeight: 600,
    color: '#111827',
  },

  userItemEmail: {
    margin: '2px 0 0 0',
    fontSize: 13,
    color: '#6b7280',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  activeDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },

  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8f9fa',
    minWidth: 0,
  },

  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
  },

  menuBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    fontSize: 24,
    cursor: 'pointer',
    padding: 8,
    color: '#374151',
  },

  chatHeaderUser: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 600,
  },

  chatHeaderName: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: '#111827',
  },

  onlineStatus: {
    margin: '2px 0 0 0',
    fontSize: 12,
    color: '#10b981',
  },

  chatActions: {
    display: 'flex',
    gap: 8,
  },

  actionBtn: {
    background: 'none',
    border: 'none',
    padding: 8,
    cursor: 'pointer',
    fontSize: 20,
    borderRadius: 8,
    transition: 'background 0.2s',
  },

  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: window.innerWidth <= 768 ? 12 : 24,
    display: 'flex',
    flexDirection: 'column',
    gap: window.innerWidth <= 768 ? 8 : 12,
  },

  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: window.innerWidth <= 768 ? 4 : 8,
  },


  messageRowMe: {
    flexDirection: 'row-reverse',
  },

  messageAvatar: {
    width: window.innerWidth <= 768 ? 24 : 32,
    height: window.innerWidth <= 768 ? 24 : 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: window.innerWidth <= 768 ? 10 : 12,
    fontWeight: 600,
    flexShrink: 0,
  },

  messageBubble: {
    maxWidth: window.innerWidth <= 768 ? '85%' : '70%',
    padding: window.innerWidth <= 768 ? '8px 12px' : '10px 16px',
    borderRadius: window.innerWidth <= 768 ? 12 : 16,
    fontSize: window.innerWidth <= 768 ? 14 : 14,
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },
  messageBubbleMe: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    borderBottomRightRadius: window.innerWidth <= 768 ? 2 : 4,
  },


  messageBubbleThem: {
    backgroundColor: '#fff',
    color: '#111827',
    borderBottomLeftRadius: window.innerWidth <= 768 ? 2 : 4,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  messageText: {
    margin: 0,
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
  messageImage: {
    display: 'block',
    maxWidth: window.innerWidth <= 768 ? 200 : 260,
    width: '100%',
    height: 'auto',
    marginTop: 8,
    borderRadius: 8,
  },

  inputBar: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 12,
    padding: 20,
    backgroundColor: '#fff',
    borderTop: '1px solid #e5e7eb',
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
  },

  attachBtn: {
    padding: 10,
    cursor: 'pointer',
    fontSize: 20,
    borderRadius: 8,
    transition: 'background 0.2s',
    border: 'none',
    background: 'none',
  },

  messageInput: {
    flex: 1,
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: 16,
    fontSize: 15,
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
    minHeight: 44,
    maxHeight: 120,
    transition: 'all 0.2s',
    backgroundColor: '#f9fafb',
  },

  sendBtn: {
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: 18,
    transition: 'all 0.2s',
  },

  sendBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  emptyChat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  emptyChatIcon: {
    width: 96,
    height: 96,
    background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 40,
    marginBottom: 16,
  },

  emptyChatTitle: {
    fontSize: 24,
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 8px 0',
  },

  emptyChatText: {
    fontSize: 16,
    color: '#6b7280',
    margin: 0,
  },
};

/* ======================== RESPONSIVE ======================== */
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  
  if (mediaQuery.matches) {
    styles.sidebar = {
      ...styles.sidebar,
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 50,
      transform: 'translateX(-100%)',
    };
    
    styles.overlay = {
      ...styles.overlay,
      display: 'block',
    };
    
    styles.menuBtn = {
      ...styles.menuBtn,
      display: 'block',
    };
  }
}

/* -------------------- EmojiPicker -------------------- */
const EMOJIS = ["😀", "😁", "😂", "🤣", "😊", "😍", "😎", "😢", "😭", "😡", "👍", "👎", "🙏", "💪", "🎉", "🔥", "❤️", "💯", "🤔", "😱"];

function EmojiPicker({ onPick, disabled }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((s) => !s)}
        disabled={disabled}
        style={{
          padding: 10,
          cursor: 'pointer',
          fontSize: 20,
          borderRadius: 8,
          transition: 'background 0.2s',
          border: 'none',
          background: 'none',
        }}
        type="button"
      >
        😊
      </button>
      {open && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10,
            }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute',
            bottom: 48,
            left: 0,
            zIndex: 20,
            backgroundColor: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
            padding: 12,
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 4,
              width: 200,
            }}>
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    onPick(e);
                    setOpen(false);
                  }}
                  style={{
                    fontSize: 24,
                    padding: 8,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    borderRadius: 8,
                    transition: 'background 0.2s',
                  }}
                  type="button"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Chat;