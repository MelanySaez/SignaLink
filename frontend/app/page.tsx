"use client"
import { useState, useRef, useEffect } from "react"
import { io, Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  Info,
  Hand,
  Users,
  MessageSquare,
  Link2,
  Check,
} from "lucide-react"

export default function SignLanguageVideoCall() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [isCameraEnabled, setIsCameraEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isDetectingLocal, setIsDetectingLocal] = useState(false)
  const [translatedTextLocal, setTranslatedTextLocal] = useState("")
  const [translatedTextRemote, setTranslatedTextRemote] = useState("")
  const [callDuration, setCallDuration] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [language, setLanguage] = useState<"es" | "en">("es")
  const [roomId, setRoomId] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  // Conectar al backend y obtener/crear roomId
  useEffect(() => {
    // Conectar a Socket.io
    const socket = io("http://localhost:3001")
    socketRef.current = socket

    // Obtener roomId de la URL o crear uno nuevo
    const urlParams = new URLSearchParams(window.location.search)
    const room = urlParams.get("room") || Math.random().toString(36).substring(2, 9)
    setRoomId(room)

    // Si no había room en la URL, agregarlo
    if (!urlParams.get("room")) {
      const newUrl = `${window.location.pathname}?room=${room}`
      window.history.replaceState({}, "", newUrl)
    }

    socket.on("connect", () => {
      console.log("✅ Conectado al servidor de señalización")
    })

    socket.on("disconnect", () => {
      console.log("❌ Desconectado del servidor")
    })

    // Cleanup al desmontar
    return () => {
      console.log("🧹 Limpiando conexiones...")
      
      // Limpiar event listeners
      socket.off("other-user")
      socket.off("user-connected")
      socket.off("offer")
      socket.off("answer")
      socket.off("ice-candidate")
      socket.off("user-disconnected")
      
      socket.close()
      
      // Limpiar peer connection si existe
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
      
      // Detener streams locales
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
        localStreamRef.current = null
      }
    }
  }, [])

  // Asegurar que el video local se actualice cuando cambie el stream
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current
      localVideoRef.current.play().catch(e => console.log("Auto-play:", e))
    }
  }, [isCallActive])

  // Crear conexión peer-to-peer
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    })

    // Cuando recibimos tracks remotos
    pc.ontrack = (event) => {
      console.log("📹 Stream remoto recibido")
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
        setIsConnected(true)
      }
    }

    // Cuando hay nuevos ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        console.log("🧊 Enviando ICE candidate")
        socketRef.current.emit("ice-candidate", event.candidate, roomId)
      }
    }

    // Estado de la conexión
    pc.onconnectionstatechange = () => {
      console.log("🔌 Estado de conexión:", pc.connectionState)
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setIsConnected(false)
      }
    }

    return pc
  }

  // Configurar listeners de Socket.io para señalización
  const setupSocketListeners = () => {
    const socket = socketRef.current
    if (!socket) return

    // Limpiar listeners anteriores para evitar duplicados
    socket.off("other-user")
    socket.off("user-connected")
    socket.off("offer")
    socket.off("answer")
    socket.off("ice-candidate")
    socket.off("user-disconnected")

    // Otro usuario ya está en la sala
    socket.on("other-user", async (userId: string) => {
      console.log("👤 Otro usuario detectado, creando oferta...")
      
      // Cerrar conexión anterior si existe
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
      
      const pc = createPeerConnection()
      peerConnectionRef.current = pc

      // Agregar tracks locales
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!)
        })
      }

      // Crear y enviar oferta
      try {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        socket.emit("offer", offer, roomId)
      } catch (error) {
        console.error("Error creando oferta:", error)
      }
    })

    // Nuevo usuario se conectó
    socket.on("user-connected", async (userId: string) => {
      console.log("✅ Nuevo usuario conectado:", userId)
    })

    // Recibir oferta
    socket.on("offer", async (offer: RTCSessionDescriptionInit, userId: string) => {
      console.log("📥 Oferta recibida de:", userId)
      
      // Cerrar conexión anterior si existe
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
      
      const pc = createPeerConnection()
      peerConnectionRef.current = pc

      // Agregar tracks locales
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!)
        })
      }

      try {
        await pc.setRemoteDescription(offer)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit("answer", answer, roomId)
      } catch (error) {
        console.error("Error procesando oferta:", error)
      }
    })

    // Recibir respuesta
    socket.on("answer", async (answer: RTCSessionDescriptionInit, userId: string) => {
      console.log("📨 Respuesta recibida de:", userId)
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(answer)
        } catch (error) {
          console.error("Error procesando respuesta:", error)
        }
      }
    })

    // Recibir ICE candidate
    socket.on("ice-candidate", async (candidate: RTCIceCandidateInit, userId: string) => {
      console.log("🧊 ICE candidate recibido")
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(candidate)
        } catch (error) {
          console.error("Error añadiendo ICE candidate:", error)
        }
      }
    })

    // Usuario desconectado
    socket.on("user-disconnected", (userId: string) => {
      console.log("❌ Usuario desconectado:", userId)
      setIsConnected(false)
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
    })
  }

  const copyCallLink = () => {
    const callLink = window.location.href
    navigator.clipboard.writeText(callLink).then(() => {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 1500)
    })
  }

  const startCall = async () => {
    try {
      console.log("🎥 Solicitando acceso a cámara y micrófono...")
      
      // Obtener acceso a cámara y micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: true 
      })
      
      console.log("✅ Acceso concedido, configurando stream local...")
      localStreamRef.current = stream
      
      // Asignar stream al video local INMEDIATAMENTE
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
        // Forzar reproducción
        localVideoRef.current.play().catch(e => console.log("Auto-play manejado:", e))
      }
      
      // Configurar listeners de Socket.io
      setupSocketListeners()
      
      // Unirse a la sala
      if (socketRef.current) {
        console.log("🚪 Uniéndose a sala:", roomId)
        socketRef.current.emit("join-room", roomId)
      }
      
      setIsCallActive(true)
      setIsMicEnabled(true)
      setIsCameraEnabled(true)
      
      console.log("🎉 Llamada iniciada correctamente")
    } catch (error) {
      console.error("❌ Error accessing camera/mic:", error)
      alert("No se pudo acceder a la cámara o micrófono. Por favor, verifica los permisos en la configuración del navegador.")
    }
  }

  const endCall = () => {
    // Detener todos los tracks locales
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    
    // Limpiar video local
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
    
    // Limpiar video remoto
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
    
    // Cerrar conexión peer
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    
    // Limpiar referencias
    localStreamRef.current = null
    
    setIsCallActive(false)
    setIsConnected(false)
    setTranslatedTextLocal("")
    setTranslatedTextRemote("")
    setCallDuration(0)
  }

  const toggleMic = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsMicEnabled(!isMicEnabled)
    }
  }

  const toggleCamera = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsCameraEnabled(!isCameraEnabled)
    }
  }

  const speakText = (text: string) => {
    if (isAudioEnabled && text) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === "es" ? "es-ES" : "en-US"
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showToast && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-5 duration-300">
          <Card className="p-4 shadow-lg border border-gray-200 bg-white rounded-xl flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#0085B9" }}
            >
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">¡Link copiado!</p>
              <p className="text-sm text-gray-600">Compártelo para iniciar la llamada</p>
            </div>
          </Card>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-300 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg"
                style={{ backgroundColor: "#0085B9" }}
              >
                <Hand className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">SignaLink</h1>
                <p className="text-xs text-gray-600">Videollamadas con Traducción de Señas (LSC)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 cursor-pointer">
                    <Info className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 border-gray-200 bg-white rounded-2xl">
                  <div className="space-y-4">
                    <div className="pb-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Desarrollado por</h3>
                    </div>
                    <div className="space-y-3">
                      <a
                        href="https://www.linkedin.com/in/melany-marcela-saez-acu%C3%B1a-618b3a33a/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-200 cursor-pointer"
                        style={{
                          ["--hover-border" as string]: "#0085B9",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0085B9")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                      >
                        <div
                          className="w-2 h-2 rounded-full transition-colors"
                          style={{ backgroundColor: "#0085B9" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#009496")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0085B9")}
                        />
                        <div className="flex flex-col">
                          <span
                            className="text-sm font-medium text-gray-900 transition-colors"
                            style={{ ["--hover-color" as string]: "#0085B9" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#0085B9")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                          >
                            Melany Saez Acuña
                          </span>
                          <span className="text-xs text-gray-600">msaez@utb.edu.co</span>
                        </div>
                      </a>
                      <a
                        href="https://www.linkedin.com/in/jes%C3%BAs-petro-118bab233/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-200 cursor-pointer"
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0085B9")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                      >
                        <div
                          className="w-2 h-2 rounded-full transition-colors"
                          style={{ backgroundColor: "#0085B9" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#009496")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0085B9")}
                        />
                        <div className="flex flex-col">
                          <span
                            className="text-sm font-medium text-gray-900 transition-colors"
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#0085B9")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                          >
                            Jesús Petro Ramos
                          </span>
                          <span className="text-xs text-gray-600">jpetro@utb.edu.co</span>
                        </div>
                      </a>
                      <a
                        href="https://www.linkedin.com/in/gabriel-mantilla-204b212a5/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-200 cursor-pointer"
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0085B9")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                      >
                        <div
                          className="w-2 h-2 rounded-full transition-colors"
                          style={{ backgroundColor: "#0085B9" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#009496")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0085B9")}
                        />
                        <div className="flex flex-col">
                          <span
                            className="text-sm font-medium text-gray-900 transition-colors"
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#0085B9")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                          >
                            Gabriel Mantilla Clavijo
                          </span>
                          <span className="text-xs text-gray-600">gmantilla@utb.edu.co</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyCallLink}
                className="text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                <Link2 className="w-5 h-5" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 cursor-pointer">
                    <Languages className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 border-gray-200 bg-white rounded-xl p-2">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start cursor-pointer text-gray-900 hover:bg-gray-100"
                      style={language === "es" ? { backgroundColor: "#0085B9", color: "white" } : {}}
                      onClick={() => setLanguage("es")}
                      onMouseEnter={(e) => {
                        if (language !== "es") {
                          e.currentTarget.style.backgroundColor = "#f3f4f6"
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (language !== "es") {
                          e.currentTarget.style.backgroundColor = ""
                        }
                      }}
                    >
                      <span className={language === "es" ? "font-semibold" : ""}>Español</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start cursor-pointer text-gray-900 hover:bg-gray-100"
                      style={language === "en" ? { backgroundColor: "#0085B9", color: "white" } : {}}
                      onClick={() => setLanguage("en")}
                      onMouseEnter={(e) => {
                        if (language !== "en") {
                          e.currentTarget.style.backgroundColor = "#f3f4f6"
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (language !== "en") {
                          e.currentTarget.style.backgroundColor = ""
                        }
                      }}
                    >
                      <span className={language === "en" ? "font-semibold" : ""}>English</span>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </header>

      {/* Main Call Area */}
      <main className="container mx-auto px-6 py-8">
        {!isCallActive ? (
          // Pre-call Screen
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-2xl p-8 bg-white border-2 border-gray-300 rounded-2xl">
              <div className="space-y-8 text-center">
                <div className="flex justify-center">
                  <div
                    className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center"
                    style={{ borderWidth: "2px", borderColor: "#0085B9" }}
                  >
                    <Users className="w-10 h-10" style={{ color: "#0085B9" }} />
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-4xl font-bold text-gray-900">Inicia una Videollamada</h2>
                  <p className="text-gray-600 text-lg">
                    Conecta con otra persona y comunícate usando Lenguaje de Señas con traducción en tiempo real
                  </p>
                </div>
                <Button
                  onClick={startCall}
                  size="lg"
                  className="w-full text-white text-lg h-14 gap-2 rounded-xl transition-all cursor-pointer"
                  style={{ backgroundColor: "#0085B9" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#009496")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0085B9")}
                >
                  <Phone className="w-6 h-6" />
                  Iniciar Llamada
                </Button>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto" style={{ color: "#0085B9" }} />
                    <p className="text-sm font-medium text-gray-900">Traducción</p>
                    <p className="text-xs text-gray-600">Tiempo Real</p>
                  </div>
                  <div className="space-y-2">
                    <Video className="w-8 h-8 mx-auto" style={{ color: "#0085B9" }} />
                    <p className="text-sm font-medium text-gray-900">Video HD</p>
                    <p className="text-xs text-gray-600">Alta Calidad</p>
                  </div>
                  <div className="space-y-2">
                    <Users className="w-8 h-8 mx-auto" style={{ color: "#0085B9" }} />
                    <p className="text-sm font-medium text-gray-900">2 Personas</p>
                    <p className="text-xs text-gray-600">Peer to Peer</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          // Active Call Screen
          <div className="space-y-4">
            {/* Video Grid */}
            <div className="grid lg:grid-cols-2 gap-4 mb-6">
              {/* Local Video */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 border-2 border-gray-200">
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                  onLoadedMetadata={(e) => {
                    // Asegurar que el video se reproduzca
                    const video = e.currentTarget
                    video.play().catch(err => console.log("Video auto-play:", err))
                  }}
                />
                {!localStreamRef.current && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-white">
                      <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Cargando cámara...</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge className="text-white gap-1.5" style={{ backgroundColor: "#0085B9" }}>
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Tú
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                  <Button
                    onClick={toggleMic}
                    size="lg"
                    className={`rounded-full w-12 h-12 flex items-center justify-center cursor-pointer ${
                      isMicEnabled
                        ? "bg-gray-200 hover:bg-gray-300 text-gray-900"
                        : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                    }`}
                  >
                    {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>

                  <Button
                    onClick={toggleCamera}
                    size="lg"
                    className={`rounded-full w-12 h-12 flex items-center justify-center cursor-pointer ${
                      isCameraEnabled
                        ? "bg-gray-200 hover:bg-gray-300 text-gray-900"
                        : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                    }`}
                  >
                    {isCameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>

                  <Button
                    onClick={endCall}
                    size="lg"
                    className="rounded-full w-12 h-12 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Remote Video */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 border-2 border-gray-200">
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  className={`w-full h-full object-cover ${!isConnected ? 'hidden' : ''}`}
                />
                {!isConnected && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-600 font-medium">Esperando a la otra persona...</p>
                      <p className="text-gray-500 text-sm mt-2">Comparte el link de la sala</p>
                    </div>
                  </div>
                )}
                {isConnected && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-500 text-white gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      Conectado
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Translation Cards */}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Tu Mensaje */}
              <Card className="p-6 bg-white border-gray-200 shadow-md rounded-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" style={{ color: "#0085B9" }} />
                      Tu Mensaje
                    </h3>
                    <Button
                      onClick={() => setIsDetectingLocal(!isDetectingLocal)}
                      size="sm"
                      className="text-white rounded-lg transition-all cursor-pointer"
                      style={{
                        backgroundColor: isDetectingLocal ? "#ef4444" : "#0085B9",
                      }}
                      onMouseEnter={(e) => {
                        if (isDetectingLocal) {
                          e.currentTarget.style.backgroundColor = "#dc2626"
                        } else {
                          e.currentTarget.style.backgroundColor = "#009496"
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isDetectingLocal) {
                          e.currentTarget.style.backgroundColor = "#ef4444"
                        } else {
                          e.currentTarget.style.backgroundColor = "#0085B9"
                        }
                      }}
                    >
                      {isDetectingLocal ? "Detener detección" : "Iniciar detección"}
                    </Button>
                  </div>

                  {translatedTextLocal ? (
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-xl p-4 min-h-24 border border-gray-200">
                        <p className="text-gray-900 text-lg leading-relaxed">{translatedTextLocal}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200 min-h-24 flex items-center justify-center">
                      <p className="text-gray-500">Tu conversación aparecerá aquí</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Traducción de la Otra Persona */}
              <Card className="p-6 bg-white border-gray-200 shadow-md rounded-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" style={{ color: "#0085B9" }} />
                      Traducción Remota
                    </h3>
                    <Button
                      onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                      size="icon"
                      variant={isAudioEnabled ? "default" : "outline"}
                      className={`transition-all cursor-pointer ${isAudioEnabled ? "text-white" : "border-gray-300"}`}
                      style={isAudioEnabled ? { backgroundColor: "#0085B9" } : {}}
                      onMouseEnter={(e) => {
                        if (isAudioEnabled) {
                          e.currentTarget.style.backgroundColor = "#009496"
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isAudioEnabled) {
                          e.currentTarget.style.backgroundColor = "#0085B9"
                        }
                      }}
                    >
                      {isAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </Button>
                  </div>

                  {translatedTextRemote ? (
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-xl p-4 min-h-24 border border-gray-200">
                        <p className="text-gray-900 text-lg leading-relaxed">{translatedTextRemote}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => speakText(translatedTextRemote)}
                        disabled={!isAudioEnabled}
                        className="border transition-colors rounded-lg cursor-pointer"
                        variant="outline"
                        style={{
                          backgroundColor: "#e6f4f9",
                          borderColor: "#b3dff0",
                          color: "#0085B9",
                        }}
                        onMouseEnter={(e) => {
                          if (isAudioEnabled) {
                            e.currentTarget.style.backgroundColor = "#d1ebf5"
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (isAudioEnabled) {
                            e.currentTarget.style.backgroundColor = "#e6f4f9"
                          }
                        }}
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        Reproducir Audio
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200 min-h-24 flex items-center justify-center">
                      <p className="text-gray-500">La traducción remota aparecerá aquí</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
