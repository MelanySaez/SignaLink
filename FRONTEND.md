# SignaLink - Documentación del Frontend

## Descripción General

SignaLink es una aplicación de videollamadas en tiempo real diseñada para facilitar la comunicación de personas sordas y con discapacidad auditiva usando Lenguaje de Señas Colombiano (LSC). El frontend está construido con **Next.js 15** usando **React 19**, **TypeScript** y **Tailwind CSS v4**.

---

## Arquitectura del Proyecto

### Estructura de Carpetas

\`\`\`
signalinkproject/
├── app/
│   ├── layout.tsx          # Layout raíz (HTML, metadatos, fuentes)
│   ├── page.tsx            # Página principal - componente de videollamada
│   └── globals.css         # Estilos globales y temas
├── components/
│   ├── ui/                 # Componentes shadcn/ui reutilizables
│   └── theme-provider.tsx  # Proveedor de tema (dark/light)
├── hooks/
│   ├── use-mobile.ts       # Hook para detectar si es mobile
│   └── use-toast.ts        # Hook para notificaciones toast
├── lib/
│   └── utils.ts            # Funciones auxiliares (cn, etc)
├── public/                 # Activos estáticos
├── styles/                 # Estilos adicionales
└── next.config.mjs         # Configuración de Next.js
\`\`\`

---

## Componentes Principales

### 1. **SignLanguageVideoCall** (`app/page.tsx`)

Es el componente principal de la aplicación. Gestiona todo el flujo de videollamadas.

#### Estados Principales

\`\`\`typescript
const [isCallActive, setIsCallActive] = useState(false)          // ¿Llamada en progreso?
const [isMicEnabled, setIsMicEnabled] = useState(true)          // ¿Micrófono activo?
const [isCameraEnabled, setIsCameraEnabled] = useState(true)    // ¿Cámara activa?
const [isAudioEnabled, setIsAudioEnabled] = useState(true)      // ¿Audio de reproducción activo?
const [isDetectingLocal, setIsDetectingLocal] = useState(false) // ¿Detectando señas locales?
const [translatedTextLocal, setTranslatedTextLocal] = useState("")       // Traducción local
const [translatedTextRemote, setTranslatedTextRemote] = useState("")     // Traducción remota
const [callDuration, setCallDuration] = useState(0)             // Duración de llamada
const [language, setLanguage] = useState<"es" | "en">("es")     // Idioma (ES/EN)
\`\`\`

#### Referencias a Elementos del DOM

\`\`\`typescript
const localVideoRef = useRef<HTMLVideoElement>(null)   // Video local (tu cámara)
const remoteVideoRef = useRef<HTMLVideoElement>(null)  // Video remoto (otra persona)
\`\`\`

---

## Funcionalidades Clave

### 1. Inicio de Llamada

\`\`\`typescript
const startCall = async () => {
  try {
    // Solicita acceso a cámara y micrófono
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    })
    
    // Asigna el stream al elemento video local
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream
    }
    
    // Activa la interfaz de llamada
    setIsCallActive(true)
    setIsMicEnabled(true)
    setIsCameraEnabled(true)
  } catch (error) {
    console.error("Error accessing camera/mic:", error)
  }
}
\`\`\`

**¿Qué hace?**
- Solicita permisos de cámara y micrófono al usuario
- Obtiene el stream de medios usando la API `getUserMedia`
- Asigna el stream al elemento `<video>` del usuario local
- Cambia a la pantalla de llamada activa

---

### 2. Finalizar Llamada

\`\`\`typescript
const endCall = () => {
  // Obtiene el stream de medios
  const stream = localVideoRef.current?.srcObject as MediaStream
  
  // Detiene todas las pistas (video y audio)
  stream?.getTracks().forEach((track) => track.stop())
  
  // Limpia el elemento video
  if (localVideoRef.current) {
    localVideoRef.current.srcObject = null
  }
  
  // Restaura los estados iniciales
  setIsCallActive(false)
  setTranslatedTextLocal("")
  setTranslatedTextRemote("")
  setCallDuration(0)
}
\`\`\`

**¿Qué hace?**
- Detiene todas las pistas de audio y video
- Limpia la referencia del elemento video
- Restaura la pantalla inicial

---

### 3. Control de Micrófono

\`\`\`typescript
const toggleMic = () => {
  if (localVideoRef.current?.srcObject) {
    const stream = localVideoRef.current.srcObject as MediaStream
    
    // Obtiene todas las pistas de audio
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled  // Alterna entre activo/inactivo
    })
    
    setIsMicEnabled(!isMicEnabled)
  }
}
\`\`\`

---

### 4. Control de Cámara

\`\`\`typescript
const toggleCamera = () => {
  if (localVideoRef.current?.srcObject) {
    const stream = localVideoRef.current.srcObject as MediaStream
    
    // Obtiene todas las pistas de video
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled  // Alterna entre activo/inactivo
    })
    
    setIsCameraEnabled(!isCameraEnabled)
  }
}
\`\`\`

---

### 5. Síntesis de Voz

\`\`\`typescript
const speakText = (text: string) => {
  if (isAudioEnabled && text) {
    // Crea una instancia de SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(text)
    
    // Configura el idioma
    utterance.lang = language === "es" ? "es-ES" : "en-US"
    
    // Reproduce el audio
    window.speechSynthesis.speak(utterance)
  }
}
\`\`\`

**Usa la Web Speech API para convertir texto a voz**

---

### 6. Copiar Link de Llamada

\`\`\`typescript
const copyCallLink = () => {
  const callLink = window.location.href
  
  // Copia el enlace al portapapeles
  navigator.clipboard.writeText(callLink).then(() => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 1500)
  })
}
\`\`\`

---

## Interfaz de Usuario

### Pantalla Pre-Llamada

Muestra antes de iniciar la videollamada:
- Logo y nombre de la app (SignaLink)
- Descripción del servicio
- Botón "Iniciar Llamada"
- Características destacadas en grid de 3 columnas

**Características:**
- Traducción en Tiempo Real
- Video HD
- Tecnología Peer to Peer

---

### Pantalla de Llamada Activa

Se divide en tres secciones:

#### 1. **Área de Videos (Grid 2 columnas en Desktop)**

**Video Local:**
- Muestra la cámara del usuario
- Badge con "Tú" y indicador en vivo
- Controles en la parte inferior:
  - Botón Micrófono (activo/inactivo)
  - Botón Cámara (activo/inactivo)
  - Botón Colgar (rojo)

**Video Remoto:**
- Placeholder mientras no hay otra persona
- Icono de usuarios
- Mensaje: "Esperando a la otra persona..."

#### 2. **Tarjeta de Tu Mensaje**

\`\`\`
┌─────────────────────────────┐
│ 📝 Tu Mensaje               │
│ [Iniciar/Detener detección] │
├─────────────────────────────┤
│ Tu conversación aparecerá    │
│ aquí                         │
└─────────────────────────────┘
\`\`\`

- Botón para iniciar/detener detección de señas
- Área de texto traducido
- Fondo gris con borde

#### 3. **Tarjeta de Traducción Remota**

\`\`\`
┌─────────────────────────────┐
│ 📝 Traducción Remota  🔊    │
├─────────────────────────────┤
│ La traducción remota         │
│ aparecerá aquí               │
├─────────────────────────────┤
│ [🔊 Reproducir Audio]        │
└─────────────────────────────┘
\`\`\`

- Botón volumen para controlar audio
- Botón "Reproducir Audio" para síntesis de voz
- Botón solo disponible si audio está habilitado

---

## Header / Navegación

Elementos en la parte superior:

1. **Logo y Título**
   - Icono de mano (Hand icon)
   - Texto "SignaLink"
   - Subtítulo: "Videollamadas con Traducción de Señas (LSC)"

2. **Botones de Control (derecha)**
   - **Info**: Abre popover con desarrolladores
   - **Link**: Copia el enlace de llamada
   - **Idioma**: Selector entre Español e Inglés
   - **Toast**: Notificación cuando se copia el link

---

## Sistema de Colores

El proyecto usa un sistema de colores coherente:

| Color | Uso | Valor |
|-------|-----|-------|
| **Azul Principal** | CTA, Iconos, Badges | `#0085B9` |
| **Verde Oscuro** | Hover del botón principal | `#009496` |
| **Rojo** | Botón colgar, estados deshabilitados | `#ef4444` / `#dc2626` |
| **Grises** | Backgrounds, bordes, textos | `#f3f4f6`, `#d1e7ee`, etc |
| **Blanco** | Fondos principales | `#ffffff` |

