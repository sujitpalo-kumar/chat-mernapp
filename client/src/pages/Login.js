import { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import API_BASE_URL from "../utils/config";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  console.log("aaaaaaaaaaaa",API_BASE_URL)

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      login(res.data);
      navigate("/");
    } catch (err) {
      if (!err.response) {
        setError("Unable to connect to server. Please try again later.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }

      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Decoration */}
      <div style={styles.bgDecoration1}></div>
      <div style={styles.bgDecoration2}></div>

      <div style={styles.cardWrapper}>
        {/* Logo/Brand Section */}
        <div style={styles.brandSection}>
          <div style={styles.logoCircle}>
            <span style={styles.logoIcon}>💬</span>
          </div>
          <h1 style={styles.brandTitle}>Welcome Back</h1>
          <p style={styles.brandSubtitle}>Sign in to continue to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.card}>
          {/* Error Message */}
          {error && (
            <div style={styles.errorContainer}>
              <span style={styles.errorIcon}>⚠️</span>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          {/* Email Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>📧</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                onFocus={(e) => {
                  e.target.parentElement.style.borderColor = '#667eea';
                  e.target.parentElement.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.parentElement.style.borderColor = '#e5e7eb';
                  e.target.parentElement.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                onFocus={(e) => {
                  e.target.parentElement.style.borderColor = '#667eea';
                  e.target.parentElement.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.parentElement.style.borderColor = '#e5e7eb';
                  e.target.parentElement.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.showPasswordBtn}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={styles.optionsRow}>
            <label style={styles.checkboxLabel}>
              <input type="checkbox" style={styles.checkbox} />
              <span style={styles.checkboxText}>Remember me</span>
            </label>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.submitBtn,
              ...(loading ? styles.submitBtnDisabled : {})
            }}
          >
            {loading ? (
              <span style={styles.loadingContent}>
                <span style={styles.spinner}></span>
                Signing in...
              </span>
            ) : (
              <span>Sign In →</span>
            )}
          </button>

          {/* Register Link */}
          <div style={styles.registerSection}>
            <p style={styles.registerText}>
              Don't have an account?{" "}
              <Link to="/register" style={styles.registerLink}>
                Create account
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div style={styles.divider}>
            <span style={styles.dividerText}>Or continue with</span>
          </div>

          {/* Social Login Buttons */}
          <div style={styles.socialButtons}>
            <button type="button" style={styles.socialBtn}>
              <span style={styles.socialIcon}>G</span>
              Google
            </button>
            <button type="button" style={styles.socialBtn}>
              <span style={styles.socialIcon}>f</span>
              Facebook
            </button>
          </div>
        </form>

        {/* Footer */}
        <p style={styles.footer}>
          Protected by reCAPTCHA and subject to the{" "}
          <a href="#" style={styles.footerLink}>Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },

  bgDecoration1: {
    position: "absolute",
    top: "-100px",
    right: "-100px",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(100px)",
  },

  bgDecoration2: {
    position: "absolute",
    bottom: "-150px",
    left: "-150px",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(100px)",
  },

  cardWrapper: {
    width: "100%",
    maxWidth: "440px",
    position: "relative",
    zIndex: 1,
  },

  brandSection: {
    textAlign: "center",
    marginBottom: "32px",
  },

  logoCircle: {
    width: "80px",
    height: "80px",
    margin: "0 auto 20px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "3px solid rgba(255, 255, 255, 0.3)",
  },

  logoIcon: {
    fontSize: "40px",
  },

  brandTitle: {
    margin: "0 0 8px 0",
    fontSize: "32px",
    fontWeight: "700",
    color: "#fff",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },

  brandSubtitle: {
    margin: 0,
    fontSize: "16px",
    color: "rgba(255, 255, 255, 0.9)",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  errorContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    animation: "shake 0.5s",
  },

  errorIcon: {
    fontSize: "20px",
    flexShrink: 0,
  },

  errorText: {
    margin: 0,
    color: "#dc2626",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "4px",
  },

  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    transition: "all 0.3s ease",
    backgroundColor: "#f9fafb",
  },

  inputIcon: {
    position: "absolute",
    left: "16px",
    fontSize: "18px",
    pointerEvents: "none",
  },

  input: {
    flex: 1,
    padding: "14px 16px 14px 48px",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    backgroundColor: "transparent",
    outline: "none",
    color: "#111827",
  },

  showPasswordBtn: {
    // position: "absolute",
    right: "-45%",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    padding: "8px",
    borderRadius: "6px",
    transition: "background 0.2s",
  },

  optionsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "-8px",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },

  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: "#667eea",
  },

  checkboxText: {
    fontSize: "14px",
    color: "#6b7280",
  },

  forgotLink: {
    fontSize: "14px",
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "600",
    transition: "color 0.2s",
  },

  submitBtn: {
    padding: "16px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
  },

  submitBtnDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  loadingContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },

  spinner: {
    width: "18px",
    height: "18px",
    border: "3px solid rgba(255, 255, 255, 0.3)",
    borderTop: "3px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },

  registerSection: {
    textAlign: "center",
    paddingTop: "8px",
  },

  registerText: {
    margin: 0,
    fontSize: "14px",
    color: "#6b7280",
  },

  registerLink: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "600",
    transition: "color 0.2s",
  },

  divider: {
    position: "relative",
    textAlign: "center",
    margin: "8px 0",
  },

  dividerText: {
    position: "relative",
    display: "inline-block",
    padding: "0 16px",
    fontSize: "13px",
    color: "#9ca3af",
    backgroundColor: "#fff",
    zIndex: 1,
  },

  socialButtons: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },

  socialBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    backgroundColor: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  socialIcon: {
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    fontSize: "12px",
    fontWeight: "700",
    backgroundColor: "#f3f4f6",
  },

  footer: {
    textAlign: "center",
    marginTop: "24px",
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.8)",
  },

  footerLink: {
    color: "#fff",
    textDecoration: "underline",
  },
};

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }

    input::placeholder {
      color: #9ca3af;
    }

    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }

    a:hover {
      color: #5568d3 !important;
    }

    .socialBtn:hover {
      background-color: #f9fafb !important;
      border-color: #667eea !important;
    }

    @media (max-width: 480px) {
      .card {
        padding: 28px 24px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Login;