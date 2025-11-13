# 🧪 Cómo Probar SignaLink - Guía Paso a Paso

## ✅ Pre-requisitos Verificados

- ✅ Backend corriendo en `http://localhost:3001`
- ✅ Frontend corriendo en `http://localhost:3000`

## 🎬 Método 1: Dos Pestañas - Mismo Navegador

### Paso 1: Primera Pestaña
1. Abre `http://localhost:3000` en Chrome (o tu navegador)
2. Deberías ver la pantalla "Inicia una Videollamada"
3. Haz clic en **"Iniciar Llamada"**
4. Permite permisos de cámara y micrófono cuando aparezca el popup
5. Deberías verte a ti mismo en el cuadro de la izquierda
6. Verifica en la consola (F12) que veas:
   ```
   ✅ Conectado al servidor de señalización
   🎥 Solicitando acceso a cámara y micrófono...
   ✅ Acceso concedido, configurando stream local...
   🚪 Uniéndose a sala: xxxxxx
   🎉 Llamada iniciada correctamente
   ```

### Paso 2: Copiar Link de Sala
1. En el header, haz clic en el ícono de **cadena** (🔗)
2. Deberías ver una notificación verde "¡Link copiado!"
3. El link copiado será algo como: `http://localhost:3000/?room=abc123`

### Paso 3: Segunda Pestaña
1. Abre una **NUEVA PESTAÑA** en el mismo navegador
2. Pega el link copiado (Ctrl + V en la barra de direcciones)
3. Presiona Enter
4. Haz clic en **"Iniciar Llamada"**
5. Permite permisos nuevamente

### Paso 4: ¡Conexión!
En unos 2-3 segundos deberías ver:
- **Pestaña 1**: Tu video en la izquierda + Video de la pestaña 2 en la derecha
- **Pestaña 2**: Tu video en la izquierda + Video de la pestaña 1 en la derecha
- Ambas pestañas muestran badge verde "Conectado"

## 🔥 Método 2: Modo Incógnito (Recomendado)

### ¿Por qué este método?
El modo incógnito evita conflictos de permisos y cache.

### Pasos
1. **Ventana Normal**: 
   - Abre `http://localhost:3000`
   - Inicia llamada
   - Copia el link

2. **Ventana Incógnito**:
   - Presiona `Ctrl + Shift + N` (Chrome) o `Ctrl + Shift + P` (Firefox)
   - Pega el link copiado
   - Inicia llamada

¡Deberías ver ambas cámaras conectadas!

## 🌍 Método 3: Dos Navegadores Diferentes

### Pasos
1. **Chrome**: 
   - `http://localhost:3000`
   - Inicia llamada
   - Copia link

2. **Firefox/Edge**:
   - Pega el link
   - Inicia llamada

Ventaja: Más realista de cómo funcionará en producción.

## 🔍 Qué Verificar Durante la Prueba

### En la Interfaz
- [ ] Video local (izquierda) muestra tu cámara
- [ ] Badge azul "Tú" visible
- [ ] Botones de controles funcionan (Mic, Cámara, Colgar)
- [ ] Cuando se conecta el otro usuario:
  - [ ] Video remoto (derecha) muestra la otra cámara
  - [ ] Badge verde "Conectado" aparece
  - [ ] Se quita el mensaje "Esperando a la otra persona..."

### En la Consola del Navegador (F12)
Busca estos mensajes en orden:
```
✅ Conectado al servidor de señalización
🎥 Solicitando acceso a cámara y micrófono...
✅ Acceso concedido, configurando stream local...
🚪 Uniéndose a sala: xxxxx
🎉 Llamada iniciada correctamente

# Cuando se conecta el otro usuario:
👤 Otro usuario detectado, creando oferta...
📤 Oferta enviada a sala xxxxx
🧊 ICE candidate enviado
📨 Respuesta recibida de: yyyy
📹 Stream remoto recibido
🔌 Estado de conexión: connected
```

