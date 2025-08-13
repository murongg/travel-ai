"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import { voiceService, type VoiceRecognitionResult } from "@/lib/voice"

interface VoiceInputProps {
  onTranscript: (text: string) => void
  placeholder?: string
  language?: string
}

export function VoiceInput({
  onTranscript,
  placeholder = "点击麦克风开始语音输入",
  language = "zh-CN",
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(true)
  const [error, setError] = useState("")
  const stopRecognitionRef = useRef<(() => void) | null>(null)

  const handleStartRecording = () => {
    if (!voiceService.isSupported()) {
      setIsSupported(false)
      setError("您的浏览器不支持语音识别功能")
      return
    }

    setIsRecording(true)
    setError("")
    setTranscript("")

    const stopRecognition = voiceService.startRecognition(
      (result: VoiceRecognitionResult) => {
        setTranscript(result.transcript)
        if (result.isFinal) {
          onTranscript(result.transcript)
        }
      },
      (errorMessage: string) => {
        setError(errorMessage)
        setIsRecording(false)
      },
      language,
    )

    stopRecognitionRef.current = stopRecognition
  }

  const handleStopRecording = () => {
    if (stopRecognitionRef.current) {
      stopRecognitionRef.current()
      stopRecognitionRef.current = null
    }
    setIsRecording(false)
    if (transcript) {
      onTranscript(transcript)
    }
  }

  const handlePlayback = () => {
    if (transcript) {
      voiceService.synthesizeSpeech(transcript, language)
    }
  }

  const handleStopPlayback = () => {
    voiceService.stopSpeech()
  }

  if (!isSupported) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <MicOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">您的浏览器不支持语音识别功能</p>
            <p className="text-xs mt-1">请使用Chrome、Edge或Safari浏览器</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-2 transition-colors ${isRecording ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="sm"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className="shrink-0"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          <div className="flex-1 min-w-0">
            {isRecording && (
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="destructive" className="animate-pulse">
                  录音中...
                </Badge>
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-1 h-4 bg-red-400 rounded animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm">
              {transcript ? (
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="text-gray-900">{transcript}</p>
                </div>
              ) : (
                <p className="text-gray-500">{placeholder}</p>
              )}
            </div>

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>

          {transcript && (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handlePlayback}>
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleStopPlayback}>
                <VolumeX className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Usage Tips */}
        {!transcript && !isRecording && (
          <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
            <p>💡 语音输入提示：</p>
            <ul className="mt-1 space-y-1">
              <li>• 点击麦克风按钮开始录音</li>
              <li>• 清晰地说出您的旅行需求</li>
              <li>• 再次点击停止录音并生成文本</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
