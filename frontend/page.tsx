"use client"
import { useState, useRef } from "react"
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
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const copyCallLink = () => {
    const callLink = window.location.href
    navigator.clipboard.writeText(callLink).then(() => {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 1500)
    })
  }

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      setIsCallActive(true)
      setIsMicEnabled(true)
      setIsCameraEnabled(true)
    } catch (error) {
      console.error("Error accessing camera/mic:", error)
    }
  }

  const endCall = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream
    stream?.getTracks().forEach((track) => track.stop())
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
    setIsCallActive(false)
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
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
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
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-600 font-medium">Esperando a la otra persona...</p>
                  </div>
                </div>
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
