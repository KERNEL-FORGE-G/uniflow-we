import { useState, useEffect, useRef, useCallback } from 'react'

export function useMediaStream() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [hasCamera, setHasCamera] = useState<boolean>(true)
  const [hasMic, setHasMic] = useState<boolean>(true)
  const [audioLevel, setAudioLevel] = useState<number>(0)
  const [permissionError, setPermissionError] = useState<string | null>(null)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)

  // Start webcam and mic stream
  const startStream = useCallback(async (videoEnabled = true, audioEnabled = true) => {
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop())
      }

      const userStream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
        audio: audioEnabled ? { echoCancellation: true, noiseSuppression: true } : false,
      })

      setStream(userStream)
      setPermissionError(null)

      // Setup audio analyzer for volume meter
      if (audioEnabled && userStream.getAudioTracks().length > 0) {
        setupAudioAnalyzer(userStream)
      }

      return userStream
    } catch (err: any) {
      console.warn('Media devices error or permission denied:', err)
      setPermissionError('Accès caméra/micro non accordé ou indisponible (mode aperçu avatar activé).')
      setHasCamera(false)
      return null
    }
  }, [stream])

  // Setup audio meter animation
  const setupAudioAnalyzer = (mediaStream: MediaStream) => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        audioContextRef.current = new AudioCtx()
      }
      const ctx = audioContextRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const source = ctx.createMediaStreamSource(mediaStream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        const avg = sum / dataArray.length
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)))
        animFrameRef.current = requestAnimationFrame(updateLevel)
      }

      updateLevel()
    } catch (e) {
      console.warn('Audio analyser error:', e)
    }
  }

  // Toggle video track
  const toggleVideo = (enabled: boolean) => {
    if (stream) {
      stream.getVideoTracks().forEach(t => { t.enabled = enabled })
    }
  }

  // Toggle audio track
  const toggleAudio = (enabled: boolean) => {
    if (stream) {
      stream.getAudioTracks().forEach(t => { t.enabled = enabled })
    }
  }

  // Start Screen Share
  const startScreenShare = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })
      setScreenStream(displayStream)

      displayStream.getVideoTracks()[0].onended = () => {
        setScreenStream(null)
      }
      return displayStream
    } catch (err) {
      console.warn('Screen share canceled:', err)
      return null
    }
  }

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop())
      setScreenStream(null)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
      if (screenStream) screenStream.getTracks().forEach(t => t.stop())
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (audioContextRef.current) audioContextRef.current.close()
    }
  }, [])

  return {
    stream,
    screenStream,
    hasCamera,
    hasMic,
    audioLevel,
    permissionError,
    startStream,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
  }
}
