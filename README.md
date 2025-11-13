# SignaLink

**Videollamadas con Traducción de Lenguaje de Señas Colombiano (LSC)**

SignaLink es una aplicación web moderna que permite comunicación por video en tiempo real con traducción de lenguaje de señas. Diseñada para cerrar brechas de comunicación para usuarios sordos y con problemas de audición, SignaLink proporciona una plataforma inclusiva para videollamadas peer-to-peer con traducción integrada de lenguaje de señas a texto.

## ✨ Características

- **Videollamadas en Tiempo Real** - Comunicación por video peer-to-peer de alta calidad usando WebRTC
- **Traducción de Lenguaje de Señas** - Detección y traducción automática de señas (LSC) a texto *(próximamente)*
- **Soporte Bilingüe** - Interfaz disponible en español e inglés
- **Salida de Audio** - Funcionalidad de texto a voz para escuchar mensajes traducidos
- **Controles de Llamada** - Controles fáciles de usar para cámara, micrófono y audio
- **Compartir Link de Llamada** - Función de copiar al portapapeles para compartir llamadas
- **Responsivo** - Optimizado para dispositivos móviles y de escritorio

## 🏗️ Arquitectura

```
SignaLink/
├── frontend/          # Next.js 15 + React 19 + Tailwind CSS
│   ├── app/
│   ├── components/    # Componentes UI (shadcn/ui)
│   └── lib/
└── backend/           # Node.js + Express + Socket.io
    └── server.js      # Servidor de señalización WebRTC
```

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Node.js 18+ instalado
- npm o pnpm
- Navegador moderno con soporte WebRTC (Chrome, Firefox, Edge, Safari)

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/MelanySaez/SignaLink.git
cd SignaLink
```

### Paso 2: Iniciar el Backend (Servidor de Señalización)

```bash
cd backend
npm install
npm start
```

El servidor estará corriendo en `http://localhost:3001`

### Paso 3: Iniciar el Frontend (en otra terminal)

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## 📖 Uso

### Iniciar una Llamada

1. Abre `http://localhost:3000` en tu navegador
2. Haz clic en **"Iniciar Llamada"**
3. Permite permisos de cámara y micrófono
4. Copia el link de la sala (ícono de cadena en el header)
5. Comparte el link con otra persona
6. Cuando la otra persona entre con el mismo link, la videollamada se conectará automáticamente

### Controles Durante la Llamada

- 🎤 **Micrófono** - Activar/desactivar audio
- 📹 **Cámara** - Activar/desactivar video
- 📞 **Colgar** - Finalizar llamada
- 🔊 **Audio** - Activar/desactivar audio de traducción
- 🌐 **Idioma** - Cambiar entre español e inglés

## 🔧 Tecnologías Utilizadas

### Frontend
- **Next.js 15** - Framework de React
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **Socket.io Client** - Comunicación en tiempo real
- **WebRTC** - Videollamadas P2P

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **Socket.io** - WebSockets para señalización
- **CORS** - Manejo de CORS

## 🎯 Próximas Características

- [ ] Integración de modelo de IA para traducción de señas LSC
- [ ] Backend de Python con TensorFlow/MediaPipe
- [ ] Detección de gestos en tiempo real
- [ ] Historial de traducciones
- [ ] Grabación de llamadas
- [ ] Soporte para más de 2 participantes
3. Share the call link with the person you want to communicate with
4. Once both parties are connected, use the translation panels to communicate

### Call Controls

- **Microphone** - Toggle audio input on/off
- **Camera** - Toggle video on/off
- **End Call** - Disconnect from the call
- **Language** - Switch between Spanish and English
- **Audio Output** - Toggle speaker for text-to-speech

### Translation Panels

- **Your Message** - Shows detected sign language from your camera
- **Remote Translation** - Displays sign language translation from the other participant
- Start detection by clicking **"Iniciar detección"** to begin translation

## Technology Stack

- **Frontend**: React 19.1.0, Next.js 15.5.4
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS v4, PostCSS
- **Icons**: Lucide React
- **Video**: WebRTC (browser native)
- **Text-to-Speech**: Web Speech API
- **Forms**: React Hook Form, Zod validation

## Project Structure

\`\`\`
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main video call interface
│   └── globals.css         # Global styles and Tailwind config
├── components/
│   └── ui/                 # shadcn/ui components
├── public/                 # Static assets
└── package.json            # Project dependencies
\`\`\`

## Configuration

The app includes language configuration in the main component. To change default language or add new languages, modify the language state in `app/page.tsx`:

\`\`\`tsx
const [language, setLanguage] = useState<"es" | "en">("es")
\`\`\`

## Accessibility

SignaLink is built with accessibility in mind:

- Semantic HTML elements
- ARIA labels for interactive components
- Keyboard navigation support
- High contrast colors for visibility
- Screen reader compatible

## Contributors

- **Melany Marcela Saez Acuña** - [LinkedIn](https://www.linkedin.com/in/melany-marcela-saez-acuña-618b3a33a/)
  - Email: msaez@utb.edu.co

- **Jesús Petro Ramos** - [LinkedIn](https://www.linkedin.com/in/jesús-petro-118bab233/)
  - Email: jpetro@utb.edu.co

- **Gabriel Mantilla Clavijo** - [LinkedIn](https://www.linkedin.com/in/gabriel-mantilla-204b212a5/)
  - Email: gmantilla@utb.edu.co

## License

This project is open source and available under the MIT License.

## Support & Feedback

For questions, bug reports, or feature requests, please reach out to the development team at any of the email addresses listed above.

## Future Enhancements

- [ ] Support for group video calls (3+ participants)
- [ ] Advanced sign language AI model training
- [ ] Mobile app for iOS and Android
- [ ] Call recording and playback
- [ ] Integration with video interpreters
- [ ] Offline support with sync
- [ ] Call history and analytics

---

**Made with ❤️ to improve accessibility and communication for the Deaf community.**
