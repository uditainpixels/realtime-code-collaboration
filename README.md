# CodeSync - Real-time Collaborative Code Editor

CodeSync is a real-time collaborative code editor that allows multiple users to work on the same code simultaneously. Built with a retro/pixel art aesthetic, it provides a seamless coding experience with instant synchronization using WebSockets.

## 🚀 Features

- **Real-time Collaboration**: Multiple users can join a room and edit code in real-time.
- **Unique Room IDs**: Generate unique room IDs to invite collaborators.
- **Member Presence**: See who is currently active in the coding session.
- **CodeMirror Integration**: A powerful text editor with syntax highlighting for JavaScript.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Retro UI**: A beautiful pixel-art inspired interface using the "Press Start 2P" font.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, CodeMirror, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **Styling**: CSS3 (Custom Retro Theme)
- **Toast Notifications**: React Hot Toast

## 📦 Installation & Setup

Follow these steps to get the project running locally:

### 1. Clone the repository
```bash
git clone https://github.com/uditainpixels/codeCollab.git
cd codeCollab
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Backend Server
In one terminal window:
```bash
npm run server:dev
```
The server will start on [http://localhost:5000](http://localhost:5000).

### 4. Start the Frontend
In another terminal window:
```bash
npm run dev
```
The application will be available at [http://localhost:5173](http://localhost:5173).

## 🖥️ Usage

1. Enter a **Username** and either paste a **Room ID** or click **"new room"** to generate one.
2. Share the Room ID with your friends.
3. Start coding together! Changes will sync instantly across all connected clients.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## 👤 Author

Built with ❤️ by **@uditainpixels**
- GitHub: [@uditainpixels](https://github.com/uditainpixels)

---