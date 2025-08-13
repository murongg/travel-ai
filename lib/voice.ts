export interface VoiceRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export const voiceService = {
  isSupported: (): boolean => {
    return "webkitSpeechRecognition" in window || "SpeechRecognition" in window
  },

  startRecognition: (
    onResult: (result: VoiceRecognitionResult) => void,
    onError: (error: string) => void,
    language = "zh-CN",
  ): (() => void) => {
    if (!voiceService.isSupported()) {
      onError("您的浏览器不支持语音识别功能")
      return () => {}
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        onResult({
          transcript: result[0].transcript,
          confidence: result[0].confidence,
          isFinal: result.isFinal,
        })
      }
    }

    recognition.onerror = (event) => {
      let errorMessage = "语音识别出错"
      switch (event.error) {
        case "no-speech":
          errorMessage = "没有检测到语音，请重试"
          break
        case "audio-capture":
          errorMessage = "无法访问麦克风，请检查权限设置"
          break
        case "not-allowed":
          errorMessage = "麦克风权限被拒绝，请在浏览器设置中允许麦克风访问"
          break
        case "network":
          errorMessage = "网络错误，请检查网络连接"
          break
      }
      onError(errorMessage)
    }

    recognition.start()

    return () => {
      recognition.stop()
    }
  },

  transcribeAudio: async (audioBlob: Blob, language = "zh-CN"): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob)
      formData.append("language", language)

      const response = await fetch("/api/enhanced/voice/transcribe", {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to transcribe audio")
      }

      const data = await response.json()
      return data.transcript
    } catch (error) {
      console.error("Error transcribing audio:", error)
      throw error
    }
  },

  synthesizeSpeech: async (text: string, language = "zh-CN"): Promise<void> => {
    try {
      // Try API-based synthesis first
      const response = await fetch("/api/enhanced/voice/synthesize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ text, language }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.play()
        return
      }
    } catch (error) {
      console.warn("API synthesis failed, falling back to browser TTS:", error)
    }

    // Fallback to browser-based synthesis
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language
      utterance.rate = 0.9
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  },

  stopSpeech: (): void => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
    }
  },
}

// Helper function to get auth headers
function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}
