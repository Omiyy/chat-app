# 💬 Full Stack Real-Time Chat App

A real-time full stack chat application built using the MERN stack, Socket.IO for live messaging, and Cloudinary for media uploads like profile pictures. This app supports user authentication, online status, and real-time bi-directional messaging.

---

## 🛠 Tech Stack

- **Frontend:** React.js, Axios, Socket.IO-client  
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Socket.IO  
- **Other Tools:** Cloudinary, bcrypt, dotenv

---

## 🚀 Features

- ✅ Real-time one-on-one messaging  
- ✅ JWT-based user authentication  
- ✅ Profile picture upload via Cloudinary  
- ✅ Online/offline user status  
- ✅ Chat list with last message preview  
- ✅ Message timestamps  
- ✅ Auto-scroll to latest message  
- ✅ REST API + Socket.IO based event handling  

---

## 📁 Folder Structure

```
chatapp/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── socket.js
│   └── package.json
├── server/                  # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── config/              # Cloudinary & DB config
│   ├── socket/              # Socket.IO logic
│   ├── .env
│   └── server.js
├── README.md
└── .gitignore
```

---

## 🔐 Environment Variables

### `server/.env`

```env
MONGO_URI=your_mongodb_url
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```

### `client/.env`

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## ⚙️ Run Locally

### Backend

```bash
cd server
npm install
npm start
```

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## 📦 Deployment

**Pending...**
