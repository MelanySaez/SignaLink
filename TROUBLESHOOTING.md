# 🔧 Guía de Solución de Problemas - SignaLink

## 🎥 Video Local No Aparece

### Síntomas
- La cámara pide permisos pero no se ve tu video
- Pantalla negra en el cuadro "Tú"

### Soluciones

#### 1. Verificar Permisos del Navegador
- **Chrome**: `chrome://settings/content/camera`
- **Firefox**: Ícono de candado → Permisos → Cámara
- **Edge**: Configuración → Privacidad → Permisos del sitio

#### 2. Verificar que la Cámara Funciona
```javascript
// Abre la consola del navegador (F12) y ejecuta:
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => console.log("✅ Cámara funciona:", stream))
  .catch(err => console.error("❌ Error:", err))
```

#### 3. Recargar Página Correctamente
1. Cierra todas las pestañas de `localhost:3000`
2. Abre una nueva pestaña
3. Pega el URL completo con el `?room=xxx`
4. Permite permisos cuando se soliciten

#### 4. Limpiar Cache del Navegador
- `Ctrl + Shift + R` (Windows/Linux)
- `Cmd + Shift + R` (Mac)

## 🔄 Problemas al Recargar

### Síntomas
- Al recargar una pestaña, no se reconecta
- Los videos dejan de funcionar

### Soluciones

#### 1. No Recargues Durante una Llamada Activa
- Si necesitas reconectar, cuelga primero
- Luego vuelve a iniciar llamada

#### 2. Si Ya Recargaste
1. En AMBAS pestañas: presiona "Colgar"
2. Espera 2-3 segundos
3. Presiona "Iniciar Llamada" nuevamente
4. Verifica que el `?room=` sea el mismo en ambas

#### 3. Reiniciar Backend
```bash
# Terminal del backend
Ctrl + C
npm start
```

## 🌐 Problemas de Conexión P2P

### Síntomas
- Video local funciona pero no aparece el remoto
- Dice "Esperando a la otra persona..." aunque alguien ya entró

### Soluciones

#### 1. Verificar Consola del Navegador (F12)
Busca estos mensajes:
```
✅ Conectado al servidor de señalización
🚪 Uniéndose a sala: xxxxx
👤 Otro usuario detectado
📹 Stream remoto recibido
```

#### 2. Verificar Backend
En la terminal del backend deberías ver:
```
✅ Usuario conectado: abc123
👥 Usuario xyz789 se unió a sala room123 (2 usuarios)
```

#### 3. Firewall/Antivirus
- Temporalmente desactiva firewall
- Prueba en modo incógnito
- Prueba con otro navegador

## 🚨 Errores Comunes

### "NotAllowedError: Permission denied"
**Causa**: No diste permisos de cámara/micrófono

**Solución**: 
1. Recarga la página
2. Cuando aparezca el popup, permite acceso
3. Si no aparece popup, verifica configuración del navegador

### "NotReadableError: Could not start video source"
**Causa**: Otra aplicación está usando la cámara (Zoom, Teams, etc.)

**Solución**:
1. Cierra todas las apps que usen cámara
2. Recarga SignaLink

### "AbortError: Starting videoinput failed"
**Causa**: La cámara está bloqueada por el sistema

**Solución**:
1. Windows: Configuración → Privacidad → Cámara → Permitir apps
2. Mac: Preferencias → Seguridad → Privacidad → Cámara

## 📱 Probar en Modo Incógnito

A veces ayuda probar sin extensiones ni cache:

1. **Ventana 1 (Normal)**: `http://localhost:3000`
2. **Ventana 2 (Incógnito)**: `Ctrl + Shift + N` → Pega el link con `?room=`

## 🔍 Debug Avanzado

### Ver todos los logs
Abre consola (F12) y ejecuta:
```javascript
// Ver estado del socket
console.log("Socket:", socketRef.current?.connected)

// Ver stream local
console.log("Stream local:", localStreamRef.current?.getTracks())

// Ver peer connection
console.log("Peer connection:", peerConnectionRef.current?.connectionState)
```

### Verificar ICE Candidates
En consola busca logs que digan:
```
🧊 ICE candidate enviado
🧊 ICE candidate recibido
```

Si no ves estos, hay problema de red/firewall.

## ✅ Lista de Verificación Rápida

- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 3000
- [ ] Ambos navegadores tienen el mismo `?room=xxx` en la URL
- [ ] Permisos de cámara/micrófono concedidos
- [ ] Ninguna otra app usa la cámara
- [ ] Firewall/antivirus no bloquean localhost
- [ ] Consola no muestra errores en rojo

## 💡 Mejores Prácticas

### Para Desarrollo
1. Mantén una terminal con backend siempre abierta
2. Mantén otra terminal con frontend siempre abierta
3. No cierres estas terminales a menos que necesites reiniciar

### Para Probar
1. Abre primera pestaña → Iniciar llamada
2. Copia el link COMPLETO (con `?room=`)
3. Abre segunda pestaña/navegador → Pega link
4. ¡Deberían conectarse automáticamente!

## 🆘 Última Opción: Reinicio Completo

```bash
# Terminal 1 - Detener todo
Ctrl + C (en backend)
Ctrl + C (en frontend)

# Terminal 2
cd backend
npm start

# Terminal 3
cd frontend
npm run dev

# Navegador
Cierra TODAS las pestañas de localhost:3000
Abre una nueva pestaña
Ve a http://localhost:3000
```
