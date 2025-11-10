# Audio Chat App

A real-time audio chat application built with React, Node.js, Express, Socket.io, and WebRTC. Users can create public or private rooms, join audio conversations, and chat via text in a seamless interface.

## Features

- **User Authentication**: Secure login and registration system
- **Room Management**: Create public or private rooms with optional access codes
- **Real-time Audio Chat**: WebRTC-powered peer-to-peer audio communication
- **Text Chat**: Side chat functionality within rooms
- **Lobby System**: Rooms can be in "inactive" or "live" status, with a lobby for participants before going live
- **Cross-platform**: Works on desktop and mobile browsers

## Tech Stack

### Frontend

- **React 19** - UI framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Styling framework
- **Socket.io Client** - Real-time communication
- **WebRTC** - Peer-to-peer audio streaming
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Notification system

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd audio-chat-app
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**

   Create a `.env` file in the `server` directory:

   ```env
   PORT=3001
   FRONTEND_URL=your-vite-frontend-url
   MONGO_URI=mongodb://localhost:27017/audiochat (i used mongodb atlas)
   JWT_SECRET=your-secret-key-here
   ```

   Create a `.env` file in the `client` directory:

   ```env
    VITE_SOCKET_URL=socket-server-url
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system.

## Running the Application

1. **Start the server**

   ```bash
   cd server
   npm run dev
   ```

2. **Start the client** (in a new terminal)

   ```bash
   cd client
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown by Vite)

## Usage

1. **Register/Login**: Create an account or log in with existing credentials
2. **Create a Room**: Enter a room name and optionally set it as private with an access code
3. **Join a Room**: Click "Join" on any available room. For private rooms, enter the access code when prompted
4. **Go Live**: Room creators can make their room "live" to start the audio chat
5. **Audio Controls**: Use the microphone button to mute/unmute yourself
6. **Text Chat**: Send messages in the side chat panel
7. **Leave Room**: Click "Leave Room" to exit the current room

## API Endpoints

### Authentication

- `POST /api/register` - User registration
- `POST /api/login` - User login

### Rooms

- `GET /api/rooms` - Get all rooms (authenticated)
- `POST /api/rooms` - Create a new room
- `PUT /api/rooms/:id/live` - Make a room live (creator only)

### Socket Events

#### Client to Server

- `join-room` - Join a room
- `leave-room` - Leave current room
- `send-message` - Send a chat message
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `ice-candidate` - ICE candidate for WebRTC

#### Server to Client

- `user-joined` - A user joined the room
- `user-left` - A user left the room
- `receive-message` - New chat message
- `messages` - Chat history on join
- `lobby` - Room is in lobby status
- `room-live` - Room went live
- `room-created` - New room was created
- `offer` - WebRTC offer from another peer
- `answer` - WebRTC answer from another peer
- `ice-candidate` - ICE candidate from another peer

## Project Structure

```
audio-chat-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   ├── socket/         # Socket.io client setup
│   │   ├── webrtc/         # WebRTC peer connection logic
│   │   ├── api/            # API service functions
│   │   └── assets/         # Static assets
│   ├── public/             # Public static files
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── core/               # Server setup and socket management
│   ├── middleware/         # Express middleware
│   ├── models/             # MongoDB models
│   ├── modules/            # Business logic modules
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── package.json
├── .gitignore
└── readme.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Troubleshooting

- **Audio not working**: Ensure your browser has microphone permissions enabled
- **Connection issues**: Check that both server and client are running on the correct ports
- **WebRTC failures**: Some networks block WebRTC traffic; try using a different network or VPN
- **Build errors**: Make sure all dependencies are installed and Node.js version is compatible

## Future Enhancements

- Video chat support
- Screen sharing
- File sharing in chat
- Room recording
- User profiles and avatars
- Admin panel for room management
- Push notifications
