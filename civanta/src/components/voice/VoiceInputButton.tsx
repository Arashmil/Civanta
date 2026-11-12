import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, ChevronDown, Play, Volume2 } from 'lucide-react';
import { SpeechService, SAMPLE_VOICE_PRESETS, VoicePreset } from '../../services/speechService';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  language: 'en' | 'kn';
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onTranscript, language }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleToggleListening = () => {
    if (isListening) {
      SpeechService.stopListening();
      setIsListening(false);
      setStatusMessage(null);
    } else {
      const started = SpeechService.startListening(
        language,
        (transcript, _isFinal) => {
          onTranscript(transcript);
          setStatusMessage(language === 'kn' ? `ಧ್ವನಿ ದಾಖಲಾಗಿದೆ: "${transcript.slice(0, 35)}..."` : `Captured: "${transcript.slice(0, 35)}..."`);
        },
        (error) => {
          setIsListening(false);
          setStatusMessage(error);
          setShowPresets(true);
        },
        () => {
          setIsListening(false);
        }
      );

      if (started) {
        setIsListening(true);
        setStatusMessage(
          language === 'kn'
            ? 'ಧ್ವನಿ ಮುದ್ರಣ ಚಾಲ್ತಿಯಲ್ಲಿದೆ... ದಯವಿಟ್ಟು ಮಾತನಾಡಿ (Listening in Kannada)'
            : 'Listening... Please speak your grievance clearly (English)'
        );
      }
    }
  };

  const handleStreamSimulatedVoice = (preset: VoicePreset) => {
    setIsSimulating(true);
    setShowPresets(false);
    setStatusMessage(language === 'kn' ? `ಧ್ವನಿ ಡಿಕ್ಟೇಶನ್ ಆರಂಭವಾಗಿದೆ: ${preset.labelKn}` : `Simulating voice dictation: ${preset.label}`);

    SpeechService.simulateDictation(
      preset.transcript,
      (partial) => {
        onTranscript(partial);
      },
      () => {
        setIsSimulating(false);
        setStatusMessage(language === 'kn' ? 'ಧ್ವನಿ ಡಿಕ್ಟೇಶನ್ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ.' : 'Voice dictation completed.');
        setTimeout(() => setStatusMessage(null), 4000);
      }
    );
  };

  const handleSelectPreset = (preset: VoicePreset) => {
    handleStreamSimulatedVoice(preset);
  };

  return (
    <div className="relative inline-flex items-center gap-1.5 flex-wrap">
      {/* Microphone Record Button */}
      <button
        type="button"
        onClick={handleToggleListening}
        disabled={isSimulating}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-60 ${
          isListening
            ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse ring-2 ring-red-400'
            : isSimulating
            ? 'bg-amber-600 text-white animate-pulse'
            : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-police-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700'
        }`}
        title="Dictate grievance via microphone or voice assistant"
      >
        {isListening ? (
          <MicOff size={14} className="animate-spin text-white" />
        ) : isSimulating ? (
          <Volume2 size={14} className="animate-bounce text-white" />
        ) : (
          <Mic size={14} className="text-red-500" />
        )}
        <span>
          {isListening
            ? (language === 'kn' ? 'ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ' : 'Stop Recording')
            : isSimulating
            ? (language === 'kn' ? 'ಡಿಕ್ಟೇಟ್ ಆಗುತ್ತಿದೆ...' : 'Dictating...')
            : (language === 'kn' ? 'ಧ್ವನಿ ಇನ್‌ಪುಟ್' : 'Voice Input')}
        </span>
      </button>

      {/* Preset simulation toggle */}
      <button
        type="button"
        onClick={() => setShowPresets(!showPresets)}
        className="px-2 py-1.5 rounded-[6px] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer text-xs flex items-center gap-1 transition-colors"
        title="Sample simulated voice transcripts (Kannada & English)"
      >
        <Sparkles size={13} className="text-amber-500" />
        <span className="hidden sm:inline text-[11px] font-medium">Demo Voices</span>
        <ChevronDown size={12} />
      </button>

      {/* Live status banner */}
      {statusMessage && (
        <span className="text-[11px] font-mono font-medium text-police-700 dark:text-amber-300 bg-amber-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-amber-200 dark:border-slate-700 animate-in fade-in max-w-xs sm:max-w-md truncate">
          {statusMessage}
        </span>
      )}

      {/* Presets flyout */}
      {showPresets && (
        <div className="absolute right-0 top-full mt-2 w-76 sm:w-92 rounded-[6px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl z-50 p-2 text-xs animate-in fade-in slide-in-from-top-1">
          <div className="px-2 py-1.5 font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>{language === 'kn' ? 'ಧ್ವನಿ ಡಿಕ್ಟೇಶನ್ ಮಾದರಿಗಳು (Voice Presets)' : 'Voice Dictation Presets (Offline Safe)'}</span>
            <span className="text-[10px] text-slate-400 font-mono">Kannada & English</span>
          </div>
          <div className="space-y-1 mt-1 max-h-56 overflow-y-auto">
            {SAMPLE_VOICE_PRESETS.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="w-full text-left p-2 rounded-[4px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-police-700 dark:group-hover:text-police-300 flex items-center gap-1.5">
                    <Play size={10} className="text-police-600 dark:text-police-400 shrink-0" />
                    {language === 'kn' ? preset.labelKn : preset.label}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                    {preset.lang}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5 font-kannada">
                  {preset.transcript}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
