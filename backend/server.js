import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Frontend de Next.js
    methods: ["GET", "POST"]
  }
});

// Almacenar usuarios por sala
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('✅ Usuario conectado:', socket.id);

  // Usuario se une a una sala
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    
    // Agregar usuario a la sala
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);
    
    const roomSize = rooms.get(roomId).size;
    console.log(`👥 Usuario ${socket.id} se unió a sala ${roomId} (${roomSize} usuarios)`);
    
    // Notificar a los demás usuarios de la sala
    socket.to(roomId).emit('user-connected', socket.id);
    
    // Si ya hay otro usuario, notificar al que acaba de entrar
    const otherUsers = Array.from(rooms.get(roomId)).filter(id => id !== socket.id);
    if (otherUsers.length > 0) {
      socket.emit('other-user', otherUsers[0]);
    }
  });

  // Señalización WebRTC - Oferta
  socket.on('offer', (offer, roomId) => {
    console.log(`📤 Oferta enviada a sala ${roomId}`);
    socket.to(roomId).emit('offer', offer, socket.id);
  });

  // Señalización WebRTC - Respuesta
  socket.on('answer', (answer, roomId) => {
    console.log(`📥 Respuesta enviada a sala ${roomId}`);
    socket.to(roomId).emit('answer', answer, socket.id);
  });

  // Señalización WebRTC - ICE Candidates
  socket.on('ice-candidate', (candidate, roomId) => {
    console.log(`🧊 ICE candidate enviado a sala ${roomId}`);
    socket.to(roomId).emit('ice-candidate', candidate, socket.id);
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log('❌ Usuario desconectado:', socket.id);
    
    // Remover de todas las salas
    rooms.forEach((users, roomId) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        socket.to(roomId).emit('user-disconnected', socket.id);
        
        // Limpiar salas vacías
        if (users.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 SignaLink Backend - Activo       ║
║   📡 Puerto: ${PORT}                      ║
║   🔗 http://localhost:${PORT}            ║
╚════════════════════════════════════════╝
  `);
});
