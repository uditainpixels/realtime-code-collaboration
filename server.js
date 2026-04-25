import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'
import { ACTIONS } from './src/Actions.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    transports: ['polling', 'websocket'] // Allow polling for better compatibility
})

app.use(express.static('dist'));

// Serve index.html for all other routes (SPA support)
app.use((req, res) => {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            // If the file doesn't exist (e.g. in dev), just send a simple message
            res.status(404).send('Frontend build not found. If you are in development, please use the Vite dev server.');
        }
    });
});


const userSocketMap = {}

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap[socketId],
        }
    })
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id)

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        console.log(`User ${username} joined room ${roomId}`)
        userSocketMap[socket.id] = username
        socket.join(roomId)

        const clients = getAllConnectedClients(roomId)
        // Notify all clients in the room (including the sender) that a new user joined
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            })
        })
    })

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    })

     socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    })

    socket.on(ACTIONS.CURSOR_CHANGE, ({ roomId, cursor, username }) => {
        socket.in(roomId).emit(ACTIONS.CURSOR_CHANGE, {
            socketId: socket.id,
            cursor,
            username,
        });
    });

    // Handle disconnection
    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms]
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            })
        })
        delete userSocketMap[socket.id]
        socket.leave()
    })
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})