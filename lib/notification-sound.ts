// Notification Sound Utility
let audioContext: AudioContext | null = null
let oscillator: OscillatorNode | null = null
let gainNode: GainNode | null = null
let isPlaying = false

export const playNotificationSound = () => {
  if (isPlaying) return
  
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }

    // Criar nós de áudio
    oscillator = audioContext.createOscillator()
    gainNode = audioContext.createGain()

    // Configurar frequência e tipo de onda
    oscillator.frequency.value = 800 // 800 Hz
    oscillator.type = 'sine'

    // Conectar nós
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Configurar volume
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)

    // Iniciar som
    oscillator.start(audioContext.currentTime)
    
    isPlaying = true

    // Parar após 500ms
    setTimeout(() => {
      stopNotificationSound()
      // Tocar novamente após 200ms (pausa)
      setTimeout(() => {
        playNotificationSound()
      }, 200)
    }, 500)
  } catch (error) {
    console.log('[v0] Error playing notification sound:', error)
  }
}

export const stopNotificationSound = () => {
  if (isPlaying && audioContext && oscillator && gainNode) {
    try {
      oscillator.stop(audioContext.currentTime)
      isPlaying = false
    } catch (error) {
      console.log('[v0] Error stopping sound:', error)
    }
  }
}
