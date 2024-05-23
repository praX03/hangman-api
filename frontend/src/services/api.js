// src/services/api.js
import axios from "axios";

// Axios instance to handle API requests
const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api", // Replace with your actual API URL
});

// Public routes that don't require authorization
const publicRoutes = ["/auth/signup", "/auth/login"];

// Request interceptor to add JWT token (if available and not on public route)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && !publicRoutes.includes(config.url)) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors (especially 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized: Token might be invalid/expired
      localStorage.removeItem("token"); // Clear invalid token
      // Optionally, redirect to login page or show a message
      console.error("Unauthorized error:", error);
      throw error; // Re-throw the error for the component to handle
    }
    return Promise.reject(error); // Pass other errors along
  }
);

// API functions (using the axios instance with interceptor)
const apiFunctions = {
  signup: (username, password) => api.post("/auth/signup", { username, password },
  {headers: { "Content-Type": "application/json" }},
  ),
  login: (username, password) => api.post("/auth/login", { username, password }),
  createRoom: (password) => api.post("/rooms/create_room", { password }),
  joinRoom: (roomId, username, password) =>
    api.post(`/rooms/join_room/${roomId}`, { username, password }),
  getRooms: () => api.get("/rooms/get_rooms"),
  getGameState: (roomId) => api.get(`/game/get_game_state/${roomId}`),
  makeGuess: (roomId, guess) => api.post(`/game/make_guess/${roomId}`, { guess }),
  startGame: (roomId, difficulty = "medium") =>
    api.post(`/game/start_game/${roomId}`, { level: difficulty }), // Default to medium difficulty
};

export default apiFunctions;  // Export the apiFunctions object