**Tema Claro (por defecto):**
- Fondo: `#f9fafb` (gris muy claro)
- Texto: `#111827` (casi negro)
- Tarjetas: `#ffffff` (blanco)

---

## Tipografía

- **Fuente Sans**: Geist (Google Fonts)
- **Fuente Mono**: Geist Mono (Google Fonts)
- **Weights usados**: 400, 500, 600, 700, 800

**Jerarquía:**
- Títulos principales: `text-4xl font-bold`
- Títulos secundarios: `text-xl font-bold` o `text-lg font-semibold`
- Cuerpo: `text-base` o `text-sm`
- Pequeño: `text-xs`

---

## Componentes shadcn/ui Utilizados

| Componente | Uso |
|------------|-----|
| `Button` | Botones de acción (iniciar, colgar, etc) |
| `Card` | Contenedores de tarjetas |
| `Badge` | Indicadores (ej: "Tú") |
| `Popover` | Menús emergentes (Info, Idioma) |

---

## Hooks Personalizados

### `useRef`
- Acceso directo a elementos del DOM (`<video>`)
- No causa re-renders cuando cambia

### `useState`
- Gestiona todos los estados de la aplicación
- Causa re-renders cuando cambios

---

## APIs del Navegador Utilizadas

| API | Uso |
|-----|-----|
| `getUserMedia` | Acceso a cámara y micrófono |
| `MediaStream` | Manejo de streams de video/audio |
| `SpeechSynthesis` | Síntesis de voz (text-to-speech) |
| `Clipboard` | Copiar enlace al portapapeles |

