import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, ChevronDown } from 'lucide-react';
import { SpeechService, SAMPLE_VOICE_PRESETS, VoicePreset } from '../../services/speechService';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  language: 'en' | 'kn';
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onTranscript, language }) => {
  const [isListening, setIsListening] = useState(false);
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
        (transcript) => {
          onTranscript(transcript);
          setStatusMessage(`Transcribed: "${transcript.slice(0, 30)}..."`);
        },
        (error) => {
          setIsListening(false);
          setStatusMessage(error);
          setShowPresets(true); // Open simulated presets when mic fails
        },
        () => {
          setIsListening(false);
        }
      );
      if (started) {
        setIsListening(true);
        setStatusMessage(language === 'kn' ? 'ದಯವಿಟ್ಟು ಮಾತನಾಡಿ (Listening in Kannada)...' : 'Listening in English...');
      }
    }
  };

  const handleSelectPreset = (preset: VoicePreset) => {
    onTranscript(preset.transcript);
    setShowPresets(false);
    setStatusMessage(`Loaded preset: ${preset.label}`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleToggleListening}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer ${
          isListening
            ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400'
            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
        }`}
        title="Dictate grievance via voice recognition"
      >
        {isListening ? <MicOff size={14} /> : <Mic size={14} className="text-police-600 dark:text-police-400" />}
        <span>{isListening ? 'Stop Recording' : 'Voice Input'}</span>
      </button>

      {/* Preset simulation toggle */}
      <button
        type="button"
        onClick={() => setShowPresets(!showPresets)}
        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer text-xs flex items-center gap-1"
        title="Sample simulated voice transcripts (Kannada & English)"
      >
        <Sparkles size={13} className="text-amber-500" />
        <span className="hidden sm:inline text-[11px]">Demo Voices</span>
        <ChevronDown size={12} />
      </button>

      {/* Status banner */}
      {statusMessage && (
        <span className="text-[11px] text-police-700 dark:text-police-300 font-medium animate-in fade-in">
          {statusMessage}
        </span>
      )}

      {/* Presets flyout */}
      {showPresets && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-2 text-xs animate-in fade-in slide-in-from-top-1">
          <div className="px-2 py-1.5 font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>Voice Grievance Presets</span>
            <span className="text-[10px] text-slate-400">Kannada & English</span>
          </div>
          <div className="space-y-1 mt-1 max-h-56 overflow-y-auto">
            {SAMPLE_VOICE_PRESETS.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="w-full text-left p-2 rounded-lg hover:bg-police-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-police-700 dark:group-hover:text-police-300">
                    {preset.label}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {preset.lang}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-kannada">
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
