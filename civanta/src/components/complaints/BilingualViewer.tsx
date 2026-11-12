import React, { useState, useEffect } from 'react';
import { Complaint } from '../../types';
import { TranslationService } from '../../services/translator';
import { Languages, Info, Copy, Check, Sparkles } from 'lucide-react';

interface BilingualViewerProps {
  complaint: Complaint;
}

export const BilingualViewer: React.FC<BilingualViewerProps> = ({ complaint }) => {
  const [activeTab, setActiveTab] = useState<'dual' | 'kn' | 'en'>('dual');
  const [copied, setCopied] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const [kannadaTitle, setKannadaTitle] = useState<string>(
    complaint.titleKannada && /[\u0C80-\u0CFF]/.test(complaint.titleKannada)
      ? complaint.titleKannada
      : (complaint.originalLanguage === 'kn' ? complaint.title : '')
  );

  const [kannadaDesc, setKannadaDesc] = useState<string>(
    complaint.descriptionKannada && /[\u0C80-\u0CFF]/.test(complaint.descriptionKannada)
      ? complaint.descriptionKannada
      : (complaint.originalLanguage === 'kn' ? complaint.description : '')
  );

  const englishTitle = complaint.title;
  const englishDesc = complaint.description;

  // Auto-translate to Kannada if complaint is in English and lacks Kannada translation
  useEffect(() => {
    const hasValidKannada = complaint.descriptionKannada && /[\u0C80-\u0CFF]/.test(complaint.descriptionKannada);
    if (!hasValidKannada && complaint.originalLanguage !== 'kn' && complaint.description) {
      setIsTranslating(true);
      TranslationService.translateText(complaint.description, 'en', 'kn')
        .then(res => {
          if (res.translatedText) {
            setKannadaDesc(res.translatedText);
            complaint.descriptionKannada = res.translatedText;
          }
          if (complaint.title && !complaint.titleKannada) {
            TranslationService.translateText(complaint.title, 'en', 'kn').then(tRes => {
              if (tRes.translatedText) {
                setKannadaTitle(tRes.translatedText);
                complaint.titleKannada = tRes.translatedText;
              }
            });
          }
        })
        .catch(err => console.warn('Bilingual auto-translation warning:', err))
        .finally(() => setIsTranslating(false));
    }
  }, [complaint.id, complaint.description, complaint.descriptionKannada, complaint.originalLanguage]);

  const engineStatus = TranslationService.getEngineStatusDescription();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      {/* Header with Bilingual Metadata & Demo Label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Languages size={18} className="text-police-600 dark:text-police-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Bilingual Case Dossier (Kannada - English)
          </h4>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-police-100 text-police-700 dark:bg-police-950 dark:text-police-300">
            Original: {complaint.originalLanguage === 'kn' ? 'ಕನ್ನಡ (Kannada)' : 'English'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('dual')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'dual'
                  ? 'bg-white dark:bg-slate-700 text-police-700 dark:text-police-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setActiveTab('kn')}
              className={`px-2.5 py-1 rounded-md font-medium font-kannada transition-colors cursor-pointer ${
                activeTab === 'kn'
                  ? 'bg-white dark:bg-slate-700 text-police-700 dark:text-police-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              ಕನ್ನಡ
            </button>
            <button
              onClick={() => setActiveTab('en')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'en'
                  ? 'bg-white dark:bg-slate-700 text-police-700 dark:text-police-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Engine Status Notice Banner - Required by prompt to be clearly labelled */}
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50/70 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300">
        <Info size={13} className="shrink-0 text-amber-600" />
        <span>
          <strong>{engineStatus.name}:</strong> {engineStatus.message}
        </span>
      </div>

      {/* Content Display */}
      <div className="p-4">
        {activeTab === 'dual' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kannada Pane */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-kannada flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  ಕನ್ನಡ ಆವೃತ್ತಿ (Kannada)
                </span>
                <button
                  onClick={() => handleCopy(`${kannadaTitle}\n\n${kannadaDesc}`)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
                  title="Copy Kannada text"
                >
                  {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
              <h5 className="font-semibold text-sm text-slate-900 dark:text-white font-kannada leading-relaxed">
                {isTranslating ? 'ಅನುವಾದ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ...' : (kannadaTitle || englishTitle)}
              </h5>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-kannada leading-relaxed whitespace-pre-line">
                {isTranslating ? 'ಕನ್ನಡಕ್ಕೆ ಅಧಿಕೃತ ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ... (Translating to Kannada...)' : (kannadaDesc || englishDesc)}
              </p>
            </div>

            {/* English Pane */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  English Translation / Record
                </span>
                <button
                  onClick={() => handleCopy(`${englishTitle}\n\n${englishDesc}`)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
                  title="Copy English text"
                >
                  {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
              <h5 className="font-semibold text-sm text-slate-900 dark:text-white leading-relaxed">
                {englishTitle}
              </h5>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {englishDesc}
              </p>
            </div>
          </div>
        ) : activeTab === 'kn' ? (
          <div className="space-y-2">
            <h5 className="font-bold text-base text-slate-900 dark:text-white font-kannada">
              {kannadaTitle}
            </h5>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-kannada leading-relaxed whitespace-pre-line">
              {kannadaDesc}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <h5 className="font-bold text-base text-slate-900 dark:text-white">
              {englishTitle}
            </h5>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {englishDesc}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
