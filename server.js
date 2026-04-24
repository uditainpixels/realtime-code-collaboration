import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'
import { ACTIONS } from './src/Actions.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    transports: ['websocket', 'polling']
})

app.use(express.static('dist'));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
})


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