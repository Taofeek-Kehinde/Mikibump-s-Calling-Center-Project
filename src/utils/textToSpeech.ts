/**
 * Creates a SpeechSynthesisUtterance with child-friendly voice settings
 * Used in both preview (users.tsx) and QR display (Qrform.tsx)
 */
export function createChildVoice(text: string): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Child-friendly voice settings
  utterance.rate = 0.9;    // Slightly slower for clarity
  utterance.pitch = 1.5;    // Higher pitch for child-like voice
  utterance.lang = 'en-US';
  
  // Try to find a child-friendly English voice
  const voices = window.speechSynthesis.getVoices();
  
  // Try to find Microsoft Aria or similar child-friendly voices
  const preferredVoices = [
    'Microsoft Aria',
    'Microsoft Zira',
    'Samantha',
    'Google US English',
    'English United States'
  ];
  
  for (const voiceName of preferredVoices) {
    const foundVoice = voices.find(v => v.name.includes(voiceName));
    if (foundVoice) {
      utterance.voice = foundVoice;
      break;
    }
  }
  
  return utterance;
}

/**
 * Speak text with child voice
 * Returns a promise that resolves when speaking ends
 */
export function speakChildVoice(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const utterance = createChildVoice(text);
    
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);
    
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech(): void {
  window.speechSynthesis.cancel();
}
