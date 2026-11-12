// Web Speech API interfaces
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export interface VoicePreset {
  id: string;
  label: string;
  labelKn: string;
  lang: 'en' | 'kn';
  transcript: string;
}

export const SAMPLE_VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'voice-kn-1',
    label: 'Kannada: Electricity Bill UPI Fraud',
    labelKn: 'ಕನ್ನಡ: ಬೆಸ್ಕಾಂ ವಿದ್ಯುತ್ ಬಿಲ್ ಯುಪಿಐ ವಂಚನೆ',
    lang: 'kn',
    transcript: 'ನನ್ನ ಬ್ಯಾಂಕ್ ಖಾತೆಯಿಂದ ನಕಲಿ ಬೆಸ್ಕಾಂ ಲಿಂಕ್ ಮೂಲಕ ೪೫ ಸಾವಿರ ರೂಪಾಯಿ ಯುಪಿಐ ವರ್ಗಾವಣೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಖಾತೆ ಸ್ಥಗಿತಗೊಳಿಸಿ ಸಹಾಯ ಮಾಡಿ.'
  },
  {
    id: 'voice-kn-2',
    label: 'Kannada: Lost Mobile at Bus Stand',
    labelKn: 'ಕನ್ನಡ: ಬಸ್ ನಿಲ್ದಾಣದಲ್ಲಿ ಮೊಬೈಲ್ ಕಳೆದುಹೋಗಿದೆ',
    lang: 'kn',
    transcript: 'ಮೆಜೆಸ್ಟಿಕ್ ಬಸ್ ನಿಲ್ದಾಣದಲ್ಲಿ ನನ್ನ ಸ್ಯಾಮ್‌ಸಂಗ್ ಗ್ಯಾಲಕ್ಸಿ ಎಸ್೨೩ ಮೊಬೈಲ್ ಫೋನ್ ಕಳೆದುಹೋಗಿದೆ. ಸಿಇಐಆರ್ ಮೂಲಕ ಪತ್ತೆ ಹಚ್ಚಿಕೊಡಿ.'
  },
  {
    id: 'voice-kn-3',
    label: 'Kannada: Tenant Deposit Dispute',
    labelKn: 'ಕನ್ನಡ: ಬಾಡಿಗೆ ಮುಂಗಡ ಹಣ ಮರುಪಾವತಿ ವಿವಾದ',
    lang: 'kn',
    transcript: 'ಮನೆ ಖಾಲಿ ಮಾಡಿ ೨ ತಿಂಗಳಾದರೂ ಮನೆಮಾಲೀಕರು ೧ ಲಕ್ಷ ರೂಪಾಯಿ ಮುಂಗಡ ಹಣವನ್ನು ವಾಪಸ್ ನೀಡುತ್ತಿಲ್ಲ ಮತ್ತು ಬೆದರಿಕೆ ಹಾಕುತ್ತಿದ್ದಾರೆ.'
  },
  {
    id: 'voice-en-1',
    label: 'English: Unauthorized UPI Debit',
    labelKn: 'ಇಂಗ್ಲಿಷ್: ಅನಧಿಕೃತ ಯುಪಿಐ ಕಡಿತ',
    lang: 'en',
    transcript: 'I received an SMS about power disconnection and clicked a link. ₹45,000 was debited via UPI to an unknown VPA without my consent.'
  },
  {
    id: 'voice-en-2',
    label: 'English: Stolen Two-Wheeler',
    labelKn: 'ಇಂಗ್ಲಿಷ್: ಬೈಕ್ ಕಳ್ಳತನ',
    lang: 'en',
    transcript: 'My black Royal Enfield motorcycle KA-04-EL-9902 was stolen from the commercial complex parking lot today afternoon.'
  },
  {
    id: 'voice-en-3',
    label: 'English: Online Trading Fraud',
    labelKn: 'ಇಂಗ್ಲಿಷ್: ನಕಲಿ ಷೇರು ಮಾರುಕಟ್ಟೆ ವಂಚನೆ',
    lang: 'en',
    transcript: 'I was lured into a fraudulent WhatsApp trading group promising 300% returns and lost ₹2,50,000 transferred to multiple dummy accounts.'
  }
];

export class SpeechService {
  private static recognition: any = null;
  private static isListening: boolean = false;

  static isBrowserSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as IWindow;
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  static startListening(
    lang: 'en' | 'kn',
    onResult: (text: string, isFinal: boolean) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      onError('Speech recognition is not supported in this browser. You can use the Voice Presets or type text directly.');
      return false;
    }

    try {
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionClass();
      recognition.lang = lang === 'kn' ? 'kn-IN' : 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let finalAccumulated = '';

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const transcript = res[0]?.transcript || '';
          if (res.isFinal) {
            finalAccumulated += (finalAccumulated ? ' ' : '') + transcript.trim();
          } else {
            interim += transcript;
          }
        }

        const currentText = (finalAccumulated + (interim ? ' ' + interim : '')).trim();
        if (currentText) {
          onResult(currentText, Boolean(finalAccumulated));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          onError('Microphone permission was denied. Please allow microphone access in your browser settings, or choose a voice preset.');
        } else if (event.error === 'no-speech') {
          // quiet timeout, safe to ignore or keep open
        } else {
          onError(`Voice input error (${event.error}). You can also choose a voice preset.`);
        }
      };

      recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      recognition.start();
      this.recognition = recognition;
      this.isListening = true;
      return true;
    } catch (e: any) {
      console.error('Failed to start speech recognition:', e);
      onError(e.message || 'Failed to start microphone.');
      return false;
    }
  }

  static stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.isListening = false;
    }
  }
}