---

## Flujo de Usuario

\`\`\`
1. Usuario abre la app
   ↓
2. Ve pantalla pre-llamada con opciones
   ↓
3. Hace clic en "Iniciar Llamada"
   ↓
4. Se solicitan permisos de cámara/micrófono
   ↓
5. Pantalla de llamada se muestra
   ↓
6. Usuario puede:
   - Activar/desactivar micrófono
   - Activar/desactivar cámara
   - Copiar enlace para compartir
   - Cambiar idioma
   - Ver traducciones locales/remotas
   ↓
7. Hace clic en "Colgar" para finalizar
   ↓
8. Vuelve a pantalla pre-llamada
\`\`\`

---

## Estilos Tailwind Principales

\`\`\`css
/* Grid responsivo */
.grid.lg:grid-cols-2 gap-4    /* 1 columna mobile, 2 en desktop */

/* Aspectos responsivos */
.aspect-video                  /* Ratio 16:9 */

/* Redondeos */
.rounded-2xl                   /* 16px de radio */
.rounded-xl                    /* 12px de radio */
.rounded-lg                    /* 8px de radio */

/* Sombras y bordes */
.shadow-lg                     /* Sombra grande */
.border-2                      /* Borde de 2px */
.border-gray-200               /* Color de borde */

/* Animaciones */
.animate-pulse                 /* Pulsación */
.animate-in                    /* Entrada suave */
.slide-in-from-top-5           /* Desliza desde arriba */

/* Espaciado */
.p-4, .px-6, .py-8            /* Padding */
.gap-3, .gap-4                /* Gaps entre elementos */
\`\`\`

---

## Responsive Design

La app es completamente responsive:

| Breakpoint | Cambios |
|------------|---------|
| **Mobile** | 1 columna, videos apilados |
| **Tablet** | Transición gradual |
| **Desktop (lg)** | 2 columnas para videos y tarjetas |

---

## Consideraciones de Accesibilidad

- Todos los botones tienen iconos + texto
- Alt text en imágenes (donde aplica)
- ARIA labels en elementos interactivos
- Contraste de colores suficiente (WCAG AA)
- Navegación por teclado soportada
- Foco visible en elementos interactivos

---

## Próximas Mejoras (Roadmap)

- [ ] Integración con WebRTC real (simulado actualmente)
- [ ] Backend para conectar usuarios
- [ ] Modelos de IA para detección de señas en tiempo real
- [ ] Grabación de videollamadas
- [ ] Historial de llamadas
- [ ] Modo oscuro
- [ ] Notificaciones de llamadas entrantes
- [ ] Soporte multi-idioma completo

---

## Instalación y Desarrollo

\`\`\`bash
# Clonar el proyecto
git clone <repo-url>

# Instalar dependencias
npm install
# o
pnpm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
\`\`\`

---

## Variables de Entorno

Actualmente no requiere variables de entorno. En el futuro se necesitarán:

\`\`\`env
# Backend API
NEXT_PUBLIC_API_URL=https://api.signalinkapp.com

# WebRTC
NEXT_PUBLIC_STUN_SERVERS=...

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=...
\`\`\`

---

## Tecnologías Usadas

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 15 | Framework React |
| React | 19 | UI Library |
| TypeScript | - | Tipado estático |
| Tailwind CSS | v4 | Estilos utilitarios |
| shadcn/ui | - | Componentes |
| Lucide React | - | Iconos |

---

## Notas Importantes

1. **Sin Backend Actualmente**: La app es un prototype. Las traducciones y conexión remota son simuladas.

2. **Permisos del Navegador**: La app requiere permisos de:
   - Cámara
   - Micrófono
   - Portapapeles (para copiar enlace)

3. **Soporte de Navegadores**:
   - Chrome/Edge 90+
   - Firefox 88+
   - Safari 14.1+
   - Requiere HTTPS en producción

4. **CORS**: Actualmente funciona en `localhost`. En producción necesitará configuración de CORS correcta.

---

## Contribuir

Para contribuir al proyecto:

1. Haz fork del repositorio
2. Crea una rama: `git checkout -b feature/mi-feature`
3. Commit tus cambios: `git commit -m "Add mi-feature"`
4. Push a la rama: `git push origin feature/mi-feature`
5. Abre un Pull Request

---

## Licencia

MIT

---

## Contacto

- **Melany Saez Acuña**: msaez@utb.edu.co
- **Jesús Petro Ramos**: jpetro@utb.edu.co
- **Gabriel Mantilla Clavijo**: gmantilla@utb.edu.co

---

**Última actualización**: Noviembre 2025
