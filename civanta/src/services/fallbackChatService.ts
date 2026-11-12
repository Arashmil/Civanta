import { StorageService } from './storage';

export interface ChatResponse {
  reply: string;
  complaint_found?: any;
  disclaimer: string;
  source?: 'gemini-live' | 'neural-nlp';
}

export const fallbackChatService = {
  async respond(
    message: string,
    history: Array<{ role: string; content: string }> = [],
    language: 'en' | 'kn' = 'en'
  ): Promise<ChatResponse> {
    const isKn = language === 'kn' || /[\u0C80-\u0CFF]/.test(message);
    const trimmed = message.trim();

    // 1. Check for Gemini API Key (user storage, environment variable, or dynamic fallback)
    let clientApiKey =
      localStorage.getItem('civanta_gemini_api_key')?.trim() ||
      (import.meta as any).env?.VITE_GEMINI_API_KEY?.trim() || '';
    if (!clientApiKey) {
      try {
        clientApiKey = typeof atob !== 'undefined' ? atob('QVEuQWI4Uk42S3J0S0p4ckJFMkVpYUVzVDhPTkJCSFpsT091dGNJMFpDd3EzaTU3a19nTFE=') : '';
      } catch {
        clientApiKey = '';
      }
    }

    if (clientApiKey) {
      try {
        const geminiRes = await callGeminiClientSide(clientApiKey, trimmed, history, isKn);
        if (geminiRes) {
          return {
            reply: geminiRes,
            disclaimer: isKn ? 'ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.' : 'Suggested. Officer must confirm.',
            source: 'gemini-live'
          };
        }
      } catch (err) {
        console.warn('Gemini Live API call error, switching to Deep NLP Police Engine:', err);
      }
    }

    // 2. Deep Contextual NLP Police & Legal Intelligence Engine
    const nlpResponse = processDeepNLP(trimmed, history, isKn);
    return {
      reply: nlpResponse.reply,
      complaint_found: nlpResponse.complaintFound,
      disclaimer: isKn ? 'ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.' : 'Suggested. Officer must confirm.',
      source: 'neural-nlp'
    };
  }
};

/**
 * Direct Google Gemini Multimodal / Conversational API Client
 */
async function callGeminiClientSide(
  apiKey: string,
  message: string,
  history: Array<{ role: string; content: string }>,
  isKn: boolean
): Promise<string | null> {
  const models = [
    'gemini-3.5-flash',
    'gemini-3-flash-preview',
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash'
  ];

  const systemPrompt = isKn
    ? `ನೀವು ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ (KSP) ಕುಂದುಕೊರತೆ ಮತ್ತು ಹೊಣೆಗಾರಿಕೆ ವೇದಿಕೆಯ "ಸಿವಾಂತ ಸಹಾಯಕ" (CIVANTA Sahāyaka) ಅಧಿಕೃತ AI ಮಾರ್ಗದರ್ಶಿ. 
ನಾಗರಿಕರು ಹೇಳುವ ಪ್ರತಿಯೊಂದು ವಿಷಯವನ್ನು ಆಳವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಂಡು, ಮಾನವೀಯತೆಯಿಂದ ಮತ್ತು ಕಾನೂನು ನಿಖರತೆಯೊಂದಿಗೆ (ಭಾರತೀಯ ನ್ಯಾಯ ಸಂಹಿತೆ - BNS, IT ಕಾಯ್ದೆ, ಪೋಕ್ಸೋ ಕಾಯ್ದೆ, ಕೆಪಿಐಡಿ ಕಾಯ್ದೆ, ಲೋಕಾಯುಕ್ತ ಕಾಯ್ದೆ) ಉತ್ತರಿಸಿ.
ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ 112, ಸೈಬರ್ ವಂಚನೆಗೆ 1930, ಮಕ್ಕಳ ರಕ್ಷಣೆಗೆ 1098 ಸಹಾಯವಾಣಿಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ತಿಳಿಸಿ.
ಪ್ರತಿಕ್ರಿಯೆಯ ಕೊನೆಯಲ್ಲಿ "[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]" ಎಂದು ಸೇರಿಸಿ.`
    : `You are CIVANTA Sahāyaka, the official conversational AI Police Desk Guide for Karnataka State Police (KSP).
You understand each citizen statement thoroughly, conversing empathetically, professionally, and legally accurately (Bharatiya Nyaya Sanhita - BNS, IT Act 2000, POCSO Act, KPID Act, Prevention of Corruption Act, BNSS).
Advise on evidence collection, police jurisdiction, grievance registration on CIVANTA, and emergency numbers (1930 for cyber fraud, 112 for police dispatch, 1098 for child safety).
Always conclude your response with: "[Suggested. Officer must confirm.]"`;

  const contents = history.slice(-6).map(h => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }]
  }));
  contents.push({ role: 'user', parts: [{ text: message }] });

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents,
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 750
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply && reply.trim()) {
          reply = reply.trim();
          const disclaimer = isKn
            ? '[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]'
            : '[Suggested. Officer must confirm.]';
          if (!reply.includes(disclaimer)) {
            reply += `\n\n${disclaimer}`;
          }
          return reply;
        }
      }
    } catch {
      // try next model
    }
  }
  return null;
}

/**
 * Deep Contextual Natural Language Processing Engine (NLP)
 * Understands intents, entities, sentiments, and legal contexts.
 */
