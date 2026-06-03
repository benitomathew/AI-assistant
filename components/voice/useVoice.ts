'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseVoiceOptions {
  onTranscript?: (text: string) => void
  voiceRate?: number
  voicePitch?: number
  voiceVolume?: number
  selectedVoice?: string
}

export function useVoice({
  onTranscript,
  voiceRate = 1,
  voicePitch = 1,
  voiceVolume = 1,
  selectedVoice = '',
}: UseVoiceOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Check browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setIsSupported(!!(SpeechRecognition && window.speechSynthesis))
    synthRef.current = window.speechSynthesis
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onTranscript?.(transcript)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [isSupported, onTranscript])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!synthRef.current) return

      // Cancel any ongoing speech
      synthRef.current.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = voiceRate
      utterance.pitch = voicePitch
      utterance.volume = voiceVolume

      // Select voice
      if (selectedVoice) {
        const voices = synthRef.current.getVoices()
        const voice = voices.find(v => v.name === selectedVoice)
        if (voice) utterance.voice = voice
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      synthRef.current.speak(utterance)
    },
    [voiceRate, voicePitch, voiceVolume, selectedVoice]
  )

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel()
    setIsSpeaking(false)
  }, [])

  const getAvailableVoices = useCallback((): SpeechSynthesisVoice[] => {
    return synthRef.current?.getVoices() ?? []
  }, [])

  return {
    isListening,
    isSpeaking,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    getAvailableVoices,
  }
}
