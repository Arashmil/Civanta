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
    label: 'Kannada: Electricity Bill Fraud',
    labelKn: 'ಕನ್ನಡ: ವಿದ್ಯುತ್ ಬಿಲ್ ವಂಚನೆ',
    lang: 'kn',
    transcript: 'ನನ್ನ ಬ್ಯಾಂಕ್ ಖಾತೆಯಿಂದ ನಕಲಿ ಬೆಸ್ಕಾಂ ಲಿಂಕ್ ಮೂಲಕ ೪೫ ಸಾವಿರ ರೂಪಾಯಿ ಯುಪಿಐ ವರ್ಗಾವಣೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಸಹಾಯ ಮಾಡಿ.'
  },
  {
    id: 'voice-kn-2',
    label: 'Kannada: Lost Mobile at Bus Stand',
    labelKn: 'ಕನ್ನಡ: ಬಸ್ ನಿಲ್ದಾಣದಲ್ಲಿ ಮೊಬೈಲ್ ಕಳೆದುಹೋಗಿದೆ',
    lang: 'kn',
    transcript: 'ಮೆಜೆಸ್ಟಿಕ್ ಬಸ್ ನಿಲ್ದಾಣದಲ್ಲಿ ನನ್ನ ಸ್ಯಾಮ್‌ಸಂಗ್ ಗ್ಯಾಲಕ್ಸಿ ಮೊಬೈಲ್ ಫೋನ್ ಕಳೆದುಹೋಗಿದೆ. ಪತ್ತೆ ಹಚ್ಚಿಕೊಡಿ.'
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
  }
];

export class SpeechService {
  private static recognition: any = null;
  private static isListening: boolean = false;

  static isBrowserSupported(): boolean {
    const win = window as unknown as IWindow;
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  static startListening(
    lang: 'en' | 'kn',
    onResult: (text: string) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ): boolean {
    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      onError('Speech recognition is not supported in this browser. Please use the simulated voice presets below.');
      return false;
    }

    try {
      if (this.recognition) {
        this.recognition.abort();
      }

      this.recognition = new SpeechRecognitionClass();
      this.recognition.lang = lang === 'kn' ? 'kn-IN' : 'en-IN';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          onResult(transcript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        onError(`Microphone error: ${event.error}. You can also pick a simulated voice preset.`);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e: any) {
      onError(e.message || 'Failed to start voice recognition.');
      return false;
    }
  }

  static stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }
}
