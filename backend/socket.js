import { io } from "socket.io-client";

// The URL of your backend server
const URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Create and export the socket instance
export const socket = io(URL, {
  autoConnect: false // Optional: prevents auto-connection on page load
});