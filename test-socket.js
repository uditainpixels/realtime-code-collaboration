import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    transports: ["websocket", "polling"]
});

socket.on("connect", () => {
    console.log("Connected successfully! ID:", socket.id);
    process.exit(0);
});

socket.on("connect_error", (err) => {
    console.error("Connection error:", err.message);
    process.exit(1);
});
