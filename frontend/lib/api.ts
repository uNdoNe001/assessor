import axios from "axios";

const api = axios.create({ baseURL: "" }); // use Next rewrite, so keep baseURL empty

// Add Authorization header if we have a token
api.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    const t = window.localStorage.getItem("token");
    if (t) cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${t}` };
  }
  return cfg;
});

export default api;
