// Dynamic API base URL - works for both localhost and network access
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `${window.location.protocol}//localhost:5000`
    : `${window.location.protocol}//${window.location.hostname}:5000`);

export default API_BASE_URL;