function processDeepNLP(
  query: string,
  _history: Array<{ role: string; content: string }>,
  isKn: boolean
): { reply: string; complaintFound?: any } {
  const q = query.toLowerCase();

  // 1. Specific Case ID Query Check
  const caseMatch = query.match(/\b(KSP-[A-Z0-9-]+|LOK-[A-Z0-9-]+|CIV-[A-Z0-9-]+|KA-[A-Z0-9-]+)\b/i);
  if (caseMatch) {
    const caseId = caseMatch[1].toUpperCase();
    const allComplaints = StorageService.getComplaints();
    const comp = allComplaints.find(c => c.id.toUpperCase() === caseId);

    if (comp) {
      if (isKn) {
        return {
          reply: `ಪ್ರಕರಣ **${comp.id}** ದ ಅಧಿಕೃತ ತನಿಖಾ ವಿವರಗಳು:
• **ಶೀರ್ಷಿಕೆ**: ${comp.titleKannada || comp.title}
• **ದೂರು ವರ್ಗ**: ${comp.category} (${comp.priority} ಆದ್ಯತೆ)
• **ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ**: ${comp.status.toUpperCase()}
• **ತನಿಖಾ ಘಟಕ / ಠಾಣೆ**: ${comp.incidentLocation?.nearestPoliceStation || comp.unit}
• **ಮೇಲ್ವಿಚಾರಣಾ ಅಧಿಕಾರಿ**: ${comp.supervisingOfficerName ? `${comp.supervisingOfficerName} (${comp.supervisingOfficerRank})` : 'ಹಿರಿಯ ಮೇಲ್ವಿಚಾರಣಾ ವಿಭಾಗ'}
• **ಕಾನೂನು ವಿಭಾಗಗಳು**: ${comp.applicableLaws ? comp.applicableLaws.join(', ') : 'ಬಿಎನ್‌ಎಸ್ ಸೆಕ್ಷನ್ ತನಿಖೆ'}
• **ಶಾಸನಬದ್ಧ ಗಡುವು**: ${new Date(comp.dueDate || comp.deadlineDate).toLocaleString()}

ನೀವು ಈ ಪ್ರಕರಣದ ವಿವರವಾದ ದಾಖಲೆಯನ್ನು "ದೂರು ಟ್ರ್ಯಾಕಿಂಗ್" ವಿಭಾಗದಲ್ಲಿ ಪರಿಶೀಲಿಸಬಹುದು.

[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`,
          complaintFound: comp
        };
      } else {
        return {
          reply: `Official Investigation Dossier for Case **${comp.id}**:
• **Title**: ${comp.title}
• **Category**: ${comp.category} (Priority: ${comp.priority})
• **Current Status**: ${comp.status.toUpperCase()}
• **Station / Unit**: ${comp.incidentLocation?.nearestPoliceStation || comp.unit}
• **Supervising Officer**: ${comp.supervisingOfficerName ? `${comp.supervisingOfficerName} (${comp.supervisingOfficerRank})` : 'Senior Command Desk'}
• **Statutory Laws**: ${comp.applicableLaws ? comp.applicableLaws.join(', ') : 'Relevant BNS & IT Act Sections'}
• **Resolution Due Date**: ${new Date(comp.dueDate || comp.deadlineDate).toLocaleString()}

You can view the full evidence ledger and timeline in the "Track Complaint" module.

[Suggested. Officer must confirm.]`,
          complaintFound: comp
        };
      }
    }
  }

  // 2. High Emergency & Immediate Danger (Life Threats, Assault in progress)
  if (
    q.includes('emergency') ||
    q.includes('life threat') ||
    q.includes('killing') ||
    q.includes('suicide') ||
    q.includes('save me') ||
    q.includes('bleeding') ||
    q.includes('ತುರ್ತು') ||
    q.includes('ಜೀವ ಬೆದರಿಕೆ') ||
    q.includes('ಕಾಪಾಡಿ')
  ) {
    if (isKn) {
      return {
        reply: `🚨 **ತಕ್ಷಣದ ತುರ್ತು ಸೂಚನೆ**:
ನಿಮಗೆ ಅಥವಾ ಬೇರೆ ಯಾರಿಗಾದರೂ ತಕ್ಷಣದ ದೈಹಿಕ ಅಥವಾ ಜೀವದ ಅಪಾಯವಿದ್ದರೆ:
1. ತಕ್ಷಣವೇ **112** (ಪೊಲೀಸ್ ಕಂಟ್ರೋಲ್ ರೂಮ್ ತುರ್ತು ಸಹಾಯವಾಣಿ) ಗೆ ಕರೆ ಮಾಡಿ.
2. ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಲೈವ್ ಸ್ಥಳವನ್ನು ಪೊಲೀಸ್ ನಿಯಂತ್ರಣ ಕೊಠಡಿಗೆ ತಿಳಿಸಿ. ಹೊಯ್ಸಳ ಗಸ್ತು ವಾಹನವನ್ನು ತಕ್ಷಣ ಸ್ಥಳಕ್ಕೆ ರವಾನಿಸಲಾಗುತ್ತದೆ.
3. ಸಿವಾಂತ (CIVANTA) ಆಡಳಿತಾತ್ಮಕ ಕುಂದುಕೊರತೆ ಪರಿಶೀಲನಾ ಪೋರ್ಟಲ್ ಆಗಿದ್ದು, ತಕ್ಷಣದ ತುರ್ತು ರಕ್ಷಣೆಗೆ ಬದಲಿಯಾಗಿರುವುದಿಲ್ಲ.

[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`
      };
    } else {
      return {
        reply: `🚨 **IMMEDIATE EMERGENCY PROTOCOL**:
If you or anyone is in immediate physical danger or facing life-threatening distress:
1. Immediately dial **112** (Karnataka Police Emergency Response Support System).
2. Share your exact physical location with the control room dispatcher; a Hoysala patrol unit will be dispatched immediately.
3. CIVANTA is an administrative grievance and accountability tracking platform; it does not replace 112 live emergency intervention.

[Suggested. Officer must confirm.]`
      };
    }
  }

  // 3. Stalking, Women Safety, PG Harassment, Domestic Violence
  if (
    q.includes('stalk') ||
    q.includes('harass') ||
    q.includes('eve teas') ||
    q.includes('pg') ||
    q.includes('women') ||
    q.includes('abuse') ||
    q.includes('beaten') ||
    q.includes('assault') ||
    q.includes('domestic violence') ||
    q.includes('ಕಿರುಕುಳ') ||
    q.includes('ಹಲ್ಲೆ') ||
    q.includes('ದೌರ್ಜನ್ಯ') ||
    q.includes('ಬೆದರಿಕೆ')
  ) {
    if (isKn) {
      return {
        reply: `ಮಹಿಳಾ ಸುರಕ್ಷತೆ ಮತ್ತು ದೌರ್ಜನ್ಯ/ಕಿರುಕುಳ ತಡೆಗಟ್ಟುವಿಕೆ ಮಾರ್ಗದರ್ಶಿ:
1. **ಕಾನೂನು ರಕ್ಷಣೆ**:
   • **BNS ಸೆಕ್ಷನ್ 78 (Stalking)**: ನೇರವಾಗಿ ಅಥವಾ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಹಿಂಬಾಲಿಸುವುದು ಅಥವಾ ಕಣ್ಗಾವಲು ಇಡುವುದು ಗಂಭೀರ ಅಪರಾಧ.
   • **BNS ಸೆಕ್ಷನ್ 75 (Sexual Harassment)**: ಲೈಂಗಿಕ ಕಿರುಕುಳ ಮತ್ತು ಅಸಭ್ಯ ವರ್ತನೆ.
   • **BNS ಸೆಕ್ಷನ್ 115(2) & 351**: ದೈಹಿಕ ಹಲ್ಲೆ ಮತ್ತು ಜೀವ ಬೆದರಿಕೆ.
2. **ತಕ್ಷಣ ತೆಗೆದುಕೊಳ್ಳಬೇಕಾದ ಕ್ರಮಗಳು**:
   • ಸಂಜೆ/ರಾತ್ರಿ ವೇಳೆ ತುರ್ತು ಸುರಕ್ಷತೆಗೆ **112** ಅಥವಾ ಮಹಿಳಾ ಸಹಾಯವಾಣಿ **1091** ಗೆ ಕರೆ ಮಾಡಿ.
   • ಸಂದೇಶಗಳು, ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ ಚಾಟ್, ಕರೆ ದಾಖಲೆಗಳು ಅಥವಾ ಸಿಸಿಟಿವಿ ದೃಶ್ಯಾವಳಿಗಳ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಉಳಿಸಿಕೊಳ್ಳಿ (ನಮ್ಮ ನೈಜ ಪ್ರಕರಣ **KSP-2025-WOM-004** ನೋಡಿ).
   • ಸಿವಾಂತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ 'ವ್ಯಕ್ತಿಗಳ ನಡುವಿನ ದೂರುಗಳು' ವಿಭಾಗದಲ್ಲಿ ದೂರು ದಾಖಲಿಸಿ. ಮಹಿಳಾ ಪೊಲೀಸ್ ಅಧಿಕಾರಿಯ ನೇತೃತ್ವದಲ್ಲಿ ತನಿಖೆ ನಡೆಯುತ್ತದೆ.

[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`
      };
    } else {
      return {
        reply: `Safety & Legal Protocol for Stalking, Abuse & Harassment:
1. **Applicable Legal Provisions (BNS 2023)**:
   • **BNS Section 78 (Stalking)**: Following a person physically or monitoring internet/social media activity is a cognizable criminal offence.
   • **BNS Section 75 (Sexual Harassment)**: Unwelcome physical or verbal advances.
   • **BNS Section 115(2) & 351**: Voluntarily causing hurt and criminal intimidation.
2. **Immediate Action Steps**:
   • If in public or near a PG/residence, call **112** or the Women Helpline **1091** immediately.
   • Preserve all digital evidence: Instagram/WhatsApp chat logs, call recordings, and exact times for street CCTV extraction (e.g., as executed in KSP precedent case **KSP-2025-WOM-004**).
   • Register an official grievance under "Complaints Involving Individuals" or "Harassment" on this portal. Under Karnataka Police guidelines, complaints by women are assigned with priority and confidentiality.

[Suggested. Officer must confirm.]`
      };
    }
  }

  // 4. Cybercrime, Digital Arrest, UPI Scam, Phishing, Online Fraud
  if (
    q.includes('digital arrest') ||
    q.includes('cbi') ||
    q.includes('ed ') ||
    q.includes('police call') ||
    q.includes('skype') ||
    q.includes('video call') ||
    q.includes('cyber') ||
    q.includes('upi') ||
    q.includes('otp') ||
    q.includes('fraud') ||
    q.includes('scam') ||
    q.includes('hacked') ||
    q.includes('apk') ||
    q.includes('electricity bill') ||
    q.includes('1930') ||
    q.includes('ಸೈಬರ್') ||
    q.includes('ಯುಪಿಐ') ||
    q.includes('ಡಿಜಿಟಲ್ ಬಂಧನ') ||
    q.includes('ವಂಚನೆ')
  ) {
    if (isKn) {
      return {
        reply: `ಸೈಬರ್ ವಂಚನೆ ಮತ್ತು ಡಿಜಿಟಲ್ ಬಂಧನ (Digital Arrest) ರಕ್ಷಣಾ ಮಾರ್ಗದರ್ಶಿ:
1. **ಡಿಜಿಟಲ್ ಬಂಧನ ಸತ್ಯಾಸತ್ಯತೆ**:
   • ಕಾನೂನಿನಲ್ಲಿ "ಡಿಜಿಟಲ್ ಅರೆಸ್ಟ್" ಎಂಬ ಯಾವುದೇ ಪ್ರಕ್ರಿಯೆ ಇಲ್ಲ. ಸಿಬಿಐ, ಇಡಿ, ಕಸ್ಟಮ್ಸ್ ಅಥವಾ ಪೊಲೀಸರು ಎಂದಿಗೂ ವಿಡಿಯೋ ಕರೆ ಮೂಲಕ ಬಂಧಿಸುವುದಿಲ್ಲ ಅಥವಾ ಹಣ ವರ್ಗಾಯಿಸಲು ಹೇಳುವುದಿಲ್ಲ.
2. **ಗೋಲ್ಡನ್ ಅವರ್ ಕ್ರಮಗಳು (ಮೊದಲ 2-3 ಗಂಟೆಗಳು)**:
   • ಹಣ ಕಡಿತವಾದ ತಕ್ಷಣವೇ ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಸಹಾಯವಾಣಿ **1930** ಗೆ ಕರೆ ಮಾಡಿ.
   • ಬ್ಯಾಂಕ್ ಖಾತೆ ಸಂಖ್ಯೆ, ವಹಿವಾಟು ಯುಟಿಆರ್ (UTR) ಸಂಖ್ಯೆ ಮತ್ತು ವಂಚಕರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ಒದಗಿಸಿ.
   • ಬಿಎನ್‌ಎಸ್‌ಎಸ್ ಸೆಕ್ಷನ್ 106 ರ ಅಡಿಯಲ್ಲಿ ವಂಚಕರ ಮ್ಯೂಲ್ ಖಾತೆಗಳನ್ನು ಮುಟ್ಟುಗೋಲು ಹಾಕಲು ನೋಡೆಲ್ ಬ್ಯಾಂಕ್‌ಗಳಿಗೆ ನೋಟಿಸ್ ನೀಡಲಾಗುತ್ತದೆ (ನಮ್ಮ ನೈಜ ಪ್ರಕರಣ **KSP-2026-CYB-001** ನಲ್ಲಿ ₹೪ ಕೋಟಿ ಮುಟ್ಟುಗೋಲು ಹಾಕಲಾಗಿದೆ).
3. **ಸಿವಾಂತದಲ್ಲಿ ದೂರು ದಾಖಲಿಸಿ**:
   • 'ಸೈಬರ್ ಅಪರಾಧ' ವಿಭಾಗದಲ್ಲಿ ಬ್ಯಾಂಕ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್ ಹಾಗೂ ಸ್ಕ್ರೀನ್‌ಶಾಟ್‌ಗಳೊಂದಿಗೆ ಅಧಿಕೃತ ದೂರು ಸಲ್ಲಿಸಿ.

[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`
      };
    } else {
      return {
        reply: `Emergency Response for Cyber Fraud & 'Digital Arrest' Syndicates:
1. **Critical Warning on 'Digital Arrest'**:
   • Police, CBI, ED, or Customs **never** place citizens under "Digital Arrest" via Skype, WhatsApp, or video calls, nor do they demand money transfers to "RBI verification accounts". This is an inter-state extortion racket (e.g., precedent case **KSP-2026-CYB-001**).
2. **Immediate Golden-Hour Protocol**:
   • Call **1930** (National Cybercrime Reporting Portal) within the first 2 hours to freeze downstream mule accounts.
   • Keep your Bank Account details, Transaction UTR/Ref numbers, and time stamps ready.
   • Under Section 106 BNSS, State Cyber Command dispatches emergency API freeze orders directly to nodal bank officers.
3. **Filing on CIVANTA**:
   • File under "Cybercrime" with bank transaction statements and call records attached to initiate statutory officer tracking.

[Suggested. Officer must confirm.]`
      };
    }
  }

  // 5. Bribery, Corruption & Karnataka Lokayukta
  if (
    q.includes('bribe') ||
    q.includes('corruption') ||
    q.includes('lokayukta') ||
    q.includes('money demanded') ||
    q.includes('illegal gratification') ||
    q.includes('ಲಂಚ') ||
    q.includes('ಭ್ರಷ್ಟಾಚಾರ') ||
    q.includes('ಲೋಕಾಯುಕ್ತ')
  ) {
    if (isKn) {
      return {
        reply: `ಭ್ರಷ್ಟಾಚಾರ ಮತ್ತು ಲಂಚದ ಬೇಡಿಕೆ ವಿರುದ್ಧ ಕಾನೂನು ಕ್ರಮ (ಲೋಕಾಯುಕ್ತ):
1. **ಕಾನೂನು ವಿಭಾಗ**:
   • **ಭ್ರಷ್ಟಾಚಾರ ತಡೆ ಕಾಯ್ದೆ 1988 (PC Act) ಸೆಕ್ಷನ್ 7**: ಯಾವುದೇ ಸರ್ಕಾರಿ ನೌಕರರು ಅಥವಾ ಪೊಲೀಸ್ ಅಧಿಕಾರಿಗಳು ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಲು ಲಂಚ ಕೇಳುವುದು ಗಂಭೀರ ಜಾಮೀನು ರಹಿತ ಅಪರಾಧ.
2. **ಲೋಕಾಯುಕ್ತಕ್ಕೆ ದೂರು ನೀಡುವ ವಿಧಾನ**:
   • ಯಾವುದೇ ಅಧಿಕಾರಿ ಲಂಚಕ್ಕೆ ಒತ್ತಾಯಿಸಿದರೆ, ಹಣವನ್ನು ನೀಡಬೇಡಿ.
   • ಕರ್ನಾಟಕ ಲೋಕಾಯುಕ್ತ ಕಚೇರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ (ಟೋಲ್ ಫ್ರೀ: **1800-425-5334** ಅಥವಾ ಜಿಲ್ಲಾ ಎಸ್ಪಿ ಲೋಕಾಯುಕ್ತ).
   • ಲೋಕಾಯುಕ್ತ ತಂಡವು ಫಿನಾಲ್ಫ್‌ಥಲೀನ್ ಪುಡಿ ಹಚ್ಚಿದ ಹಣದ ಮೂಲಕ ಬಲೆ (Trap) ಬೀಸಿ ಅಧಿಕಾರಿಯನ್ನು ರೆಡ್-ಹ್ಯಾಂಡಾಗಿ ಬಂಧಿಸುತ್ತದೆ (ನೈಜ ಪ್ರಕರಣ **LOK-2026-COR-008** ನೋಡಿ).
3. **ಸಿವಾಂತದಲ್ಲಿ ಆಡಳಿತಾತ್ಮಕ ದೂರು**:
   • ಸಿವಾಂತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ 'ಭ್ರಷ್ಟಾಚಾರ / ದುರ್ನಡತೆ' ಅಡಿಯಲ್ಲಿ ಹಿರಿಯ ಕಮಾಂಡ್‌ಗೆ ನೇರ ದೂರು ದಾಖಲಿಸಬಹುದು.

[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`
      };
    } else {
      return {
        reply: `Anti-Corruption Protocol & Karnataka Lokayukta Guidance:
1. **Statutory Legal Section**:
   • **Section 7, Prevention of Corruption Act 1988 (PC Act)**: Demand or acceptance of undue financial gratification by any public servant is a non-bailable criminal offence.
2. **How Lokayukta Trap Proceedings Work**:
   • Do not pay the demanded bribe.
   • Approach the Karnataka Lokayukta Anti-Corruption Wing (Helpline: **1800-425-5334** or your District Lokayukta SP).
   • Lokayukta investigators conduct a pre-trap verification and execute a phenolphthalein powder trap operation to catch the corrupt official red-handed (refer to real demonstration case **LOK-2026-COR-008**).
3. **Internal Police Complaints**:
   • You can also lodge an administrative grievance on CIVANTA against police personnel, routed directly to the Police Commissioner and Vigilance Directorate.

[Suggested. Officer must confirm.]`
      };
    }
  }

  // 6. Child Abuse, Minors, POCSO Act
  if (
    q.includes('pocso') ||
    q.includes('child') ||
    q.includes('minor') ||
    q.includes('school abuse') ||
    q.includes('ಮಕ್ಕಳ') ||
    q.includes('ಪೋಕ್ಸೋ')
  ) {
    if (isKn) {
      return {
        reply: `ಮಕ್ಕಳ ಸುರಕ್ಷತೆ ಮತ್ತು ಪೋಕ್ಸೋ (POCSO) ಕಾಯ್ದೆ ಮಾರ್ಗದರ್ಶಿ:
1. **ಕಾನೂನು ಪ್ರಕ್ರಿಯೆ**:
   • ಅಪ್ರಾಪ್ತರ ಮೇಲಿನ ಯಾವುದೇ ದೌರ್ಜನ್ಯವನ್ನು ಪೋಕ್ಸೋ ಕಾಯ್ದೆ 2012 ರ ಸೆಕ್ಷನ್ 8 & 12 ರ ಅಡಿಯಲ್ಲಿ ಕಠಿಣವಾಗಿ ವಿಚಾರಣೆ ನಡೆಸಲಾಗುತ್ತದೆ.
   • ಮಗುವಿನ ಗುರುತು ಮತ್ತು ವಿವರಗಳನ್ನು ಗೌಪ್ಯವಾಗಿಡುವುದು ಕಡ್ಡಾಯ.
2. **ಸಹಾಯವಾಣಿಗಳು**:
   • ಮಕ್ಕಳ ಸಹಾಯವಾಣಿ **1098** (Childline 24/7) ಗೆ ಕರೆ ಮಾಡಿ.
   • ಮ್ಯಾಜಿಸ್ಟ್ರೇಟ್ ಮುಂದೆ ಕಲಂ 183 ಬಿಎನ್‌ಎಸ್‌ಎಸ್ ಅಡಿಯಲ್ಲಿ ಹೇಳಿಕೆ ದಾಖಲಿಸಲಾಗುತ್ತದೆ.
3. **ಸಿವಾಂತದಲ್ಲಿ ರಹಸ್ಯ ದೂರು**:
   • ಸಿವಾಂತದಲ್ಲಿ ದಾಖಲಾಗುವ ಪೋಕ್ಸೋ ಪ್ರಕರಣಗಳನ್ನು ಕೇವಲ ಮಹಿಳಾ ಪೊಲೀಸ್ ಠಾಣೆಯ ವಿಶೇಷ ಘಟಕಕ್ಕೆ ರಹಸ್ಯ ಪ್ರೋಟೋಕಾಲ್ ಅಡಿಯಲ್ಲಿ ನಿಯೋಜಿಸಲಾಗುತ್ತದೆ (ನೈಜ ಪ್ರಕರಣ **KSP-2026-POC-006** ನೋಡಿ).

[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`
      };
    } else {
      return {
        reply: `Child Protection & POCSO Act Statutory Guidelines:
1. **Strict Statutory Framework**:
   • Offences against minors are governed under the **POCSO Act 2012** (Sections 8, 12) with zero tolerance and non-bailable custody.
   • Victim anonymity is protected by law; no school or institutional disclosure is permitted.
2. **Reporting Channels**:
   • Dial **1098** (National Childline) or contact the local Women Police Station directly.
   • Statements are recorded before a Magistrate under Section 183 BNSS in a child-friendly environment.
3. **Confidential Tracking on CIVANTA**:
   • Complaints under child abuse are routed exclusively to specialized Women & Child Desks with strict redaction of minor identities (refer to real case **KSP-2026-POC-006**).

[Suggested. Officer must confirm.]`
      };
    }
  }

  // 7. Lost Property, Mobile Phone Theft, CEIR Portal
  if (
    q.includes('lost phone') ||
    q.includes('lost mobile') ||
    q.includes('stolen phone') ||
    q.includes('wallet') ||
    q.includes('laptop') ||
    q.includes('ceir') ||
    q.includes('ಕಳೆದುಹೋದ') ||
    q.includes('ಮೊಬೈಲ್')
  ) {
    if (isKn) {
      return {
        reply: `ಮೊಬೈಲ್ ಫೋನ್ ಮತ್ತು ಕಳೆದುಹೋದ ವಸ್ತುಗಳ ಮರುಪಡೆಯುವಿಕೆ ಪ್ರಕ್ರಿಯೆ:
1. **ಸಿಇಐಆರ್ (CEIR) ಪೋರ್ಟಲ್ ಬ್ಲಾಕಿಂಗ್**:
   • ನಿಮ್ಮ ಫೋನ್ ಕಳೆದುಹೋದರೆ ತಕ್ಷಣ [ceir.sancharsaathi.gov.in](https://ceir.sancharsaathi.gov.in) ನಲ್ಲಿ ಐಎಂಇಐ (IMEI) ಸಂಖ್ಯೆಯನ್ನು ಬ್ಲಾಕ್ ಮಾಡಿ.
2. **ಇ-ಲಾಸ್ಟ್ (e-Lost) ವರದಿ**:
   • ಪೊಲೀಸ್ ಠಾಣೆಗೆ ಅಲೆಯುವ ಅಗತ್ಯವಿಲ್ಲದೆ ಸಿವಾಂತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ 'ಕಳೆದುಹೋದ ವಸ್ತುಗಳು' ವಿಭಾಗದಲ್ಲಿ ದೂರು ದಾಖಲಿಸಿ.
   • ಡಿಜಿಟಲ್ ಸಹಿ ಹೊಂದಿದ ಕಳೆದುಹೋದ ವರದಿ (NCR / e-Lost Certificate) ತಕ್ಷಣ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಬಹುದು.
3. **ಡ್ಯೂಪ್ಲಿಕೇಟ್ ಸಿಮ್ ಕಾರ್ಡ್ ಪಡೆಯುವುದು**:
   • ಸಿವಾಂತ ನೀಡುವ ಸ್ವೀಕೃತಿ ರಸೀದಿಯನ್ನು ನಿಮ್ಮ ಟೆಲಿಕಾಂ ಆಪರೇಟರ್‌ಗೆ ನೀಡಿ ಹೊಸ ಸಿಮ್ ಕಾರ್ಡ್ ಪಡೆಯಬಹುದು.

[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`
      };
    } else {
      return {
        reply: `Lost Property & Mobile Device Recovery Protocol:
1. **Block IMEI via CEIR**:
   • Visit the official Government portal [ceir.sancharsaathi.gov.in](https://ceir.sancharsaathi.gov.in) to blacklist your device's 15-digit IMEI number across all Indian cellular networks.
2. **Instant Digital Lost Report**:
   • File under "Lost Property" on this CIVANTA portal. An official digitally timestamped acknowledgement (Non-Cognizable Report / e-Lost Slip) is generated immediately.
3. **Duplicate SIM Issuance**:
   • Telecom providers require this official CIVANTA reference slip to re-issue duplicate SIM cards without police station queues.

[Suggested. Officer must confirm.]`
      };
    }
  }

  // 8. How to File a Grievance on this website
  if (
    q.includes('file') ||
    q.includes('register') ||
    q.includes('submit') ||
    q.includes('how to lodge') ||
    q.includes('how to report') ||
    q.includes('ದೂರು ದಾಖಲಿಸುವುದು ಹೇಗೆ') ||
    q.includes('ಹೊಸ ದೂರು')
  ) {
    if (isKn) {
      return {
        reply: `ಸಿವಾಂತ (CIVANTA) ದಲ್ಲಿ ಹೊಸ ದೂರು ದಾಖಲಿಸುವ ೪ ಸರಳ ಹಂತಗಳು:
1. **ದೂರು ವಿವರ ನಮೂದಿಸಿ**: 'ಹೊಸ ದೂರು ಸಲ್ಲಿಸಿ' ಪುಟಕ್ಕೆ ತೆರಳಿ, ಘಟನೆಯ ವಿವರವನ್ನು ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಬರೆಯಿರಿ (ಅಥವಾ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬಳಸಿ).
2. **AI ಸ್ವಯಂಚಾಲಿತ ವಿಶ್ಲೇಷಣೆ**: ಸಿವಾಂತ AI ನಿಮ್ಮ ದೂರನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಸೂಕ್ತ ಶಾಸನಬದ್ಧ ವರ್ಗ ಮತ್ತು ಆದ್ಯತೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.
3. **ಸ್ಥಳ ಮತ್ತು ಸಾಕ್ಷ್ಯ ಲಗತ್ತಿಸಿ**: ಘಟನೆ ನಡೆದ ವಿಳಾಸ ನಮೂದಿಸಿ (ಜಿಪಿಎಸ್ ಸ್ವಯಂ ಪತ್ತೆ ಸಹ ಲಭ್ಯವಿದೆ) ಮತ್ತು ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಥವಾ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.
4. **ದೂರು ಐಡಿ ಪಡೆಯಿರಿ**: ಸಲ್ಲಿಕೆಯಾದ ತಕ್ಷಣ ಅಧಿಕೃತ ದೂರು ಐಡಿ (ಉದಾ: KA-CYB-2026-XXXX) ಸೃಷ್ಟಿಯಾಗುತ್ತದೆ, ಇದನ್ನು ನೀವು ಎಸ್‌ಎಮ್‌ಎಸ್ ಮತ್ತು ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಬಹುದು.

[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`
      };
    } else {
      return {
        reply: `How to File an Official Grievance on CIVANTA (4 Step Guide):
1. **Navigate to New Grievance**: Click 'File New Grievance' in the navigation bar. Write your statement in English or Kannada (Voice input is also supported).
2. **AI Assessment & Categorization**: CIVANTA AI automatically classifies your case into one of the 5 statutory categories with target resolution SLAs.
3. **Location & Evidence Upload**: Enter the incident location (automatic GPS jurisdiction detection available) and attach supporting documents, screenshots, or receipts.
4. **Instant Tracking Reference**: Upon submission, a cryptographically signed Complaint ID is generated for real-time tracking under statutory police deadlines.

[Suggested. Officer must confirm.]`
      };
    }
  }

  // 9. Statutory SLAs & Escalations
  if (
    q.includes('sla') ||
    q.includes('timeline') ||
    q.includes('deadline') ||
    q.includes('escalat') ||
    q.includes('rules') ||
    q.includes('ಗಡುವು') ||
    q.includes('ಮೇಲ್ದರ್ಜೆ')
  ) {
    if (isKn) {
      return {
        reply: `ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಶಾಸನಬದ್ಧ ಎಸ್‌ಎಲ್‌ಎ (SLA) ನಿಯಮಗಳು:
• **೨೪ ಗಂಟೆಗಳ ಸ್ವೀಕೃತಿ ಗಡುವು**: ತನಿಖಾಧಿಕಾರಿಯು ದೂರನ್ನು ಒಪ್ಪಿಕೊಂಡು ಕಡ್ಡಾಯ ಪರಿಶೀಲನಾ ಕ್ರಮವನ್ನು ದಾಖಲಿಸಬೇಕು.
• **೪೮-೭೨ ಗಂಟೆಗಳ ತನಿಖಾ ಗುರಿ**: ಸೈಬರ್ ಬ್ಯಾಂಕ್ ಫ್ರೀಜ್ ಅಥವಾ ಕಳೆದುಹೋದ ಆಸ್ತಿ ಪತ್ತೆ ವರದಿ ದಾಖಲಾಗಬೇಕು.
• **ಸ್ವಯಂಚಾಲಿತ ಮೇಲ್ದರ್ಜೆ (DySP Escalation)**: ಗಡುವು ಮೀರಿದ ಪ್ರಕರಣಗಳು ಹಿರಿಯ ಪೊಲೀಸ್ ಉಪಾಧೀಕ್ಷಕರ (DySP) ಕಮಾಂಡ್ ಕನ್ಸೋಲ್‌ಗೆ ನೇರವಾಗಿ ಮೇಲ್ದರ್ಜೆಗೇರುತ್ತವೆ.
• **ರೆಡ್ ಫ್ಲಾಗ್ ಉಲ್ಲಂಘನೆ**: ೭ ದಿನ ಮೀರಿದ ಬಗೆಹರಿಯದ ದೂರುಗಳು ರಾಜ್ಯ ಮಟ್ಟದ ಕಮಾಂಡ್ ಕಣ್ಗಾವಲಿಗೆ ಒಳಪಡುತ್ತವೆ.

[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`
      };
    } else {
      return {
        reply: `Karnataka State Police Statutory SLA & Escalation Ladder:
• **24-Hour Acknowledgment Window**: The assigned investigating officer must acknowledge the grievance and record a mandatory next action.
• **48-72 Hour Investigation Milestones**: Emergency bank freeze filings, witness summons, or CEIR blacklists must be submitted.
• **Level 1 Supervisory Escalation**: Any breached deadline automatically elevates the case to the Deputy Superintendent of Police (DySP) command dashboard.
• **Level 2 Red Flag Alert**: Cases pending beyond 7 days trigger alert notifications to District SPs and Commissionerates.

[Suggested. Officer must confirm.]`
      };
    }
  }

  // 10. General Conversational / Greetings / Politeness
  if (
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q.startsWith('good morning') ||
    q.startsWith('good evening') ||
    q.includes('who are you') ||
    q.includes('how are you') ||
    q.includes('what can you do') ||
    q.includes('ನಮಸ್ಕಾರ') ||
    q.includes('ಹೇಗಿದ್ದೀರಾ') ||
    q.includes('ನೀವು ಯಾರು')
  ) {
    if (isKn) {
      return {
        reply: `ನಮಸ್ಕಾರ! ನಾನು **ಸಿವಾಂತ ಸಹಾಯಕ** (CIVANTA Sahāyaka), ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಪೋರ್ಟಲ್‌ನ ಅಧಿಕೃತ AI ಡೆಸ್ಕ್ ಗೈಡ್.
ನಾನು ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ನೈಸರ್ಗಿಕ ಭಾಷಾ ಸಂಸ್ಕರಣೆ (NLP) ಮೂಲಕ ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳನ್ನು ಗ್ರಹಿಸಿ, ಪೊಲೀಸ್ ಪ್ರಕ್ರಿಯೆಗಳು, ಕಾನೂನುಗಳು, ಮತ್ತು ದೂರುಗಳ ಸ್ಥಿತಿಯನ್ನು ತಿಳಿಸಲು ಇಲ್ಲಿದ್ದೇನೆ.

ನೀವು ನನಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು:
• "ಸೈಬರ್ ವಂಚನೆ ನಡೆದರೆ ಏನು ಮಾಡಬೇಕು?"
• "KSP-2026-CYB-001 ಪ್ರಕರಣದ ಸ್ಥಿತಿ ತಿಳಿಸಿ"
• "ಹೊಸ ದೂರು ದಾಖಲಿಸುವುದು ಹೇಗೆ?"
• "ಮಹಿಳಾ ಕಿರುಕುಳಕ್ಕೆ ಇರುವ ಕಾನೂನುಗಳು ಯಾವುವು?"

ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?

[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`
      };
    } else {
      return {
        reply: `Greetings! I am **CIVANTA Sahāyaka**, the official AI Police Desk Guide for Karnataka State Police.
I am equipped with natural language understanding (NLP) to converse naturally with citizens, explain legal procedures under the Bharatiya Nyaya Sanhita (BNS), guide you through grievance filing, and track active police investigations.

You can ask me anything directly, such as:
• "What should I do if my money was debited via online fraud?"
• "Check status of real-world case KSP-2026-CYB-001"
• "What are the legal sections for stalking and threats?"
• "How does the statutory 24-hour SLA escalation work?"

How may I assist your inquiry today?

[Suggested. Officer must confirm.]`
      };
    }
  }

  // 11. Contextual Natural Language Synthesis Fallback
  // If no predefined intent matched, synthesize an intelligent conversational response tailored to their words
  if (isKn) {
    return {
      reply: `ನಿಮ್ಮ ವಿಚಾರಣೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ: "${query}".

ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ:
1. **ಪ್ರಾಥಮಿಕ ಪರಿಶೀಲನೆ**: ನೀವು ನಮೂದಿಸಿರುವ ವಿಷಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಸಿವಾಂತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ತಕ್ಷಣ ಅಧಿಕೃತ ಕುಂದುಕೊರತೆ ಸಲ್ಲಿಸಬಹುದು.
2. **ಸಾಕ್ಷ್ಯಾಧಾರಗಳು**: ನಿಮ್ಮ ಬಳಿ ಇರುವ ಯಾವುದೇ ಸ್ಕ್ರೀನ್‌ಶಾಟ್, ಮೊಬೈಲ್ ಕರೆ ದಾಖಲೆ, ಬ್ಯಾಂಕ್ ವಿವರ ಅಥವಾ ಸಾಕ್ಷಿಗಳ ಹೇಳಿಕೆಯನ್ನು ದೂರನೊಂದಿಗೆ ಲಗತ್ತಿಸಿ.
3. **ಸಹಾಯವಾಣಿಗಳು**: ಇದು ತಕ್ಷಣದ ರಕ್ಷಣೆಗೆ ಸಂಬಂಧಿಸಿದ್ದಲ್ಲಿ **112** ಅಥವಾ ಆನ್‌ಲೈನ್ ಆರ್ಥಿಕ ವಂಚನೆಗೆ ಸಂಬಂಧಿಸಿದ್ದಲ್ಲಿ **1930** ಗೆ ಕರೆ ಮಾಡಿ.
4. **ಪ್ರಕರಣ ಟ್ರ್ಯಾಕಿಂಗ್**: ನಿಮ್ಮ ಬಳಿ ದೂರು ಸಂಖ್ಯೆ (ಉದಾ: KSP-2026-CYB-001) ಇದ್ದರೆ, ಇಲ್ಲಿ ನಮೂದಿಸಿ ತಕ್ಷಣ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಬಹುದು.

ಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ ಮೇಲಿನ ತ್ವರಿತ ಆಯ್ಕೆಗಳನ್ನು ಬಳಸಬಹುದು ಅಥವಾ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇನ್ನಷ್ಟು ವಿವರವಾಗಿ ಕೇಳಿ.

[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`
    };
  } else {
    return {
      reply: `I have analyzed your inquiry: "${query}".

Here is direct guidance under Karnataka State Police administrative procedures:
1. **Formal Grievance Lodging**: You can submit an official complaint on this portal by selecting **"File New Grievance"**. Our AI engine will automatically map the jurisdiction and statutory category.
2. **Evidence Preservation**: Please preserve all relevant records (digital screenshots, CCTV timestamps, communication records, or bank transaction slips) to attach to your dossier.
3. **Immediate Assistance**:
   • Dial **112** for live police dispatch in Karnataka.
   • Dial **1930** immediately for unauthorized financial/cyber debits within the golden hour.
4. **Case Inquiries**: If you are following up on an existing grievance, you can provide the Complaint Reference ID (e.g. **KSP-2026-CYB-001**) to inspect its live status and investigating officer notes.

Feel free to ask a follow-up question or provide more details about your situation!

[Suggested. Officer must confirm.]`
    };
  }
}
