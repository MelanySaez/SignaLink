# SignaLink Backend - Servidor de Señalización

Backend simple para manejar la señalización WebRTC de SignaLink.

## 🚀 Instalación

```bash
npm install
```

## 🏃 Ejecutar

```bash
npm start
```

El servidor estará disponible en `http://localhost:3001`

## 📡 Eventos Socket.io

### Cliente → Servidor
- `join-room`: Unirse a una sala de videollamada
- `offer`: Enviar oferta WebRTC
- `answer`: Enviar respuesta WebRTC
- `ice-candidate`: Enviar candidato ICE

### Servidor → Cliente
- `user-connected`: Otro usuario se conectó a la sala
- `other-user`: Notifica si ya hay alguien en la sala
- `offer`: Recibir oferta WebRTC
- `answer`: Recibir respuesta WebRTC
- `ice-candidate`: Recibir candidato ICE
- `user-disconnected`: Usuario se desconectó

## 🔧 Configuración

Por defecto usa:
- Puerto: 3001
- CORS: http://localhost:3000 (frontend Next.js)

## 🏗️ Tecnologías
- Express.js
- Socket.io
- CORS