### En el Backend (Terminal)
```
✅ Usuario conectado: abc123
👥 Usuario abc123 se unió a sala xxxxx (1 usuarios)
✅ Usuario conectado: def456
👥 Usuario def456 se unió a sala xxxxx (2 usuarios)
📤 Oferta enviada a sala xxxxx
📥 Respuesta enviada a sala xxxxx
🧊 ICE candidate enviado a sala xxxxx
```

## 🎮 Probar Controles

### Micrófono
1. Haz clic en el botón del micrófono
2. Debería cambiar de azul a rojo
3. El ícono cambia de 🎤 a 🎤🚫
4. En la otra pestaña, el audio debería silenciarse

### Cámara
1. Haz clic en el botón de la cámara
2. Tu video local se congela/oscurece
3. El ícono cambia de 📹 a 📹🚫
4. En la otra pestaña, tu video desaparece

### Colgar
1. Haz clic en el botón rojo de colgar
2. Vuelves a la pantalla de inicio
3. La otra pestaña debería mostrar "Esperando a la otra persona..."
4. En backend: `❌ Usuario desconectado: abc123`

## ❌ Problemas Comunes y Soluciones Rápidas

### "No veo mi cámara"
1. Verifica que diste permisos
2. Abre consola (F12) - ¿ves errores en rojo?
3. Intenta cerrar otras apps que usen cámara (Zoom, Teams)
4. Recarga la página (F5)

### "El otro video no aparece"
1. Verifica que ambos tengan el **mismo** `?room=` en la URL
2. Revisa consola del navegador - ¿ves los mensajes de conexión?
3. Revisa terminal del backend - ¿ves 2 usuarios en la sala?
4. Intenta colgar en ambas y volver a llamar

### "Funciona pero al recargar se rompe"
**Solución rápida**:
1. En AMBAS pestañas: Colgar
2. Espera 3 segundos
3. En AMBAS: Iniciar Llamada
4. Debería reconectar

**Por qué pasa**: WebRTC mantiene estado en memoria. Al recargar, ese estado se pierde. Los cambios que hice deberían mejorar esto, pero si persiste, simplemente cuelga y vuelve a llamar.

## 🎯 Flujo Ideal de Prueba

```
1. Abre Pestaña 1 → Inicia Llamada → Ves tu cámara → Copias link
                                      ↓
2. Abre Pestaña 2 → Pegas link → Inicia Llamada → Ves tu cámara
                                      ↓
3. ⏱️ Espera 2-3 segundos
                                      ↓
4. 🎉 ¡AMBAS CÁMARAS SE VEN ENTRE SÍ!
                                      ↓
5. Prueba botones → Mic off → Cámara off → Colgar
```

## 📱 Bonus: Probar en Otro Dispositivo (Misma Red WiFi)

Si tienes otro dispositivo (celular, tablet, otra PC) en la misma red:

1. **En tu PC**: Inicia llamada, copia link
2. **Modifica el link**: Reemplaza `localhost` por tu IP local
   - Tu IP es: `192.168.1.53` (aparece en la terminal del frontend)
   - Link modificado: `http://192.168.1.53:3000/?room=abc123`
3. **En el otro dispositivo**: Abre ese link en el navegador
4. Inicia llamada
5. ¡Deberías verte entre dispositivos!

## ✅ Checklist Final

Antes de dar por probado:
- [ ] Video local siempre aparece
- [ ] Video remoto aparece cuando se une otra persona
- [ ] Puedo mutear/desmutear micrófono
- [ ] Puedo apagar/prender cámara
- [ ] Puedo colgar y volver a llamar
- [ ] Funciona en dos pestañas
- [ ] Funciona en modo incógnito
- [ ] Funciona después de colgar y reconectar
- [ ] Los logs en consola son claros
- [ ] Backend muestra 2 usuarios en la sala

## 🆘 Si Nada Funciona

1. Cierra TODAS las pestañas de localhost
2. En terminal backend: `Ctrl + C` → `npm start`
3. En terminal frontend: `Ctrl + C` → `npm run dev`
4. Abre navegador limpio (modo incógnito)
5. Ve a `http://localhost:3000`
6. Prueba de nuevo

---

**¡Listo!** Con estos métodos deberías poder probar completamente la funcionalidad de videollamada. 🎉
