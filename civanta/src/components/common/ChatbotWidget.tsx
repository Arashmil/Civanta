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
  FileSearch,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  complaintFound?: any;
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
      ? "ನಮಸ್ಕಾರ! ನಾನು ಸಿವಾಂತ ಸಹಾಯಕ (CIVANTA Sahāyaka), ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ದೂರು ಮಾರ್ಗದರ್ಶಿ. ನಾನು ನಿಮಗೆ ದೂರು ದಾಖಲಿಸಲು, ದೂರು ಸಂಖ್ಯೆ (ಉದಾ: KA-CYB-2026-0001) ಮೂಲಕ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಲು ಅಥವಾ ಸಹಾಯವಾಣಿ ಮಾಹಿತಿ ನೀಡಲು ನೆರವಾಗಬಲ್ಲೆ.\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]"
      : "Hello! I am CIVANTA Sahāyaka, the official AI Grievance Assistant for Karnataka State Police. I can help you check case progress (e.g. KA-CYB-2026-0001), understand the 5 grievance categories, or provide emergency helpline contacts.\n\n[Suggested. Officer must confirm.]",
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
        complaintFound: res.complaint_found
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

  const quickPrompts = language === 'kn' ? [
    "ದೂರು KA-CYB-2026-0001 ಸ್ಥಿತಿ ತಿಳಿಸಿ",
    "ಸೈಬರ್ ವಂಚನೆ ನಡೆದರೆ ಏನು ಮಾಡಬೇಕು?",
    "ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಸಹಾಯವಾಣಿ 1930",
    "5 ಶಾಸನಬದ್ಧ ದೂರು ವರ್ಗಗಳು ಯಾವುವು?"
  ] : [
    "Check status of KA-CYB-2026-0001",
    "How to report cyber financial fraud?",
    "What is the 1930 Cyber helpline?",
    "Explain the 5 complaint categories"
  ];

  const handleResetChat = () => {
    setMessages([initialGreeting]);
  };

  const renderCleanMessage = (content: string, isUser: boolean) => {
    if (isUser) {
      return <span>{content}</span>;
    }
    // Clean out markdown asterisks, hashtag headers, and messy bullet symbols
    const sanitized = content
      .replace(/^#{1,6}\s*/gm, '')
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
      .replace(/^[*-]\s+/gm, '• ')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '');

    const lines = sanitized.split('\n');
    return (
      <div className="space-y-1">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Bullet points
          if (trimmed.startsWith('•')) {
            const bulletText = trimmed.replace(/^•\s*/, '');
            const colonIdx = bulletText.indexOf(':');
            if (colonIdx > 0 && colonIdx < 35) {
              const label = bulletText.slice(0, colonIdx);
              const val = bulletText.slice(colonIdx + 1);
              return (
                <div key={idx} className="flex items-start gap-1.5 pl-0.5 text-[11.5px] leading-relaxed">
                  <span className="text-amber-500 font-bold shrink-0">•</span>
                  <span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{label}:</span>
                    <span className="text-slate-600 dark:text-slate-300">{val}</span>
                  </span>
                </div>
              );
            }
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-0.5 text-[11.5px] leading-relaxed">
                <span className="text-amber-500 font-bold shrink-0">•</span>
                <span className="text-slate-700 dark:text-slate-200">{bulletText}</span>
              </div>
            );
          }

          // Plain key: value
          const colonIdx = trimmed.indexOf(':');
          if (colonIdx > 0 && colonIdx < 30 && !trimmed.startsWith('http') && !trimmed.startsWith('[') && !trimmed.startsWith('ಗಡುವು:')) {
            const label = trimmed.slice(0, colonIdx);
            const val = trimmed.slice(colonIdx + 1);
            return (
              <div key={idx} className="text-[11.5px] leading-relaxed">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{label}:</span>
                <span className="text-slate-600 dark:text-slate-300">{val}</span>
              </div>
            );
          }

          // Statutory notice disclaimer
          if (trimmed.includes('[Suggested. Officer must confirm.]') || trimmed.includes('[ಸೂಚಿಸಲಾಗಿದೆ')) {
            return (
              <div key={idx} className="mt-1.5 pt-1 border-t border-slate-200/80 dark:border-slate-800 text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                {trimmed}
              </div>
            );
          }

          return (
            <p key={idx} className="text-[11.5px] leading-relaxed text-slate-800 dark:text-slate-200">
              {trimmed}
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
        <div className="w-[360px] sm:w-[390px] rounded-[8px] border-2 border-slate-700 bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden text-xs">
          {/* Top Header Bar */}
          <div className="p-3 bg-[#14213D] text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[5px] bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                <Shield size={15} />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white">CIVANTA Sahāyaka</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    ONLINE
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 font-mono block">
                  Karnataka State Police • Desk Guide
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="Restart Chat Conversation"
              >
                <RotateCcw size={13} />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={13} /> : <Minus size={13} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="Close Assistant"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Statutory Disclaimer Banner (Mandatory Rule) */}
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
                      className={`max-w-[85%] rounded-[6px] p-2.5 text-xs leading-relaxed ${
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
                    <span>Analyzing police procedures...</span>
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
                    className="px-2 py-1 rounded-[4px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-medium border border-slate-300 dark:border-slate-700 shrink-0 cursor-pointer transition-colors"
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
                  placeholder={language === 'kn' ? "ಪ್ರಶ್ನೆ ಕೇಳಿ ಅಥವಾ ದೂರು ಐಡಿ ನಮೂದಿಸಿ..." : "Ask procedure or enter Complaint ID..."}
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
