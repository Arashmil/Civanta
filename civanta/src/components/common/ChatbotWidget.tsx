import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { tokens } from '../../tokens';
import {
  MessageSquare,
  Bot,
  X,
  Send,
  RotateCcw,
  Shield,
  AlertTriangle,
  Minus,
  Maximize2,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  complaintFound?: any;
  source?: 'gemini-live' | 'neural-nlp';
}

export const ChatbotWidget: React.FC = () => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const initialGreeting: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    content: language === 'kn'
      ? "ನಮಸ್ಕಾರ! ನಾನು ಸಿವಾಂತ ಸಹಾಯಕ (CIVANTA Sahāyaka), ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ದೂರು ಹಾಗೂ ಹೊಣೆಗಾರಿಕೆ ವ್ಯವಸ್ಥೆಯ ಅಧಿಕೃತ AI ಮಾರ್ಗದರ್ಶಿ. ನಾನು ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳನ್ನು ನೈಸರ್ಗಿಕ ಭಾಷೆಯಲ್ಲಿ ಗ್ರಹಿಸಿ, ಕಾನೂನು ಪರಿಹಾರಗಳು (BNS 2023), ಸೈಬರ್ ವಂಚನೆ (1930), ತುರ್ತು ಸಹಾಯ (112), ಮತ್ತು ನೈಜ ಪ್ರಕರಣಗಳ ಸ್ಥಿತಿ (ಉದಾ: KSP-2026-CYB-001) ಪರಿಶೀಲಿಸಲು ಸದಾ ಸಿದ್ಧನಾಗಿದ್ದೇನೆ.\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]"
      : "Hello! I am CIVANTA Sahāyaka, the conversational AI Police Desk Guide for Karnataka State Police. I am connected directly with live platform data and web intelligence to understand your situation, explain laws under the Bharatiya Nyaya Sanhita (BNS), assist in filing grievances with evidence, connect to emergency helplines (1930 / 112), or inspect active cases (e.g. KSP-2026-CYB-001).\n\n[Suggested. Officer must confirm.]",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // Update welcome greeting when language switches if chat has not started
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([initialGreeting]);
    }
  }, [language]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await api.sendChatMessage(text, history, language);

      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        complaintFound: res.complaint_found,
        source: res.source
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: language === 'kn'
          ? "ಕ್ಷಮಿಸಿ, ಸಂದೇಶ ಕಳುಹಿಸುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]"
          : "Sorry, an error occurred while connecting to the assistant. Please try again.\n\n[Suggested. Officer must confirm.]",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Modern, Actionable Quick Prompts based on real Karnataka Police Scenarios
  const quickPrompts = language === 'kn' ? [
    "ಪ್ರಕರಣ KSP-2026-CYB-001 ಸ್ಥಿತಿ ತಿಳಿಸಿ",
    "ಡಿಜಿಟಲ್ ಬಂಧನ ಅಥವಾ ಸೈಬರ್ ವಂಚನೆ ವರದಿ",
    "ಕಿರುಕುಳ ಅಥವಾ ಬೆದರಿಕೆ ಬಂದರೆ ಏನು ಮಾಡಬೇಕು?",
    "ಶಾಸನಬದ್ಧ ಎಸ್‌ಎಲ್‌ಎ (SLA) ಮತ್ತು ಹಕ್ಕುಗಳು",
    "ಭ್ರಷ್ಟಾಚಾರವನ್ನು ಲೋಕಾಯುಕ್ತಕ್ಕೆ ದೂರುವುದು ಹೇಗೆ?",
    "ದಾಖಲೆಗಳೊಂದಿಗೆ ಹೊಸ ದೂರು ದಾಖಲಿಸುವುದು ಹೇಗೆ?"
  ] : [
    "Check status of KSP-2026-CYB-001",
    "How to report Digital Arrest or UPI scam?",
    "I am facing stalking or harassment, what to do?",
    "What are my rights & SLA deadlines?",
    "How to report corruption to Lokayukta?",
    "How do I file a grievance with evidence?"
  ];

  const handleResetChat = () => {
    setMessages([initialGreeting]);
  };

  // Formatter for rich bold styling and structured bullet points
  const renderCleanMessage = (content: string, isUser: boolean) => {
    if (isUser) {
      return <span>{content}</span>;
    }

    const lines = content.split('\n');

    const renderFormattedText = (text: string) => {
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-bold text-slate-900 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
    };

    return (
      <div className="space-y-1.5">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Bullet points
          if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.replace(/^[•\-\*]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-0.5 text-[11.5px] leading-relaxed">
                <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                <span className="text-slate-700 dark:text-slate-200">
                  {renderFormattedText(bulletText)}
                </span>
              </div>
            );
          }

          // Numbered lists (e.g. "1. Step description")
          const numberedMatch = trimmed.match(/^(\d+)\.\s*(.+)$/);
          if (numberedMatch) {
            const num = numberedMatch[1];
            const itemText = numberedMatch[2];
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-0.5 text-[11.5px] leading-relaxed">
                <span className="font-mono font-bold text-police-600 dark:text-police-400 shrink-0 text-[11px]">
                  {num}.
                </span>
                <span className="text-slate-700 dark:text-slate-200">
                  {renderFormattedText(itemText)}
                </span>
              </div>
            );
          }

          // Statutory notice disclaimer
          if (trimmed.includes('[Suggested. Officer must confirm.]') || trimmed.includes('[ಸೂಚಿಸಲಾಗಿದೆ')) {
            return (
              <div key={idx} className="mt-2 pt-1.5 border-t border-slate-200/80 dark:border-slate-800 text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                {trimmed}
              </div>
            );
          }

          return (
            <p key={idx} className="text-[11.5px] leading-relaxed text-slate-800 dark:text-slate-200">
              {renderFormattedText(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <aside className="fixed bottom-6 left-6 z-40 no-print flex flex-col items-start font-sans">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-[#14213D] text-white hover:bg-slate-800 border-2 border-amber-400/80 shadow-lg cursor-pointer transition-all hover:scale-105 select-none"
          title="Open CIVANTA AI Police Desk Assistant"
        >
          <div className="relative">
            <Bot size={18} className="text-amber-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#14213D] animate-pulse" />
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="text-xs font-bold tracking-tight">CIVANTA Sahāyaka</span>
            <span className="text-[10px] text-slate-300 font-mono">AI Police Desk Guide</span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[410px] rounded-[8px] border-2 border-slate-700 bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden text-xs">
          {/* Top Header Bar */}
          <div className="p-3 bg-[#14213D] text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[5px] bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                <Shield size={15} />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs text-white">CIVANTA Sahāyaka</span>
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-700 flex items-center gap-1 font-semibold"
                    title="Seamlessly connected with Karnataka Police and Internet Intelligence"
                  >
                    <Sparkles size={10} className="text-amber-400" />
                    AI Copilot Active
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 font-mono block">
                  Karnataka State Police • Live Web & Case Intelligence
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="Restart Chat Conversation"
              >
                <RotateCcw size={13} />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={13} /> : <Minus size={13} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="Close Assistant"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Statutory Disclaimer Banner */}
              <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-900/80 flex items-center gap-1.5 text-[10px] text-amber-900 dark:text-amber-200 font-medium">
                <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                <span>Suggested. Officer must confirm. Informational guide only; does not file FIRs.</span>
              </div>

              {/* Chat Messages Body */}
              <div className="p-3 h-80 overflow-y-auto space-y-3 bg-slate-50/60 dark:bg-slate-950/40">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-[6px] p-2.5 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#14213D] text-white rounded-br-none whitespace-pre-line'
                          : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-800 rounded-bl-none shadow-xs'
                      }`}
                    >
                      {renderCleanMessage(msg.content, msg.role === 'user')}

                      {/* Complaint Quick Badge if case was queried */}
                      {msg.complaintFound && (
                        <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono flex items-center justify-between text-police-700 dark:text-police-300 font-semibold">
                          <span>Ref: {msg.complaintFound.id}</span>
                          <span className="uppercase text-[9px] px-1 rounded bg-slate-100 dark:bg-slate-800 border">
                            {msg.complaintFound.status}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-0.5 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 p-2 rounded-[6px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 w-fit text-slate-500 font-mono text-[11px]">
                    <Bot size={13} className="animate-spin text-amber-500" />
                    <span>Analyzing police procedures & laws...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Carousel */}
              <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-thin">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="px-2.5 py-1 rounded-[4px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10.5px] font-medium border border-slate-300 dark:border-slate-700 shrink-0 cursor-pointer transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Control Bar */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder={language === 'kn' ? "ಪ್ರಶ್ನೆ ಕೇಳಿ ಅಥವಾ ದೂರು ಐಡಿ ನಮೂದಿಸಿ..." : "Ask police procedure or enter Complaint ID..."}
                  className="flex-1 px-2.5 py-1.5 rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-police-600"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-1.5 rounded-[4px] bg-[#14213D] text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  title="Send query"
                >
                  <Send size={14} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </aside>
  );
};
