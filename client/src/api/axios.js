import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/api/v1",
  withCredentials: true, // cookies bhejna zaroori hai JWT ke liye
});

export default API;
